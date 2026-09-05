import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import { creators } from "@/lib/mock/admin";
import { videos } from "@/lib/mock/creator";
export default function Pagamentos() {
  const expiringSoon = videos.filter(
    (video) =>
      video.janela_status === "ativa" && (video.diasRestantes ?? 99) <= 7,
  );
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Financeiro</p>
          <h1>Pagamentos</h1>
          <p>Organize as comissões e mantenha as criadoras em dia.</p>
        </div>
        <button className="button button-primary">
          Marcar selecionados como pagos
        </button>
      </div>
      <div className="hero">
        <p className="eyebrow">Total a pagar</p>
        <h2>R$ 8.420,20</h2>
        <p>23 criadoras aguardando pagamento</p>
        <span className="hero-tag">Próximo ciclo: 10/09</span>
      </div>
      <SectionTitle icon="wallet">Comissões pendentes</SectionTitle>
      {expiringSoon.length > 0 && (
        <div className="warning-callout">
          {expiringSoon.length} janela(s) encerram em até 7 dias e precisam de
          atenção antes do saque.
        </div>
      )}
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Criadora</th>
              <th>Vendas</th>
              <th>Valor</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => (
              <tr key={c.name}>
                <td>
                  <div className="person">
                    <div className="person-avatar">{c.initials}</div>
                    <b>{c.name}</b>
                  </div>
                </td>
                <td>{c.sales}</td>
                <td className="money">
                  R$ {c.commission.toFixed(2).replace(".", ",")}
                </td>
                <td>
                  <button className="button button-light">
                    Marcar como pago
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
