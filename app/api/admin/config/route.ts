import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

const defaults = { repasse_organico_percent: 50, repasse_impulsionado_percent: 10, custo_anuncio_por_venda: 9, saque_minimo: 50 };

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  const { data } = await supabaseAdmin.from("users").select("role,status").eq("email", user.email).maybeSingle();
  return data?.role === "admin" && data.status === "active";
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("admin_config").select("repasse_organico_percent,repasse_impulsionado_percent,custo_anuncio_por_venda,saque_minimo").eq("id", true).maybeSingle();
  if (error) return NextResponse.json({ config: defaults, warning: error.message });
  return NextResponse.json({ config: { ...defaults, ...(data ?? {}) } });
}

async function save(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  let body: Partial<typeof defaults>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const config = { repasse_organico_percent: Number(body.repasse_organico_percent), repasse_impulsionado_percent: Number(body.repasse_impulsionado_percent), custo_anuncio_por_venda: Number(body.custo_anuncio_por_venda), saque_minimo: Number(body.saque_minimo) };
  if (!Number.isFinite(config.repasse_organico_percent) || config.repasse_organico_percent < 0 || config.repasse_organico_percent > 100 || !Number.isFinite(config.repasse_impulsionado_percent) || config.repasse_impulsionado_percent < 0 || config.repasse_impulsionado_percent > 100 || !Number.isFinite(config.custo_anuncio_por_venda) || config.custo_anuncio_por_venda < 0 || !Number.isFinite(config.saque_minimo) || config.saque_minimo < 0) return NextResponse.json({ error: "Valores inválidos" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("admin_config").upsert({ id: true, ...config, updated_at: new Date().toISOString() }).select("repasse_organico_percent,repasse_impulsionado_percent,custo_anuncio_por_venda,saque_minimo").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}

export const PUT = save;
export const POST = save;
export const PATCH = save;
