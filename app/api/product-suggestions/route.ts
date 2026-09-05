import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
async function currentUser() { const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); return user; }
function isShopeeUrl(value: string) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && url.hostname.toLowerCase().includes("shopee"); } catch { return false; } }

export async function GET() {
  if (!isSupabaseConfigured) return fail("Supabase não configurado", 503);
  const user = await currentUser(); if (!user) return fail("Não autenticada", 401);
  const { data, error } = await supabaseAdmin.from("product_suggestions").select("id,shopee_url,reason,status,created_at").eq("creator_id", user.id).order("created_at", { ascending: false });
  if (error) return fail(error.message, 500); return NextResponse.json({ suggestions: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return fail("Supabase não configurado", 503);
  const user = await currentUser(); if (!user) return fail("Não autenticada", 401);
  let body: { shopee_url?: string; reason?: string }; try { body = await request.json(); } catch { return fail("JSON inválido", 400); }
  const shopeeUrl = String(body.shopee_url ?? "").trim(), reason = String(body.reason ?? "").trim() || null;
  if (!isShopeeUrl(shopeeUrl)) return fail("Insira um link válido da Shopee.", 400);
  const { data, error } = await supabaseAdmin.from("product_suggestions").insert({ creator_id: user.id, shopee_url: shopeeUrl, reason }).select("id,shopee_url,reason,status,created_at").single();
  if (error) return fail(error.message, 500); return NextResponse.json({ suggestion: data }, { status: 201 });
}
