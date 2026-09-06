import Link from "next/link";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";

const quickGuide = [
  {
    icon: "play",
    title: "Revise os vídeos pendentes",
    description: "Comece pela fila de aprovações para manter as criadoras em movimento.",
    href: "/admin/aprovacoes",
    action: "Abrir aprovações",
  },
  {
    icon: "cart",
    title: "Acompanhe os produtos",
    description: "Cadastre e organize os produtos disponíveis para gravação.",
    href: "/admin/produtos",
    action: "Ver produtos",
  },
  {
    icon: "wallet",
    title: "Confira os pagamentos",
    description: "Monitore valores e mantenha os repasses das criadoras organizados.",
    href: "/admin/pagamentos",
    action: "Ver pagamentos",
  },
];

export default function AdminHelpPage() {
  return (
    <Shell admin>
      <div className="page-head academy-head">
        <div>
          <p className="eyebrow">Central de ajuda</p>
          <h1>Guia rápido do painel admin</h1>
          <p>Encontre os principais atalhos para acompanhar a operação do Studio UGC.</p>
        </div>
        <div className="academy-head-icon"><Icon name="home" size={24} /></div>
      </div>

      <div className="academy-grid">
        {quickGuide.map((item) => (
          <article className="academy-card card" key={item.title}>
            <div className="academy-card-top">
              <span className="academy-icon"><Icon name={item.icon} size={19} /></span>
              <span className="academy-eyebrow">Painel admin</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link href={item.href} className="button button-primary academy-detail-button">{item.action}</Link>
          </article>
        ))}
      </div>
    </Shell>
  );
}
