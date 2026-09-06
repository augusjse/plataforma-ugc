"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Icon from "./Icon";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className="button button-light account-logout"
      type="button"
      onClick={async () => {
        await createSupabaseBrowserClient().auth.signOut();
        router.push("/login");
      }}
    >
      <Icon name="arrow" size={16} />
      Sair da conta
    </button>
  );
}
