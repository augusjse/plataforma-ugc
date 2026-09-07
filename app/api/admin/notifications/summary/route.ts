import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/current-account";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const account = await getCurrentAccount();
  if (!account || account.role !== "admin") return NextResponse.json({ count: 0 }, { status: 403 });

  const [{ count: pendingVideos }, { count: pendingTrending }] = await Promise.all([
    supabaseAdmin.from("videos_ugc").select("id", { count: "exact", head: true }).eq("moderation_status", "pendente"),
    supabaseAdmin.from("trending_products_ugc").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return NextResponse.json({ count: (pendingVideos ?? 0) + (pendingTrending ?? 0) });
}
