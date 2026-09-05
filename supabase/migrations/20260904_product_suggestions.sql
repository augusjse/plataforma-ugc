create extension if not exists pgcrypto;

create table if not exists public.product_suggestions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null,
  shopee_url text not null check (shopee_url ~ '^https?://'),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_product_suggestions_creator on public.product_suggestions(creator_id, created_at desc);
create index if not exists idx_product_suggestions_status on public.product_suggestions(status, created_at desc);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid unique references public.product_suggestions(id) on delete set null,
  name text not null default 'Produto sugerido pela comunidade',
  shopee_url text not null,
  created_at timestamptz not null default now()
);
alter table public.product_suggestions enable row level security;
alter table public.catalog_products enable row level security;

insert into public.users (email, name, role, status)
values ('augustoj2015@gmail.com', 'Augusto José', 'admin', 'active')
on conflict (email) do update set role = 'admin', status = 'active';
