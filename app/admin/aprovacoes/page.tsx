import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import Badge from "@/components/Badge";
import { pending } from "@/lib/mock/admin";
import { products } from "@/lib/mock/products";
export default function Aprovacoes() {
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Moderação</p>
          <h1>
            Fila de aprovação <Badge tone="warning">14 pendentes</Badge>
          </h1>
          <p>Assista aos vídeos e decida quais entram no catálogo.</p>
        </div>
      </div>
      <SectionTitle icon="play">Vídeos para analisar</SectionTitle>
      <div className="approval-table-wrap">
        <table className="approval-table">
          <thead><tr><th>Vídeo</th><th>Criadora</th><th>Produto</th><th>Comissão</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{pending.map((v) => {
            const product = products.find((item) => item.name === v.product);
            return <tr key={v.id}>
              <td><div className="approval-video"><img src={v.image} alt="" /><strong>{v.title}</strong></div></td>
              <td>{v.creator}</td>
              <td>{v.product}</td>
              <td>{product?.commissionPercent ?? 0}%</td>
              <td><Badge tone="warning">Em análise</Badge></td>
              <td><div className="approval-actions"><button className="button button-primary">Aprovar</button><button className="button button-ghost">Reprovar</button></div></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </Shell>
  );
}
