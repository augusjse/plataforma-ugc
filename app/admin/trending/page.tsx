"use client";

import Shell from "@/components/Shell";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  shopLink: string;
  vendorCommission: number;
  status: "pending" | "approved" | "rejected";
};

type TrendingApiProduct = {
  id: string;
  name: string;
  price?: number | null;
  image?: string | null;
  shop_link: string;
  vendor_commission?: number | string | null;
  status: TrendingProduct["status"];
};

export default function TrendingPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [minCommission, setMinCommission] = useState(5);
  const [subIds, setSubIds] = useState<string[]>(["", "", "", "", ""]);
  const [copied, setCopied] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  async function fetchTrendingProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/shopee/trending-list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Supabase não configurado");
      if (!data.products?.length) throw new Error("TRENDING_EMPTY");
      setUsingMock(false);
      setProducts(
        (data.products || []).map((p: TrendingApiProduct) => ({
          id: p.id,
          name: p.name,
          price: p.price ?? 0,
          image: p.image || "https://via.placeholder.com/48",
          shopLink: p.shop_link,
          vendorCommission: Number(p.vendor_commission ?? 0),
          status: p.status as TrendingProduct["status"],
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar trending:", error);
      const useMock = error instanceof Error && (error.message === "TRENDING_EMPTY" || error.message.includes("Supabase não configurado"));
      setUsingMock(useMock);
      setProducts(useMock ? [
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
      ] : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const settingsTimer = window.setTimeout(() => {
      const saved = localStorage.getItem("admin_min_commission");
      if (saved) setMinCommission(parseInt(saved));
      const savedSubIds = localStorage.getItem("admin_sub_ids");
      if (savedSubIds) setSubIds(JSON.parse(savedSubIds));
      void fetchTrendingProducts();
    }, 0);
    return () => window.clearTimeout(settingsTimer);
  }, []);

  function generateAffiliateLink(baseLink: string): string {
    let link = baseLink;

    const activeSubIds = subIds.filter(id => id.trim());
    if (activeSubIds.length > 0) {
      activeSubIds.forEach((id, index) => {
        link += (link.includes("?") ? "&" : "?") + `sub_id${index + 1}=${encodeURIComponent(id)}`;
      });
    }

    return link;
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
    if (usingMock) {
      setProducts((current) => current.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
      showToast({ title: "Produto aprovado", description: "A decisão foi aplicada ao produto de demonstração.", type: "info" });
      return;
    }
    try {
      const response = await fetch(`/api/shopee/trending/${encodeURIComponent(id)}/approve`, { method: "POST" });
      if (!response.ok) throw new Error("Não foi possível aprovar o produto.");
      setProducts((current) => current.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
      showToast({ title: "Produto aprovado", description: "O produto trending foi liberado para as criadoras.", type: "success" });
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      showToast({ title: "Erro ao aprovar", description: error instanceof Error ? error.message : "Não foi possível aprovar o produto.", type: "error" });
    }
  }

  async function rejectProduct(id: string) {
    if (usingMock) {
      setProducts((current) => current.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
      showToast({ title: "Produto rejeitado", description: "A decisão foi aplicada ao produto de demonstração.", type: "info" });
      return;
    }
    try {
      const response = await fetch(`/api/shopee/trending/${encodeURIComponent(id)}/reject`, { method: "POST" });
      if (!response.ok) throw new Error("Não foi possível rejeitar o produto.");
      setProducts((current) => current.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
      showToast({ title: "Produto rejeitado", description: "O produto trending foi retirado da fila de aprovação.", type: "success" });
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      showToast({ title: "Erro ao rejeitar", description: error instanceof Error ? error.message : "Não foi possível rejeitar o produto.", type: "error" });
    }
  }

  async function resetToPending(id: string) {
    if (usingMock) {
      setProducts((current) => current.map((p) => (p.id === id ? { ...p, status: "pending" } : p)));
      showToast({ title: "Decisão desfeita", description: "O produto de demonstração voltou para pendente.", type: "info" });
      return;
    }
    try {
      const response = await fetch(`/api/shopee/trending/${encodeURIComponent(id)}/reset`, { method: "POST" });
      if (!response.ok) throw new Error("Não foi possível desfazer a decisão do produto.");
      setProducts((current) => current.map((p) => (p.id === id ? { ...p, status: "pending" } : p)));
      showToast({ title: "Decisão desfeita", description: "O produto voltou para a fila de pendentes.", type: "info" });
    } catch (error) {
      console.error("Erro ao desfazer decisão:", error);
      showToast({ title: "Erro ao desfazer", description: error instanceof Error ? error.message : "Não foi possível desfazer a decisão.", type: "error" });
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

      {usingMock && (
        <div className="warning-banner">
          ⚠️ A API da Shopee ainda não está configurada (faltam <code>SHOPEE_APP_ID</code> e{" "}
          <code>SHOPEE_APP_SECRET</code> no Vercel). Mostrando produtos de exemplo por enquanto.
        </div>
      )}

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
          <label style={{ marginBottom: "0.75rem" }}>
            <strong>Sub_ids para Rastreamento (até 5):</strong>
          </label>
          <div className="sub-ids-grid">
            {subIds.map((id, index) => (
              <div key={index} className="sub-id-input">
                <label>Sub_id {index + 1}</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => {
                    const newSubIds = [...subIds];
                    newSubIds[index] = e.target.value;
                    setSubIds(newSubIds);
                    localStorage.setItem("admin_sub_ids", JSON.stringify(newSubIds));
                  }}
                  placeholder={`Ex: ${["Trending", "Produtos-em-Alta", "InstagramFeed", "TikTok", "YouTube"][index]}`}
                />
              </div>
            ))}
          </div>
          <small>
            Preencha os Sub_ids que você usa no painel de afiliado da Shopee. O link será gerado automaticamente com esses parâmetros!
          </small>
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
                <th>VOCÊ FATURARIA</th>
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
                  <td>
                    <span className="commission-badge">
                      R$ {(product.price * (product.vendorCommission / 100)).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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
                        <span className="status-with-action">
                          <span className={`status status-${product.status}`}>
                            {product.status === "approved" ? "✓ Aprovado" : "✕ Rejeitado"}
                          </span>
                          <button
                            type="button"
                            className="button button-ghost undo-button"
                            onClick={() => resetToPending(product.id)}
                            title="Voltar o produto para pendente"
                            aria-label="Desfazer decisão e voltar para pendente"
                          >
                            ↶ Desfazer
                          </button>
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
        .warning-banner {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #b45309;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .warning-banner code {
          background: rgba(0, 0, 0, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85em;
        }

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
          margin: 0.5rem 0 0 0;
          display: block;
        }

        .sub-ids-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .sub-id-input {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .sub-id-input label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .sub-id-input input {
          padding: 0.6rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--app-bg);
          color: var(--text-main);
          font-size: 0.9rem;
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

        .status-with-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .undo-button {
          padding: 4px 7px !important;
          border: none;
          color: var(--text-secondary);
          font-size: 0.75rem !important;
        }

        .undo-button:hover {
          color: var(--text-main);
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
