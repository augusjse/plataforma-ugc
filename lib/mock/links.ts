import { products } from "./products";
import { sales, videos } from "./creator";

export type CreatorLink = {
  creator: string;
  product: string;
  video: string;
  subId: string;
  url: string;
  date: string;
  clicks: number;
  sales: number;
  commission: number;
};

const creatorByVideo: Record<string, string> = {
  v1: "Maria Souza",
  v2: "Maria Souza",
  v3: "Maria Souza",
};

export const creatorLinks: CreatorLink[] = videos.map((video) => {
  const product =
    products.find((item) => item.id === video.productId) ?? products[0];
  const videoSales = sales.filter((sale) => sale.videoId === video.id);
  return {
    creator: creatorByVideo[video.id] ?? "Criadora parceira",
    product: product.name,
    video: video.title,
    subId: video.myLink.split("=").at(-1) ?? "video_ugc",
    url: video.myLink,
    date: video.janela_inicio ?? "Aguardando primeira venda",
    clicks: video.clicks,
    sales: videoSales.reduce((sum, sale) => sum + sale.quantity, 0),
    commission: videoSales.reduce(
      (sum, sale) => sum + sale.creatorCommission,
      0,
    ),
  };
});
