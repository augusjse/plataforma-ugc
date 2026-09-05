"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import Link from "next/link";

export default function AdminSettings() {
  const [monthlyGoal, setMonthlyGoal] = useState("180000");
  const [trafficBudget, setTrafficBudget] = useState("15");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    localStorage.setItem("admin_monthly_goal", monthlyGoal);
    localStorage.setItem("admin_traffic_budget", trafficBudget);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Shell admin>
      <div className="page-head">
        <Link href="/admin" className="button button-light">
          ← Voltar
        </Link>
        <div>
          <p className="eyebrow">Configurações</p>
          <h1>Suas metas</h1>
          <p>Defina as metas e orçamentos do Studio UGC.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card card">
          <h3>Meta de receita mensal</h3>
          <p>Qual é sua meta de faturamento para este mês?</p>
          <div className="input-group">
            <label>Valor em R$</label>
            <input
              type="number"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              placeholder="180000"
            />
          </div>
        </div>

        <div className="settings-card card">
          <h3>% Investimento em tráfego</h3>
          <p>Qual porcentagem da margem líquida você investe em anúncios?</p>
          <div className="input-group">
            <label>Porcentagem (%)</label>
            <input
              type="number"
              value={trafficBudget}
              onChange={(e) => setTrafficBudget(e.target.value)}
              placeholder="15"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="button button-primary" onClick={handleSave}>
          Salvar configurações
        </button>
        {saved && (
          <span className="success-message">✓ Configurações salvas!</span>
        )}
      </div>

      <style jsx>{`
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .settings-card {
          padding: 1.5rem;
          border-radius: 12px;
          background: var(--surface);
          border: 1px solid var(--border-color);
        }

        .settings-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .settings-card p {
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .input-group input {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--app-bg);
          color: var(--text-main);
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(255, 107, 38, 0.1);
        }

        .settings-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          align-items: center;
        }

        .success-message {
          color: var(--success-color, #10b981);
          font-weight: 500;
        }

        @media (max-width: 767px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Shell>
  );
}
