import Link from "next/link";
import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import VideoRow from "@/components/VideoRow";
import NoticeBar from "@/components/NoticeBar";
import { getCreatorDashboard } from "@/lib/dashboard-data";
import ReferralBanner from "@/components/ReferralBanner";
import PerformanceChart from "@/components/PerformanceChart";
import GoalCard from "@/components/GoalCard";
import PeriodSelector from "@/components/PeriodSelector";
import GuideCard from "@/components/GuideCard";
import Icon from "@/components/Icon";
import { normalizeDashboardPeriod, normalizeDashboardRange } from "@/lib/dashboard-data";
import { MoneyValue } from "@/components/ValuesVisibilityContext";

export default async function CreatorHome({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const query = await searchParams;
  const customRange = normalizeDashboardRange(query.from, query.to);
  const periodDays = customRange?.days ?? normalizeDashboardPeriod(query.period);
  const { products, videos, sales } = await getCreatorDashboard(customRange ?? periodDays);
  const nextProduct =
    products.find((product) => product.videoCount === 0) ?? products[0];
  return (
    <Shell>
      <div className="creator-dashboard">
      <div className="creator-top-layout">
        <div className="creator-top-left">
          <NoticeBar
            title="Seu próximo pagamento está quase lá"
            description="Continue criando: faltam R$ 18 para completar o próximo ciclo."
            action="Ver ganhos"
          />
          <div className="creator-hero">
            <div>
              <p className="eyebrow">Quanto você já ganhou</p>
              <h1><MoneyValue value={`R$ ${sales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toFixed(2).replace(".", ",")}`} /></h1>
              <div className="creator-pills">
                <span>
                  Disponível para saque <b><MoneyValue value={`R$ ${sales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toFixed(2).replace(".", ",")}`} /></b>
                </span>
                <span>
                  Já recebido <b><MoneyValue value="R$ 0,00" /></b>
                </span>
              </div>
            </div>
            <Link href="/criadora/ganhos" className="button button-primary">
              Sacar agora →
            </Link>
          </div>
        </div>
        <div className="creator-top-right">
          <ReferralBanner />
          <Link href="/criadora/catalogo" className="new-video-card">
            <span className="new-video-icon"><Icon name="plus" size={21} /></span>
            <span className="new-video-copy">
              <strong>Subir novo vídeo</strong>
              <small>Escolha um produto para gravar</small>
            </span>
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </div>
      <div className="dashboard-tools">
        <GuideCard
          title="Aprenda como usar"
          description="Veja em 2 minutos como acompanhar seus resultados."
          action="Ver guia"
        />
        <GuideCard
          title="Produtos novos"
          description="Veja os produtos recém aprovados para gravar."
          action="Ver produtos novos"
          href="/criadora/catalogo"
          icon="cart"
        />
        <PeriodSelector periodDays={periodDays} from={customRange?.from} to={customRange?.to} />
      </div>
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
      <SectionTitle icon="chart">Desempenho financeiro</SectionTitle>
      <div className="creator-revenue-layout">
        <PerformanceChart sales={sales} periodDays={periodDays} />
        <aside className="creator-revenue-summary">
          <div className="finance-card">
            <SectionTitle icon="wallet">Resumo financeiro</SectionTitle>
            <div className="finance-columns">
              <div>
                <span>Total em vendas</span>
                <strong>
                  <MoneyValue value={`R$ ${sales.reduce((sum, sale) => sum + sale.revenue, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                </strong>
              </div>
              <div>
                <span>Suas comissões</span>
                <strong>
                  <MoneyValue value={`R$ ${sales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                </strong>
              </div>
            </div>
          </div>
          <GoalCard value={82} title="Meta de receita" detail="R$ 1.640 de R$ 2.000" />
        </aside>
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
      <div className={`suggestion-layout${nextProduct ? "" : " suggestion-layout-empty"}`}>
        {nextProduct ? (
          <>
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
          </>
        ) : (
          <div className="suggestion-copy card">
            <p className="eyebrow">Oportunidade para você</p>
            <h2>Nenhum produto disponível no momento</h2>
            <p>Volte em breve para conferir novas oportunidades.</p>
          </div>
        )}
      </div>
      <div className={`stats-grid creator-mini-stats${nextProduct ? "" : " creator-mini-stats-empty"}`}>
        <StatCard label="Publicados" value={String(videos.length)} icon="play" />
        <StatCard label="Vendas" value={String(sales.length)} icon="cart" tone="green" />
      </div>
      </div>
    </Shell>
  );
}
