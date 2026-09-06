"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";

type Video = { video_id: string; product_id: string; status: string; moderation_status?: string; motivo_reprovacao?: string | null; dias_restantes: number | null; total_ganho_criadora: number };

export default function MeusVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [attemptsByProduct, setAttemptsByProduct] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account")
      .then(async (accountResponse) => {
        const accountBody = await accountResponse.json();
        if (!accountResponse.ok || !accountBody.account?.id) throw Error(accountBody.error ?? "Não foi possível identificar sua conta.");
        return fetch(`/api/videos/${encodeURIComponent(accountBody.account.id)}`);
      })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw Error(body.error);
        setVideos(body.videos ?? []);
        setAttemptsByProduct(body.attempts_by_product ?? {});
      })
      .catch((reason) => setError(reason.message));
  }, []);

  return <Shell><div className="page-head"><div><p className="eyebrow">Sua produção</p><h1>Meus vídeos</h1><p>Cada vídeo tem seu próprio link e janela de comissão.</p></div></div><div className="card table-wrap">{error ? <p className="muted">{error}</p> : <table className="data-table"><thead><tr><th>Produto</th><th>Status</th><th>Dias restantes</th><th>Ganho</th><th>Link</th></tr></thead><tbody>{videos.map((video) => { const limitReached = (attemptsByProduct[video.product_id] ?? 0) >= 4; return <tr key={video.video_id}><td>{video.product_id}</td><td>{video.moderation_status === "reprovado" ? <div className="rejected-video-notice"><strong>Recusado</strong><span>{video.motivo_reprovacao || "O vídeo precisa de ajustes antes de ser reenviado."}</span>{limitReached ? <span>Você já atingiu o máximo de 4 vídeos para este produto. Escolha outro produto para gravar.</span> : <a href={`/criadora/enviar?produto=${encodeURIComponent(video.product_id)}`}>Enviar outro vídeo</a>}</div> : video.moderation_status === "aprovado" ? "Aprovado" : video.status}</td><td>{video.dias_restantes ?? "—"}</td><td className="money">R$ {(video.total_ganho_criadora ?? 0).toFixed(2).replace(".", ",")}</td><td><a href={`/v/${video.video_id}`}>Abrir</a></td></tr>; })}</tbody></table>}</div></Shell>;
}
