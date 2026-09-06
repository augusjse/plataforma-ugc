import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url), code = requestUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
  });
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !session?.user.email) return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  const authUser = session.user, email = authUser.email;
  const name = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null;
  const { data: existing, error: lookupError } = await supabaseAdmin.from("users").select("role,status").eq("email", email).maybeSingle();
  if (lookupError) return NextResponse.redirect(new URL("/login?error=account", requestUrl.origin));
  if (existing && existing.status !== "active") {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=inactive", requestUrl.origin));
  }
  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from("users").insert({ id: authUser.id, email, name, role: "criadora", status: "active" });
    if (insertError) return NextResponse.redirect(new URL("/login?error=account", requestUrl.origin));
    return NextResponse.redirect(new URL("/sign-up", requestUrl.origin));
  }
  const destination = (existing?.role ?? "criadora") === "admin" ? "/admin" : "/criadora";
  return NextResponse.redirect(new URL(`${destination}?welcome=1`, requestUrl.origin));
}
