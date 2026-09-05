import { products } from "./products";
import { calculateSaleFinancials, type SaleOrigin } from "./finance";

export type VideoStatus =
  "Em análise" | "Aprovado" | "Impulsionado" | "Reprovado";
export type WindowStatus = "aguardando" | "ativa" | "encerrada";

export type VideoSale = {
  id: string;
  videoId: string;
  date: string;
  quantity: number;
  origem: SaleOrigin;
  insideWindow: boolean;
  revenue: number;
  platformCommission: number;
  creatorCommission: number;
  grossMargin: number;
  adCost: number;
  netMargin: number;
};

export type CommissionWindow = {
  janela_inicio: string | null;
  janela_dias: 30;
  janela_fim: string | null;
  janela_status: WindowStatus;
  diasRestantes: number | null;
};

export type Video = CommissionWindow & {
  id: string;
  title: string;
  product: string;
  productId: string;
  status: VideoStatus;
  clicks: number;
  sales: number;
  commission: number;
  date: string;
  myLink: string;
  reason?: string;
};

export const mockToday = "2025-09-15";

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): number {
  const startTime = new Date(`${start}T12:00:00Z`).getTime();
  const endTime = new Date(`${end}T12:00:00Z`).getTime();
  return Math.floor((endTime - startTime) / 86400000);
}

export const videosBase = [
  {
    id: "v1",
    title: "Testando o mini aspirador",
    productId: "p1",
    status: "Impulsionado" as VideoStatus,
    clicks: 18400,
    date: "há 2 dias",
    myLink: "shopee.com.br/universal-link?sub_id=video_maria01",
  },
  {
    id: "v2",
    title: "O que cabe na minha bolsa",
    productId: "p2",
    status: "Aprovado" as VideoStatus,
    clicks: 9200,
    date: "há 5 dias",
    myLink: "shopee.com.br/universal-link?sub_id=video_maria02",
  },
  {
    id: "v3",
    title: "Organizando minha penteadeira",
    productId: "p3",
    status: "Em análise" as VideoStatus,
    clicks: 0,
    date: "hoje",
    myLink: "shopee.com.br/universal-link?sub_id=video_maria03",
  },
  {
    id: "v4",
    title: "Minha garrafa para o dia todo",
    productId: "p2",
    status: "Aprovado" as VideoStatus,
    clicks: 12600,
    date: "há 28 dias",
    myLink: "shopee.com.br/universal-link?sub_id=video_maria04",
  },
];

export const salesBase = [
  {
    id: "s1",
    videoId: "v1",
    date: "2025-09-04",
    quantity: 38,
    origem: "organico" as SaleOrigin,
  },
  {
    id: "s2",
    videoId: "v1",
    date: "2025-09-12",
    quantity: 200,
    origem: "pago" as SaleOrigin,
  },
  {
    id: "s3",
    videoId: "v2",
    date: "2025-08-22",
    quantity: 24,
    origem: "organico" as SaleOrigin,
  },
  {
    id: "s4",
    videoId: "v2",
    date: "2025-09-14",
    quantity: 8,
    origem: "pago" as SaleOrigin,
  },
  {
    id: "s5",
    videoId: "v2",
    date: "2025-10-01",
    quantity: 12,
    origem: "pago" as SaleOrigin,
  },
  {
    id: "s6",
    videoId: "v3",
    date: "2025-09-15",
    quantity: 2,
    origem: "pago" as SaleOrigin,
  },
  {
    id: "s7",
    videoId: "v4",
    date: "2025-07-01",
    quantity: 30,
    origem: "organico" as SaleOrigin,
  },
  {
    id: "s8",
    videoId: "v4",
    date: "2025-08-12",
    quantity: 15,
    origem: "pago" as SaleOrigin,
  },
];

function firstSaleDate(videoId: string): string | null {
  return salesBase.find((sale) => sale.videoId === videoId)?.date ?? null;
}

export function getCommissionWindow(videoId: string): CommissionWindow {
  const start = firstSaleDate(videoId);
  if (!start) {
    return {
      janela_inicio: null,
      janela_dias: 30,
      janela_fim: null,
      janela_status: "aguardando",
      diasRestantes: null,
    };
  }
  const end = addDays(start, 30);
  const remaining = daysBetween(mockToday, end);
  return {
    janela_inicio: start,
    janela_dias: 30,
    janela_fim: end,
    janela_status: remaining > 0 ? "ativa" : "encerrada",
    diasRestantes: Math.max(remaining, 0),
  };
}

export const sales: VideoSale[] = salesBase.map((sale) => {
  const video = videosBase.find((item) => item.id === sale.videoId);
  const product =
    products.find((item) => item.id === video?.productId) ?? products[0];
  const window = getCommissionWindow(sale.videoId);
  const inside = Boolean(
    window.janela_inicio &&
    sale.date >= window.janela_inicio &&
    sale.date <= (window.janela_fim ?? ""),
  );
  const revenue = Number((sale.quantity * product.price).toFixed(2));
  const financials = calculateSaleFinancials(
    revenue,
    product.commissionPercent,
    sale.origem,
    inside,
  );
  return {
    ...sale,
    insideWindow: inside,
    revenue,
    ...financials,
  };
});

export const videos: Video[] = videosBase.map((video) => {
  const product =
    products.find((item) => item.id === video.productId) ?? products[0];
  const videoSales = sales.filter((sale) => sale.videoId === video.id);
  const window = getCommissionWindow(video.id);
  return {
    ...video,
    ...window,
    product: product.name,
    sales: videoSales.reduce((total, sale) => total + sale.quantity, 0),
    commission: Number(
      videoSales
        .reduce((total, sale) => total + sale.creatorCommission, 0)
        .toFixed(2),
    ),
  };
});

export const links = videos.slice(0, 2).map((video) => ({
  video: video.title,
  code: video.myLink.split("=").at(-1) ?? "video_maria",
  url: video.myLink,
}));
