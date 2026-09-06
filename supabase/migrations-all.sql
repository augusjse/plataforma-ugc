-- Studio UGC - Complete Database Migrations
-- Execute tudo isso no Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  instagram text,
  youtube text,
  tiktok text,
  role text not null default 'criadora' check (role in ('admin', 'criadora')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
alter table public.users add column if not exists instagram text;
alter table public.users add column if not exists youtube text;
alter table public.users add column if not exists tiktok text;
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);

create or replace function public.set_users_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users for each row execute function public.set_users_updated_at();
alter table public.users enable row level security;

insert into public.users (email, name, role, status)
values ('augustoj2015@gmail.com', 'Augusto José', 'admin', 'active')
on conflict (email) do update set role = 'admin', status = 'active';

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

create table if not exists public.videos_ugc (
  id uuid primary key default gen_random_uuid(),
  creator_id text not null,
  product_id text not null,
  affiliate_link_bruto text not null check (affiliate_link_bruto ~ '^https?://'),
  video_url_sua_plataforma text not null check (video_url_sua_plataforma ~ '^https?://'),
  janela_inicio timestamptz,
  janela_fim timestamptz,
  status text not null default 'aguardando_primeira_venda' check (status in ('aguardando_primeira_venda', 'ativo', 'encerrado')),
  created_at timestamptz not null default now()
);

create table if not exists public.sales_ugc (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos_ugc(id) on delete restrict,
  sale_value numeric(14,2) not null check (sale_value >= 0),
  commission_percent numeric(8,6) not null check (commission_percent >= 0),
  commission_creator numeric(14,2) not null default 0,
  commission_platform numeric(14,2) not null default 0,
  sale_date timestamptz not null default now(),
  external_sale_id text unique
);

create table if not exists public.video_clicks_ugc (
  id bigint generated always as identity primary key,
  video_id uuid not null references public.videos_ugc(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

create or replace view public.video_janelas as
select v.id as video_id, v.creator_id, v.product_id, v.janela_inicio, v.janela_fim,
  v.status, v.created_at,
  case when v.janela_fim is null then null else greatest(0, ceil(extract(epoch from (v.janela_fim - now()) / 86400)))::int end as dias_restantes,
  coalesce(sum(s.commission_creator), 0)::numeric(14,2) as total_ganho_criadora,
  count(s.id)::int as total_sales
from public.videos_ugc v left join public.sales_ugc s on s.video_id = v.id
group by v.id;

create table if not exists public.admin_config (
  id boolean primary key default true check (id),
  repasse_organico_percent numeric(5,2) not null default 50,
  repasse_impulsionado_percent numeric(5,2) not null default 10,
  custo_anuncio_por_venda numeric(10,2) not null default 9,
  updated_at timestamptz not null default now()
);
insert into public.admin_config (id) values (true) on conflict (id) do nothing;
alter table public.admin_config enable row level security;

create or replace function public.registrar_venda_ugc(
  p_video_id uuid, p_sale_value numeric, p_commission_percent numeric,
  p_sale_date timestamptz default now(), p_external_sale_id text default null
) returns table(video_id uuid, sale_id uuid, status text, janela_inicio timestamptz,
  janela_fim timestamptz, commission_creator numeric, commission_platform numeric)
language plpgsql security definer set search_path = public as $$
declare v videos_ugc%rowtype; creator numeric; platform numeric; inserted_id uuid; organic_share numeric;
begin
  select coalesce(repasse_organico_percent, 50) into organic_share from public.admin_config where id = true;
  organic_share := coalesce(organic_share, 50);
  select * into v from videos_ugc where id = p_video_id for update;
  if not found then raise exception 'video_id não encontrado'; end if;
  if p_external_sale_id is not null and exists(select 1 from sales_ugc where external_sale_id = p_external_sale_id) then
    select s.id, v.status, v.janela_inicio, v.janela_fim, s.commission_creator, s.commission_platform
      into inserted_id, status, janela_inicio, janela_fim, commission_creator, commission_platform
      from sales_ugc s where s.external_sale_id = p_external_sale_id;
    video_id := p_video_id; sale_id := inserted_id; return next; return;
  end if;
  if v.janela_inicio is null then
    update videos_ugc set janela_inicio = p_sale_date, janela_fim = p_sale_date + interval '30 days', status = 'ativo' where id = p_video_id returning * into v;
  elsif p_sale_date > v.janela_fim then
    update videos_ugc set status = 'encerrado' where id = p_video_id returning * into v;
  end if;
  if v.status = 'ativo' and p_sale_date between v.janela_inicio and v.janela_fim then
    creator := round((p_sale_value * p_commission_percent * organic_share / 100)::numeric, 2);
  else creator := 0; end if;
  platform := round((p_sale_value * p_commission_percent - creator)::numeric, 2);
  insert into sales_ugc(video_id, sale_value, commission_percent, commission_creator, commission_platform, sale_date, external_sale_id)
    values(p_video_id, p_sale_value, p_commission_percent, creator, platform, p_sale_date, p_external_sale_id) returning id into inserted_id;
  video_id := p_video_id; sale_id := inserted_id; status := v.status; janela_inicio := v.janela_inicio; janela_fim := v.janela_fim; commission_creator := creator; commission_platform := platform; return next;
end; $$;

alter table public.videos_ugc enable row level security;
alter table public.sales_ugc enable row level security;

create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  method text not null,
  status text not null check (status in ('error', 'success')),
  error_message text,
  request_body jsonb,
  response jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_api_logs_created_at on public.api_logs(created_at desc);
alter table public.api_logs enable row level security;

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

alter table public.videos_ugc
  add column if not exists moderation_status text not null default 'pendente';

alter table public.videos_ugc
  add column if not exists motivo_reprovacao text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'videos_ugc_moderation_status_check'
      and conrelid = 'public.videos_ugc'::regclass
  ) then
    alter table public.videos_ugc
      add constraint videos_ugc_moderation_status_check
      check (moderation_status in ('pendente', 'aprovado', 'reprovado'));
  end if;
end $$;

-- 20260906_saque_minimo.sql
alter table public.admin_config
  add column if not exists saque_minimo numeric(12,2) not null default 50
  check (saque_minimo >= 0);

comment on column public.admin_config.saque_minimo is
  'Minimum creator payout amount in BRL; default 50 is configurable by admins.';

-- 20260906_metas_financeiras_criadora.sql
alter table public.users
  add column if not exists meta_diaria numeric(10,2) not null default 0 check (meta_diaria >= 0),
  add column if not exists meta_semanal numeric(10,2) not null default 0 check (meta_semanal >= 0),
  add column if not exists meta_mensal numeric(10,2) not null default 0 check (meta_mensal >= 0),
  add column if not exists bonus_diario numeric(10,2) not null default 0 check (bonus_diario >= 0),
  add column if not exists bonus_semanal numeric(10,2) not null default 0 check (bonus_semanal >= 0),
  add column if not exists bonus_mensal numeric(10,2) not null default 0 check (bonus_mensal >= 0);

create or replace view public.video_janelas as
select v.id as video_id, v.creator_id, v.product_id, v.janela_inicio, v.janela_fim,
  v.status, v.created_at,
  case when v.janela_fim is null then null else greatest(0, ceil(extract(epoch from (v.janela_fim - now()) / 86400)))::int end as dias_restantes,
  coalesce(sum(s.commission_creator), 0)::numeric(14,2) as total_ganho_criadora,
  count(s.id)::int as total_sales, v.moderation_status, v.motivo_reprovacao
from public.videos_ugc v left join public.sales_ugc s on s.video_id = v.id
group by v.id;

insert into storage.buckets (id, name, public)
values ('videos-ugc', 'videos-ugc', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'videos_ugc_service_role_insert') then
    create policy videos_ugc_service_role_insert on storage.objects for insert to service_role with check (bucket_id = 'videos-ugc');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'videos_ugc_public_read') then
    create policy videos_ugc_public_read on storage.objects for select to anon, authenticated using (bucket_id = 'videos-ugc');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow authenticated uploads to videos-ugc') then
    create policy "Allow authenticated uploads to videos-ugc" on storage.objects for insert to authenticated
      with check (bucket_id = 'videos-ugc' and name like (auth.uid()::text || '/%'));
  end if;
end $$;
