"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Icon from "./Icon";
import { adminGroups, creatorGroups } from "./NavGroups";

export default function MobileDrawer({ admin, open, onClose }: { admin: boolean; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const groups = admin ? adminGroups : creatorGroups;
  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/login");
  }
  return (
    <div className={`mobile-drawer-backdrop${open ? " is-open" : ""}`} aria-hidden={!open} onClick={onClose}>
      <aside className="mobile-drawer" aria-label="Menu da conta e navegação" onClick={(event) => event.stopPropagation()}>
        <div className="mobile-drawer-header"><strong>Menu</strong><button className="icon-button" type="button" onClick={onClose} aria-label="Fechar menu"><Icon name="close" size={19} /></button></div>
        <nav className="mobile-drawer-nav" aria-label="Navegação principal">
          {groups.map((group) => (
            <div key={group.label} className="mobile-drawer-group">
              <span className="mobile-drawer-label"><Icon name={group.icon} size={16} />{group.label}</span>
              {group.items.map((item) => <Link href={item.href} key={item.href} onClick={onClose}><Icon name={item.icon} size={16} />{item.label}</Link>)}
            </div>
          ))}
        </nav>
        <div className="mobile-drawer-account">
          <span className="mobile-drawer-label"><Icon name="users" size={16} />Conta</span>
          <Link href="/" onClick={onClose}><Icon name="settings" size={16} />Minha conta</Link>
          <Link href="/" onClick={onClose}><Icon name="users" size={16} />Trocar de conta</Link>
          <button className="mobile-drawer-logout" type="button" onClick={logout}><Icon name="arrow" size={16} />Sair</button>
        </div>
      </aside>
    </div>
  );
}
