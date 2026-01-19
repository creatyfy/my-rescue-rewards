insert into storage.buckets (id, name, public)
values
  ('receipts', 'receipts', false),
  ('products', 'products', true),
  ('establishments', 'establishments', true),
  ('avatars', 'avatars', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

create policy "storage_admin_all"
on storage.objects
for all
using (public.is_admin())
with check (public.is_admin());

create policy "receipts_user_insert"
on storage.objects
for insert
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "receipts_user_select"
on storage.objects
for select
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "public_buckets_read"
on storage.objects
for select
using (bucket_id in ('products', 'establishments', 'avatars'));

create policy "products_admin_insert"
on storage.objects
for insert
with check (
  bucket_id = 'products'
  and public.is_admin()
);

create policy "products_admin_update"
on storage.objects
for update
using (
  bucket_id = 'products'
  and public.is_admin()
)
with check (
  bucket_id = 'products'
  and public.is_admin()
);

create policy "products_admin_delete"
on storage.objects
for delete
using (
  bucket_id = 'products'
  and public.is_admin()
);

create policy "establishments_admin_insert"
on storage.objects
for insert
with check (
  bucket_id = 'establishments'
  and public.is_admin()
);

create policy "establishments_admin_update"
on storage.objects
for update
using (
  bucket_id = 'establishments'
  and public.is_admin()
)
with check (
  bucket_id = 'establishments'
  and public.is_admin()
);

create policy "establishments_admin_delete"
on storage.objects
for delete
using (
  bucket_id = 'establishments'
  and public.is_admin()
);

create policy "avatars_user_insert"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_user_update"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_user_delete"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
