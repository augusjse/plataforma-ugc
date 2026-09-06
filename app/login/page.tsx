"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  useEffect(() => setCallbackError(new URLSearchParams(window.location.search).get("error")), []);
  async function signInWithGoogle() {
    setLoading(true); setError(null);
    const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) { setError("Não foi possível iniciar o login. Tente novamente."); setLoading(false); }
  }
  const visibleError = error ?? (callbackError === "inactive" ? "Esta conta está temporariamente desativada." : callbackError ? "Não foi possível concluir o login. Tente novamente." : null);
  return <main className="login-page">
    <section className="login-hero" aria-label="Sobre o Studio UGC"><div className="login-hero-content">
      <div className="brand brand-on-dark"><span className="brand-mark">S</span><span>Studio <b>UGC</b></span></div>
      <div className="login-hero-copy"><span className="login-hero-accent" aria-hidden="true" /><p className="login-kicker">PARA QUEM CRIA COM VERDADE</p><h2>Conteúdo real.<br /><em>Resultados reais.</em></h2><p>Conectamos criadoras a produtos que merecem ser descobertos.</p></div>
      <span className="login-hero-dot" aria-hidden="true" />
    </div></section>
    <section className="login-side"><div className="login-card">
      <div className="brand brand-on-light"><span className="brand-mark">S</span><span>Studio <b>UGC</b></span></div>
      <div className="login-intro"><p className="login-kicker">BEM-VINDA AO STUDIO</p><h1>Seu talento pode <em>virar renda.</em></h1><p>Entre no Studio UGC e comece a criar vídeos para produtos que você já ama.</p></div>
      <button className="button login-google-button" type="button" onClick={signInWithGoogle} disabled={loading}><span className="google-g" aria-hidden="true">G</span>{loading ? "Conectando..." : "Entrar com Google"}</button>
      {visibleError && <p className="oauth-error" role="alert">{visibleError}</p>}
      <p className="login-terms">Ao continuar, você concorda com nossos <a href="#termos">Termos</a> e <a href="#privacidade">Privacidade</a>.</p>
    </div></section>
  </main>;
}
