create extension if not exists pgcrypto;

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

create or replace function public.registrar_venda_ugc(
  p_video_id uuid, p_sale_value numeric, p_commission_percent numeric,
  p_sale_date timestamptz default now(), p_external_sale_id text default null
) returns table(video_id uuid, sale_id uuid, status text, janela_inicio timestamptz,
  janela_fim timestamptz, commission_creator numeric, commission_platform numeric)
language plpgsql security definer set search_path = public as $$
declare v videos_ugc%rowtype; creator numeric; platform numeric; inserted_id uuid;
begin
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
    creator := round((p_sale_value * p_commission_percent * 0.5)::numeric, 2);
  else creator := 0; end if;
  platform := round((p_sale_value * p_commission_percent - creator)::numeric, 2);
  insert into sales_ugc(video_id, sale_value, commission_percent, commission_creator, commission_platform, sale_date, external_sale_id)
    values(p_video_id, p_sale_value, p_commission_percent, creator, platform, p_sale_date, p_external_sale_id) returning id into inserted_id;
  video_id := p_video_id; sale_id := inserted_id; status := v.status; janela_inicio := v.janela_inicio; janela_fim := v.janela_fim; commission_creator := creator; commission_platform := platform; return next;
end; $$;

alter table public.videos_ugc enable row level security;
alter table public.sales_ugc enable row level security;
