import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import { products } from "@/lib/mock/products";

export default function Produtos() {
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Mineração do catálogo</p>
          <h1>Produtos</h1>
          <p>Minere, converta e deixe os produtos prontos para as criadoras.</p>
        </div>
        <button className="button button-primary">+ Adicionar produto</button>
      </div>
      <div className="card mining-form">
        <SectionTitle icon="plus">Adicionar produto minerado</SectionTitle>
        <div className="form-grid">
          <label>
            Link do produto na Shopee
            <input placeholder="Cole o link original" />
          </label>
          <label>
            Link de afiliado convertido
            <input placeholder="Cole o link convertido pela Shopee" />
          </label>
          <label>
            Nome do produto
            <input placeholder="Nome que aparecerá no catálogo" />
          </label>
          <label>
            Foto do produto
            <input placeholder="URL da foto" />
          </label>
          <label>
            Preço
            <input placeholder="R$ 0,00" />
          </label>
          <label>
            Comissão (%)
            <input placeholder="18" />
          </label>
          <label>
            Categoria
            <select defaultValue="Casa">
              <option>Casa</option>
              <option>Beleza</option>
              <option>Eletrônicos</option>
            </select>
          </label>
          <label>
            Status
            <select defaultValue="Ativo">
              <option>Ativo</option>
              <option>Pausado</option>
              <option>Esgotado</option>
            </select>
          </label>
        </div>
        <button className="button button-primary">
          Salvar produto no catálogo
        </button>
      </div>
      <SectionTitle icon="chart">Saúde do catálogo</SectionTitle>
      <div className="stats-grid catalog-health">
        <StatCard
          label="Produtos ativos"
          value="186"
          icon="check"
          tone="green"
        />
        <StatCard
          label="Sem nenhum vídeo"
          value="42"
          change="Oportunidade"
          icon="play"
        />
        <StatCard
          label="Comissão abaixo de 10%"
          value="18"
          icon="warning"
          tone="purple"
        />
        <StatCard label="Produtos minerados" value="264" icon="cart" />
      </div>
      <SectionTitle
        icon="cart"
        action={
          <button className="button button-light">Pausar selecionados</button>
        }
      >
        Produtos minerados
      </SectionTitle>
      <div className="card table-wrap product-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Comissão</th>
              <th>Vídeos</th>
              <th>Vendas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-table-name">
                    <img src={product.image} alt="" />
                    <b>{product.name}</b>
                  </div>
                </td>
                <td className="money">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </td>
                <td className="money">
                  {product.commissionPercent}% · R${" "}
                  {product.commissionValue.toFixed(2).replace(".", ",")}
                </td>
                <td>{product.videoCount}</td>
                <td>{product.sales.toLocaleString("pt-BR")}</td>
                <td>
                  <span
                    className={`badge badge-${product.status === "Ativo" ? "success" : "warning"}`}
                  >
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
