alter table public.videos_ugc
  add column if not exists motivo_reprovacao text;

create or replace view public.video_janelas as
select v.id as video_id, v.creator_id, v.product_id, v.janela_inicio, v.janela_fim,
  v.status, v.created_at,
  case when v.janela_fim is null then null else greatest(0, ceil(extract(epoch from (v.janela_fim - now()) / 86400)))::int end as dias_restantes,
  coalesce(sum(s.commission_creator), 0)::numeric(14,2) as total_ganho_criadora,
  count(s.id)::int as total_sales, v.moderation_status, v.motivo_reprovacao
from public.videos_ugc v left join public.sales_ugc s on s.video_id = v.id
group by v.id;
