import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("videos_ugc").update({ moderation_status: "reprovado" }).eq("id", id).eq("moderation_status", "pendente").select("id,moderation_status").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Vídeo pendente não encontrado" }, { status: 404 });
  return NextResponse.json({ success: true, video: data });
}
