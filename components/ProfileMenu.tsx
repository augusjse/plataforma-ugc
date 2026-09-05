"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Icon from "./Icon";

type Props = { admin: boolean; menu: string | null; setMenu: (menu: string | null) => void };

export default function ProfileMenu({ menu, setMenu }: Props) {
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "" });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser?.email) return;

      const authName = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? "";
      const { data: account } = await supabase
        .from("users")
        .select("name, email")
        .eq("email", authUser.email)
        .maybeSingle();

      if (active) {
        setProfile({
          name: account?.name || authName,
          email: account?.email || authUser.email,
        });
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

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

  const initials = profile.name
    ? profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

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
        {initials || "?"}
      </button>
      {menu === "profile" && (
      <div
        className="profile-dropdown"
        onMouseEnter={() => setMenu("profile")}
        onMouseLeave={() => setMenu(null)}
        onClick={() => setMenu(null)}
      >
        <div className="profile-user">
          <strong>{profile.name || "Carregando..."}</strong>
          <span>{profile.email}</span>
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
