import Link from "next/link";
import Badge from "./Badge";
import { DashboardProduct as Product } from "@/lib/dashboard-data";
export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <img src={product.image} alt="" />
      <div className="product-content">
        <Badge tone="neutral">{product.category}</Badge>
        <h3>{product.name}</h3>
        {product.videoCount === 0 && (
          <Badge tone="brand">Ninguém gravou ainda</Badge>
        )}
        <div className="product-meta">
          <span>
            Você ganha{" "}
            <b>
              R$ {product.creatorCommissionValue.toFixed(2).replace(".", ",")}
            </b>
          </span>
          <span className="difficulty">● {product.difficulty}</span>
        </div>
        <Link
          className="button button-primary full"
          href={`/criadora/enviar?produto=${product.id}`}
        >
          Quero gravar este <span>→</span>
        </Link>
      </div>
    </article>
  );
}
