-- Direct browser uploads use the creator's Supabase Auth session (never the service role key).
-- The uid-prefixed path prevents an authenticated creator from uploading into another
-- creator's namespace. Client-side validation limits files to 500 MB, but Storage's
-- dashboard/project limits remain the authoritative server-side size controls.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated uploads to videos-ugc'
  ) then
    create policy "Allow authenticated uploads to videos-ugc"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'videos-ugc'
        and name like (auth.uid()::text || '/%')
      );
  end if;
end $$;
