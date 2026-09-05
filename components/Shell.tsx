"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import NavGroups from "./NavGroups";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
type Props = { children: React.ReactNode; admin?: boolean };
export default function Shell({ children, admin = false }: Props) {
  const [menu, setMenu] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!shellRef.current?.querySelector(".topbar")?.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
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
        </header>
      </div>
      <main className="container">{children}</main>
      <footer>
        <span>Studio UGC</span>
        <span>© 2025 · Termos · Privacidade</span>
        <code>v0.1.0 mock</code>
      </footer>
    </div>
  );
}
function BadgeMini({ text }: { text: string }) {
  return <span className="plan-pill">{text}</span>;
}
