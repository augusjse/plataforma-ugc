"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number | null;
  image: string;
  store: string;
  url: string;
  growth: number | null;
};

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/shopee/trending")
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
      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card trending-product-card" key={product.id}>
            <div className="trending-product-image">
              {product.image ? <img src={product.image} alt="" loading="lazy" /> : <span>🛍️</span>}
            </div>
            <div className="product-content">
              <h3>{product.name}</h3>
              <p className="trending-store">{product.store}</p>
              <p className="trending-price">
                {product.price == null
                  ? "Preço indisponível"
                  : product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              {product.growth != null && <p className="trending-growth">↑ {product.growth}% em 7 dias</p>}
              <a className="button button-primary full" href={product.url} target="_blank" rel="noopener noreferrer">
                Ver produto <span>→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
