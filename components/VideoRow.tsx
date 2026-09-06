import Badge from "./Badge";
import { DashboardVideo as Video } from "@/lib/dashboard-data";
import Icon from "./Icon";
import Link from "next/link";
export default function VideoRow({ video }: { video: Video }) {
  const moderationRejected = video.moderationStatus === "reprovado";
  const moderationPending = video.moderationStatus === "pendente";
  const tone =
    moderationRejected
      ? "danger"
      : moderationPending
        ? "warning"
        : video.status === "Impulsionado" || video.status === "Aprovado"
      ? "success"
      : video.status === "Reprovado"
        ? "danger"
        : "warning";
  return (
    <article className="video-card">
      <div className="video-thumb">
        <Icon name="play" size={21} />
      </div>
      <div className="video-info">
        <strong>{video.title}</strong>
        <span>
          {video.product} · {video.date}
        </span>
        {moderationRejected && (
          <div className="rejected-video-notice video-row-rejection">
            <strong>Recusado</strong>
            <span>{video.rejectionReason || "O vídeo precisa de ajustes antes de ser reenviado."}</span>
            <Link href={`/criadora/enviar?produto=${encodeURIComponent(video.productId)}`}>Enviar outro vídeo</Link>
          </div>
        )}
      </div>
      <Badge tone={tone}>{moderationRejected ? "Recusado" : moderationPending ? "Em análise" : video.status}</Badge>
      <div className="video-metrics">
        <span>Cliques <b>{video.clicks.toLocaleString("pt-BR")}</b></span>
        <span>Vendas <b>{video.sales}</b></span>
        <span>Ganho <b>R$ {video.commission.toFixed(2).replace(".", ",")}</b></span>
      </div>
      <div className={`window-state window-${video.janela_status}`}>
        <strong>
          {video.janela_status === "aguardando"
            ? "Começa na primeira venda"
            : video.janela_status === "encerrada"
              ? "Janela encerrada"
              : `Ativa · faltam ${video.diasRestantes} dias`}
        </strong>
        {video.janela_status !== "aguardando" && (
          <div className="window-progress">
            <i
              style={{
                width: `${video.janela_status === "encerrada" ? 100 : Math.max(5, 100 - ((video.diasRestantes ?? 0) / 30) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
