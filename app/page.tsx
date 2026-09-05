import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
export default async function Home() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: account } = await supabaseAdmin.from("users").select("role,status").eq("email", user.email).maybeSingle();
      if (account?.status === "inactive") redirect("/login?error=inactive");
      redirect(account?.role === "admin" ? "/admin" : "/criadora");
    }
  }
  redirect("/login");
}
