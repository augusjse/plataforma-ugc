"use client";
import { useState } from "react";
import type { ModerationVideo } from "@/lib/dashboard-data";

export default function ApprovalQueue({ initialVideos }: { initialVideos: ModerationVideo[] }) {
  const [videos, setVideos] = useState(initialVideos); const [error, setError] = useState(""); const [busy, setBusy] = useState<string | null>(null); const [rejecting, setRejecting] = useState<string | null>(null); const [reason, setReason] = useState("");
  async function moderate(id: string, action: "aprovar" | "reprovar", motivo?: string) {
    setBusy(id); setError("");
    try { const response = await fetch(`/api/videos/${id}/${action}`, { method: "POST", headers: action === "reprovar" ? { "Content-Type": "application/json" } : undefined, body: action === "reprovar" ? JSON.stringify({ motivo }) : undefined }); const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Não foi possível atualizar o vídeo."); setVideos((current) => current.filter((video) => video.id !== id)); setRejecting(null); setReason(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o vídeo."); } finally { setBusy(null); }
  }
  function openReject(id: string) { setRejecting(id); setReason(""); setError(""); }
  function cancelReject() { setRejecting(null); setReason(""); }
  if (!videos.length) return <div className="card"><p>Nenhum vídeo pendente de aprovação.</p></div>;
  return <div className="approval-list">{error && <p className="form-error">{error}</p>}{videos.map((video) => <div className="approval-list-item" key={video.id}><img src={video.productImage || "https://placehold.co/48x48?text=UGC"} alt="" width={48} height={48} /><div className="approval-list-main"><video controls preload="metadata" src={video.videoUrl} className="approval-video" /><strong>{video.creatorName}</strong><span>{video.productName}</span><a className="affiliate-small" href={video.affiliateLink} target="_blank" rel="noopener noreferrer">Link de afiliado</a></div><div className="approval-actions"><button className="button button-primary" disabled={busy === video.id} onClick={() => moderate(video.id, "aprovar")}>Aprovar</button><button className="button button-ghost" disabled={busy === video.id} onClick={() => openReject(video.id)}>Reprovar</button></div>{rejecting === video.id && <div className="reject-reason-panel"><label htmlFor={`reject-reason-${video.id}`}>Motivo da recusa</label><textarea id={`reject-reason-${video.id}`} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explique o que a criadora precisa ajustar..." rows={3} autoFocus /><div><button className="button button-primary" disabled={busy === video.id || !reason.trim()} onClick={() => moderate(video.id, "reprovar", reason.trim())}>{busy === video.id ? "Salvando..." : "Confirmar recusa"}</button><button className="button button-ghost" disabled={busy === video.id} onClick={cancelReject}>Cancelar</button></div></div>}</div>)}</div>;
}
