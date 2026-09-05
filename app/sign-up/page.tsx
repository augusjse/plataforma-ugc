"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { createSupabaseBrowserClient().auth.getUser().then(({ data }) => { if (!data.user) router.replace("/login"); else { setEmail(data.user.email ?? ""); setName(data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? ""); } }); }, [router]);
  async function completeAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/auth/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
    if (!response.ok) { setError("Não foi possível salvar seus dados. Tente novamente."); setLoading(false); return; }
    router.replace("/criadora");
  }
  return <main className="auth-page"><section className="auth-card"><div className="brand brand-on-light"><span className="brand-mark">S</span><span>Studio <b>UGC</b></span></div><p className="login-kicker">QUASE LÁ</p><h1>Complete seu cadastro.</h1><p className="auth-description">Só precisamos de mais alguns dados para preparar seu espaço de criadora.</p><form onSubmit={completeAccount} className="auth-form"><label>Nome completo<input required value={name} onChange={(e) => setName(e.target.value)} /></label><label>E-mail<input value={email} readOnly /></label><label>Celular<input required type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>{error && <p className="oauth-error" role="alert">{error}</p>}<button className="button login-google-button" disabled={loading}>{loading ? "Salvando..." : "Começar agora"}</button></form></section></main>;
}
