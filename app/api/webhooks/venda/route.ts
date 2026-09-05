import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getAdminConfig } from "@/lib/dashboard-data";

export async function POST(request: NextRequest) {
  const secret = process.env.VIDEO_SALES_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-webhook-secret") !== secret) return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  if (!isSupabaseConfigured) return NextResponse.json({ success: false, error: "Supabase não configurado" }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 }); }
  const videoId = String(body.video_id ?? "").trim();
  const saleValue = Number(body.sale_value ?? body.valor_bruto);
  const commission = Number(body.commission_percent ?? body.comissao_percent);
  const saleDate = String(body.sale_date ?? body.data_venda ?? new Date().toISOString());
  if (!videoId || !Number.isFinite(saleValue) || saleValue < 0 || !Number.isFinite(commission)) return NextResponse.json({ success: false, error: "video_id, sale_value e commission_percent são obrigatórios" }, { status: 400 });
  const commissionRate = commission > 1 ? commission / 100 : commission;
  const video = await supabaseAdmin.from("videos_ugc").select("id,status,janela_inicio,janela_fim").eq("id", videoId).single();
  if (video.error || !video.data) return NextResponse.json({ success: false, error: "video_id não encontrado" }, { status: 404 });
  const firstSale = !video.data.janela_inicio;
  const start = firstSale ? saleDate : video.data.janela_inicio;
  const end = firstSale ? new Date(new Date(saleDate).getTime() + 30 * 86400000).toISOString() : video.data.janela_fim;
  const inWindow = !end || new Date(saleDate) <= new Date(end);
  const config = await getAdminConfig();
  const creatorCommission = inWindow ? Number((saleValue * commissionRate * config.repasse_organico_percent / 100).toFixed(2)) : 0;
  const platformCommission = Number((saleValue * commissionRate - creatorCommission).toFixed(2));
  const updated = await supabaseAdmin.from("videos_ugc").update({ janela_inicio: start, janela_fim: end, status: inWindow ? "ativo" : "encerrado" }).eq("id", videoId).select("*").single();
  if (updated.error) return NextResponse.json({ success: false, error: updated.error.message }, { status: 500 });
  const inserted = await supabaseAdmin.from("sales_ugc").insert({ video_id: videoId, sale_value: saleValue, commission_percent: commissionRate, commission_creator: creatorCommission, commission_platform: platformCommission, sale_date: saleDate }).select("*").single();
  if (inserted.error) return NextResponse.json({ success: false, error: inserted.error.message }, { status: 500 });
  return NextResponse.json({ success: true, sale: inserted.data, video: updated.data });
}
