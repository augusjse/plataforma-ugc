import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  const { data, error } = await supabaseAdmin.from("trending_products_ugc").select("id,name,price,image,shop_link,vendor_commission,status,fetched_at,created_at").order("fetched_at", { ascending: false });
  if (error) { console.error("Trending list error", error); return NextResponse.json({ error: "Não foi possível carregar os produtos persistidos." }, { status: 500 }); }
  return NextResponse.json({ products: data ?? [] });
}
