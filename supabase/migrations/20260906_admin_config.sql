create table if not exists public.admin_config (
  id boolean primary key default true check (id),
  repasse_organico_percent numeric(5,2) not null default 50,
  repasse_impulsionado_percent numeric(5,2) not null default 10,
  custo_anuncio_por_venda numeric(10,2) not null default 9,
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'admin_config' and column_name = 'custo_anuncio_venda')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'admin_config' and column_name = 'custo_anuncio_por_venda') then
    alter table public.admin_config rename column custo_anuncio_venda to custo_anuncio_por_venda;
  end if;
end $$;

alter table public.admin_config alter column repasse_impulsionado_percent set default 10;
alter table public.admin_config alter column custo_anuncio_por_venda set default 9;
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
