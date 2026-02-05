-- Role-based hardening for RLS and sensitive data access.

-- 1) Add explicit role column on profiles.
alter table public.profiles
  add column if not exists role public.app_role not null default 'user';

comment on column public.profiles.role is
  'Application role resolved on backend (user|admin). Never trust frontend for admin checks.';

-- Backfill role from user_roles when available.
update public.profiles p
set role = coalesce(
  (
    select case
      when exists (
        select 1
        from public.user_roles ur
        where ur.user_id = p.user_id
          and ur.role = 'admin'
      ) then 'admin'::public.app_role
      else 'user'::public.app_role
    end
  ),
  'user'::public.app_role
);

-- 2) Keep profile.role synchronized with user_roles (backend source of truth).
create or replace function public.sync_profile_role_from_user_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_role public.app_role;
begin
  v_user_id := coalesce(new.user_id, old.user_id);

  select case
    when exists (
      select 1
      from public.user_roles ur
      where ur.user_id = v_user_id
        and ur.role = 'admin'
    ) then 'admin'::public.app_role
    else 'user'::public.app_role
  end
  into v_role;

  update public.profiles
     set role = v_role,
         updated_at = now()
   where user_id = v_user_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_profile_role_from_user_roles on public.user_roles;
create trigger trg_sync_profile_role_from_user_roles
after insert or update or delete on public.user_roles
for each row
execute function public.sync_profile_role_from_user_roles();

-- 3) Block any frontend/admin-role spoofing directly on profiles writes.
create or replace function public.enforce_profile_role_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.role, 'user'::public.app_role) <> 'user'::public.app_role
       and not public.is_admin() then
      raise exception 'forbidden: role is managed by backend only';
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role
       and not public.is_admin() then
      raise exception 'forbidden: role is managed by backend only';
    end if;
    return new;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_enforce_profile_role_integrity on public.profiles;
create trigger trg_enforce_profile_role_integrity
before insert or update on public.profiles
for each row
execute function public.enforce_profile_role_integrity();

-- 4) RLS alignment: own data for regular users, cross-user visibility only for admins.
-- Replace profile select/update policies to include explicit admin path and immutable role for users.
drop policy if exists "Profiles: select own" on public.profiles;
drop policy if exists "Profiles: update own" on public.profiles;

create policy "Profiles: select own or admin"
on public.profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

create policy "Profiles: update own or admin"
on public.profiles
for update
to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
)
with check (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

-- Receipts policy already blocks non-admin from other users; ensure explicit policy name/logic exists.
drop policy if exists "Receipts: select own" on public.receipts;
create policy "Receipts: select own or admin"
on public.receipts
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

-- 5) Enforce RLS strictly in sensitive tables to block direct URL/API bypass attempts.
alter table public.profiles force row level security;
alter table public.user_roles force row level security;
alter table public.receipts force row level security;
alter table public.points_ledger force row level security;
