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
          name: "Fone Bluetooth Premium com Cancelamento de Ruído",
          price: 89.99,
          image: "https://via.placeholder.com/48?text=Fone",
          shopLink: "https://shopee.com.br",
          status: "pending",
        },
        {
          id: "2",
          name: "Carregador Rápido USB-C 65W",
          price: 45.50,
          image: "https://via.placeholder.com/48?text=Carregador",
          shopLink: "https://shopee.com.br",
          status: "pending",
        },
        {
          id: "3",
          name: "Smartwatch Fitness com Monitor Cardíaco",
          price: 129.99,
          image: "https://via.placeholder.com/48?text=Watch",
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
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
    }
  }

  async function rejectProduct(id: string) {
    try {
      await fetch(`/api/shopee/trending/${id}/reject`, { method: "POST" });
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
    }
  }

  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Produtos em Alta</h1>
          <p>Aprove ou rejeite produtos trending da Shopee para suas criadoras.</p>
        </div>
      </div>

      <div className="trending-settings">
        <label className="commission-label">
          Comissão sugerida: <strong>{commissionPercent}%</strong>
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
        <p>Carregando produtos...</p>
      ) : products.length === 0 ? (
        <div className="card">
          <p>Nenhum produto no momento.</p>
        </div>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>PRODUTO</th>
                <th>PREÇO</th>
                <th>COMISSÃO ({commissionPercent}%)</th>
                <th style={{ textAlign: "center" }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={`row-${product.status}`}>
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
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      {product.status === "pending" ? (
                        <>
                          <button
                            className="button button-primary"
                            onClick={() => approveProduct(product.id)}
                            title="Aprovar este produto"
                          >
                            Aprovar
                          </button>
                          <button
                            className="button button-light"
                            onClick={() => rejectProduct(product.id)}
                            title="Rejeitar este produto"
                          >
                            Rejeitar
                          </button>
                        </>
                      ) : (
                        <span className={`status status-${product.status}`}>
                          {product.status === "approved" ? "✓ Aprovado" : "✕ Rejeitado"}
                        </span>
                      )}
                      <a
                        href={product.shopLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-ghost"
                        title="Ver no Shopee"
                      >
                        Shopee →
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .trending-settings {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--border-color);
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

        .row-rejected {
          opacity: 0.6;
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
          flex-shrink: 0;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-buttons .button {
          padding: 8px 14px;
          font-size: 0.85rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
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
          padding: 6px 10px;
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
      `}</style>
    </Shell>
  );
}
