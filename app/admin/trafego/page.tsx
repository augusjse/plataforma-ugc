import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
export default function Trafego() {
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Mídia paga</p>
          <h1>Tráfego pago</h1>
          <p>Entenda quais conteúdos merecem mais investimento.</p>
        </div>
      </div>
      <SectionTitle icon="chart">Vídeos impulsionados</SectionTitle>
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vídeo / criadora</th>
              <th>Investimento</th>
              <th>Receita</th>
              <th>Retorno</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Testando o mini aspirador",
                "Maria Souza",
                "R$ 1.200",
                "R$ 8.420",
                "7,0x",
              ],
              [
                "Minha luz mudou tudo",
                "Ana Clara",
                "R$ 680",
                "R$ 3.920",
                "5,8x",
              ],
              [
                "Organizando minha penteadeira",
                "Bia Martins",
                "R$ 420",
                "R$ 1.880",
                "4,5x",
              ],
            ].map((r) => (
              <tr key={r[0]}>
                <td>
                  <b>{r[0]}</b>
                  <small className="muted">{r[1]}</small>
                </td>
                <td>{r[2]}</td>
                <td className="money">{r[3]}</td>
                <td className="money">{r[4]}</td>
                <td>
                  <span className="badge badge-success">Ativo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
