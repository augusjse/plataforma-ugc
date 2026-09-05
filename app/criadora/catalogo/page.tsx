import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import ProductCard from "@/components/ProductCard";
import TrendingProducts from "@/components/TrendingProducts";
import { getProducts } from "@/lib/dashboard-data";
export default async function Catalogo() {
  const products = await getProducts();
  return (
    <Shell>
      <div className="page-head">
        <div>
          <p className="eyebrow">Catálogo aberto</p>
          <h1>Encontre seu próximo vídeo</h1>
          <p>Produtos escolhidos para você criar conteúdo autêntico.</p>
        </div>
      </div>
      <div className="filter-row">
        <input placeholder="Buscar produto..." />
        <span className="button button-light">Todos os produtos</span>
      </div>
      <SectionTitle icon="cart">Produtos disponíveis</SectionTitle>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <TrendingProducts />
    </Shell>
  );
}
