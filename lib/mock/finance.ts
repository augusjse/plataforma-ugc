export type SaleOrigin = "organico" | "pago";

// Percentuais padrão da comissão da plataforma repassados à criadora, nunca do valor da venda.
// O orgânico paga mais porque a criadora trouxe o público; o pago considera a verba de anúncio.
export const ORGANIC_SHARE = 50;
export const PAID_SHARE = 10;

// Custo médio mock de anúncio atribuído a cada venda originada por tráfego pago.
export const PAID_AD_COST_PER_SALE = 9;

export type SaleFinancials = {
  platformCommission: number;
  creatorCommission: number;
  grossMargin: number;
  adCost: number;
  netMargin: number;
};

export type DistributionConfig = {
  organicShare: number;
  paidShare: number;
  paidAdCost: number;
};

export function calculateSaleFinancials(
  revenue: number,
  productCommissionPercent: number,
  origin: SaleOrigin,
  insideWindow: boolean,
  config: DistributionConfig = {
    organicShare: ORGANIC_SHARE,
    paidShare: PAID_SHARE,
    paidAdCost: PAID_AD_COST_PER_SALE,
  },
): SaleFinancials {
  const platformCommission = Number(
    ((revenue * productCommissionPercent) / 100).toFixed(2),
  );
  const share = origin === "organico" ? config.organicShare : config.paidShare;
  const creatorCommission = insideWindow
    ? Number(((platformCommission * share) / 100).toFixed(2))
    : 0;
  const grossMargin = Number(
    (platformCommission - creatorCommission).toFixed(2),
  );
  const adCost = origin === "pago" ? config.paidAdCost : 0;
  return {
    platformCommission,
    creatorCommission,
    grossMargin,
    adCost,
    netMargin: Number((grossMargin - adCost).toFixed(2)),
  };
}

export function creatorEarningPerSale(
  price: number,
  productCommissionPercent: number,
): number {
  const financials = calculateSaleFinancials(
    price,
    productCommissionPercent,
    "organico",
    true,
  );
  return financials.creatorCommission;
}
