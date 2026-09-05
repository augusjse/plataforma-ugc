import crypto from "node:crypto";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const SHOPEE_URL = process.env.SHOPEE_AFFILIATE_URL ?? "https://open-api.affiliate.shopee.com.br/graphql";
const PAGE_LIMIT = 20;
const MAX_PRODUCTS = 50;
const query = `query TrendingProducts($page: Int!, $limit: Int!) {
  productOfferV2(listType: 2, sortType: 5, page: $page, limit: $limit) {
    nodes { itemId productName productLink offerLink imageUrl priceMin shopName commissionRate }
    pageInfo { page limit hasNextPage }
  }
}`;

type ShopeeProduct = { itemId?: string | number; productName?: string; productLink?: string; offerLink?: string; imageUrl?: string; priceMin?: string | number; shopName?: string; commissionRate?: string | number };
export type TrendingProduct = { id: string; name: string; price: number | null; image: string; store: string; url: string; growth: null; commissionRate: number | null; fetchedAt: string };

function numberOrNull(value: unknown): number | null {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchPage(appId: string, secret: string, page: number) {
  const payload = JSON.stringify({ query, variables: { page, limit: PAGE_LIMIT } });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHash("sha256").update(`${appId}${timestamp}${payload}${secret}`).digest("hex");
  const response = await fetch(SHOPEE_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}` }, body: payload, cache: "no-store" });
  if (!response.ok) throw new Error(`Shopee respondeu ${response.status}`);
  const body = await response.json();
  if (body.errors?.length) throw new Error(body.errors[0]?.message ?? "Erro GraphQL da Shopee");
  return body.data?.productOfferV2;
}

export async function syncTrendingProducts(): Promise<TrendingProduct[]> {
  const appId = process.env.SHOPEE_APP_ID;
  const secret = process.env.SHOPEE_APP_SECRET ?? process.env.SHOPEE_SECRET;
  if (!appId || !secret) throw new Error("Shopee Affiliate API não configurada.");
  // A API aceita páginas de 20; três chamadas dão até 60 itens, limitados a 50.
  const nodes: ShopeeProduct[] = [];
  for (let page = 0; page < 3 && nodes.length < MAX_PRODUCTS; page++) {
    const result = await fetchPage(appId, secret, page);
    nodes.push(...(result?.nodes ?? []));
    if (!result?.pageInfo?.hasNextPage) break;
  }
  const fetchedAt = new Date().toISOString();
  // The API can return the same item on more than one page. PostgreSQL rejects
  // an upsert batch when two rows target the same conflict key, so keep the
  // first occurrence of each item before persisting.
  const entries = nodes.map((product) => {
    const normalized = { id: String(product.itemId ?? ""), name: product.productName ?? "Produto Shopee", price: numberOrNull(product.priceMin), image: product.imageUrl ?? "", store: product.shopName ?? "Shopee", url: product.offerLink ?? product.productLink ?? "https://shopee.com.br", growth: null, commissionRate: numberOrNull(product.commissionRate), fetchedAt };
    return [normalized.id, normalized] as const;
  }).filter(([id]) => id);
  const products = Array.from(new Map(entries).values()).slice(0, MAX_PRODUCTS);
  if (isSupabaseConfigured && products.length) {
    const rows = products.map((product) => ({ id: product.id, name: product.name, price: product.price, image: product.image, shop_link: product.url, vendor_commission: (product.commissionRate ?? 0) * 100, fetched_at: product.fetchedAt }));
    const { error } = await supabaseAdmin.from("trending_products_ugc").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`Erro ao persistir trending: ${error.message}`);
  }
  return products;
}
