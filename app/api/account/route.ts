import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/current-account";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const account = await getCurrentAccount();

  if (!account) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({
    account: {
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      canSwitchAccount: account.role === "admin",
    },
  });
}

export async function PUT(request: Request) {
  const account = await getCurrentAccount();

  if (!account) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const fields = ["name", "phone", "instagram", "youtube", "tiktok"] as const;
  const limits = { name: 120, phone: 30, instagram: 160, youtube: 160, tiktok: 160 };
  const updates: Record<(typeof fields)[number], string> = {
    name: "",
    phone: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  };

  for (const field of fields) {
    if (typeof input[field] !== "string") {
      return NextResponse.json({ error: `Campo ${field} inválido` }, { status: 400 });
    }
    updates[field] = input[field].trim().slice(0, limits[field]);
  }

  if (!updates.name) {
    return NextResponse.json({ error: "Informe seu nome" }, { status: 400 });
  }

  let { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", account.id)
    .select("name, phone, instagram, youtube, tiktok")
    .single();

  const missingSocialColumns = error?.code === "42703" || error?.code === "PGRST204";
  if (missingSocialColumns) {
    const basicUpdate = await supabaseAdmin
      .from("users")
      .update({ name: updates.name, phone: updates.phone })
      .eq("id", account.id)
      .select("name, phone")
      .single();
    if (basicUpdate.error) {
      console.error("Account update failed", basicUpdate.error);
      return NextResponse.json({ error: "Não foi possível salvar as alterações" }, { status: 500 });
    }

    data = basicUpdate.data
      ? { ...basicUpdate.data, instagram: updates.instagram, youtube: updates.youtube, tiktok: updates.tiktok }
      : null;
    error = null;

    const metadataUpdate = await supabaseAdmin.auth.admin.updateUserById(account.authUserId, {
      user_metadata: { instagram: updates.instagram, youtube: updates.youtube, tiktok: updates.tiktok },
    });
    if (metadataUpdate.error) {
      console.error("Account metadata update failed", metadataUpdate.error);
      return NextResponse.json({ error: "Não foi possível salvar as redes sociais" }, { status: 500 });
    }
  }

  if (error) {
    console.error("Account update failed", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações" }, { status: 500 });
  }

  return NextResponse.json({ account: data });
}
