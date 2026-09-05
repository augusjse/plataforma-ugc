import Link from "next/link";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";

const lessons = [
  {
    icon: "home",
    eyebrow: "Comece por aqui",
    title: "Bem-vinda ao Studio UGC",
    description: "Entenda como a plataforma funciona e descubra como transformar seus vídeos em uma renda extra.",
    cta: "Conhecer o Studio",
    detail: "Você escolhe um produto, grava um vídeo do seu jeito e compartilha seu link. Quando uma venda acontece, a comissão é sua.",
  },
  {
    icon: "play",
    eyebrow: "Conteúdo que converte",
    title: "Como gravar um vídeo que vende",
    description: "Um passo a passo leve para criar vídeos autênticos, prender a atenção e mostrar o produto em ação.",
    cta: "Ver o passo a passo",
    detail: "Comece com um gancho, mostre o produto de perto, conte sua experiência e termine com um convite claro para conhecer o link.",
  },
  {
    icon: "wallet",
    eyebrow: "Dinheiro no bolso",
    title: "Quanto você vai ganhar?",
    description: "Veja como funcionam suas comissões e por que cada venda tem uma janela de acompanhamento.",
    cta: "Entender meus ganhos",
    href: "/criadora/ganhos",
    detail: "A comissão é registrada quando a venda acontece. A janela de 30 dias permite confirmar a venda antes de liberar o valor para saque.",
  },
  {
    icon: "calendar",
    eyebrow: "Fique de olho",
    title: "Como funciona a janela de 30 dias",
    description: "Tudo o que você precisa saber sobre o prazo de confirmação de uma venda.",
    cta: "Ler como funciona",
    detail: "Durante 30 dias, a venda fica em acompanhamento para trocas ou cancelamentos. Depois desse período, sua comissão fica disponível para receber.",
  },
  {
    icon: "users",
    eyebrow: "Juntas é melhor",
    title: "Conheça amigas que querem ganhar dinheiro",
    description: "Convide amigas para criar com a gente e faça parte de uma comunidade que cresce junto.",
    cta: "Convidar uma amiga",
    detail: "Compartilhe seu convite com quem ama criar conteúdo. Quando sua amiga aceitar, vocês podem aproveitar novas oportunidades no Studio.",
  },
  {
    icon: "bell",
    eyebrow: "Não perca nada",
    title: "Gerenciar notificações",
    description: "Escolha os avisos que fazem sentido para você e fique por dentro das melhores oportunidades.",
    cta: "Configurar avisos",
    href: "/criadora/notificacoes",
    detail: "Ative ou pause avisos sobre vídeos, pagamentos, convites e novidades da plataforma quando quiser.",
  },
];

export default function AcademyPage() {
  return (
    <Shell>
      <div className="page-head academy-head">
        <div>
          <p className="eyebrow">Seu espaço para aprender</p>
          <h1>Academy Studio UGC</h1>
          <p>Conteúdos rápidos para você criar melhor, vender mais e aproveitar tudo que o Studio tem para oferecer.</p>
        </div>
        <div className="academy-head-icon"><Icon name="play" size={24} /></div>
      </div>

      <div className="academy-grid">
        {lessons.map((lesson) => (
          <article className="academy-card card" key={lesson.title}>
            <div className="academy-card-top">
              <span className="academy-icon"><Icon name={lesson.icon} size={19} /></span>
              <span className="academy-eyebrow">{lesson.eyebrow}</span>
            </div>
            <h2>{lesson.title}</h2>
            <p>{lesson.description}</p>
            <details>
              <summary>{lesson.cta} <span>→</span></summary>
              <div className="academy-detail">{lesson.detail}</div>
              {lesson.href && <Link href={lesson.href} className="button button-primary academy-detail-button">Abrir página</Link>}
            </details>
          </article>
        ))}
      </div>

      <div className="academy-faq card">
        <div className="academy-faq-icon"><Icon name="warning" size={20} /></div>
        <div>
          <p className="eyebrow">Ainda ficou com dúvida?</p>
          <h2>FAQ</h2>
          <p>As respostas para as perguntas mais comuns sobre vídeos, links e pagamentos estão sempre por aqui.</p>
        </div>
        <Link href="/criadora/ganhos" className="button button-light">Ver perguntas frequentes →</Link>
      </div>
    </Shell>
  );
}
