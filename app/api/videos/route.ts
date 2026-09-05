import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });
function isUrl(value: unknown) { try { const u = new URL(String(value)); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } }

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return fail("Supabase não configurado", 503);
  const creatorId = request.nextUrl.searchParams.get("creator_id");
  let query = supabaseAdmin.from("videos_ugc").select("*").order("created_at", { ascending: false });
  if (creatorId) query = query.eq("creator_id", creatorId);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  const videos = await Promise.all((data ?? []).map(async (video) => {
    const sales = await supabaseAdmin.from("sales_ugc").select("sale_value,commission_creator").eq("video_id", video.id);
    const rows = sales.data ?? [];
    const end = video.janela_fim ? new Date(video.janela_fim) : null;
    return { ...video, dias_restantes: end ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000)) : null, total_sales: rows.length, total_ganho_criadora: rows.reduce((sum, sale) => sum + Number(sale.commission_creator ?? 0), 0) };
  }));
  return NextResponse.json({ success: true, videos });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return fail("Supabase não configurado", 503);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("JSON inválido", 400); }
  const creatorId = String(body.criadora_id ?? body.creator_id ?? "").trim();
  const productId = String(body.product_id ?? body.produto_id ?? "").trim();
  const affiliate = String(body.affiliate_link_bruto ?? "").trim();
  const videoUrl = String(body.video_url ?? "").trim();
  if (!creatorId || !productId || !isUrl(affiliate) || !isUrl(videoUrl)) return fail("criadora_id, product_id, affiliate_link_bruto e video_url são obrigatórios", 400);
  const { data, error } = await supabaseAdmin.from("videos_ugc").insert({ id: crypto.randomUUID(), creator_id: creatorId, product_id: productId, affiliate_link_bruto: affiliate, video_url: videoUrl }).select("id,status,created_at").single();
  if (error) return fail(error.message, 500);
  const base = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");
  return NextResponse.json({ success: true, video_id: data.id, link_seu_dominio: `${base}/v/${data.id}`, status: data.status, created_at: data.created_at }, { status: 201 });
}
