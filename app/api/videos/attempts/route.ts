import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const ATTEMPT_LIMIT = 4;

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ success: false, error: "Supabase não configurado" }, { status: 503 });
  }

  const creatorId = request.nextUrl.searchParams.get("creator_id")?.trim();
  const productId = request.nextUrl.searchParams.get("product_id")?.trim();
  if (!creatorId || !productId) {
    return NextResponse.json({ success: false, error: "creator_id e product_id são obrigatórios" }, { status: 400 });
  }

  const { count, error } = await supabaseAdmin
    .from("videos_ugc")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .eq("product_id", productId);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const attemptCount = count ?? 0;
  return NextResponse.json({
    success: true,
    attempt_count: attemptCount,
    attempt_limit: ATTEMPT_LIMIT,
    limit_reached: attemptCount >= ATTEMPT_LIMIT,
  });
}
