import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateSaleFinancials, ORGANIC_SHARE, PAID_AD_COST_PER_SALE, PAID_SHARE, type SaleOrigin } from "@/lib/mock/finance";

export type AdminConfig = {
  repasse_organico_percent: number;
  repasse_impulsionado_percent: number;
  custo_anuncio_por_venda: number;
};

const defaultAdminConfig: AdminConfig = {
  repasse_organico_percent: ORGANIC_SHARE,
  repasse_impulsionado_percent: PAID_SHARE,
  custo_anuncio_por_venda: PAID_AD_COST_PER_SALE,
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

export type ModerationVideo = {
  id: string;
  creatorId: string;
  creatorName: string;
  productId: string;
  productName: string;
  productImage: string;
  videoUrl: string;
  affiliateLink: string;
  moderationStatus: "pendente" | "aprovado" | "reprovado";
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
    const { data } = await supabaseAdmin.from("admin_config").select("repasse_organico_percent,repasse_impulsionado_percent,custo_anuncio_por_venda").eq("id", true).maybeSingle();
    return {
      repasse_organico_percent: Number(data?.repasse_organico_percent ?? defaultAdminConfig.repasse_organico_percent),
      repasse_impulsionado_percent: Number(data?.repasse_impulsionado_percent ?? defaultAdminConfig.repasse_impulsionado_percent),
      custo_anuncio_por_venda: Number(data?.custo_anuncio_por_venda ?? defaultAdminConfig.custo_anuncio_por_venda),
    };
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
      .eq("moderation_status", "pendente");
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getPendingModerationVideos(): Promise<ModerationVideo[]> {
  try {
  const { data: rows, error } = await supabaseAdmin.from("videos_ugc")
      .select("id,creator_id,product_id,video_url_sua_plataforma,affiliate_link_bruto,moderation_status,motivo_reprovacao")
      .eq("moderation_status", "pendente").order("created_at", { ascending: false });
    if (error) return [];
    const videos = rows ?? [];
    const creatorIds = [...new Set(videos.map((row) => String(row.creator_id)))];
    const productIds = [...new Set(videos.map((row) => String(row.product_id)))];
    const [{ data: creators }, { data: products }, { data: trending }] = await Promise.all([
      supabaseAdmin.from("users").select("id,name,email").in("id", creatorIds),
      supabaseAdmin.from("catalog_products").select("*").in("id", productIds),
      supabaseAdmin.from("trending_products_ugc").select("id,name,image").in("id", productIds),
    ]);
    const creatorMap = new Map((creators ?? []).map((row) => [String(row.id), String(row.name ?? row.email ?? "Criadora")]));
    const productMap = new Map<string, { name: string; image: string }>();
    for (const row of products ?? []) productMap.set(String(row.id), { name: String(row.name ?? "Produto"), image: String(row.image_url ?? row.image ?? "") });
    for (const row of trending ?? []) productMap.set(String(row.id), { name: String(row.name ?? "Produto"), image: String(row.image ?? "") });
    return videos.map((row) => {
      const product = productMap.get(String(row.product_id)) ?? { name: "Produto", image: "" };
      return { id: String(row.id), creatorId: String(row.creator_id), creatorName: creatorMap.get(String(row.creator_id)) ?? `Criadora ${String(row.creator_id).slice(0, 8)}`, productId: String(row.product_id), productName: product.name, productImage: product.image, videoUrl: String(row.video_url_sua_plataforma), affiliateLink: String(row.affiliate_link_bruto), moderationStatus: String(row.moderation_status) as ModerationVideo["moderationStatus"] };
    });
  } catch { return []; }
}

export const DASHBOARD_PERIODS = [15, 30, 60, 90] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];
export type DashboardDateRange = { from: string; to: string; days: number };

export function normalizeDashboardPeriod(value?: string | number): DashboardPeriod {
  const period = Number(value);
  return DASHBOARD_PERIODS.includes(period as DashboardPeriod) ? period as DashboardPeriod : 15;
}

export function normalizeDashboardRange(from?: string, to?: string): DashboardDateRange | null {
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return null;
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  return { from, to, days };
}

export async function getSales(videoIds?: string[], periodDays: number | DashboardDateRange = 15): Promise<DashboardSale[]> {
  try {
    const config = await getAdminConfig();
    let query = supabaseAdmin.from("sales_ugc").select("*").order("sale_date", { ascending: false });
    if (videoIds) query = videoIds.length ? query.in("video_id", videoIds) : query.eq("video_id", "00000000-0000-0000-0000-000000000000");
    if (typeof periodDays === "number") query = query.gte("sale_date", new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString());
    else { query = query.gte("sale_date", `${periodDays.from}T00:00:00.000Z`); query = query.lt("sale_date", `${periodDays.to}T23:59:59.999Z`); }
    const { data } = await query;
    return (data ?? []).map((row) => {
      const value = Number(row.sale_value ?? 0);
      const commissionPercent = Number(row.commission_percent ?? 0) * (Number(row.commission_percent ?? 0) <= 1 ? 100 : 1);
      const origem: SaleOrigin = row.origem === "pago" || row.origin === "paid" ? "pago" : "organico";
      const financials = calculateSaleFinancials(value, commissionPercent, origem, true, {
        organicShare: config.repasse_organico_percent,
        paidShare: config.repasse_impulsionado_percent,
        paidAdCost: config.custo_anuncio_por_venda,
      });
      return { id: String(row.id), videoId: String(row.video_id), date: String(row.sale_date), quantity: 1, revenue: value, platformCommission: financials.platformCommission, creatorCommission: financials.creatorCommission, netMargin: financials.netMargin, origem };
    });
  } catch { return []; }
}

export async function getCreatorDashboard(periodDays: number | DashboardDateRange = 15) {
  const account = await currentAccount();
  const videos = await getVideos(account?.id);
  const sales = await getSales(videos.map((video) => video.id), periodDays);
  return { account, videos, sales, products: await getProducts(), periodDays: typeof periodDays === "number" ? periodDays : periodDays.days };
}

export async function getAdminDashboard(periodDays: number | DashboardDateRange = 15) {
  const [account, videos, sales, products] = await Promise.all([currentAccount(), getVideos(), getSales(undefined, periodDays), getProducts()]);
  const { data: creators } = await supabaseAdmin.from("users").select("*").eq("role", "criadora").order("created_at", { ascending: false });
  return { account, videos, sales, products, creators: creators ?? [], periodDays: typeof periodDays === "number" ? periodDays : periodDays.days };
}
