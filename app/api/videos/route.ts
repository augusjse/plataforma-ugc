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

// Monta a URL de afiliado Shopee automaticamente, embutindo o video_id como sub_id1.
// Isso garante que QUALQUER venda originada desse clique seja atribuída ao vídeo,
// mesmo que o comprador leve outro produto (o sync casa por sub_id, não por produto).
function buildShopeeAffiliateLink(productLinkBase: string, videoId: string, extraSubIds?: string[]) {
  const url = new URL(productLinkBase);
  url.searchParams.set("sub_id1", videoId);
  (extraSubIds ?? []).slice(0, 4).forEach((value, index) => {
    if (value?.trim()) url.searchParams.set(`sub_id${index + 2}`, value.trim());
  });
  return url.toString();
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return fail("Supabase não configurado", 503);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("JSON inválido", 400); }
  const creatorId = String(body.criadora_id ?? body.creator_id ?? "").trim();
  const productId = String(body.product_id ?? body.produto_id ?? "").trim();
  // Aceita tanto um link já pronto (affiliate_link_bruto) quanto o link puro do produto
  // (product_link_base), que é o caminho recomendado: o sub_id1=video_id é aplicado aqui.
  const productLinkBase = String(body.product_link_base ?? "").trim();
  const affiliateOverride = String(body.affiliate_link_bruto ?? "").trim();
  const extraSubIds = Array.isArray(body.sub_ids) ? (body.sub_ids as unknown[]).map(String) : undefined;
  const videoUrl = String(body.video_url ?? "").trim();
  if (!creatorId || !productId || !isUrl(videoUrl)) return fail("criadora_id, product_id e video_url são obrigatórios", 400);
  if (!isUrl(productLinkBase) && !isUrl(affiliateOverride)) return fail("Informe product_link_base (link do produto na Shopee) ou affiliate_link_bruto", 400);

  const videoId = crypto.randomUUID();
  const affiliate = isUrl(productLinkBase)
    ? buildShopeeAffiliateLink(productLinkBase, videoId, extraSubIds)
    : affiliateOverride;

  const { data, error } = await supabaseAdmin.from("videos_ugc").insert({ id: videoId, creator_id: creatorId, product_id: productId, affiliate_link_bruto: affiliate, video_url: videoUrl }).select("id,status,moderation_status,created_at").single();
  if (error) return fail(error.message, 500);
  const base = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");
  return NextResponse.json({ success: true, video_id: data.id, link_seu_dominio: `${base}/v/${data.id}`, affiliate_link_bruto: affiliate, status: data.status, moderation_status: data.moderation_status, created_at: data.created_at }, { status: 201 });
}
