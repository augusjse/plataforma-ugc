import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);
export const supabaseAdmin = createClient(
  url ?? "http://127.0.0.1:54321",
  key ?? "missing-supabase-key",
  { auth: { autoRefreshToken: false, persistSession: false } },
);
