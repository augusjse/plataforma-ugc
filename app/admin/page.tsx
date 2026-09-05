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
import { sales, videos } from "@/lib/mock/creator";
export default function Admin() {
  const closedRevenue = sales
    .filter((sale) => {
      const video = videos.find((item) => item.id === sale.videoId);
      return video?.janela_status === "encerrada";
    })
    .reduce((sum, sale) => sum + sale.revenue, 0);
  const netMargin = sales.reduce((sum, sale) => sum + sale.netMargin, 0);
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
        title="14 vídeos esperam sua aprovação"
        description="Uma fila organizada ajuda as melhores criadoras a começarem mais rápido."
        action="Revisar agora"
      />
      <div className="dashboard-tools">
        <GuideCard
          title="Aprenda como usar"
          description="Veja em 2 minutos como acompanhar seus resultados."
          action="Ver guia"
        />
        <PeriodSelector />
      </div>
      <div className="overview-top">
        <div className="overview-left">
          <div className="hero">
            <p className="eyebrow">Receita gerada este mês</p>
            <h2>R$ 148.290,00</h2>
            <p>+ 18,4% em relação ao mês passado</p>
            <span className="hero-tag">Meta: R$ 180 mil</span>
          </div>
          <div className="stats-grid">
            <StatCard label="Criadoras" value="428" change="+36" icon="users" />
            <StatCard
              label="Vendas"
              value="8.942"
              change="+24,8%"
              icon="cart"
              tone="green"
            />
            <StatCard
              label="A pagar"
              value="R$ 28.420"
              icon="wallet"
              tone="purple"
            />
            <StatCard label="Na fila" value="14" icon="play" />
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
        <strong>14 vídeos aguardando aprovação</strong>
        <Link href="/admin/aprovacoes">Abrir fila →</Link>
      </div>
      <PerformanceChart subtitle="Vendas e comissões nos últimos 15 dias" />
      <div className="overview-grid">
        <div className="finance-card">
          <SectionTitle icon="wallet">Resumo financeiro</SectionTitle>
          <div className="finance-columns">
            <div>
              <span>Investimento em tráfego</span>
              <strong>R$ 18.640</strong>
            </div>
            <div>
              <span>Lucro estimado</span>
              <strong>R$ 96.820</strong>
            </div>
          </div>
        </div>
        <GoalCard
          value={82}
          title="Meta de receita"
          detail="R$ 148 mil de R$ 180 mil"
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
        {["Maria Souza", "Ana Clara", "Bia Martins"].map((name, index) => (
          <div className="ranking-row" key={name}>
            <b>0{index + 1}</b>
            <span>{name}</span>
            <strong>
              R$ {[28420, 18640, 12890][index].toLocaleString("pt-BR")}
            </strong>
          </div>
        ))}
      </div>
    </Shell>
  );
}
