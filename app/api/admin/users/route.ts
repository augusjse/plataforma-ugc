import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  const { data } = await supabaseAdmin.from("users").select("role,status").eq("email", user.email).maybeSingle();
  return data?.role === "admin" && data.status === "active";
}
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("users").select("id,email,name,role,status,created_at,updated_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}
export async function PATCH(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const body = await request.json() as { id?: string; role?: string; status?: string };
  if (!body.id || (body.role && !["admin", "criadora"].includes(body.role)) || (body.status && !["active", "inactive"].includes(body.status))) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const changes = { ...(body.role ? { role: body.role } : {}), ...(body.status ? { status: body.status } : {}) };
  const { data, error } = await supabaseAdmin.from("users").update(changes).eq("id", body.id).select("id,email,name,role,status,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
