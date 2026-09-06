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

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", account.id)
    .select("name, phone, instagram, youtube, tiktok")
    .single();

  if (error) {
    console.error("Account update failed", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações" }, { status: 500 });
  }

  return NextResponse.json({ account: data });
}
