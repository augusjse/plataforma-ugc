import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, context: { params: Promise<{ creator_id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json({ success: false, error: "Supabase não configurado" }, { status: 503 });
  const { creator_id } = await context.params;
  const [{ data, error }, { data: attemptRows, error: attemptsError }] = await Promise.all([
    supabaseAdmin.from("video_janelas").select("*").eq("creator_id", creator_id).order("created_at", { ascending: false }),
    supabaseAdmin.from("videos_ugc").select("product_id").eq("creator_id", creator_id),
  ]);
  if (error || attemptsError) return NextResponse.json({ success: false, error: error?.message ?? attemptsError?.message }, { status: 500 });
  const attempts_by_product: Record<string, number> = {};
  for (const row of attemptRows ?? []) {
    const productId = String(row.product_id ?? "");
    if (productId) attempts_by_product[productId] = (attempts_by_product[productId] ?? 0) + 1;
  }
  return NextResponse.json({ success: true, videos: data ?? [], attempts_by_product });
}
