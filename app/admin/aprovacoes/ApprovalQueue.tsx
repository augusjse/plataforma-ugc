"use client";
import { useState } from "react";
import type { ModerationVideo } from "@/lib/dashboard-data";

export default function ApprovalQueue({ initialVideos }: { initialVideos: ModerationVideo[] }) {
  const [videos, setVideos] = useState(initialVideos); const [error, setError] = useState(""); const [busy, setBusy] = useState<string | null>(null);
  async function moderate(id: string, action: "aprovar" | "reprovar") {
    setBusy(id); setError("");
    try { const response = await fetch(`/api/videos/${id}/${action}`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.error ?? "Não foi possível atualizar o vídeo."); setVideos((current) => current.filter((video) => video.id !== id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o vídeo."); } finally { setBusy(null); }
  }
  if (!videos.length) return <div className="card"><p>Nenhum vídeo pendente de aprovação.</p></div>;
  return <div className="approval-list">{error && <p className="form-error">{error}</p>}{videos.map((video) => <div className="approval-list-item" key={video.id}><img src={video.productImage || "https://placehold.co/48x48?text=UGC"} alt="" width={48} height={48} /><div className="approval-list-main"><a className="play-link" href={video.videoUrl} target="_blank" rel="noopener noreferrer">▶ Ver vídeo</a><strong>{video.creatorName}</strong><span>{video.productName}</span><a className="affiliate-small" href={video.affiliateLink} target="_blank" rel="noopener noreferrer">Link de afiliado</a></div><div className="approval-actions"><button className="button button-primary" disabled={busy === video.id} onClick={() => moderate(video.id, "aprovar")}>Aprovar</button><button className="button button-ghost" disabled={busy === video.id} onClick={() => moderate(video.id, "reprovar")}>Reprovar</button></div></div>)}</div>;
}
