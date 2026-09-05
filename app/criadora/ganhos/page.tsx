import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import VideoRow from "@/components/VideoRow";
import { sales, videos, links } from "@/lib/mock/creator";
export default function Ganhos() {
  const received = videos
    .filter((v) => v.janela_status === "encerrada")
    .reduce((sum, video) => sum + video.commission, 0);
  const payable = videos
    .filter((v) => v.janela_status !== "encerrada")
    .reduce((sum, video) => sum + video.commission, 0);
  const organicEarnings = sales
    .filter((sale) => sale.origem === "organico")
    .reduce((sum, sale) => sum + sale.creatorCommission, 0);
  const paidEarnings = sales
    .filter((sale) => sale.origem === "pago")
    .reduce((sum, sale) => sum + sale.creatorCommission, 0);
  return (
    <Shell>
      <div className="page-head">
        <div>
          <p className="eyebrow">Seu dinheiro</p>
          <h1>Meus ganhos</h1>
          <p>Transparência em cada venda feita pelos seus vídeos.</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard label="Total acumulado" value="R$ 600,20" icon="wallet" />
        <StatCard
          label="A receber"
          value="R$ 144,00"
          icon="card"
          tone="purple"
        />
        <StatCard
          label="Já recebido"
          value="R$ 456,20"
          icon="check"
          tone="green"
        />
      </div>
      <SectionTitle icon="chart">Detalhamento por vídeo</SectionTitle>
      <div className="origin-summary creator-origin-summary">
        <div className="card">
          <span className="eyebrow">Vendas do seu post</span>
          <strong>R$ {organicEarnings.toFixed(2).replace(".", ",")}</strong>
          <small>Quando você traz o público, sua comissão é maior.</small>
        </div>
        <div className="card">
          <span className="eyebrow">Vendas do impulsionamento</span>
          <strong>R$ {paidEarnings.toFixed(2).replace(".", ",")}</strong>
          <small>A plataforma trouxe o público com anúncios.</small>
        </div>
      </div>
      <div className="rule-callout">
        Quando a venda vem do seu post, sua comissão é bem maior.
      </div>
      <div className="window-summary">
        <span>
          Recebido <b>R$ {received.toFixed(2).replace(".", ",")}</b>
        </span>
        <span>
          A receber <b>R$ {payable.toFixed(2).replace(".", ",")}</b>
        </span>
        <span>
          Encerrado <b>R$ {received.toFixed(2).replace(".", ",")}</b>
        </span>
      </div>
      <div className="video-list">
        {videos
          .filter((v) => v.sales)
          .map((v) => (
            <VideoRow key={v.id} video={v} />
          ))}
      </div>
      <SectionTitle icon="arrow">Seus links de venda</SectionTitle>
      <div className="card">
        {links.map((l) => (
          <div className="video-row" key={l.code}>
            <div className="video-info">
              <strong>{l.video}</strong>
              <span>{l.url}</span>
            </div>
            <button className="button button-light">Copiar link</button>
          </div>
        ))}
      </div>
    </Shell>
  );
}
