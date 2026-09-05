import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import Icon from "@/components/Icon";
import LinkRow from "@/components/LinkRow";
import { products } from "@/lib/mock/products";
export default function Enviar() {
  const product = products[0];
  return (
    <Shell>
      <div className="page-head">
        <div>
          <p className="eyebrow">Novo conteúdo</p>
          <h1>Envie seu vídeo</h1>
          <p>
            Mostre o produto do seu jeito. O vídeo passa por uma análise rápida.
          </p>
        </div>
      </div>
      <div className="card">
        <div className="rule-callout">
          Você ganha uma parte da comissão gerada pelas vendas do seu vídeo
          durante 30 dias, a contar da primeira venda.
        </div>
        <SectionTitle icon="cart">Produto escolhido</SectionTitle>
        <div className="selected-product">
          <img src={product.image} alt="" />
          <div>
            <strong>{product.name}</strong>
            <span>
              Você ganha R${" "}
              {product.creatorCommissionValue.toFixed(2).replace(".", ",")} por
              venda
            </span>
          </div>
        </div>
        <div className="link-callout">
          <strong>
            Este link é só seu. Toda venda por ele conta para você.
          </strong>
          <LinkRow
            title="Seu link de venda"
            url="shopee.com.br/universal-link?sub_id=video_maria04"
          />
        </div>
        <SectionTitle icon="upload">Escolha o arquivo</SectionTitle>
        <div className="upload">
          <div className="section-icon">
            <Icon name="upload" />
          </div>
          <strong>Arraste seu vídeo aqui</strong>
          <span>ou escolha um arquivo do celular · MP4, até 500 MB</span>
          <button className="button button-primary" style={{ marginTop: 16 }}>
            Escolher vídeo
          </button>
        </div>
        <SectionTitle icon="play">
          Dicas para um vídeo que funciona
        </SectionTitle>
        <div className="tip-grid">
          <div className="tip">01 · Grave em um lugar bem iluminado</div>
          <div className="tip">02 · Mostre o produto em uso</div>
          <div className="tip">03 · Fale como você falaria com uma amiga</div>
        </div>
      </div>
    </Shell>
  );
}
