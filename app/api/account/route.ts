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
  const fields = ["name", "phone", "instagram", "youtube", "tiktok", "pix_key"] as const;
  const financialFields = ["meta_diaria", "meta_semanal", "meta_mensal", "bonus_diario", "bonus_semanal", "bonus_mensal"] as const;
  const limits = { name: 120, phone: 30, instagram: 160, youtube: 160, tiktok: 160, pix_key: 200 };
  const updates: Record<(typeof fields)[number], string> = {
    name: "",
    phone: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    pix_key: "",
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

  const financialUpdates: Record<(typeof financialFields)[number], number> = {
    meta_diaria: 0, meta_semanal: 0, meta_mensal: 0, bonus_diario: 0, bonus_semanal: 0, bonus_mensal: 0,
  };
  for (const field of financialFields) {
    const value = typeof input[field] === "string" ? Number(input[field].replace(",", ".")) : Number(input[field]);
    if (!Number.isFinite(value) || value < 0 || value > 99_999_999.99) {
      return NextResponse.json({ error: `Campo ${field} inválido` }, { status: 400 });
    }
    financialUpdates[field] = value;
  }

  let { data, error } = await supabaseAdmin
    .from("users")
    .update({ ...updates, ...financialUpdates })
    .eq("id", account.id)
    .select("name, phone, instagram, youtube, tiktok, pix_key, meta_diaria, meta_semanal, meta_mensal, bonus_diario, bonus_semanal, bonus_mensal")
    .single();

  const missingSocialColumns = error?.code === "42703" || error?.code === "PGRST204";
  if (missingSocialColumns) {
    if (error?.message.includes("meta_") || error?.message.includes("bonus_") || error?.message.includes("pix_key")) {
      return NextResponse.json({ error: "As metas financeiras ainda precisam da migration do banco de dados" }, { status: 503 });
    }
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
      ? { ...basicUpdate.data, instagram: updates.instagram, youtube: updates.youtube, tiktok: updates.tiktok, pix_key: updates.pix_key, ...financialUpdates }
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
