import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await request.json() as { name?: string; phone?: string };
  if (!body.name?.trim() || !body.phone?.trim()) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  const { error } = await supabaseAdmin.from("users").update({ name: body.name.trim(), phone: body.phone.trim() }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  return NextResponse.json({ redirect: "/criadora" });
}
