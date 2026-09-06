"use client";

import { FormEvent, useRef, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { DashboardProduct } from "@/lib/dashboard-data";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ToastProvider";

const MAX_ATTEMPTS = 4;
const MAX_SOURCE_VIDEO_BYTES = 500 * 1024 * 1024;
const MIN_VIDEO_BYTES = 10 * 1024;
const UPLOAD_WEBHOOK_URL = "https://automacoes-n8n.jnyzmx.easypanel.host/webhook/upload-video-criadora";
const ATTEMPT_LIMIT_MESSAGE = "Você já enviou o máximo de 4 vídeos para este produto. Como a equipe investe em anúncios para cada tentativa, não é possível aprovar novos vídeos deste produto para evitar custos desnecessários. Escolha outro produto para gravar.";

type AttemptCheck = { attempt_count?: number; limit_reached?: boolean; error?: string };

export default function EnviarForm({ product, creatorId, initialAttemptCount }: { product: DashboardProduct | null; creatorId: string; initialAttemptCount: number }) {
  const { showToast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [affiliate, setAffiliate] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(initialAttemptCount);
  const [wizardStep, setWizardStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const limitReached = attemptCount >= MAX_ATTEMPTS;

  async function checkAttemptLimit() {
    if (!product?.id) return false;
    const response = await fetch(`/api/videos/attempts?creator_id=${encodeURIComponent(creatorId)}&product_id=${encodeURIComponent(product.id)}`, { cache: "no-store" });
    const body = await response.json() as AttemptCheck;
    if (!response.ok) throw new Error(body.error ?? "Não foi possível verificar suas tentativas.");
    setAttemptCount(body.attempt_count ?? 0);
    return Boolean(body.limit_reached);
  }

  async function handleFileChange(file: File | null) {
    setAffiliate(""); setMessage(""); setVideoFile(null);
    if (!file) return;
    if (limitReached) { setMessage(ATTEMPT_LIMIT_MESSAGE); return; }
    if (!file.type.startsWith("video/")) { setMessage("Envie um arquivo de vídeo válido."); return; }
    if (file.size > MAX_SOURCE_VIDEO_BYTES) { setMessage("O arquivo original deve ter no máximo 500 MB."); return; }
    setVideoFile(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (limitReached) { setMessage(ATTEMPT_LIMIT_MESSAGE); return; }
    if (!videoFile) { setMessage("Escolha um arquivo de vídeo para enviar."); return; }
    if (videoFile.size < MIN_VIDEO_BYTES) { setMessage("O arquivo de vídeo está vazio ou corrompido. Selecione outro vídeo."); return; }
    if (videoFile.size > MAX_SOURCE_VIDEO_BYTES) { setMessage("O arquivo original deve ter no máximo 500 MB."); return; }
    if (!product?.id || !product.shopeeLink) { setMessage("Este produto ainda não tem um link Shopee configurado."); return; }
    setLoading(true);
    try {
      if (await checkAttemptLimit()) {
        setVideoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        throw new Error(ATTEMPT_LIMIT_MESSAGE);
      }
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
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setAttemptCount(MAX_ATTEMPTS);
          setVideoFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          throw new Error(ATTEMPT_LIMIT_MESSAGE);
        }
        throw new Error(body.error ?? "Não foi possível enviar o vídeo.");
      }
      setAttemptCount((count) => count + 1);
      setAffiliate(body.affiliate_link_bruto); setMessage("Vídeo enviado com sucesso e encaminhado para análise."); setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; showToast({ title: "Vídeo enviado", description: "Seu vídeo foi recebido e encaminhado para análise.", type: "success" });
    } catch (error) {
      const description = error instanceof TypeError ? "Não foi possível conectar ao serviço de armazenamento. Verifique sua conexão e tente novamente." : error instanceof Error ? error.message : "Não foi possível enviar o vídeo. Verifique sua conexão e tente novamente.";
      setMessage(description);
      showToast({ title: "Erro no envio", description, type: "error" });
    } finally { setLoading(false); }
  }

  const copy = <><p>“Eu testei o {product?.name ?? "produto"} e adorei como ele deixou minha rotina mais prática.”</p><p>“Depois de usar por alguns dias, essa foi a minha experiência de verdade: [conte como o produto ajudou você].”</p><p>“Quer conhecer? Clique em <strong>Saiba mais</strong> e veja o produto na Shopee!”</p></>;

  return <>
    {!limitReached && wizardStep <= 3 && <div className="upload-wizard-overlay" role="presentation"><section className="upload-wizard" role="dialog" aria-modal="true" aria-labelledby="upload-wizard-title"><header className="upload-wizard-header"><div><small>PASSO {wizardStep} DE 3</small><h2 id="upload-wizard-title">{wizardStep === 1 ? "Como funciona" : wizardStep === 2 ? "Prepare o seu roteiro" : "Suas tentativas por produto"}</h2></div><div className="upload-wizard-progress" aria-label={`Passo ${wizardStep} de 3`}><span style={{ width: `${(wizardStep / 3) * 100}%` }} /></div></header><div className="upload-wizard-body">{wizardStep === 1 && <><p>Grave um vídeo autêntico mostrando sua experiência com o produto, envie para análise e, quando ele for aprovado, comece a ganhar comissão pelas vendas.</p><p>A comissão é contabilizada durante 30 dias a partir da primeira venda do seu vídeo.</p></>}{wizardStep === 2 && <><p>Use esta copy como inspiração e fale do seu jeito. Não precisa decorar — a sua experiência pessoal deixa o conteúdo mais natural.</p><div className="copy-suggestion wizard-copy">{copy}</div></>}{wizardStep === 3 && <><p>Se o vídeo não performar bem, você pode gravar uma nova versão falando de um jeito diferente — você tem até 4 tentativas por produto.</p><p>Depois disso, novos vídeos desse produto não serão mais aprovados, porque a equipe do Studio UGC investe em anúncios para divulgar cada vídeo aprovado, e testes repetidos sem resultado geram custos que precisamos evitar.</p></>}</div><footer className="upload-wizard-footer">{wizardStep > 1 ? <button type="button" className="button button-ghost" onClick={() => setWizardStep((step) => step - 1)}>Voltar</button> : <span />}{wizardStep < 3 ? <button type="button" className="button button-primary" onClick={() => setWizardStep((step) => step + 1)}>Próximo</button> : <button type="button" className="button button-primary" onClick={() => setWizardStep(4)}>Entendi, escolher vídeo</button>}</footer></section></div>}
    <form onSubmit={submit} className="video-submit-form">
      {limitReached ? <div className="attempt-limit-notice" role="alert"><strong>Limite de tentativas atingido</strong><span>{ATTEMPT_LIMIT_MESSAGE}</span></div> : <div className="enviar-video-columns"><div className="enviar-video-column"><SectionTitle icon="play">Arquivo do seu vídeo</SectionTitle><label className={`video-dropzone${videoFile ? " has-file" : ""}`} htmlFor="video-file"><input ref={fileInputRef} id="video-file" className="file-input-hidden" type="file" accept="video/*" required={!videoFile} disabled={limitReached} onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)} /><span className="video-dropzone-icon" aria-hidden="true">+</span>{videoFile ? <><strong>{videoFile.name}</strong><span>Toque para trocar o arquivo</span><small>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</small></> : <><strong>Toque para escolher o vídeo da galeria</strong><span>MP4 ou outro formato de vídeo</span></>}</label><p className="form-hint">Vídeos de até 500 MB são enviados sem compressão.</p>{loading && <div className="upload-progress" role="status" aria-live="polite"><div className="upload-progress-bar" role="progressbar" aria-label="Upload do vídeo em andamento" aria-valuetext="Enviando vídeo" /><span>Enviando vídeo... isso pode levar alguns minutos para arquivos grandes.</span></div>}<div className="warning-callout">⚠️ <strong>Importante:</strong> seu vídeo precisa ter uma CTA (chamada para ação) pedindo para a pessoa clicar em “Saiba mais” para ver o produto na Shopee. Vídeos sem essa CTA não serão aprovados.</div></div><div className="enviar-video-column"><SectionTitle icon="edit">Copy sugerida para o vídeo</SectionTitle><div className="copy-suggestion">{copy}</div></div></div>}
      {message && <p className={affiliate ? "form-success" : "form-error"}>{message}</p>}
      <button className="button button-primary" type="submit" disabled={loading || !videoFile || !product || limitReached}>{loading ? "Enviando vídeo..." : "Enviar vídeo"}</button>
    </form>
  </>;
}
