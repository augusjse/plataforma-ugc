import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import { currentAccount, getProducts, type DashboardProduct } from "@/lib/dashboard-data";
import { supabaseAdmin } from "@/lib/supabase";
import EnviarForm from "./EnviarForm";

type EnviarProps = { searchParams: Promise<{ produto?: string }> };

export default async function Enviar({ searchParams }: EnviarProps) {
  const { produto: productId } = await searchParams;
  const products = await getProducts();
  let product: DashboardProduct | undefined = productId ? products.find((item) => item.id === productId) : products[0];
  if (!product && productId) {
    const { data } = await supabaseAdmin.from("trending_products_ugc").select("id,name,price,image,shop_link,vendor_commission").eq("id", productId).eq("status", "approved").maybeSingle();
    if (data) {
      const price = Number(data.price ?? 0); const commission = Number(data.vendor_commission ?? 0);
      product = { id: String(data.id), name: String(data.name), category: "Em alta", price, commissionPercent: commission, commissionValue: price * commission / 100, creatorCommissionValue: price * commission / 100, difficulty: "Médio", image: String(data.image ?? ""), shopeeLink: String(data.shop_link ?? ""), affiliateLink: "", status: "Ativo", videoCount: 0, sales: 0 };
    }
  }
  const account = await currentAccount();
  return <Shell><div className="page-head"><div><p className="eyebrow">Novo conteúdo</p><h1>Envie seu vídeo</h1><p>Mostre o produto do seu jeito. O vídeo passa por uma análise rápida.</p></div></div><div className="card"><div className="rule-callout">Você ganha uma parte da comissão gerada pelas vendas do seu vídeo durante 30 dias, a contar da primeira venda.</div><SectionTitle icon="cart">Produto escolhido</SectionTitle><div className="selected-product">{product ? <img src={product.image} alt="" /> : <div />}<div><strong>{product?.name ?? "Nenhum produto disponível"}</strong><span>Você ganha R$ {(product?.creatorCommissionValue ?? 0).toFixed(2).replace(".", ",")} por venda</span></div></div><EnviarForm product={product ?? null} creatorId={account?.id ?? "demo-creator"} /></div></Shell>;
}
