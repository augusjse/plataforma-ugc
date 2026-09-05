import Badge from "./Badge";
type Props = { title: string; creator: string; product: string; image: string };
export default function ApprovalCard({
  title,
  creator,
  product,
  image,
}: Props) {
  return (
    <article className="approval-card">
      <img src={image} alt="" />
      <div className="approval-body">
        <Badge tone="warning">Em análise</Badge>
        <h3>{title}</h3>
        <p>
          {creator} · {product}
        </p>
        <button className="button button-primary">Analisar vídeo →</button>
      </div>
    </article>
  );
}
