"use client";

import Shell from "@/components/Shell";
import { useState, useEffect } from "react";

type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  shopLink: string;
  estimatedCommission: number;
  status: "pending" | "approved" | "rejected";
};

export default function TrendingPage() {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionPercent, setCommissionPercent] = useState(30);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("admin_commission_percent");
      if (saved) setCommissionPercent(parseInt(saved));
    };
    loadSettings();
    fetchTrendingProducts();
  }, []);

  async function fetchTrendingProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/shopee/trending");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Erro ao buscar trending:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveProduct(id: string) {
    try {
      await fetch(`/api/shopee/trending/${id}/approve`, { method: "POST" });
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
    } catch (error) {
      console.error("Erro ao aprovar:", error);
    }
  }

  async function rejectProduct(id: string) {
    try {
      await fetch(`/api/shopee/trending/${id}/reject`, { method: "POST" });
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
    }
  }

  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Produtos em Alta</h1>
          <p>Aprove ou rejeite produtos trending da Shopee.</p>
        </div>
      </div>

      <div className="trending-controls">
        <label>
          Comissão sugerida: {commissionPercent}%
          <input
            type="range"
            min="10"
            max="50"
            value={commissionPercent}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setCommissionPercent(val);
              localStorage.setItem("admin_commission_percent", String(val));
            }}
          />
        </label>
      </div>

      {loading ? (
        <p>Carregando produtos trending...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto trending no momento.</p>
      ) : (
        <div className="trending-grid">
          {products.map((product) => (
            <div key={product.id} className="trending-card">
              <div className="trending-info">
                <h3>{product.name}</h3>
                <p className="price">R$ {product.price.toLocaleString("pt-BR")}</p>
                <p className="commission">
                  Comissão estimada: R$ {(product.price * (commissionPercent / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <a href={product.shopLink} target="_blank" rel="noopener noreferrer" className="shop-link">
                  Ver no Shopee →
                </a>
              </div>
              <div className="trending-actions">
                {product.status === "pending" ? (
                  <>
                    <button className="button button-primary" onClick={() => approveProduct(product.id)}>
                      Aprovar
                    </button>
                    <button className="button button-light" onClick={() => rejectProduct(product.id)}>
                      Rejeitar
                    </button>
                  </>
                ) : (
                  <span className={`status status-${product.status}`}>
                    {product.status === "approved" ? "✓ Aprovado" : "✗ Rejeitado"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .trending-controls {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .trending-controls label {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
        }

        .trending-controls input[type="range"] {
          flex: 1;
          max-width: 300px;
        }

        .trending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .trending-card {
          background: var(--surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .trending-info h3 {
          font-size: 1rem;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .trending-info .price {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--brand);
          margin: 0;
        }

        .trending-info .commission {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0.5rem 0 0 0;
        }

        .shop-link {
          font-size: 0.9rem;
          color: var(--brand);
          text-decoration: none;
          margin-top: 0.5rem;
        }

        .shop-link:hover {
          text-decoration: underline;
        }

        .trending-actions {
          display: flex;
          gap: 0.5rem;
        }

        .trending-actions button {
          flex: 1;
        }

        .status {
          display: block;
          text-align: center;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 500;
        }

        .status-approved {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      `}</style>
    </Shell>
  );
}
