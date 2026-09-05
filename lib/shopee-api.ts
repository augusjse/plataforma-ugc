import crypto from "crypto";

const SHOPEE_APP_ID = process.env.SHOPEE_APP_ID!;
const SHOPEE_APP_SECRET = process.env.SHOPEE_APP_SECRET!;
const SHOPEE_API_BASE = "https://open-api.affiliate.shopee.com.br";

function generateSignature(timestamp: number, body: string): string {
  const message = `${timestamp}${body}`;
  return crypto
    .createHmac("sha256", SHOPEE_APP_SECRET)
    .update(message)
    .digest("hex");
}

export async function getShopeeGraphQLData(query: string, variables?: any) {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({ query, variables });
  const signature = generateSignature(timestamp, body);

  const response = await fetch(`${SHOPEE_API_BASE}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Token": SHOPEE_APP_ID,
      "X-Signature": signature,
      "X-Timestamp": String(timestamp),
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Shopee API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getAffiliateConversions(
  startDate?: number,
  endDate?: number
) {
  const query = `
    query GetConversions($startDate: Int, $endDate: Int) {
      conversions(startDate: $startDate, endDate: $endDate) {
        edges {
          node {
            id
            orderId
            saleValue
            commissionPercent
            commissionAmount
            timestamp
            status
            subId
          }
        }
      }
    }
  `;

  return getShopeeGraphQLData(query, { startDate, endDate });
}

export interface ShopeeConversion {
  sub_id: string;
  order_id: string;
  sale_value: number;
  commission_percent: number;
  commission_amount: number;
  timestamp: number;
  status: "pending" | "confirmed" | "rejected";
}

export async function syncShopeeConversions(): Promise<ShopeeConversion[]> {
  try {
    const response = await getAffiliateConversions();

    if (response.errors) {
      console.error("GraphQL errors:", response.errors);
      throw new Error(`Shopee API error: ${response.errors[0]?.message}`);
    }

    const edges = response.data?.conversions?.edges || [];

    if (!Array.isArray(edges)) {
      console.log("No conversion data from Shopee");
      return [];
    }

    return edges.map((edge: any) => {
      const node = edge.node;
      return {
        sub_id: node.subId || "",
        order_id: node.orderId,
        sale_value: parseFloat(node.saleValue) || 0,
        commission_percent: parseFloat(node.commissionPercent) || 0,
        commission_amount: parseFloat(node.commissionAmount) || 0,
        timestamp: node.timestamp,
        status: node.status || "pending",
      };
    });
  } catch (error) {
    console.error("Error syncing Shopee conversions:", error);
    throw error;
  }
}
