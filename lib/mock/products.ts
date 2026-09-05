import { creatorEarningPerSale } from "./finance";

export type ProductStatus = "Ativo" | "Pausado" | "Esgotado";

export type Product = {
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
  status: ProductStatus;
  videoCount: number;
  sales: number;
};

export function commissionPerSale(product: Product): number {
  return Number(((product.price * product.commissionPercent) / 100).toFixed(2));
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Mini aspirador portátil 3 em 1",
    category: "Casa",
    price: 79.9,
    commissionPercent: 15,
    commissionValue: 0,
    creatorCommissionValue: 0,
    difficulty: "Fácil",
    image:
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
    shopeeLink: "shopee.com.br/mini-aspirador-3-em-1",
    affiliateLink: "shopee.com.br/universal-link?af=studiougc01",
    status: "Ativo",
    videoCount: 12,
    sales: 1842,
  },
  {
    id: "p2",
    name: "Garrafa térmica Stanley 1L",
    category: "Estilo de vida",
    price: 139.9,
    commissionPercent: 18,
    commissionValue: 0,
    creatorCommissionValue: 0,
    difficulty: "Fácil",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    shopeeLink: "shopee.com.br/garrafa-termica-stanley",
    affiliateLink: "shopee.com.br/universal-link?af=studiougc02",
    status: "Ativo",
    videoCount: 8,
    sales: 986,
  },
  {
    id: "p3",
    name: "Kit organizador de maquiagem",
    category: "Beleza",
    price: 49.9,
    commissionPercent: 10,
    commissionValue: 0,
    creatorCommissionValue: 0,
    difficulty: "Médio",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
    shopeeLink: "shopee.com.br/kit-organizador-maquiagem",
    affiliateLink: "shopee.com.br/universal-link?af=studiougc03",
    status: "Ativo",
    videoCount: 0,
    sales: 0,
  },
  {
    id: "p4",
    name: "Luminária LED para vídeos",
    category: "Eletrônicos",
    price: 99.9,
    commissionPercent: 15,
    commissionValue: 0,
    creatorCommissionValue: 0,
    difficulty: "Médio",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=600&q=80",
    shopeeLink: "shopee.com.br/luminaria-led-videos",
    affiliateLink: "shopee.com.br/universal-link?af=studiougc04",
    status: "Pausado",
    videoCount: 5,
    sales: 421,
  },
];

for (const product of products) {
  product.commissionValue = commissionPerSale(product);
  product.creatorCommissionValue = creatorEarningPerSale(
    product.price,
    product.commissionPercent,
  );
}
