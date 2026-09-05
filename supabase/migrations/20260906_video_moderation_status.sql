alter table public.videos_ugc
  add column if not exists moderation_status text not null default 'pendente';

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
