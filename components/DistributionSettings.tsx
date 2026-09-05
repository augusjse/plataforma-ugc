"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateSaleFinancials,
  ORGANIC_SHARE,
  PAID_AD_COST_PER_SALE,
  PAID_SHARE,
  type SaleOrigin,
} from "@/lib/mock/finance";
import { products } from "@/lib/mock/products";
import { sales } from "@/lib/mock/creator";
import { videos } from "@/lib/mock/creator";

type Config = {
  organicShare: number;
  paidShare: number;
  paidAdCost: number;
};

const STORAGE_KEY = "studio-ugc-distribution-config";
const defaults: Config = {
  organicShare: ORGANIC_SHARE,
  paidShare: PAID_SHARE,
  paidAdCost: PAID_AD_COST_PER_SALE,
};

function money(value: number): string {
  return value.toLocaleString("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 2,
    style: "currency",
  });
}

export default function DistributionSettings() {
  const [config, setConfig] = useState<Config>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setConfig({ ...defaults, ...JSON.parse(saved) });
    } catch {
      setConfig(defaults);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // A simulação continua funcionando mesmo quando o navegador bloqueia storage.
    }
  }, [config, hydrated]);

  const summary = useMemo(() => {
    return (["organico", "pago"] as SaleOrigin[]).map((origin) => {
      const originSales = sales.filter((sale) => sale.origem === origin);
      const totals = originSales.reduce(
        (total, sale) => {
          const video = videos.find((item) => item.id === sale.videoId);
          const product = products.find((item) => item.id === video?.productId);
          const productPercent = product?.commissionPercent ?? 0;
          const result = calculateSaleFinancials(
            sale.revenue,
            productPercent,
            origin,
            sale.insideWindow,
            config,
          );
          return {
            commission: total.commission + result.platformCommission,
            creator: total.creator + result.creatorCommission,
            margin: total.margin + result.netMargin,
          };
        },
        { commission: 0, creator: 0, margin: 0 },
      );
      return { origin, ...totals };
    });
  }, [config]);

  function update(key: keyof Config, value: string) {
    const numeric = Number(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return;
    setConfig((current) => ({
      ...current,
      [key]: Math.max(0, Math.min(key === "paidAdCost" ? 1000 : 100, numeric)),
    }));
  }

  return (
    <div className="settings-stack">
      <div className="card settings-card">
        <label>
          <span>Repasse quando vem do post (%)</span>
          <div className="settings-control">
            <input
              type="range"
              min="0"
              max="100"
              value={config.organicShare}
              onChange={(event) => update("organicShare", event.target.value)}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={config.organicShare}
              onChange={(event) => update("organicShare", event.target.value)}
            />
            <b>%</b>
          </div>
        </label>
        <label>
          <span>Repasse quando é impulsionado (%)</span>
          <div className="settings-control">
            <input
              type="range"
              min="0"
              max="100"
              value={config.paidShare}
              onChange={(event) => update("paidShare", event.target.value)}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={config.paidShare}
              onChange={(event) => update("paidShare", event.target.value)}
            />
            <b>%</b>
          </div>
        </label>
        <label>
          <span>Custo de anúncio por venda</span>
          <div className="settings-control settings-cost">
            <span>R$</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.paidAdCost}
              onChange={(event) => update("paidAdCost", event.target.value)}
            />
          </div>
        </label>
      </div>
      <div className="origin-summary">
        {summary.map((item) => (
          <div className="card" key={item.origin}>
            <span className="eyebrow">
              {item.origin === "organico"
                ? "Vendas do seu post"
                : "Impulsionamento"}
            </span>
            <strong>{money(item.margin)}</strong>
            <small>
              Margem líquida simulada · repasse {money(item.creator)}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
