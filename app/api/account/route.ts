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
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      canSwitchAccount: account.role === "admin",
    },
  });
}

const profileFields = ["name", "phone", "instagram", "youtube", "tiktok", "pix_key"] as const;
const financialFields = ["meta_diaria", "meta_semanal", "meta_mensal", "bonus_diario", "bonus_semanal", "bonus_mensal"] as const;
const profileLimits = { name: 120, phone: 30, instagram: 160, youtube: 160, tiktok: 160, pix_key: 200 };

type Section = "profile" | "financial";
type Update = Record<string, string | number>;

function missingColumn(error: { code?: string; message?: string } | null, fields: readonly string[]) {
  if (!error || (error.code !== "42703" && error.code !== "PGRST204")) return null;
  const message = error.message ?? "";
  return fields.find((field) => new RegExp(`['\"]${field}['\"]|\\b${field}\\b`, "i").test(message)) ?? null;
}

async function updateExistingColumns(accountId: string, updates: Update) {
  const remaining = { ...updates };
  const unavailable: string[] = [];

  while (Object.keys(remaining).length) {
    const { data, error } = await supabaseAdmin.from("users").update(remaining).eq("id", accountId).select().single();
    if (!error) return { data, savedFields: Object.keys(remaining), unavailable };

    const field = missingColumn(error, Object.keys(remaining));
    if (!field) return { error, savedFields: [] as string[], unavailable };
    delete remaining[field];
    unavailable.push(field);
  }

  return { data: null, savedFields: [] as string[], unavailable };
}

function parseUpdate(input: Record<string, unknown>, section: Section) {
  const updates: Update = {};
  if (section === "profile") {
    for (const field of profileFields) {
      if (!(field in input)) continue;
      if (typeof input[field] !== "string") return { error: `Campo ${field} inválido` };
      const value = input[field].trim().slice(0, profileLimits[field]);
      if (field === "name" && !value) return { error: "Informe seu nome" };
      updates[field] = value;
    }
  } else {
    for (const field of financialFields) {
      if (!(field in input)) continue;
    const rawValue = input[field];
    const value = typeof rawValue === "string" ? Number(rawValue.replace(",", ".")) : Number(rawValue);
    if (!Number.isFinite(value) || value < 0 || value > 99_999_999.99) return { error: `Campo ${field} inválido` };
    updates[field] = value;
    }
  }
  return Object.keys(updates).length ? { updates } : { error: "Nenhuma alteração para salvar" };
}

async function saveAccountSection(request: Request) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const input = body as Record<string, unknown>;
  const section = input.section;
  if (section !== "profile" && section !== "financial") return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
  const parsed = parseUpdate(input, section);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const result = await updateExistingColumns(account.id, parsed.updates);
  if ("error" in result) {
    console.error("Account update failed", result.error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações" }, { status: 500 });
  }

  // Optional profile fields remain saveable in auth metadata until their DB migration is applied.
  const metadataFields = result.unavailable.filter((field) => profileFields.includes(field as typeof profileFields[number]));
  if (metadataFields.length) {
    const user_metadata = Object.fromEntries(metadataFields.map((field) => [field, parsed.updates[field]]));
    const metadataUpdate = await supabaseAdmin.auth.admin.updateUserById(account.authUserId, { user_metadata });
    if (metadataUpdate.error) {
      console.error("Account metadata update failed", metadataUpdate.error);
      return NextResponse.json({ error: "Não foi possível salvar as alterações" }, { status: 500 });
    }
    result.savedFields.push(...metadataFields);
    result.unavailable.splice(0, result.unavailable.length, ...result.unavailable.filter((field) => !metadataFields.includes(field)));
  }

  const unavailableFields = result.unavailable.filter((field) => financialFields.includes(field as typeof financialFields[number]));
  if (unavailableFields.length) {
    return NextResponse.json({
      error: "Metas financeiras: aguardando atualização do sistema. Tente novamente mais tarde.",
      savedFields: result.savedFields,
      unavailableFields,
    }, { status: result.savedFields.length ? 200 : 503 });
  }

  return NextResponse.json({ account: result.data, savedFields: result.savedFields, unavailableFields: [] });
}

export async function PATCH(request: Request) { return saveAccountSection(request); }

// Compatibility for clients deployed before the section-specific PATCH flow.
export async function PUT(request: Request) { return saveAccountSection(request); }
