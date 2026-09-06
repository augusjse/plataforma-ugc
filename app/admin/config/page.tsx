"use client";

import { useEffect, useRef, useState } from "react";
import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import { useToast } from "@/components/ToastProvider";

type Config = { repasse_organico_percent: number; repasse_impulsionado_percent: number; custo_anuncio_por_venda: number; saque_minimo: number; imposto_meta_ads_percent: number; imposto_nota_fiscal_percent: number };
const defaults: Config = { repasse_organico_percent: 50, repasse_impulsionado_percent: 10, custo_anuncio_por_venda: 9, saque_minimo: 50, imposto_meta_ads_percent: 13, imposto_nota_fiscal_percent: 0 };

export default function Config() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<Config>(defaults);
  const [status, setStatus] = useState("Carregando...");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/admin/config").then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setConfig({ ...defaults, ...body.config });
      setStatus("Salvo");
    }).catch((error: Error) => setStatus(error.message));
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  function update(key: keyof Config, value: string) {
    const numeric = Number(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return;
    const next = { ...config, [key]: Math.max(0, key === "custo_anuncio_por_venda" || key === "saque_minimo" ? numeric : Math.min(100, numeric)) };
    setConfig(next);
    setStatus("Salvando...");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
        if (!response.ok) throw new Error((await response.json()).error);
        setStatus("Salvo");
        showToast({ title: "Configurações salvas", description: "Os valores financeiros foram atualizados com sucesso.", type: "success" });
      } catch (error) {
        const description = error instanceof Error ? error.message : "Erro ao salvar";
        setStatus(description);
        showToast({ title: "Erro ao salvar", description, type: "error" });
      }
    }, 400);
  }

  return <Shell admin>
    <div className="page-head"><div><p className="eyebrow">Configuração financeira</p><h1>Distribuição e custos</h1><p>Defina os valores usados nos cálculos de comissão da plataforma.</p></div></div>
    <SectionTitle icon="settings">Percentuais e custos</SectionTitle>
    <div className="card settings-card">
      <ConfigSlider label="Repasse orgânico" value={config.repasse_organico_percent} suffix="%" min={0} max={100} step={1} onChange={(value) => update("repasse_organico_percent", value)} />
      <ConfigSlider label="Repasse impulsionado" value={config.repasse_impulsionado_percent} suffix="%" min={0} max={100} step={1} onChange={(value) => update("repasse_impulsionado_percent", value)} />
      <ConfigSlider label="Custo de anúncio por venda" value={config.custo_anuncio_por_venda} suffix="R$" min={0} max={1000} step={0.5} onChange={(value) => update("custo_anuncio_por_venda", value)} />
      <ConfigSlider label="Saque mínimo" value={config.saque_minimo} suffix="R$" min={0} max={5000} step={1} onChange={(value) => update("saque_minimo", value)} />
      <ConfigSlider label="Imposto Meta Ads" value={config.imposto_meta_ads_percent} suffix="%" min={0} max={100} step={0.01} onChange={(value) => update("imposto_meta_ads_percent", value)} />
      <ConfigSlider label="Imposto Nota Fiscal" value={config.imposto_nota_fiscal_percent} suffix="%" min={0} max={100} step={0.01} onChange={(value) => update("imposto_nota_fiscal_percent", value)} />
      <small className="muted" aria-live="polite">{status}</small>
    </div>
  </Shell>;
}

function ConfigSlider({ label, value, suffix, min, max, step, onChange }: { label: string; value: number; suffix: string; min: number; max: number; step: number; onChange: (value: string) => void }) {
  return <label><span>{label}</span><div className="settings-control"><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} /><input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} /><b>{suffix}</b></div></label>;
}
