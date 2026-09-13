insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creatives', 'creatives', false, 26214400, array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy creatives_storage_select on storage.objects for select to authenticated
using (bucket_id='creatives' and ((storage.foldername(name))[1]=(select auth.uid())::text or private.is_vyoo_admin()));
create policy creatives_storage_insert on storage.objects for insert to authenticated
with check (bucket_id='creatives' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy creatives_storage_update on storage.objects for update to authenticated
using (bucket_id='creatives' and owner_id=(select auth.uid())::text)
with check (bucket_id='creatives' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy creatives_storage_delete on storage.objects for delete to authenticated
using (bucket_id='creatives' and owner_id=(select auth.uid())::text);
