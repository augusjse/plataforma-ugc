import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import { creators } from "@/lib/mock/admin";
export default function Criadoras() {
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
        Todas as criadoras <span className="muted">(128)</span>
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
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => (
              <tr key={c.name}>
                <td>
                  <div className="person">
                    <div className="person-avatar">{c.initials}</div>
                    <div>
                      <b>{c.name}</b>
                      <small className="muted">{c.handle}</small>
                    </div>
                  </div>
                </td>
                <td>{c.videos}</td>
                <td>{c.sales}</td>
                <td>{c.activeWindows}</td>
                <td className="money">
                  R$ {c.commission.toFixed(2).replace(".", ",")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
