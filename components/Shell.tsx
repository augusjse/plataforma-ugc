"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import NavGroups from "./NavGroups";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import MobileDrawer from "./MobileDrawer";
import InstallPrompt from "./InstallPrompt";
import { useValuesVisibility, ValuesVisibilityProvider } from "./ValuesVisibilityContext";
type Props = { children: React.ReactNode; admin?: boolean };
export default function Shell({ children, admin = false }: Props) {
  const [menu, setMenu] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!shellRef.current?.querySelector(".topbar")?.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <ValuesVisibilityProvider>
    <div className="app-shell" ref={shellRef}>
      <div className="topbar-container">
        <header className="topbar">
          <Link href={admin ? "/admin" : "/criadora"} className="logo">
            <span className="logo-mark">S</span>
            <span>
              Studio <b>UGC</b>
            </span>
          </Link>
          <BadgeMini text={admin ? "Dono da plataforma" : "Criadora"} />
          <NavGroups admin={admin} menu={menu} setMenu={setMenu} />
          <div className="top-actions">
            <Link
              href={admin ? "/admin" : "/criadora/notificacoes"}
              className="icon-button notification-button"
              aria-label="Abrir notificações"
            >
              <Icon name="bell" size={18} />
              <i />
            </Link>
            <ThemeToggle />
            <ProfileMenu admin={admin} menu={menu} setMenu={setMenu} />
          </div>
          <MobileActions drawerOpen={drawerOpen} onDrawer={() => setDrawerOpen((open) => !open)} />
        </header>
      </div>
      <MobileDrawer admin={admin} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="container">{children}</main>
      <footer>
        <span>Studio UGC</span>
        <span>© 2025 · Termos · Privacidade</span>
        <code>v0.1.0 mock</code>
      </footer>
      <InstallPrompt />
    </div>
    </ValuesVisibilityProvider>
  );
}
function MobileActions({ drawerOpen, onDrawer }: { drawerOpen: boolean; onDrawer: () => void }) {
  const { hidden, toggle } = useValuesVisibility();
  return <div className="mobile-actions">
    <button className="icon-button" type="button" onClick={toggle} aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}><Icon name={hidden ? "eye-off" : "eye"} size={18} /></button>
    <ThemeToggle />
    <button className="icon-button" type="button" onClick={onDrawer} aria-label={drawerOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={drawerOpen}><Icon name={drawerOpen ? "close" : "menu"} size={19} /></button>
  </div>;
}
function BadgeMini({ text }: { text: string }) {
  return <span className="plan-pill">{text}</span>;
}
