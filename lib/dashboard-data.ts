import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateSaleFinancials, ORGANIC_SHARE, PAID_AD_COST_PER_SALE, PAID_SHARE, type SaleOrigin } from "@/lib/mock/finance";

export type AdminConfig = {
  repasse_organico_percent: number;
  repasse_impulsionado_percent: number;
  custo_anuncio_venda: number;
};

const defaultAdminConfig: AdminConfig = {
  repasse_organico_percent: ORGANIC_SHARE,
  repasse_impulsionado_percent: PAID_SHARE,
  custo_anuncio_venda: PAID_AD_COST_PER_SALE,
};

export type DashboardProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  commissionPercent: number;
  commissionValue: number;
  creatorCommissionValue: number;
  difficulty: "Fácil" | "Médio";
  image: string;
  shopeeLink: string;
  affiliateLink: string;
  status: "Ativo" | "Pausado" | "Esgotado";
  videoCount: number;
  sales: number;
};

export type DashboardVideo = {
  id: string;
  title: string;
  product: string;
  productId: string;
  creatorId: string;
  status: string;
  clicks: number;
  sales: number;
  commission: number;
  date: string;
  myLink: string;
  janela_inicio: string | null;
  janela_fim: string | null;
  janela_status: "aguardando" | "ativa" | "encerrada";
  diasRestantes: number | null;
};

export type DashboardSale = {
  id: string;
  videoId: string;
  date: string;
  quantity: number;
  revenue: number;
  platformCommission: number;
  creatorCommission: number;
  netMargin: number;
  origem: "organico" | "pago";
};

export async function currentAccount() {
  try {
    const client = await createSupabaseServerClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user?.email) return null;
    const { data } = await supabaseAdmin.from("users").select("*").eq("email", user.email).maybeSingle();
    return data ?? null;
  } catch { return null; }
}

export async function getAdminConfig(): Promise<AdminConfig> {
  try {
    const { data } = await supabaseAdmin.from("admin_config").select("repasse_organico_percent,repasse_impulsionado_percent,custo_anuncio_venda").eq("id", true).maybeSingle();
    return { ...defaultAdminConfig, ...(data ?? {}) };
  } catch { return defaultAdminConfig; }
}

function product(row: Record<string, unknown>, config: AdminConfig): DashboardProduct {
  const commission = Number(row.commission_percent ?? row.commissionPercent ?? 0);
  const price = Number(row.price ?? 0);
  return {
    id: String(row.id), name: String(row.name ?? "Produto"), category: String(row.category ?? ""),
    price, commissionPercent: commission, commissionValue: price * commission / 100,
    creatorCommissionValue: price * commission * config.repasse_organico_percent / 10000, difficulty: "Médio",
    image: String(row.image_url ?? row.image ?? ""), shopeeLink: String(row.shopee_url ?? ""),
    affiliateLink: String(row.affiliate_link ?? ""), status: row.status === "paused" ? "Pausado" : "Ativo",
    videoCount: 0, sales: 0,
  };
}

export async function getProducts(): Promise<DashboardProduct[]> {
  try {
    const [{ data }, config] = await Promise.all([
      supabaseAdmin.from("catalog_products").select("*").order("created_at", { ascending: false }),
      getAdminConfig(),
    ]);
    return (data ?? []).map((row) => product(row as Record<string, unknown>, config));
  } catch { return []; }
}

function mapVideo(row: Record<string, unknown>, productName = "Produto"): DashboardVideo {
  const status = String(row.status ?? "aguardando_primeira_venda");
  const start = row.janela_inicio ? String(row.janela_inicio) : null;
  const end = row.janela_fim ? String(row.janela_fim) : null;
  const remaining = row.dias_restantes == null ? null : Number(row.dias_restantes);
  return {
    id: String(row.video_id ?? row.id), title: String(row.title ?? `Vídeo ${String(row.video_id ?? row.id).slice(0, 8)}`),
    product: productName, productId: String(row.product_id ?? ""), creatorId: String(row.creator_id ?? ""), status,
    clicks: Number(row.clicks ?? row.total_clicks ?? 0), sales: Number(row.total_sales ?? 0),
    commission: Number(row.total_ganho_criadora ?? 0), date: row.created_at ? new Date(String(row.created_at)).toLocaleDateString("pt-BR") : "",
    myLink: String(row.affiliate_link_bruto ?? ""), janela_inicio: start, janela_fim: end,
    janela_status: status === "ativo" ? "ativa" : status === "encerrado" ? "encerrada" : "aguardando", diasRestantes: remaining,
  };
}

export async function getVideos(creatorId?: string): Promise<DashboardVideo[]> {
  try {
    let query = supabaseAdmin.from("video_janelas").select("*").order("created_at", { ascending: false });
    if (creatorId) query = query.eq("creator_id", creatorId);
    const { data } = await query;
    return (data ?? []).map((row) => mapVideo(row as Record<string, unknown>));
  } catch { return []; }
}

export async function getPendingVideosCount(): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from("videos_ugc")
      .select("id", { count: "exact", head: true })
      .eq("status", "aguardando_primeira_venda");
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export const DASHBOARD_PERIODS = [15, 30, 60, 90] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export function normalizeDashboardPeriod(value?: string | number): DashboardPeriod {
  const period = Number(value);
  return DASHBOARD_PERIODS.includes(period as DashboardPeriod) ? period as DashboardPeriod : 15;
}

export async function getSales(videoIds?: string[], periodDays: DashboardPeriod = 15): Promise<DashboardSale[]> {
  try {
    const config = await getAdminConfig();
    let query = supabaseAdmin.from("sales_ugc").select("*").order("sale_date", { ascending: false });
    if (videoIds) query = videoIds.length ? query.in("video_id", videoIds) : query.eq("video_id", "00000000-0000-0000-0000-000000000000");
    const cutoff = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("sale_date", cutoff);
    const { data } = await query;
    return (data ?? []).map((row) => {
      const value = Number(row.sale_value ?? 0);
      const commissionPercent = Number(row.commission_percent ?? 0) * (Number(row.commission_percent ?? 0) <= 1 ? 100 : 1);
      const origem: SaleOrigin = row.origem === "pago" || row.origin === "paid" ? "pago" : "organico";
      const financials = calculateSaleFinancials(value, commissionPercent, origem, true, {
        organicShare: config.repasse_organico_percent,
        paidShare: config.repasse_impulsionado_percent,
        paidAdCost: config.custo_anuncio_venda,
      });
      return { id: String(row.id), videoId: String(row.video_id), date: String(row.sale_date), quantity: 1, revenue: value, platformCommission: financials.platformCommission, creatorCommission: financials.creatorCommission, netMargin: financials.netMargin, origem };
    });
  } catch { return []; }
}

export async function getCreatorDashboard(periodDays: DashboardPeriod = 15) {
  const account = await currentAccount();
  const videos = await getVideos(account?.id);
  const sales = await getSales(videos.map((video) => video.id), periodDays);
  return { account, videos, sales, products: await getProducts(), periodDays };
}

export async function getAdminDashboard(periodDays: DashboardPeriod = 15) {
  const [account, videos, sales, products] = await Promise.all([currentAccount(), getVideos(), getSales(undefined, periodDays), getProducts()]);
  const { data: creators } = await supabaseAdmin.from("users").select("*").eq("role", "criadora").order("created_at", { ascending: false });
  return { account, videos, sales, products, creators: creators ?? [], periodDays };
}
