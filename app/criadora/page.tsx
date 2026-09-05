import Link from "next/link";
import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import VideoRow from "@/components/VideoRow";
import NoticeBar from "@/components/NoticeBar";
import { getCreatorDashboard } from "@/lib/dashboard-data";
import ReferralBanner from "@/components/ReferralBanner";

export default async function CreatorHome() {
  const { products, videos, sales } = await getCreatorDashboard();
  const nextProduct =
    products.find((product) => product.videoCount === 0) ?? products[0];
  return (
    <Shell>
      <NoticeBar
        title="Seu próximo pagamento está quase lá"
        description="Continue criando: faltam R$ 18 para completar o próximo ciclo."
        action="Ver ganhos"
      />
      <div className="creator-hero">
        <div>
          <p className="eyebrow">Quanto você já ganhou</p>
            <h1>R$ {sales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toFixed(2).replace(".", ",")}</h1>
          <div className="creator-pills">
            <span>
                Disponível para saque <b>R$ {sales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toFixed(2).replace(".", ",")}</b>
            </span>
            <span>
                Já recebido <b>R$ 0,00</b>
            </span>
          </div>
        </div>
        <Link href="/criadora/ganhos" className="button button-primary">
          Sacar agora →
        </Link>
      </div>
      <ReferralBanner />
      <SectionTitle icon="wallet">Até o próximo saque</SectionTitle>
      <div className="withdraw-card">
        <div className="withdraw-copy">
          <strong>Faltam R$ 18 para você poder sacar</strong>
          <span>Você já está bem perto de alcançar o mínimo.</span>
        </div>
        <div className="progress">
          <i style={{ width: "82%" }} />
        </div>
        <span className="withdraw-percent">82%</span>
      </div>
      <SectionTitle icon="play">
        Seus vídeos <span className="muted">({videos.length})</span>
      </SectionTitle>
      <div className="video-list">
        {videos.map((video) => (
          <VideoRow key={video.id} video={video} />
        ))}
      </div>
      <SectionTitle icon="cart">Próximo passo sugerido</SectionTitle>
      <div className="suggestion-layout">
        <article className="suggestion-product card">
          <img src={nextProduct.image} alt="" />
          <div className="suggestion-product-copy">
            <span className="suggestion-category">{nextProduct.category}</span>
            <h3>{nextProduct.name}</h3>
            <span className="badge badge-brand">Ninguém gravou ainda</span>
            <div className="suggestion-earning">
              Você ganha <b>R$ {nextProduct.creatorCommissionValue.toFixed(2).replace(".", ",")}</b> por venda
            </div>
          </div>
        </article>
        <div className="suggestion-copy">
          <p className="eyebrow">Oportunidade para você</p>
          <h2>Grave este produto e seja a primeira</h2>
          <p>Comece agora e coloque esse produto na frente de milhares de pessoas.</p>
          <Link
            href={`/criadora/enviar?produto=${nextProduct.id}`}
            className="button button-primary"
          >
            Quero gravar este →
          </Link>
        </div>
      </div>
      <div className="stats-grid creator-mini-stats">
        <StatCard label="Publicados" value={String(videos.length)} icon="play" />
        <StatCard label="Vendas" value={String(sales.length)} icon="cart" tone="green" />
      </div>
    </Shell>
  );
}
