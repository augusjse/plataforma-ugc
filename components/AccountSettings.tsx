"use client";

import { FormEvent, useState } from "react";
import Icon from "./Icon";
import LogoutButton from "./LogoutButton";
import { useValuesVisibility } from "./ValuesVisibilityContext";

type Account = {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  role: "admin" | "criadora" | null;
  avatarUrl: string;
};

const futureItems = ["Segurança", "Meu Plano", "Integrações", "Legendas AI", "Limpeza"];

export default function AccountSettings({ account, initials }: { account: Account; initials: string }) {
  const { hidden, toggle } = useValuesVisibility();
  const [form, setForm] = useState({
    name: account.name,
    phone: account.phone,
    instagram: account.instagram,
    youtube: account.youtube,
    tiktok: account.tiktok,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível salvar as alterações");
      setMessage("Alterações salvas com sucesso.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar as alterações");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="account-settings-layout">
      <aside className="account-settings-nav card" aria-label="Configurações da conta">
        <h2>Configurações</h2>
        <a className="active" href="#perfil"><Icon name="users" size={17} /> Meus Dados</a>
        <a href="#seguranca"><Icon name="settings" size={17} /> Segurança</a>
        <a href="#preferencias"><Icon name="eye" size={17} /> Preferências</a>
        {futureItems.slice(1).map((item) => (
          <span className="account-future-link" key={item}><Icon name="settings" size={17} /> {item}<small>Em breve</small></span>
        ))}
      </aside>

      <div className="account-settings-content">
        <form className="card account-profile-form" id="perfil" onSubmit={save}>
          <header className="account-section-header">
            <div><p className="eyebrow">Meus dados</p><h2>Perfil</h2><p>Mantenha seus dados de contato e redes sociais atualizados.</p></div>
            <span className="account-role">{account.role === "admin" ? "Administrador" : "Criadora"}</span>
          </header>

          <section className="account-photo-section">
            <div className="account-avatar" aria-label={`Avatar de ${account.name || account.email}`}>
              {account.avatarUrl ? <img src={account.avatarUrl} alt="" /> : initials || "?"}
            </div>
            <div><strong>FOTO DE PERFIL</strong><p>Sua foto atual vem da conta Google usada no login.</p><button className="button button-light" type="button" disabled>Alterar foto <small>Em breve</small></button></div>
          </section>

          <div className="account-fields">
            <label>NOME<input required maxLength={120} value={form.name} onChange={(event) => change("name", event.target.value)} /></label>
            <label>E-MAIL<div className="account-locked-input"><input value={account.email} readOnly aria-readonly="true" /><Icon name="lock" size={16} /></div><small>Vinculado à sua conta Google</small></label>
            <label>WHATSAPP<input type="tel" maxLength={30} placeholder="+55 11 99999-9999" value={form.phone} onChange={(event) => change("phone", event.target.value)} /></label>
            <label>INSTAGRAM<input maxLength={160} placeholder="@seuusuario" value={form.instagram} onChange={(event) => change("instagram", event.target.value)} /></label>
            <label>YOUTUBE<input maxLength={160} placeholder="Canal ou URL" value={form.youtube} onChange={(event) => change("youtube", event.target.value)} /></label>
            <label>TIKTOK<input maxLength={160} placeholder="@seuusuario" value={form.tiktok} onChange={(event) => change("tiktok", event.target.value)} /></label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status"><Icon name="check" size={16} />{message}</p>}
          <footer className="account-form-actions"><LogoutButton /><button className="button button-primary" disabled={saving} type="submit">{saving ? "Salvando..." : "Salvar alterações"}</button></footer>
        </form>

        <section className="card account-settings-section" id="seguranca">
          <div className="account-section-header"><div><p className="eyebrow">Segurança de acesso</p><h2>Login com Google</h2></div></div>
          <p>Você entra com sua conta Google. Por isso, não há uma senha própria do Studio UGC para gerenciar.</p>
        </section>

        <section className="card account-settings-section" id="preferencias">
          <div className="account-section-header"><div><p className="eyebrow">Preferências e notificações</p><h2>Exibição do painel</h2></div></div>
          <div className="account-preference-row">
            <div><strong>Exibir receita</strong><p>Mostrar valores financeiros no painel.</p></div>
            <button className={`account-switch${hidden ? "" : " enabled"}`} type="button" role="switch" aria-checked={!hidden} onClick={toggle}><span /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
