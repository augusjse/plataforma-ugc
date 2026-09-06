import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export type AccountRole = "admin" | "criadora";

export type CurrentAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  role: AccountRole | null;
  status: string | null;
  avatarUrl: string;
};

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: account } = await supabaseAdmin
    .from("users")
    .select("id, name, email, phone, instagram, youtube, tiktok, role, status")
    .eq("email", user.email)
    .maybeSingle();

  const metadata = user.user_metadata ?? {};
  const role = account?.role === "admin" || account?.role === "criadora" ? account.role : null;

  return {
    id: String(account?.id ?? user.id),
    name: String(account?.name ?? metadata.full_name ?? metadata.name ?? ""),
    email: String(account?.email ?? user.email),
    phone: String(account?.phone ?? ""),
    instagram: String(account?.instagram ?? ""),
    youtube: String(account?.youtube ?? ""),
    tiktok: String(account?.tiktok ?? ""),
    role,
    status: account?.status ? String(account.status) : null,
    avatarUrl: String(metadata.avatar_url ?? metadata.picture ?? ""),
  };
}

export function accountInitials(name: string, email: string) {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}
