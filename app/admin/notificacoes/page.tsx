import Link from "next/link";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import SectionTitle from "@/components/SectionTitle";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  type: "video" | "trending" | "creator" | "sale";
  icon: string;
  title: string;
  description: string;
  href: string;
  date: string;
};

const age = (date: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;
  return new Date(date).toLocaleDateString("pt-BR");
};

const money = (value: unknown) => Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function getNotifications(): Promise<Notification[]> {
  const recentSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [videosResult, trendingResult, creatorsResult, salesResult] = await Promise.all([
    supabaseAdmin.from("videos_ugc").select("id,created_at").eq("moderation_status", "pendente").order("created_at", { ascending: false }).limit(30),
    supabaseAdmin.from("trending_products_ugc").select("id,name,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(30),
    supabaseAdmin.from("users").select("id,name,email,created_at").eq("role", "criadora").gte("created_at", recentSince).order("created_at", { ascending: false }).limit(30),
    supabaseAdmin.from("sales_ugc").select("id,sale_date,sale_value").gte("sale_date", recentSince).order("sale_date", { ascending: false }).limit(30),
  ]);

  const notifications: Notification[] = [];
  for (const row of videosResult.data ?? []) {
    const date = String(row.created_at);
    notifications.push({ id: `video-${row.id}`, type: "video", icon: "play", title: "Vídeo aguardando aprovação", description: "Revise este conteúdo antes de liberá-lo para o catálogo.", href: "/admin/aprovacoes", date });
  }
  for (const row of trendingResult.data ?? []) {
    const date = String(row.created_at);
    notifications.push({ id: `trending-${row.id}`, type: "trending", icon: "chart", title: "Produto trending aguardando aprovação", description: `${String(row.name ?? "Produto")} está na fila de análise.`, href: "/admin/trending", date });
  }
  for (const row of creatorsResult.data ?? []) {
    const date = String(row.created_at);
    notifications.push({ id: `creator-${row.id}`, type: "creator", icon: "users", title: "Nova criadora cadastrada", description: String(row.name ?? row.email ?? "Uma nova criadora entrou na plataforma."), href: "/admin/criadoras", date });
  }
  for (const row of salesResult.data ?? []) {
    const date = String(row.sale_date);
    notifications.push({ id: `sale-${row.id}`, type: "sale", icon: "cart", title: "Venda registrada", description: `Uma nova venda de ${money(row.sale_value)} foi registrada.`, href: "/admin/vendas", date });
  }
  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications();
  return (
    <Shell admin>
      <div className="page-head notifications-head">
        <div>
          <p className="eyebrow">Central de operações</p>
          <h1>Notificações</h1>
          <p>Acompanhe as pendências e os eventos mais recentes da plataforma.</p>
        </div>
        <span className="notifications-head-icon"><Icon name="bell" size={24} /></span>
      </div>
      <SectionTitle icon="bell">Atividade recente</SectionTitle>
      {notifications.length === 0 ? (
        <div className="card admin-notifications-empty"><span className="notifications-empty-icon"><Icon name="check" size={24} /></span><strong>Tudo em dia!</strong><p>Nenhuma pendência no momento.</p></div>
      ) : (
        <div className="card admin-notifications-list">
          {notifications.map((notification) => (
            <Link className="admin-notification-item" href={notification.href} key={notification.id}>
              <span className={`admin-notification-icon admin-notification-icon-${notification.type}`}><Icon name={notification.icon} size={19} /></span>
              <span className="admin-notification-copy"><strong>{notification.title}</strong><small>{notification.description}</small></span>
              <time dateTime={notification.date}>{age(notification.date)}</time>
              <Icon name="arrow" size={17} />
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
