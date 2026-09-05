"use client";

import Shell from "@/components/Shell";
import { useState, useEffect } from "react";

type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  shopLink: string;
  vendorCommission: number;
  status: "pending" | "approved" | "rejected";
};

export default function TrendingPage() {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [minCommission, setMinCommission] = useState(5);
  const [affiliateCode, setAffiliateCode] = useState("seu-codigo");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("admin_min_commission");
      if (saved) setMinCommission(parseInt(saved));
      const code = localStorage.getItem("admin_affiliate_code");
      if (code) setAffiliateCode(code);
    };
    loadSettings();
    fetchTrendingProducts();
  }, []);

  async function fetchTrendingProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/shopee/trending");
      const data = await res.json();
      setProducts(
        (data.products || []).map((p: any) => ({
          ...p,
          status: p.status || "pending",
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar trending:", error);
      setProducts([
        {
          id: "1",
          name: "Fone Bluetooth Premium com Cancelamento de Ruído",
          price: 89.99,
          image: "https://via.placeholder.com/48?text=Fone",
          shopLink: "https://shopee.com.br/search?keyword=fone+bluetooth",
          vendorCommission: 12,
          status: "pending",
        },
        {
          id: "2",
          name: "Carregador Rápido USB-C 65W",
          price: 45.50,
          image: "https://via.placeholder.com/48?text=Carregador",
          shopLink: "https://shopee.com.br/search?keyword=carregador+usb-c",
          vendorCommission: 8,
          status: "pending",
        },
        {
          id: "3",
          name: "Smartwatch Fitness com Monitor Cardíaco",
          price: 129.99,
          image: "https://via.placeholder.com/48?text=Watch",
          shopLink: "https://shopee.com.br/search?keyword=smartwatch",
          vendorCommission: 15,
          status: "pending",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function generateAffiliateLink(baseLink: string): string {
    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}af=${affiliateCode}`;
  }

  async function copyAffiliateLink(product: TrendingProduct) {
    const link = generateAffiliateLink(product.shopLink);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(product.id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
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

  const filteredProducts = products.filter((p) => p.vendorCommission >= minCommission);

  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Produtos em Alta</h1>
          <p>Filtre por comissão de afiliado e aprove produtos trending da Shopee.</p>
        </div>
      </div>

      <div className="trending-settings">
        <div className="setting-row">
          <label className="commission-label">
            Comissão mínima: <strong>{minCommission}%</strong>
            <input
              type="range"
              min="1"
              max="50"
              value={minCommission}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setMinCommission(val);
                localStorage.setItem("admin_min_commission", String(val));
              }}
            />
          </label>
        </div>

        <div className="setting-row">
          <label>
            Código de Afiliado Shopee:
            <input
              type="text"
              value={affiliateCode}
              onChange={(e) => {
                setAffiliateCode(e.target.value);
                localStorage.setItem("admin_affiliate_code", e.target.value);
              }}
              placeholder="seu-codigo-afiliado"
            />
          </label>
          <small>O link copiado será: shopee.com.br/...?af={affiliateCode}</small>
        </div>
      </div>

      {loading ? (
        <p>Carregando produtos...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="card">
          <p>Nenhum produto com comissão ≥ {minCommission}%. Tente reduzir o filtro.</p>
        </div>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>PRODUTO</th>
                <th>PREÇO</th>
                <th>COMISSÃO</th>
                <th style={{ textAlign: "center" }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
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
                    <span className="commission-badge">{product.vendorCommission}%</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      {product.status === "pending" ? (
                        <>
                          <button
                            className="button button-primary"
                            onClick={() => approveProduct(product.id)}
                          >
                            Aprovar
                          </button>
                          <button
                            className="button button-light"
                            onClick={() => rejectProduct(product.id)}
                          >
                            Rejeitar
                          </button>
                        </>
                      ) : (
                        <span className={`status status-${product.status}`}>
                          {product.status === "approved" ? "✓ Aprovado" : "✕ Rejeitado"}
                        </span>
                      )}
                      <button
                        className={`button button-ghost ${copied === product.id ? "copied" : ""}`}
                        onClick={() => copyAffiliateLink(product)}
                        title="Copiar link de afiliado"
                      >
                        {copied === product.id ? "✓ Copiado!" : "Copiar"}
                      </button>
                      <a
                        href={generateAffiliateLink(product.shopLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-ghost"
                        title="Ver no Shopee (com seu código de afiliado)"
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
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .setting-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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

        .setting-row input[type="text"] {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--app-bg);
          color: var(--text-main);
          font-family: monospace;
          max-width: 300px;
        }

        .setting-row small {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-left: 0.5rem;
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
          opacity: 0.5;
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

        .commission-badge {
          background: rgba(255, 107, 38, 0.1);
          color: var(--brand);
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-buttons .button {
          padding: 8px 12px;
          font-size: 0.8rem;
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

        .button-ghost.copied {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-color: #10b981;
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
