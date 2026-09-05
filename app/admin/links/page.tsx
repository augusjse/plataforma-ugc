import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import { getAdminDashboard } from "@/lib/dashboard-data";

export default async function Links() {
  const { videos } = await getAdminDashboard();
  const creatorLinks = videos.map((video) => ({ creator: video.productId, product: video.product, video: video.title, subId: video.id, url: video.myLink, date: video.janela_inicio ?? "—", clicks: video.clicks, sales: video.sales, commission: video.commission }));
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Rastreamento</p>
          <h1>Links gerados</h1>
          <p>Prove que cada venda está ligada à criadora e ao vídeo certo.</p>
        </div>
      </div>
      <div className="filter-row">
        <input placeholder="Filtrar por criadora..." />
        <input placeholder="Filtrar por produto..." />
      </div>
      <SectionTitle icon="arrow">Links por vídeo</SectionTitle>
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Criadora</th>
              <th>Produto</th>
              <th>Vídeo</th>
              <th>Sub_id</th>
              <th>Link final</th>
              <th>Data</th>
              <th>Cliques</th>
              <th>Vendas</th>
              <th>Comissão</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {creatorLinks.map((link) => (
              <tr key={link.subId}>
                <td>{link.creator}</td>
                <td>{link.product}</td>
                <td>{link.video}</td>
                <td>
                  <b>{link.subId}</b>
                </td>
                <td className="link-cell">{link.url}</td>
                <td>{link.date}</td>
                <td>{link.clicks.toLocaleString("pt-BR")}</td>
                <td>{link.sales.toLocaleString("pt-BR")}</td>
                <td className="money">
                  R$ {link.commission.toFixed(2).replace(".", ",")}
                </td>
                <td>
                  <button className="button button-light">Copiar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
