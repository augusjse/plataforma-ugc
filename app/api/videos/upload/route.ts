import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const BUCKET = "videos-ugc";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ success: false, error: "Supabase não configurado" }, { status: 503 });
  let file: File | null;
  try { file = (await request.formData()).get("file") as File | null; } catch { return NextResponse.json({ success: false, error: "FormData inválido" }, { status: 400 }); }
  if (!file || typeof file.arrayBuffer !== "function") return NextResponse.json({ success: false, error: "O campo file é obrigatório" }, { status: 400 });
  if (!file.type.startsWith("video/")) return NextResponse.json({ success: false, error: "Envie um arquivo de vídeo válido" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ success: false, error: "O vídeo deve ter no máximo 4 MB" }, { status: 413 });

  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "video.mp4";
  const path = `${crypto.randomUUID()}-${originalName}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ success: true, url: data.publicUrl, path });
}
