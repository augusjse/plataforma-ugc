"use client";

import { useState } from "react";

export default function GerarLinkForm() {
  const [creatorId, setCreatorId] = useState("");
  const [productId, setProductId] = useState("");
  const [productLink, setProductLink] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState<{ link_seu_dominio: string; affiliate_link_bruto: string } | null>(null);
  const [copied, setCopied] = useState<"seu" | "shopee" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setError("");
    setResult(null);
    if (!creatorId || !productId || !productLink || !videoUrl) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_id: creatorId,
          product_id: productId,
          product_link_base: productLink,
          video_url: videoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar link");
      setResult({ link_seu_dominio: data.link_seu_dominio, affiliate_link_bruto: data.affiliate_link_bruto });
      setCreatorId("");
      setProductId("");
      setProductLink("");
      setVideoUrl("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, which: "seu" | "shopee") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  return (
    <div className="gerar-link-card">
      <h3>Gerar novo link rastreável</h3>
      <p className="hint">
        Cole o link do produto na Shopee — o Sub_id (rastreio) é aplicado automaticamente. Qualquer
        venda feita a partir desse clique será contada, mesmo que seja outro produto.
      </p>
      <div className="form-grid">
        <div className="field">
          <label>Criadora (ID)</label>
          <input value={creatorId} onChange={(e) => setCreatorId(e.target.value)} placeholder="maria-teste" />
        </div>
        <div className="field">
          <label>Produto (ID)</label>
          <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="prod-123" />
        </div>
        <div className="field field-wide">
          <label>Link do produto na Shopee</label>
          <input
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            placeholder="https://shopee.com.br/produto-exemplo-i.123.456"
          />
        </div>
        <div className="field field-wide">
          <label>URL do vídeo (onde a criadora postou)</label>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://instagram.com/..." />
        </div>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="button button-primary" onClick={handleGenerate} disabled={loading}>
        {loading ? "Gerando..." : "Gerar link"}
      </button>

      {result && (
        <div className="result-box">
          <div className="result-row">
            <div>
              <span className="result-label">Link para a criadora divulgar (seu domínio)</span>
              <code>{result.link_seu_dominio}</code>
            </div>
            <button className="button button-light" onClick={() => copy(result.link_seu_dominio, "seu")}>
              {copied === "seu" ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>
          <div className="result-row">
            <div>
              <span className="result-label">Link direto na Shopee (com Sub_id já aplicado)</span>
              <code>{result.affiliate_link_bruto}</code>
            </div>
            <button className="button button-light" onClick={() => copy(result.affiliate_link_bruto, "shopee")}>
              {copied === "shopee" ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .gerar-link-card {
          background: var(--surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .gerar-link-card h3 {
          margin: 0 0 0.4rem 0;
          font-size: 1.1rem;
        }
        .hint {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0 0 1.25rem 0;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .field-wide {
          grid-column: 1 / -1;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .field label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .field input {
          padding: 0.65rem 0.8rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--app-bg);
          color: var(--text-main);
          font-size: 0.9rem;
        }
        .error-msg {
          color: #ef4444;
          font-size: 0.85rem;
          margin: 0 0 1rem 0;
        }
        .result-box {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .result-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: var(--app-bg);
          border-radius: 8px;
          padding: 0.75rem 1rem;
        }
        .result-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        .result-row code {
          font-size: 0.85rem;
          word-break: break-all;
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .result-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
