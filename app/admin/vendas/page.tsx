import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import { getAdminDashboard } from "@/lib/dashboard-data";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function Vendas() {
  const { sales, videos, products } = await getAdminDashboard();
  const revenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
  const grossCommission = sales.reduce(
    (sum, sale) => sum + sale.platformCommission,
    0,
  );
  const creatorCommission = sales.reduce(
    (sum, sale) => sum + sale.creatorCommission,
    0,
  );
  const platformMargin = sales.reduce((sum, sale) => sum + sale.netMargin, 0);
  const originSummary = ["organico", "pago"].map((origin) => {
    const originSales = sales.filter((sale) => sale.origem === origin);
    return {
      origin,
      revenue: originSales.reduce((sum, sale) => sum + sale.revenue, 0),
      margin: originSales.reduce((sum, sale) => sum + sale.netMargin, 0),
    };
  });
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Atribuição de vendas</p>
          <h1>Vendas por link</h1>
          <p>Veja qual vídeo gerou cada resultado e dentro de qual janela.</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Receita total"
          value={formatMoney(revenue)}
          icon="chart"
        />
        <StatCard
          label="Comissão Shopee"
          value={formatMoney(grossCommission)}
          icon="wallet"
          tone="purple"
        />
        <StatCard
          label="Repasse criadoras"
          value={formatMoney(creatorCommission)}
          icon="users"
          tone="green"
        />
        <StatCard
          label="Margem plataforma"
          value={formatMoney(platformMargin)}
          icon="chart"
        />
      </div>
      <SectionTitle icon="chart">Últimas vendas</SectionTitle>
      <div className="origin-summary">
        {originSummary.map((summary) => (
          <div className="card" key={summary.origin}>
            <span className="eyebrow">
              {summary.origin === "organico"
                ? "Vendas do seu post"
                : "Impulsionamento"}
            </span>
            <strong>{formatMoney(summary.revenue)}</strong>
            <small>Margem líquida {formatMoney(summary.margin)}</small>
          </div>
        ))}
      </div>
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vídeo</th>
              <th>Produto</th>
              <th>Pedidos</th>
              <th>Receita</th>
              <th>Origem</th>
              <th>Janela</th>
              <th>Comissão Shopee</th>
              <th>Criadora</th>
              <th>Margem líquida</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const video = videos.find((item) => item.id === sale.videoId);
              const product = products.find(
                (item) => item.id === video?.productId,
              );
              const inside = sale.creatorCommission > 0;
              return (
                <tr key={sale.id}>
                  <td>
                    <b>{video?.myLink.split("=").at(-1)}</b>
                  </td>
                  <td>{product?.name}</td>
                  <td>{sale.quantity}</td>
                  <td className="money">{formatMoney(sale.revenue)}</td>
                  <td>
                    {sale.origem === "organico"
                      ? "Seu post"
                      : "Impulsionamento"}
                  </td>
                  <td>
                    <span
                      className={`status ${inside ? "status-success" : "status-muted"}`}
                    >
                      {inside ? "Dentro" : "Fora"}
                    </span>
                  </td>
                  <td className="money">
                    {formatMoney(sale.platformCommission)}
                  </td>
                  <td className="money">
                    {formatMoney(sale.creatorCommission)}
                  </td>
                  <td className="money">{formatMoney(sale.netMargin)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
