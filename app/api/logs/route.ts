import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("api_logs")
    .select("id,endpoint,method,status,error_message,request_body,response,created_at")
    .order("created_at", { ascending: false }).limit(50);
  if (error) {
    console.error("api_logs read failed", error);
    return NextResponse.json({ error: "Não foi possível carregar os logs" }, { status: 500 });
  }
  return NextResponse.json(data ?? [], { headers: { "Cache-Control": "no-store" } });
}
