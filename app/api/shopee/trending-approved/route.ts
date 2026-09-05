import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from("trending_products_ugc")
    .select("id,name,image,shop_link")
    .eq("status", "approved")
    .order("fetched_at", { ascending: false });

  if (error) {
    console.error("Approved trending list error", error);
    return NextResponse.json({ error: "Não foi possível carregar os produtos aprovados." }, { status: 500 });
  }

  return NextResponse.json({
    products: (data ?? []).map((product) => ({
      id: String(product.id),
      name: product.name,
      image: product.image ?? "",
      store: "Shopee",
      url: product.shop_link,
    })),
  });
}
