"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";

const groups = [
  { title: "Vídeos", icon: "play", items: [["suggested", "Novos vídeos sugeridos", "Receba ideias de produtos para gravar."], ["viral", "Quando um vídeo vira viral", "Saiba quando seu conteúdo ganhar destaque."]] },
  { title: "Pagamentos", icon: "wallet", items: [["paid", "Pagamentos processados", "Avise quando sua comissão for confirmada."]] },
  { title: "Sociais", icon: "users", items: [["friend", "Convite de amiga aceitou", "Acompanhe quem entrou pelo seu convite."]] },
  { title: "Sistema", icon: "settings", items: [["promos", "Novos banners e promoções", "Fique por dentro das campanhas disponíveis."], ["tips", "Dicas e tutoriais", "Receba conteúdos para criar e vender melhor."], ["updates", "Atualizações da plataforma", "Saiba o que está mudando no Studio UGC."]] },
] as const;

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ suggested: true, viral: true, paid: true, friend: true, promos: false, tips: true, updates: true });
  const [saved, setSaved] = useState(false);
  function toggle(id: string) {
    setSaved(false);
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
  }
  return (
    <Shell>
      <div className="page-head notifications-head">
        <div>
          <p className="eyebrow">Preferências</p>
          <h1>Notificações</h1>
          <p>Ative notificações para não perder nenhuma oportunidade.</p>
        </div>
        <span className="notifications-head-icon"><Icon name="bell" size={24} /></span>
      </div>
      <div className="notification-groups">
        {groups.map((group) => (
          <section className="notification-group card" key={group.title}>
            <div className="notification-group-title"><span className="academy-icon"><Icon name={group.icon} size={18} /></span><h2>{group.title}</h2></div>
            <div className="notification-options">
              {group.items.map(([id, label, description]) => (
                <label className="notification-option" key={id}>
                  <span className="notification-copy"><strong>{label}</strong><small>{description}</small></span>
                  <input type="checkbox" checked={enabled[id]} onChange={() => toggle(id)} />
                  <span className="toggle" aria-hidden="true"><i /></span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="notification-save-row">
        {saved && <span className="save-success"><Icon name="check" size={16} /> Preferências salvas!</span>}
        <button className="button button-primary" type="button" onClick={() => setSaved(true)}>Salvar preferências</button>
      </div>
    </Shell>
  );
}
