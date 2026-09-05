import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export default async function CriadoraLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  const { data: account } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (account?.role !== "criadora") redirect("/admin");

  return children;
}
