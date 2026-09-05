create table if not exists public.admin_config (
  id boolean primary key default true check (id),
  repasse_organico_percent numeric(5,2) not null default 50 check (repasse_organico_percent between 0 and 100),
  repasse_impulsionado_percent numeric(5,2) not null default 18 check (repasse_impulsionado_percent between 0 and 100),
  custo_anuncio_venda numeric(12,2) not null default 9 check (custo_anuncio_venda >= 0),
  updated_at timestamptz not null default now()
);
insert into public.admin_config (id) values (true) on conflict (id) do nothing;
alter table public.admin_config enable row level security;
