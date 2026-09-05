import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, context: { params: Promise<{ creator_id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ success: false, error: "Supabase não configurado" }, { status: 503 });
  const { creator_id } = await context.params;
  const { data, error } = await supabaseAdmin.from("video_janelas").select("*").eq("creator_id", creator_id).order("created_at", { ascending: false });
  return error ? NextResponse.json({ success: false, error: error.message }, { status: 500 }) : NextResponse.json({ success: true, videos: data ?? [] });
}
