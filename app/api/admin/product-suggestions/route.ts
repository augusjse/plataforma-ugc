import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

async function requireAdmin() { const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user?.email) return false; const { data } = await supabaseAdmin.from("users").select("role,status").eq("email", user.email).maybeSingle(); return data?.role === "admin" && data.status === "active"; }
export async function GET() {
  if (!isSupabaseConfigured || !await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("product_suggestions").select("id,creator_id,shopee_url,reason,status,created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = [...new Set((data ?? []).map((item) => item.creator_id))]; const { data: users } = ids.length ? await supabaseAdmin.from("users").select("id,email,name").in("id", ids) : { data: [] }; const userMap = new Map((users ?? []).map((user) => [user.id, user]));
  return NextResponse.json({ suggestions: (data ?? []).map((item) => ({ ...item, creator: userMap.get(item.creator_id) ?? null })) });
}
export async function PATCH(request: Request) {
  if (!isSupabaseConfigured || !await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  let body: { id?: string; status?: string }; try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!body.id || !["approved", "rejected"].includes(body.status ?? "")) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("product_suggestions").update({ status: body.status }).eq("id", body.id).eq("status", "pending").select("id,creator_id,shopee_url,reason,status,created_at").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 }); if (!data) return NextResponse.json({ error: "Sugestão não encontrada ou já analisada" }, { status: 409 });
  if (body.status === "approved") { const catalog = await supabaseAdmin.from("catalog_products").upsert({ suggestion_id: data.id, shopee_url: data.shopee_url }, { onConflict: "suggestion_id" }).select("id").single(); if (catalog.error) return NextResponse.json({ error: catalog.error.message }, { status: 500 }); }
  return NextResponse.json({ suggestion: data });
}
