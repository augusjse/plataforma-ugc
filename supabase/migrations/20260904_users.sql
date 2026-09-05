create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(), email text unique not null, name text,
  role text not null default 'criadora' check (role in ('admin', 'criadora')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default now(), updated_at timestamp not null default now()
);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create or replace function public.set_users_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users for each row execute function public.set_users_updated_at();
alter table public.users enable row level security;
