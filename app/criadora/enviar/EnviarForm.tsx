"use client";
import { FormEvent, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { DashboardProduct } from "@/lib/dashboard-data";

export default function EnviarForm({ product, creatorId }: { product: DashboardProduct | null; creatorId: string }) {
  const [videoFile, setVideoFile] = useState<File | null>(null); const [message, setMessage] = useState(""); const [affiliate, setAffiliate] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (!videoFile) { setMessage("Escolha um arquivo de vídeo para enviar."); return; }
    if (!product?.id || !product.shopeeLink) { setMessage("Este produto ainda não tem um link Shopee configurado."); return; }
    setLoading(true);
    try {
      const uploadData = new FormData(); uploadData.append("file", videoFile);
      const uploadResponse = await fetch("/api/videos/upload", { method: "POST", body: uploadData });
      const uploadBody = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadBody.error ?? "Não foi possível fazer o upload do vídeo.");
      const response = await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creator_id: creatorId, product_id: product.id, product_link_base: product.shopeeLink, video_url: uploadBody.url }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Não foi possível enviar o vídeo.");
      setAffiliate(body.affiliate_link_bruto); setMessage("Vídeo enviado com sucesso e encaminhado para análise."); setVideoFile(null);
    }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar o vídeo."); } finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="video-submit-form"><SectionTitle icon="play">Arquivo do seu vídeo</SectionTitle><label className="form-label" htmlFor="video-file">Faça upload do vídeo (MP4 ou outro formato de vídeo)</label><input id="video-file" className="text-input file-input" type="file" accept="video/*" required={!videoFile} onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} />{videoFile && <p className="file-selected">Arquivo selecionado: <strong>{videoFile.name}</strong> ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>}<p className="form-hint">Limite deste envio: 4 MB. Para vídeos maiores, será necessário um upload direto ao Storage.</p><div className="warning-callout">⚠️ <strong>Importante:</strong> seu vídeo precisa ter uma CTA (chamada para ação) pedindo para a pessoa clicar em “Saiba mais” para ver o produto na Shopee. Vídeos sem essa CTA não serão aprovados.</div><SectionTitle icon="edit">Copy sugerida para o vídeo</SectionTitle><div className="copy-suggestion">“Eu testei o {product?.name ?? "produto"} e adorei como ele deixou minha rotina mais prática. Depois de usar por alguns dias, essa foi a minha experiência de verdade. Quer conhecer? Clique em <strong>Saiba mais</strong> e veja o produto na Shopee!”</div>{message && <p className={affiliate ? "form-success" : "form-error"}>{message}</p>}{affiliate && <div className="affiliate-result"><strong>Seu link de afiliado está pronto:</strong><a href={affiliate} target="_blank" rel="noreferrer">{affiliate}</a></div>}<button className="button button-primary" type="submit" disabled={loading || !product}>{loading ? "Enviando vídeo..." : "Enviar vídeo"}</button></form>;
}
