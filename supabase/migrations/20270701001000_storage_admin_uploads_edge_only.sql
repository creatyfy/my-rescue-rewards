drop policy if exists "storage_admin_all" on storage.objects;
drop policy if exists "products_admin_insert" on storage.objects;
drop policy if exists "products_admin_update" on storage.objects;
drop policy if exists "products_admin_delete" on storage.objects;
drop policy if exists "establishments_admin_insert" on storage.objects;
drop policy if exists "establishments_admin_update" on storage.objects;
drop policy if exists "establishments_admin_delete" on storage.objects;

create policy "products_service_role_insert"
on storage.objects
for insert
with check (
  bucket_id = 'products'
  and auth.role() = 'service_role'
);

create policy "products_service_role_update"
on storage.objects
for update
using (
  bucket_id = 'products'
  and auth.role() = 'service_role'
)
with check (
  bucket_id = 'products'
  and auth.role() = 'service_role'
);

create policy "products_service_role_delete"
on storage.objects
for delete
using (
  bucket_id = 'products'
  and auth.role() = 'service_role'
);

create policy "establishments_service_role_insert"
on storage.objects
for insert
with check (
  bucket_id = 'establishments'
  and auth.role() = 'service_role'
);

create policy "establishments_service_role_update"
on storage.objects
for update
using (
  bucket_id = 'establishments'
  and auth.role() = 'service_role'
)
with check (
  bucket_id = 'establishments'
  and auth.role() = 'service_role'
);

create policy "establishments_service_role_delete"
on storage.objects
for delete
using (
  bucket_id = 'establishments'
  and auth.role() = 'service_role'
);
