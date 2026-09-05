import { NextResponse } from "next/server";
import crypto from "node:crypto";

const SHOPEE_URL =
  process.env.SHOPEE_AFFILIATE_URL ??
  "https://open-api.affiliate.shopee.com.br/graphql";

const query = `query TrendingProducts($page: Int!, $limit: Int!) {
  productOfferV2(listType: 2, sortType: 5, page: $page, limit: $limit) {
    nodes {
      itemId productName productLink offerLink imageUrl priceMin
      shopName commissionRate
    }
    pageInfo { page limit hasNextPage }
  }
}`;

type ShopeeProduct = {
  itemId?: string | number;
  productName?: string;
  productLink?: string;
  offerLink?: string;
  imageUrl?: string;
  priceMin?: string | number;
  shopName?: string;
  commissionRate?: string | number;
};

function numberOrNull(value: unknown): number | null {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  const appId = process.env.SHOPEE_APP_ID;
  const secret = process.env.SHOPEE_APP_SECRET ?? process.env.SHOPEE_SECRET;

  if (!appId || !secret) {
    return NextResponse.json(
      { error: "Shopee Affiliate API não configurada." },
      { status: 503 },
    );
  }

  const payload = JSON.stringify({
    query,
    variables: { page: 0, limit: 20 },
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash("sha256")
    .update(`${appId}${timestamp}${payload}${secret}`)
    .digest("hex");

  try {
    const response = await fetch(SHOPEE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}`,
      },
      body: payload,
      next: { revalidate: 60 * 60 * 6 },
    });

    if (!response.ok) {
      throw new Error(`Shopee respondeu ${response.status}`);
    }

    const body = await response.json();
    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? "Erro GraphQL da Shopee");
    }

    const nodes: ShopeeProduct[] = body.data?.productOfferV2?.nodes ?? [];
    const products = nodes.map((product) => ({
      id: String(product.itemId ?? ""),
      name: product.productName ?? "Produto Shopee",
      price: numberOrNull(product.priceMin),
      image: product.imageUrl ?? "",
      store: product.shopName ?? "Shopee",
      url: product.offerLink ?? product.productLink ?? "https://shopee.com.br",
      // A API de ofertas não expõe necessariamente crescimento; não inventamos a métrica.
      growth: null,
      commissionRate: numberOrNull(product.commissionRate),
      fetchedAt: new Date().toISOString(),
    }));

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=21600, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("Shopee trending error", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os produtos em alta." },
      { status: 502 },
    );
  }
}
