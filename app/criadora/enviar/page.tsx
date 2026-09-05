import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import Icon from "@/components/Icon";
import LinkRow from "@/components/LinkRow";
import { getProducts } from "@/lib/dashboard-data";
import { supabaseAdmin } from "@/lib/supabase";

type EnviarProps = { searchParams: Promise<{ produto?: string }> };

export default async function Enviar({ searchParams }: EnviarProps) {
  const { produto: productId } = await searchParams;
  const products = await getProducts();
  let product = productId ? products.find((candidate) => candidate.id === productId) : products[0];

  if (!product && productId) {
    const { data: trendingProduct } = await supabaseAdmin
      .from("trending_products_ugc")
      .select("id,name,price,image,vendor_commission")
      .eq("id", productId)
      .eq("status", "approved")
      .maybeSingle();

    if (trendingProduct) {
      const price = Number(trendingProduct.price ?? 0);
      const commissionPercent = Number(trendingProduct.vendor_commission ?? 0);
      product = {
        id: String(trendingProduct.id),
        name: String(trendingProduct.name ?? "Produto"),
        category: "Em alta",
        price,
        commissionPercent,
        commissionValue: price * commissionPercent / 100,
        creatorCommissionValue: price * commissionPercent / 100,
        difficulty: "Médio",
        image: String(trendingProduct.image ?? ""),
        shopeeLink: "",
        affiliateLink: "",
        status: "Ativo",
        videoCount: 0,
        sales: 0,
      };
    }
  }
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
          {product ? <img src={product.image} alt="" /> : <div />}
          <div>
            <strong>{product?.name ?? "Nenhum produto disponível"}</strong>
            <span>
              Você ganha R${" "}
              {(product?.creatorCommissionValue ?? 0).toFixed(2).replace(".", ",")} por
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
