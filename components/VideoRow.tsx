import Badge from "./Badge";
import { Video } from "@/lib/mock/creator";
import Icon from "./Icon";
export default function VideoRow({ video }: { video: Video }) {
  const tone =
    video.status === "Impulsionado" || video.status === "Aprovado"
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
      </div>
      <Badge tone={tone}>{video.status}</Badge>
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
