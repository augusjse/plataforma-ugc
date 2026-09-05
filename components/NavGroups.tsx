"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

type Item = { href: string; label: string; icon: string };
type Group = { href: string; label: string; icon: string; items: Item[] };
type Props = { admin: boolean; menu: string | null; setMenu: (menu: string | null) => void };

const adminGroups: Group[] = [
  {
    href: "/admin",
    label: "Painel",
    icon: "home",
    items: [{ href: "/admin", label: "Visão geral", icon: "home" }],
  },
  {
    href: "/admin/aprovacoes",
    label: "Conteúdo",
    icon: "play",
    items: [
      { href: "/admin/aprovacoes", label: "Aprovações", icon: "play" },
      { href: "/admin/criadoras", label: "Criadoras", icon: "users" },
      { href: "/admin/usuarios", label: "Usuários", icon: "users" },
      { href: "/admin/sugestoes-produtos", label: "Sugestões de produtos", icon: "plus" },
      { href: "/admin/trending", label: "Trending", icon: "chart" },
    ],
  },
  {
    href: "/admin/vendas",
    label: "Resultados",
    icon: "chart",
    items: [
      { href: "/admin/vendas", label: "Vendas por link", icon: "cart" },
      { href: "/admin/trafego", label: "Tráfego pago", icon: "chart" },
    ],
  },
  {
    href: "/admin/config",
    label: "Operação",
    icon: "settings",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: "cart" },
      { href: "/admin/pagamentos", label: "Pagamentos", icon: "wallet" },
      { href: "/admin/links", label: "Links", icon: "arrow" },
      { href: "/admin/videos", label: "Vídeos", icon: "play" },
      { href: "/admin/config", label: "Distribuição", icon: "settings" },
    ],
  },
];

const creatorGroups: Group[] = [
  {
    href: "/criadora",
    label: "Painel",
    icon: "home",
    items: [{ href: "/criadora", label: "Visão geral", icon: "home" }],
  },
  {
    href: "/criadora/catalogo",
    label: "Conteúdo",
    icon: "play",
    items: [
      { href: "/criadora/catalogo", label: "Produtos", icon: "cart" },
      { href: "/criadora/meus-videos", label: "Meus vídeos", icon: "play" },
      { href: "/criadora/sugerir-produto", label: "Sugerir produto", icon: "plus" },
    ],
  },
  {
    href: "/criadora/ganhos",
    label: "Resultados",
    icon: "wallet",
    items: [{ href: "/criadora/ganhos", label: "Meus ganhos", icon: "wallet" }],
  },
  {
    href: "/criadora/academy",
    label: "Aprender",
    icon: "play",
    items: [
      { href: "/criadora/academy", label: "Academy", icon: "play" },
      { href: "/criadora/notificacoes", label: "Notificações", icon: "bell" },
    ],
  },
];

export default function NavGroups({ admin, menu, setMenu }: Props) {
  const groups = admin ? adminGroups : creatorGroups;
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRefs = useRef<HTMLAnchorElement[]>([]);
  const itemRefs = useRef<HTMLAnchorElement[]>([]);

  function openGroup(index: number) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (groups[index].items.length > 1) setMenu(`nav-${index}`);
  }

  function closeGroupLater() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 180);
  }

  useEffect(() => {
    if (menu === "profile") {
      const closeMobile = window.setTimeout(() => setMobileOpen(false), 0);
      return () => window.clearTimeout(closeMobile);
    }
    function closeOnOutside(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setMenu(null);
        setMobileOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menu, setMenu]);

  function handleButtonKey(event: React.KeyboardEvent<HTMLAnchorElement>, index: number) {
    if (event.key === "ArrowDown" && groups[index].items.length > 1) {
      event.preventDefault();
      setMenu(`nav-${index}`);
      setTimeout(() => itemRefs.current[index * 3]?.focus(), 0);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      buttonRefs.current[(index + 1) % groups.length]?.focus();
    }
    if (event.key === "Escape") setMenu(null);
  }

  return (
    <>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileOpen}
        onClick={() => {
          setMobileOpen((current) => !current);
          setMenu(null);
        }}
      >
        <span />
        <span />
        <span />
      </button>
    <nav className={`group-nav${mobileOpen ? " mobile-open" : ""}`} ref={navRef} aria-label="Navegação principal">
      {groups.map((group, index) => {
        const active = group.items.some((item) => pathname === item.href);
        return (
          <div
            className="nav-group"
            key={group.label}
            onMouseEnter={() => openGroup(index)}
            onMouseLeave={closeGroupLater}
          >
            <Link
              ref={(element) => {
                if (element) buttonRefs.current[index] = element;
              }}
              className={`icon-button ${active ? "nav-active" : ""}`}
              title={group.items.length === 1 ? group.label : undefined}
              href={group.href}
              aria-label={group.label}
              aria-haspopup={group.items.length > 1 ? "menu" : undefined}
              aria-expanded={menu === `nav-${index}`}
              onKeyDown={(event) => handleButtonKey(event, index)}
              >
              <Icon name={group.icon} size={17} />
              <span className="nav-group-label">{group.label}</span>
              {active && <span className="nav-active-dot" />}
            </Link>
            {menu === `nav-${index}` && group.items.length > 1 && (
              <div className="nav-dropdown" role="menu">
                {group.items.map((item, itemIndex) => (
                  <Link
                    className={pathname === item.href ? "current" : ""}
                    href={item.href}
                    key={item.href}
                    ref={(element) => {
                      if (element)
                        itemRefs.current[index * 3 + itemIndex] = element;
                    }}
                    onClick={() => {
                      setMenu(null);
                      setMobileOpen(false);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "ArrowDown" ||
                        event.key === "ArrowUp"
                      ) {
                        event.preventDefault();
                        const step = event.key === "ArrowDown" ? 1 : -1;
                        const next =
                          (itemIndex + step + group.items.length) %
                          group.items.length;
                        itemRefs.current[index * 3 + next]?.focus();
                      }
                      if (event.key === "Escape") {
                        setMenu(null);
                        buttonRefs.current[index]?.focus();
                      }
                    }}
                  >
                    <span className="nav-item-icon">
                      <Icon name={item.icon} size={16} />
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
    </>
  );
}
