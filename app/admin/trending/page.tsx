"use client";

import Shell from "@/components/Shell";
import { useState, useEffect } from "react";

type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  shopLink: string;
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
      setProducts([
        {
          id: "1",
          name: "Fone Bluetooth Premium",
          price: 89.99,
          image: "https://via.placeholder.com/48",
          shopLink: "https://shopee.com.br",
          status: "pending",
        },
        {
          id: "2",
          name: "Carregador Rápido USB-C",
          price: 45.50,
          image: "https://via.placeholder.com/48",
          shopLink: "https://shopee.com.br",
          status: "pending",
        },
      ]);
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

  const pendingProducts = products.filter((p) => p.status === "pending");

  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Produtos em Alta</h1>
          <p>Aprove ou rejeite produtos trending da Shopee.</p>
        </div>
      </div>

      <div className="trending-settings">
        <label className="commission-label">
          Comissão: {commissionPercent}%
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
        <p>Carregando...</p>
      ) : pendingProducts.length === 0 ? (
        <div className="card">
          <p>Nenhum produto pendente de aprovação.</p>
        </div>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>PRODUTO</th>
                <th>PREÇO</th>
                <th>COMISSÃO ({commissionPercent}%)</th>
                <th style={{ textAlign: "right" }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <img src={product.image} alt={product.name} className="product-thumb" />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <strong>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </td>
                  <td>
                    R$ {(product.price * (commissionPercent / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="action-buttons">
                      <button
                        className="button button-primary"
                        onClick={() => approveProduct(product.id)}
                        title="Aprovar"
                      >
                        ✓
                      </button>
                      <button
                        className="button button-light"
                        onClick={() => rejectProduct(product.id)}
                        title="Rejeitar"
                      >
                        ✕
                      </button>
                      <a
                        href={product.shopLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-ghost"
                        title="Ver no Shopee"
                      >
                        →
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products.filter((p) => p.status !== "pending").length > 0 && (
        <>
          <h3 style={{ marginTop: "3rem", marginBottom: "1rem" }}>Histórico</h3>
          <div className="product-table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>PRODUTO</th>
                  <th>PREÇO</th>
                  <th>COMISSÃO ({commissionPercent}%)</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.status !== "pending")
                  .map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <img src={product.image} alt={product.name} className="product-thumb" />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <strong>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      </td>
                      <td>
                        R$ {(product.price * (commissionPercent / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`status status-${product.status}`}>
                          {product.status === "approved" ? "✓ Aprovado" : "✕ Rejeitado"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .trending-settings {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .commission-label {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .commission-label input[type="range"] {
          flex: 1;
          max-width: 300px;
        }

        .product-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
        }

        .product-table {
          width: 100%;
          border-collapse: collapse;
        }

        .product-table thead {
          background: var(--app-bg);
          border-bottom: 1px solid var(--border-color);
        }

        .product-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .product-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .product-table tbody tr:last-child td {
          border-bottom: none;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-thumb {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          background: var(--app-bg);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .action-buttons .button {
          min-width: 40px;
          padding: 8px 12px;
          font-size: 0.9rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .button-ghost {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-main);
        }

        .button-ghost:hover {
          background: var(--app-bg);
        }

        .status {
          font-size: 0.85rem;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .status-approved {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        h3 {
          font-size: 1.1rem;
          margin: 0;
        }
      `}</style>
    </Shell>
  );
}
