"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  image: string;
  store: string;
};

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/shopee/trending-approved")
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("Feed indisponível")),
      )
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  if (!products.length) return null;

  return (
    <section className="trending-products" aria-labelledby="trending-products-title">
      <div className="section-title">
        <div className="section-icon">↗</div>
        <h2 id="trending-products-title">Produtos em alta</h2>
      </div>
      <div className="trending-product-list">
        {products.map((product) => (
          <article className="trending-product-row" key={product.id}>
            <div className="trending-product-image">
              {product.image ? <img src={product.image} alt="" loading="lazy" /> : <span>🛍️</span>}
            </div>
            <div className="product-content">
              <h3>{product.name}</h3>
              <p className="trending-store">{product.store}</p>
              <Link className="button button-primary" href={`/criadora/enviar?produto=${encodeURIComponent(product.id)}`}>
                Gravar vídeo
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
