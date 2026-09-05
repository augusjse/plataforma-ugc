import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizePhone, validatePhone } from "@/lib/phone-validation";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await request.json() as { name?: string; phone?: string; countryCode?: string };
  const name = body.name?.trim();
  const countryCode = body.countryCode?.trim();
  const phoneError = validatePhone(countryCode ?? "", body.phone ?? "");
  if (!name || phoneError) return NextResponse.json({ error: !name ? "Dados incompletos" : phoneError }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("users").update({ name, phone: normalizePhone(countryCode!, body.phone!) })
    .or(`id.eq.${user.id},email.eq.${user.email}`).select("id").maybeSingle();
  if (error) { console.error("complete-signup update failed", error); return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 }); }
  if (!data) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  return NextResponse.json({ redirect: "/criadora" });
}
