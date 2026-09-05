create table if not exists public.trending_products_ugc (
  id text primary key,
  name text not null,
  price numeric(14,2),
  image text,
  shop_name text,
  shop_link text not null,
  vendor_commission numeric(8,4) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.trending_products_ugc enable row level security;
alter table public.trending_products_ugc add column if not exists shop_name text;
