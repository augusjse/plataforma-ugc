"use client";

import { FormEvent, useRef, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { DashboardProduct } from "@/lib/dashboard-data";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_SOURCE_VIDEO_BYTES = 500 * 1024 * 1024;
const MIN_VIDEO_BYTES = 10 * 1024;
const UPLOAD_WEBHOOK_URL = "https://automacoes-n8n.jnyzmx.easypanel.host/webhook/upload-video-criadora";

export default function EnviarForm({ product, creatorId }: { product: DashboardProduct | null; creatorId: string }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [affiliate, setAffiliate] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(file: File | null) {
    setAffiliate(""); setMessage(""); setVideoFile(null);
    if (!file) return;
    if (!file.type.startsWith("video/")) { setMessage("Envie um arquivo de vídeo válido."); return; }
    if (file.size > MAX_SOURCE_VIDEO_BYTES) { setMessage("O arquivo original deve ter no máximo 500 MB."); return; }
    setVideoFile(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (!videoFile) { setMessage("Escolha um arquivo de vídeo para enviar."); return; }
    if (videoFile.size < MIN_VIDEO_BYTES) { setMessage("O arquivo de vídeo está vazio ou corrompido. Selecione outro vídeo."); return; }
    if (videoFile.size > MAX_SOURCE_VIDEO_BYTES) { setMessage("O arquivo original deve ter no máximo 500 MB."); return; }
    if (!product?.id || !product.shopeeLink) { setMessage("Este produto ainda não tem um link Shopee configurado."); return; }
    setLoading(true);
    try {
      const supabaseBrowser = createSupabaseBrowserClient();
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) throw new Error("Sua sessão expirou. Entre novamente para enviar o vídeo.");
      const formData = new FormData();
      formData.append("data", videoFile, videoFile.name);
      formData.append("filename", videoFile.name);
      const uploadResponse = await fetch(UPLOAD_WEBHOOK_URL, { method: "POST", body: formData });
      let uploadBody: { success?: boolean; url?: string; viewUrl?: string; };
      try { uploadBody = await uploadResponse.json(); } catch { throw new Error("O webhook retornou uma resposta inválida."); }
      if (!uploadResponse.ok) throw new Error("Não foi possível enviar o vídeo ao serviço de armazenamento.");
      const videoUrl = uploadBody.url || uploadBody.viewUrl;
      if (!videoUrl) throw new Error("O serviço de armazenamento não retornou o link do vídeo.");
      const response = await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creator_id: creatorId, product_id: product.id, product_link_base: product.shopeeLink, video_url: videoUrl }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Não foi possível enviar o vídeo.");
      setAffiliate(body.affiliate_link_bruto); setMessage("Vídeo enviado com sucesso e encaminhado para análise."); setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setMessage(error instanceof TypeError ? "Não foi possível conectar ao serviço de armazenamento. Verifique sua conexão e tente novamente." : error instanceof Error ? error.message : "Não foi possível enviar o vídeo. Verifique sua conexão e tente novamente.");
    } finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="video-submit-form"><div className="enviar-video-columns"><div className="enviar-video-column"><SectionTitle icon="play">Arquivo do seu vídeo</SectionTitle><label className={`video-dropzone${videoFile ? " has-file" : ""}`} htmlFor="video-file"><input ref={fileInputRef} id="video-file" className="file-input-hidden" type="file" accept="video/*" required={!videoFile} onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)} /><span className="video-dropzone-icon" aria-hidden="true">+</span>{videoFile ? <><strong>{videoFile.name}</strong><span>Toque para trocar o arquivo</span><small>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</small></> : <><strong>Toque para escolher o vídeo da galeria</strong><span>MP4 ou outro formato de vídeo</span></>}</label><p className="form-hint">Vídeos de até 500 MB são enviados sem compressão.</p>{loading && <div className="upload-progress" role="status" aria-live="polite"><div className="upload-progress-bar" role="progressbar" aria-label="Upload do vídeo em andamento" aria-valuetext="Enviando vídeo" /><span>Enviando vídeo... isso pode levar alguns minutos para arquivos grandes.</span></div>}<div className="warning-callout">⚠️ <strong>Importante:</strong> seu vídeo precisa ter uma CTA (chamada para ação) pedindo para a pessoa clicar em “Saiba mais” para ver o produto na Shopee. Vídeos sem essa CTA não serão aprovados.</div></div><div className="enviar-video-column"><SectionTitle icon="edit">Copy sugerida para o vídeo</SectionTitle><div className="copy-suggestion">“Eu testei o {product?.name ?? "produto"} e adorei como ele deixou minha rotina mais prática. Depois de usar por alguns dias, essa foi a minha experiência de verdade. Quer conhecer? Clique em <strong>Saiba mais</strong> e veja o produto na Shopee!”</div></div></div>{message && <p className={affiliate ? "form-success" : "form-error"}>{message}</p>}{affiliate && <div className="affiliate-result"><strong>Seu link de afiliado está pronto:</strong><a href={affiliate} target="_blank" rel="noreferrer">{affiliate}</a></div>}<button className="button button-primary" type="submit" disabled={loading || !videoFile || !product}>{loading ? "Enviando vídeo..." : "Enviar vídeo"}</button></form>;
}
