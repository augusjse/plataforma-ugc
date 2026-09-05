import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: NextRequest, context: { params: Promise<{ video_id: string }> }) {
  if (!isSupabaseConfigured) return new NextResponse("Supabase não configurado", { status: 503 });
  const { video_id } = await context.params;
  const { data, error } = await supabaseAdmin.from("videos_ugc").select("affiliate_link_bruto").eq("id", video_id).single();
  if (error || !data) return new NextResponse("Vídeo não encontrado", { status: 404 });
  await supabaseAdmin.from("video_clicks_ugc").insert({ video_id });
  return NextResponse.redirect(data.affiliate_link_bruto, 302);
}
