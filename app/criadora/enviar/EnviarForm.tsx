"use client";
import { FormEvent, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { DashboardProduct } from "@/lib/dashboard-data";

export default function EnviarForm({ product, creatorId }: { product: DashboardProduct | null; creatorId: string }) {
  const [videoUrl, setVideoUrl] = useState(""); const [message, setMessage] = useState(""); const [affiliate, setAffiliate] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    try { const parsed = new URL(videoUrl); if (!/^https?:$/.test(parsed.protocol)) throw new Error(); } catch { setMessage("Cole uma URL válida do Instagram, TikTok ou outra plataforma."); return; }
    if (!product?.id || !product.shopeeLink) { setMessage("Este produto ainda não tem um link Shopee configurado."); return; }
    setLoading(true);
    try { const response = await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creator_id: creatorId, product_id: product.id, product_link_base: product.shopeeLink, video_url: videoUrl }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Não foi possível enviar o vídeo."); setAffiliate(body.affiliate_link_bruto); setMessage("Vídeo enviado com sucesso e encaminhado para análise."); setVideoUrl(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar o vídeo."); } finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="video-submit-form"><SectionTitle icon="link">Link do seu vídeo</SectionTitle><label className="form-label" htmlFor="video-url">Cole o link do seu vídeo (Instagram, TikTok, etc)</label><input id="video-url" className="text-input" type="url" required value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://www.instagram.com/reel/..." /><div className="warning-callout">⚠️ <strong>Importante:</strong> seu vídeo precisa ter uma CTA (chamada para ação) pedindo para a pessoa clicar em “Saiba mais” para ver o produto na Shopee. Vídeos sem essa CTA não serão aprovados.</div><SectionTitle icon="edit">Copy sugerida para o vídeo</SectionTitle><div className="copy-suggestion">“Eu testei o {product?.name ?? "produto"} e adorei como ele deixou minha rotina mais prática. Depois de usar por alguns dias, essa foi a minha experiência de verdade. Quer conhecer? Clique em <strong>Saiba mais</strong> e veja o produto na Shopee!”</div>{message && <p className={affiliate ? "form-success" : "form-error"}>{message}</p>}{affiliate && <div className="affiliate-result"><strong>Seu link de afiliado está pronto:</strong><a href={affiliate} target="_blank" rel="noreferrer">{affiliate}</a></div>}<button className="button button-primary" type="submit" disabled={loading || !product}>{loading ? "Enviando..." : "Enviar vídeo"}</button></form>;
}
