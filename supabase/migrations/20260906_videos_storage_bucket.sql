insert into storage.buckets (id, name, public)
values ('videos-ugc', 'videos-ugc', true)
on conflict (id) do nothing;

-- supabaseAdmin usa a service_role key e bypassa RLS. Esta policy explícita
-- também documenta o escopo de upload caso a configuração do cliente mude.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'videos_ugc_service_role_insert') then
    create policy videos_ugc_service_role_insert on storage.objects
      for insert to service_role
      with check (bucket_id = 'videos-ugc');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'videos_ugc_public_read') then
    create policy videos_ugc_public_read on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'videos-ugc');
  end if;
end $$;
