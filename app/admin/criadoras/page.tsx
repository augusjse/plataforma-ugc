import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import { getAdminDashboard } from "@/lib/dashboard-data";
export default async function Criadoras() {
  const { creators, videos, sales } = await getAdminDashboard();
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Comunidade</p>
          <h1>Criadoras</h1>
          <p>Desempenho e ganhos de quem cria com a gente.</p>
        </div>
      </div>
      <SectionTitle icon="users">
        Todas as criadoras <span className="muted">({creators.length})</span>
      </SectionTitle>
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Criadora</th>
              <th>Vídeos</th>
              <th>Vendas</th>
              <th>Janelas ativas</th>
              <th>Comissão devida</th>
              <th>Chave PIX</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => {
              const mine = videos.filter((video) => video.creatorId === c.id);
              const mySales = sales.filter((sale) => mine.some((video) => video.id === sale.videoId));
              return <tr key={c.id}>
                <td>
                  <div className="person">
                    <div className="person-avatar">{String(c.name ?? c.email).slice(0, 2).toUpperCase()}</div>
                    <div>
                      <b>{c.name ?? c.email}</b>
                      <small className="muted">{c.email}</small>
                    </div>
                  </div>
                </td>
                <td>{mine.length}</td>
                <td>{mySales.length}</td>
                <td>{mine.filter((video) => video.janela_status === "ativa").length}</td>
                <td className="money">
                  R$ {mySales.reduce((sum, sale) => sum + sale.creatorCommission, 0).toFixed(2).replace(".", ",")}
                </td>
                <td>{c.pix_key ? <span title={String(c.pix_key)}>{String(c.pix_key)}</span> : <span className="muted">Não cadastrada</span>}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
