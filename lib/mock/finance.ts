export type SaleOrigin = "organico" | "pago";

// Percentual padrão da comissão da plataforma repassado à criadora, nunca do valor da venda.
export const PAID_SHARE = 10;

export type SaleFinancials = {
  platformCommission: number;
  creatorCommission: number;
  grossMargin: number;
  adCost: number;
  netMargin: number;
};

export type DistributionConfig = {
  creatorShare: number;
  metaAdsTaxPercent: number;
};

export function calculateSaleFinancials(
  revenue: number,
  productCommissionPercent: number,
  _origin: SaleOrigin,
  insideWindow: boolean,
  config: DistributionConfig = {
    creatorShare: PAID_SHARE,
    metaAdsTaxPercent: 13,
  },
): SaleFinancials {
  const platformCommission = Number(
    ((revenue * productCommissionPercent) / 100).toFixed(2),
  );
  const creatorCommission = insideWindow
    ? Number(((platformCommission * config.creatorShare) / 100).toFixed(2))
    : 0;
  const grossMargin = Number(
    (platformCommission - creatorCommission).toFixed(2),
  );
  const adCost = Number(((platformCommission * config.metaAdsTaxPercent) / 100).toFixed(2));
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
