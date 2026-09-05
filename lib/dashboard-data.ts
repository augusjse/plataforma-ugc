import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

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

function product(row: Record<string, unknown>): DashboardProduct {
  const commission = Number(row.commission_percent ?? row.commissionPercent ?? 0);
  const price = Number(row.price ?? 0);
  return {
    id: String(row.id), name: String(row.name ?? "Produto"), category: String(row.category ?? ""),
    price, commissionPercent: commission, commissionValue: price * commission / 100,
    creatorCommissionValue: price * commission / 200, difficulty: "Médio",
    image: String(row.image_url ?? row.image ?? ""), shopeeLink: String(row.shopee_url ?? ""),
    affiliateLink: String(row.affiliate_link ?? ""), status: row.status === "paused" ? "Pausado" : "Ativo",
    videoCount: 0, sales: 0,
  };
}

export async function getProducts(): Promise<DashboardProduct[]> {
  try {
    const { data } = await supabaseAdmin.from("catalog_products").select("*").order("created_at", { ascending: false });
    return (data ?? []).map((row) => product(row as Record<string, unknown>));
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

export async function getSales(videoIds?: string[]): Promise<DashboardSale[]> {
  try {
    let query = supabaseAdmin.from("sales_ugc").select("*").order("sale_date", { ascending: false });
    if (videoIds) query = videoIds.length ? query.in("video_id", videoIds) : query.eq("video_id", "00000000-0000-0000-0000-000000000000");
    const { data } = await query;
    return (data ?? []).map((row) => {
      const value = Number(row.sale_value ?? 0), creator = Number(row.commission_creator ?? 0), platform = Number(row.commission_platform ?? 0);
      return { id: String(row.id), videoId: String(row.video_id), date: String(row.sale_date), quantity: 1, revenue: value, platformCommission: platform, creatorCommission: creator, netMargin: platform - creator, origem: "organico" };
    });
  } catch { return []; }
}

export async function getCreatorDashboard() {
  const account = await currentAccount();
  const videos = await getVideos(account?.id);
  const sales = await getSales(videos.map((video) => video.id));
  return { account, videos, sales, products: await getProducts() };
}

export async function getAdminDashboard() {
  const [account, videos, sales, products] = await Promise.all([currentAccount(), getVideos(), getSales(), getProducts()]);
  const { data: creators } = await supabaseAdmin.from("users").select("*").eq("role", "criadora").order("created_at", { ascending: false });
  return { account, videos, sales, products, creators: creators ?? [] };
}
