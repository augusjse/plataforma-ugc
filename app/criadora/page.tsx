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
  const { account, products, videos, sales, saldoDisponivel, saqueMinimo, metaMensalCriadora } = await getCreatorDashboard(customRange ?? periodDays);
  const receitaReal = sales.reduce((sum, sale) => sum + sale.creatorCommission, 0);
  const temMetaMensal = metaMensalCriadora > 0;
  const progressoMetaReceita = temMetaMensal ? Math.min(100, Math.round(receitaReal / metaMensalCriadora * 100)) : 0;
  const formatarMoeda = (valor: number) => `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const faltaSaque = Math.max(0, saqueMinimo - saldoDisponivel);
  const progressoSaque = saqueMinimo > 0 ? Math.min(100, Math.round(saldoDisponivel / saqueMinimo * 100)) : 100;
  const disponivelParaSaque = saldoDisponivel >= saqueMinimo;
  const temProgressoSaque = saldoDisponivel >= saqueMinimo * 0.1;
  const saldoFormatado = saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const nextProduct =
    products.find((product) => product.videoCount === 0) ?? products[0];
  return (
    <Shell>
      <div className="creator-dashboard">
      <div className="creator-top-layout">
        <div className="creator-top-left">
          <div className="notice-period-row">
            <NoticeBar
              icon="coin"
              title={temProgressoSaque ? "Seu próximo pagamento está quase lá" : "Comece a gravar para ganhar"}
              description={temProgressoSaque ? (disponivelParaSaque ? "Seu saldo já atingiu o mínimo para saque." : `Continue criando: faltam R$ ${faltaSaque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para completar o próximo ciclo.`) : "Envie seu primeiro vídeo e comece a receber comissões."}
              action="Ver ganhos"
            >
              <PeriodSelector periodDays={periodDays} from={customRange?.from} to={customRange?.to} />
            </NoticeBar>
          </div>
          <div className="creator-hero">
            <div>
              <p className="eyebrow">Quanto você já ganhou</p>
              <h1><MoneyValue value={formatarMoeda(receitaReal)} /></h1>
              <div className="creator-pills">
                <span>
                  Disponível para saque <b><MoneyValue value={formatarMoeda(receitaReal)} /></b>
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
        </div>
      </div>
      <div className="dashboard-tools">
        {!account?.pix_key && <Link href="/conta" className="new-video-card creator-pix-reminder">
          <span className="new-video-icon"><Icon name="wallet" size={21} /></span>
          <span className="new-video-copy"><strong>Cadastre sua chave PIX</strong><small>Configure para receber seus pagamentos</small></span>
          <Icon name="arrow" size={18} />
        </Link>}
        <div className="dashboard-guide-cards">
          <GuideCard
            title="Aprenda como usar"
            description="Veja em 2 minutos como acompanhar seus resultados."
            action="Ver guia"
            href="/criadora/academy"
          />
          <GuideCard
            title="Produtos novos"
            description="Veja os produtos recém aprovados para gravar."
            action="Ver produtos novos"
            href="/criadora/catalogo"
            icon="cart"
          />
        </div>
        <Link href="/criadora/catalogo" className="new-video-card creator-new-video-card">
          <span className="new-video-icon"><Icon name="plus" size={21} /></span>
          <span className="new-video-copy">
            <strong>Subir novo vídeo</strong>
            <small>Escolha um produto para gravar</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
      </div>
      <SectionTitle icon="wallet">Até o próximo saque</SectionTitle>
      <div className="withdraw-card">
        <div className="withdraw-copy">
          <strong>{disponivelParaSaque ? "Você já pode sacar!" : `Faltam R$ ${faltaSaque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para você poder sacar`}</strong>
          <span>{disponivelParaSaque ? `Saldo disponível: R$ ${saldoFormatado}.` : `Seu saldo disponível é R$ ${saldoFormatado} de R$ ${saqueMinimo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`}</span>
        </div>
        <div className="progress">
          <i style={{ width: `${progressoSaque}%` }} />
        </div>
        <span className="withdraw-percent">{progressoSaque}%</span>
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
          <GoalCard value={progressoMetaReceita} title={temMetaMensal ? "Meta de receita" : "Defina sua meta mensal"} detail={temMetaMensal ? `${formatarMoeda(receitaReal)} de ${formatarMoeda(metaMensalCriadora)}` : "Defina sua meta em Minha conta"} />
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
