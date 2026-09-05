import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import NoticeBar from "@/components/NoticeBar";
import PeriodSelector from "@/components/PeriodSelector";
import GuideCard from "@/components/GuideCard";
import PromoCard from "@/components/PromoCard";
import GoalCard from "@/components/GoalCard";
import PerformanceChart from "@/components/PerformanceChart";
import { getAdminDashboard, getPendingVideosCount, normalizeDashboardPeriod, normalizeDashboardRange } from "@/lib/dashboard-data";
export default async function Admin({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const query = await searchParams;
  const customRange = normalizeDashboardRange(query.from, query.to);
  const periodDays = customRange?.days ?? normalizeDashboardPeriod(query.period);
  const [{ sales, videos, creators }, pendingVideosCount] = await Promise.all([
    getAdminDashboard(customRange ?? periodDays),
    getPendingVideosCount(),
  ]);
  const closedRevenue = sales
    .filter((sale) => {
      const video = videos.find((item) => item.id === sale.videoId);
      return video?.janela_status === "encerrada";
    })
    .reduce((sum, sale) => sum + sale.revenue, 0);
  const netMargin = sales.reduce((sum, sale) => sum + sale.netMargin, 0);

  const top10Creators = creators
    .map((creator) => {
      const creatorSales = sales.filter((sale) => {
        const video = videos.find((v) => v.id === sale.videoId);
        return video?.creatorId === creator.id;
      });
      return {
        ...creator,
        totalRevenue: creatorSales.reduce((sum, s) => sum + s.revenue, 0),
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);
  return (
    <Shell admin>
      <div className="page-head overview-head">
        <div>
          <p className="eyebrow">Painel do negócio</p>
          <h1>Visão geral</h1>
          <p>Acompanhe o que está acontecendo no Studio UGC.</p>
        </div>
        <Link href="/admin/aprovacoes" className="button button-primary">
          Ver aprovações
        </Link>
      </div>
      <NoticeBar
        title={`${pendingVideosCount.toLocaleString("pt-BR")} vídeos esperam sua aprovação`}
        description="Uma fila organizada ajuda as melhores criadoras a começarem mais rápido."
        action="Revisar agora"
      />
      <div className="dashboard-tools">
        <GuideCard
          title="Aprenda como usar"
          description="Veja em 2 minutos como acompanhar seus resultados."
          action="Ver guia"
        />
        <PeriodSelector periodDays={periodDays} from={customRange?.from} to={customRange?.to} />
      </div>
      <div className="overview-top">
        <div className="overview-left">
          <div className="hero">
            <p className="eyebrow">Receita gerada este mês</p>
            <h2>R$ {sales.reduce((sum, sale) => sum + sale.revenue, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
            <p>Dados reais das vendas registradas</p>
            <span className="hero-tag">Sem dados mockados</span>
          </div>
          <div className="stats-grid">
            <StatCard label="Criadoras" value={String(creators.length)} icon="users" />
            <StatCard
              label="Vendas"
              value={sales.length.toLocaleString("pt-BR")}
              icon="cart"
              tone="green"
            />
            <StatCard
              label="A pagar"
              value={`R$ ${sales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon="wallet"
              tone="purple"
            />
            <StatCard label="Na fila" value={pendingVideosCount.toLocaleString("pt-BR")} icon="play" />
          </div>
        </div>
        <PromoCard
          eyebrow="Destaque da semana"
          title="Convide novas criadoras para o Studio"
          image="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80"
          action="Compartilhar convite"
        />
      </div>
      <div className="compact-queue">
        <span className="section-icon">◈</span>
        <strong>{pendingVideosCount.toLocaleString("pt-BR")} vídeos aguardando aprovação</strong>
        <Link href="/admin/aprovacoes">Abrir fila →</Link>
      </div>
      <PerformanceChart sales={sales} periodDays={periodDays} />
      <div className="overview-grid">
        <div className="finance-card">
          <SectionTitle icon="wallet">Resumo financeiro</SectionTitle>
          <div className="finance-columns">
            <div>
              <span>Investimento em tráfego</span>
              <strong>
                R$ {(netMargin * 0.15).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>
              <span>Lucro estimado</span>
              <strong>
                R$ {netMargin.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>
        <GoalCard
          value={
            sales.reduce((sum, s) => sum + s.revenue, 0) > 180000
              ? 100
              : Math.round(
                  (sales.reduce((sum, s) => sum + s.revenue, 0) / 180000) * 100
                )
          }
          title="Meta de receita"
          detail={`R$ ${sales.reduce((sum, s) => sum + s.revenue, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R$ 180.000`}
        />
      </div>
      <div className="compact-queue">
        <span className="section-icon">◈</span>
        <strong>Receita de janelas encerradas</strong>
        <span>
          R${" "}
          {closedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="net-margin-callout">
        <span className="eyebrow">Margem líquida da operação</span>
        <strong>
          R$ {netMargin.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </strong>
        <span>Comissão Shopee menos repasses e anúncios.</span>
      </div>
      <div className="ranking-card">
        <SectionTitle
          icon="chart"
          action={
            <button className="button button-light">Melhores criadoras⌄</button>
          }
        >
          Top 10
        </SectionTitle>
        {top10Creators.map((creator, index) => (
          <div className="ranking-row" key={creator.id}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span>{creator.name || "Criadora sem nome"}</span>
            <strong>
              R${" "}
              {creator.totalRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>
        ))}
      </div>
    </Shell>
  );
}
