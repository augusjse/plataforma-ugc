import { NextResponse } from "next/server";
import { syncTrendingProducts } from "@/lib/shopee-trending";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  } else console.warn("CRON_SECRET não configurada; sincronização cron liberada em modo dev.");
  try { const products = await syncTrendingProducts(); return NextResponse.json({ success: true, count: products.length }); }
  catch (error) { console.error("Trending cron error", error); return NextResponse.json({ error: "Não foi possível sincronizar os produtos em alta." }, { status: 502 }); }
}
