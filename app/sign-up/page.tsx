"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { PHONE_COUNTRIES, validatePhone } from "@/lib/phone-validation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("BR"); const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { createSupabaseBrowserClient().auth.getUser().then(({ data }) => { if (!data.user) router.replace("/login"); else { setEmail(data.user.email ?? ""); setName(data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? ""); } }); }, [router]);
  async function completeAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const phoneError = validatePhone(countryCode, phone);
    if (phoneError) { setError(phoneError); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/complete-signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, countryCode, phone }) });
      if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error ?? "Não foi possível salvar seus dados. Tente novamente."); return; }
      router.replace("/criadora");
    } catch { setError("Não foi possível salvar seus dados. Tente novamente."); }
    finally { setLoading(false); }
  }
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (countryCode !== "BR") return digits;
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return <main className="auth-page"><section className="auth-card"><div className="brand brand-on-light"><span className="brand-mark">S</span><span>Studio <b>UGC</b></span></div><p className="login-kicker">QUASE LÁ</p><h1>Complete seu cadastro.</h1><p className="auth-description">Só precisamos de mais alguns dados para preparar seu espaço de criadora.</p><form onSubmit={completeAccount} className="auth-form"><label>Nome completo<input required value={name} onChange={(e) => setName(e.target.value)} /></label><label>E-mail<input value={email} readOnly /></label><label>WhatsApp<div className="phone-field"><select aria-label="País" required value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setPhone(""); }}>{PHONE_COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.code} {country.dialCode}</option>)}</select><span className="phone-divider" aria-hidden="true">|</span><input required type="tel" inputMode="numeric" placeholder={countryCode === "BR" ? "(11) 99999-9999" : "DDD e número"} value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} /></div></label>{error && <p className="oauth-error" role="alert">{error}</p>}<button className="button login-google-button" disabled={loading}>{loading ? "Salvando..." : "Começar agora"}</button></form></section></main>;
}
