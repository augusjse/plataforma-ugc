"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";

type User = { id: string; email: string; name: string | null; role: "admin" | "criadora"; status: "active" | "inactive" };
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]), [search, setSearch] = useState(""), [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/users").then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setUsers(body.users); }).catch((reason: Error) => setError(reason.message)); }, []);
  const filtered = useMemo(() => users.filter((user) => user.email.toLowerCase().includes(search.toLowerCase())), [users, search]);
  async function updateUser(id: string, change: { role?: User["role"]; status?: User["status"] }) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...change }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Não foi possível atualizar o usuário."); return; }
    setUsers((current) => current.map((user) => user.id === id ? body.user : user));
  }
  return <Shell admin><div className="page-head"><div><p className="eyebrow">Administração</p><h1>Usuários</h1><p>Gerencie acessos, papéis e status da equipe.</p></div></div>
    <SectionTitle icon="users">Todos os usuários <span className="muted">({filtered.length})</span></SectionTitle>
    <div className="filter-row users-search"><input aria-label="Buscar por e-mail" placeholder="Buscar por e-mail" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    {error ? <div className="card users-error" role="alert">{error}</div> : <div className="card table-wrap"><table className="data-table users-table"><thead><tr><th>Usuário</th><th>Papel</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="person"><div className="person-avatar">{(user.name ?? user.email).slice(0, 2).toUpperCase()}</div><div><b>{user.name ?? "Sem nome"}</b><small className="muted">{user.email}</small></div></div></td><td><button className="user-toggle" onClick={() => updateUser(user.id, { role: user.role === "admin" ? "criadora" : "admin" })}>{user.role === "admin" ? "Admin" : "Criadora"}</button></td><td><button className={`user-toggle status-${user.status}`} onClick={() => updateUser(user.id, { status: user.status === "active" ? "inactive" : "active" })}>{user.status === "active" ? "Ativo" : "Inativo"}</button></td><td><span className="muted">Clique no papel ou status para alterar</span></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="empty-users">Nenhum usuário encontrado.</p>}</div>}
  </Shell>;
}
