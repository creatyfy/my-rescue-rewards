create or replace function public.has_role(check_user_id uuid, check_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.user_roles ur
    where ur.user_id = check_user_id
      and ur.role = check_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_roles_admin_select"
on public.user_roles
for select
using (public.is_admin());

create policy "user_roles_admin_insert"
on public.user_roles
for insert
with check (public.is_admin());

create policy "user_roles_admin_update"
on public.user_roles
for update
using (public.is_admin())
with check (public.is_admin());

create policy "user_roles_admin_delete"
on public.user_roles
for delete
using (public.is_admin());

create policy "establishments_public_select"
on public.establishments
for select
using (true);

create policy "establishments_admin_insert"
on public.establishments
for insert
with check (public.is_admin());

create policy "establishments_admin_update"
on public.establishments
for update
using (public.is_admin())
with check (public.is_admin());

create policy "establishments_admin_delete"
on public.establishments
for delete
using (public.is_admin());

create policy "receipts_user_insert"
on public.receipts
for insert
with check (auth.uid() = user_id);

create policy "receipts_user_or_admin_select"
on public.receipts
for select
using (auth.uid() = user_id or public.is_admin());

create policy "receipts_admin_update"
on public.receipts
for update
using (public.is_admin())
with check (public.is_admin());

create policy "points_ledger_user_or_admin_select"
on public.points_ledger
for select
using (auth.uid() = user_id or public.is_admin());

create policy "products_public_select"
on public.products
for select
using (true);

create policy "products_admin_insert"
on public.products
for insert
with check (public.is_admin());

create policy "products_admin_update"
on public.products
for update
using (public.is_admin())
with check (public.is_admin());

create policy "products_admin_delete"
on public.products
for delete
using (public.is_admin());

create policy "redemptions_user_insert"
on public.redemptions
for insert
with check (auth.uid() = user_id);

create policy "redemptions_user_or_admin_select"
on public.redemptions
for select
using (auth.uid() = user_id or public.is_admin());

create policy "redemptions_admin_update"
on public.redemptions
for update
using (public.is_admin())
with check (public.is_admin());
