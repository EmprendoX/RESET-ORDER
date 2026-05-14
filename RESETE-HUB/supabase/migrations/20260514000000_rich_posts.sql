-- Posts: subir límite de body de 8000 a 50000 (para HTML enriquecido)
alter table public.posts drop constraint if exists posts_body_check;
alter table public.posts add constraint posts_body_check
  check (char_length(body) between 1 and 50000);

-- RLS storage.objects para el bucket post-media (creado vía Storage API).
-- Lectura pública, escritura solo del propio usuario bajo posts/<auth.uid()>/...

drop policy if exists "post-media public read" on storage.objects;
create policy "post-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'post-media');

drop policy if exists "post-media own write" on storage.objects;
create policy "post-media own write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = 'posts'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "post-media own update" on storage.objects;
create policy "post-media own update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'post-media'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "post-media own delete" on storage.objects;
create policy "post-media own delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'post-media'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
