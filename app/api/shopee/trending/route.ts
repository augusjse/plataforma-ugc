import { NextResponse } from "next/server";
import { syncTrendingProducts } from "@/lib/shopee-trending";

export async function GET() {
  try {
    const products = await syncTrendingProducts();
    return NextResponse.json({ products }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("Shopee trending error", error);
    const message = error instanceof Error ? error.message : "Não foi possível carregar os produtos em alta.";
    return NextResponse.json({ error: message }, { status: message.includes("não configurada") ? 503 : 502 });
  }
}
