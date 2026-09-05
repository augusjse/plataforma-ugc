import crypto from "crypto";

const SHOPEE_APP_ID = process.env.SHOPEE_APP_ID!;
const SHOPEE_APP_SECRET = process.env.SHOPEE_APP_SECRET!;
const SHOPEE_API_BASE = "https://affiliate-api.shopee.com.br";

function generateSignature(
  endpoint: string,
  timestamp: number,
  body: string = ""
): string {
  const message = `${endpoint}${timestamp}${body}`;
  return crypto
    .createHmac("sha256", SHOPEE_APP_SECRET)
    .update(message)
    .digest("hex");
}

export async function getShopeeAffiliateData(
  endpoint: string,
  body?: Record<string, any>
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const bodyStr = body ? JSON.stringify(body) : "";
  const signature = generateSignature(endpoint, timestamp, bodyStr);

  const url = `${SHOPEE_API_BASE}${endpoint}?app_id=${SHOPEE_APP_ID}&timestamp=${timestamp}&signature=${signature}`;

  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyStr || undefined,
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
  const params: Record<string, any> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  return getShopeeAffiliateData("/api/v2/conversion/get_conversion_data", params);
}

export async function getAffiliateCommissionData() {
  return getShopeeAffiliateData("/api/v2/conversion/get_commission");
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
    const data = await getAffiliateConversions();

    if (!data.data || !Array.isArray(data.data)) {
      console.log("No conversion data from Shopee");
      return [];
    }

    return data.data.map((item: any) => ({
      sub_id: item.sub_id || "",
      order_id: item.order_id,
      sale_value: parseFloat(item.sale_value) || 0,
      commission_percent: parseFloat(item.commission_percent) || 0,
      commission_amount: parseFloat(item.commission_amount) || 0,
      timestamp: item.timestamp,
      status: item.status || "pending",
    }));
  } catch (error) {
    console.error("Error syncing Shopee conversions:", error);
    throw error;
  }
}
