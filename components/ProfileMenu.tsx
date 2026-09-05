"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Icon from "./Icon";

type Props = { admin: boolean; menu: string | null; setMenu: (menu: string | null) => void };

export default function ProfileMenu({ admin, menu, setMenu }: Props) {
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = admin
    ? { name: "João Pereira", email: "joao@studiougc.com" }
    : { name: "Maria Souza", email: "maria@email.com" };

  useEffect(() => {
    if (menu !== "profile") return;
    const closeOnOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menu, setMenu]);

  return (
    <div
      className="profile-menu"
      ref={profileRef}
      onMouseEnter={() => menu !== "profile" && setMenu("profile")}
    >
      <button
        className="avatar"
        type="button"
        aria-label="Abrir perfil"
        aria-expanded={menu === "profile"}
        onClick={() => setMenu(menu === "profile" ? null : "profile")}
        onMouseEnter={() => setMenu("profile")}
      >
        {admin ? "JP" : "MS"}
      </button>
      {menu === "profile" && (
      <div
        className="profile-dropdown"
        onMouseEnter={() => setMenu("profile")}
        onMouseLeave={() => setMenu(null)}
        onClick={() => setMenu(null)}
      >
        <div className="profile-user">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
        <Link href="/">
          <Icon name="settings" size={16} />
          Minha conta
        </Link>
        <Link href="/">
          <Icon name="users" size={16} />
          Trocar de conta
        </Link>
        <hr />
        <button className="logout profile-logout" type="button" onClick={async () => { await createSupabaseBrowserClient().auth.signOut(); router.push("/login"); }}>
          <Icon name="arrow" size={16} />
          Sair
        </button>
      </div>
      )}
    </div>
  );
}
