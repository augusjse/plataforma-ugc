import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  let body: { motivo?: unknown } = {};
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Informe o motivo da recusa" }, { status: 400 }); }
  const motivo = typeof body.motivo === "string" ? body.motivo.trim() : "";
  if (!motivo) return NextResponse.json({ error: "Informe o motivo da recusa" }, { status: 400 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("videos_ugc").update({ moderation_status: "reprovado", motivo_reprovacao: motivo }).eq("id", id).eq("moderation_status", "pendente").select("id,moderation_status,motivo_reprovacao").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Vídeo pendente não encontrado" }, { status: 404 });
  return NextResponse.json({ success: true, video: data });
}
