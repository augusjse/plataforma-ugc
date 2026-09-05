"use client";

import { FormEvent, useRef, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { DashboardProduct } from "@/lib/dashboard-data";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_SOURCE_VIDEO_BYTES = 500 * 1024 * 1024;
const MAX_UPLOAD_VIDEO_BYTES = 45 * 1024 * 1024;
const BUCKET = "videos-ugc";

async function compressVideo(file: File): Promise<File> {
  const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);
  const ffmpeg = new FFmpeg();
  const cdnBase = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({ coreURL: await toBlobURL(`${cdnBase}/ffmpeg-core.js`, "text/javascript"), wasmURL: await toBlobURL(`${cdnBase}/ffmpeg-core.wasm`, "application/wasm") });
  const inputName = "input-video";
  const outputName = "compressed-video.mp4";
  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    for (const crf of [28, 32]) {
      await ffmpeg.exec(["-i", inputName, "-vf", "scale=-2:min(720,ih)", "-c:v", "libx264", "-preset", "fast", "-crf", String(crf), "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-threads", "1", "-y", outputName]);
      const output = await ffmpeg.readFile(outputName);
      if (typeof output === "string") throw new Error("A compactação não retornou um arquivo válido.");
      const outputBuffer = new ArrayBuffer(output.byteLength);
      new Uint8Array(outputBuffer).set(output);
      const compressed = new File([outputBuffer], file.name.replace(/\.[^.]+$/, "") + "-compactado.mp4", { type: "video/mp4" });
      await ffmpeg.deleteFile(outputName);
      if (compressed.size <= MAX_UPLOAD_VIDEO_BYTES) return compressed;
    }
  } finally {
    try { await ffmpeg.deleteFile(inputName); } catch { /* best effort cleanup */ }
    try { await ffmpeg.deleteFile(outputName); } catch { /* best effort cleanup */ }
    ffmpeg.terminate();
  }
  throw new Error("Não foi possível compactar o vídeo para menos de 45 MB.");
}

export default function EnviarForm({ product, creatorId }: { product: DashboardProduct | null; creatorId: string }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [affiliate, setAffiliate] = useState("");
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(file: File | null) {
    setAffiliate(""); setMessage(""); setVideoFile(null);
    if (!file) return;
    if (!file.type.startsWith("video/")) { setMessage("Envie um arquivo de vídeo válido."); return; }
    if (file.size > MAX_SOURCE_VIDEO_BYTES) { setMessage("O arquivo original deve ter no máximo 500 MB."); return; }
    if (file.size <= MAX_UPLOAD_VIDEO_BYTES) { setVideoFile(file); return; }
    setCompressing(true);
    try { setVideoFile(await compressVideo(file)); } catch (error) {
      setMessage(error instanceof Error ? `${error.message} Tente reduzir o vídeo manualmente antes de enviar novamente.` : "Não foi possível compactar o vídeo. Tente reduzir o vídeo manualmente antes de enviar novamente.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally { setCompressing(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (!videoFile) { setMessage("Escolha um arquivo de vídeo para enviar."); return; }
    if (videoFile.size > MAX_UPLOAD_VIDEO_BYTES) { setMessage("O vídeo precisa ter no máximo 45 MB após a compactação."); return; }
    if (!product?.id || !product.shopeeLink) { setMessage("Este produto ainda não tem um link Shopee configurado."); return; }
    setLoading(true);
    try {
      const supabaseBrowser = createSupabaseBrowserClient();
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) throw new Error("Sua sessão expirou. Entre novamente para enviar o vídeo.");
      const safeName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "video.mp4";
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabaseBrowser.storage.from(BUCKET).upload(path, videoFile, { contentType: videoFile.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message || "Não foi possível fazer o upload do vídeo.");
      const { data: publicUrlData } = supabaseBrowser.storage.from(BUCKET).getPublicUrl(path);
      const response = await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creator_id: creatorId, product_id: product.id, product_link_base: product.shopeeLink, video_url: publicUrlData.publicUrl }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Não foi possível enviar o vídeo.");
      setAffiliate(body.affiliate_link_bruto); setMessage("Vídeo enviado com sucesso e encaminhado para análise."); setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar o vídeo."); } finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="video-submit-form"><div className="enviar-video-columns"><div className="enviar-video-column"><SectionTitle icon="play">Arquivo do seu vídeo</SectionTitle><label className={`video-dropzone${videoFile ? " has-file" : ""}`} htmlFor="video-file"><input ref={fileInputRef} id="video-file" className="file-input-hidden" type="file" accept="video/*" required={!videoFile} onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)} /><span className="video-dropzone-icon" aria-hidden="true">+</span>{videoFile ? <><strong>{videoFile.name}</strong><span>Toque para trocar o arquivo</span><small>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</small></> : <><strong>Toque para escolher o vídeo da galeria</strong><span>MP4 ou outro formato de vídeo · arquivos maiores serão compactados</span></>}</label><p className="form-hint">Vídeos de até 45 MB são enviados direto. Arquivos maiores são compactados automaticamente para ficar abaixo do limite de 45 MB do Storage.</p>{compressing && <div className="upload-progress" role="status" aria-live="polite"><div className="upload-progress-bar" role="progressbar" aria-label="Compactação do vídeo em andamento" aria-valuetext="Compactando vídeo" /><span>Compactando vídeo... isso pode levar um minuto.</span></div>}{loading && <div className="upload-progress" role="status" aria-live="polite"><div className="upload-progress-bar" role="progressbar" aria-label="Upload do vídeo em andamento" aria-valuetext="Enviando vídeo" /><span>Enviando vídeo... não feche esta página.</span></div>}<div className="warning-callout">⚠️ <strong>Importante:</strong> seu vídeo precisa ter uma CTA (chamada para ação) pedindo para a pessoa clicar em “Saiba mais” para ver o produto na Shopee. Vídeos sem essa CTA não serão aprovados.</div></div><div className="enviar-video-column"><SectionTitle icon="edit">Copy sugerida para o vídeo</SectionTitle><div className="copy-suggestion">“Eu testei o {product?.name ?? "produto"} e adorei como ele deixou minha rotina mais prática. Depois de usar por alguns dias, essa foi a minha experiência de verdade. Quer conhecer? Clique em <strong>Saiba mais</strong> e veja o produto na Shopee!”</div></div></div>{message && <p className={affiliate ? "form-success" : "form-error"}>{message}</p>}{affiliate && <div className="affiliate-result"><strong>Seu link de afiliado está pronto:</strong><a href={affiliate} target="_blank" rel="noreferrer">{affiliate}</a></div>}<button className="button button-primary" type="submit" disabled={loading || compressing || !videoFile || !product}>{loading ? "Enviando vídeo..." : compressing ? "Compactando vídeo..." : "Enviar vídeo"}</button></form>;
}
