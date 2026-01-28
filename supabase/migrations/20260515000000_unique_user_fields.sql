-- Normalize CPF and phone for consistent uniqueness checks
create or replace function public.normalize_cpf(input text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(coalesce(input, ''), '\\D', '', 'g'), '');
$$;

create or replace function public.normalize_phone(input text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(coalesce(input, ''), '\\D', '', 'g'), '');
$$;

-- Case-insensitive unique email enforcement
create unique index if not exists auth_users_email_lower_unique
  on auth.users (lower(email))
  where email is not null;

-- Unique indexes on normalized CPF and phone
create unique index if not exists profiles_cpf_unique_idx
  on public.profiles (public.normalize_cpf(cpf))
  where public.normalize_cpf(cpf) is not null;

create unique index if not exists profiles_phone_unique_idx
  on public.profiles (public.normalize_phone(phone))
  where public.normalize_phone(phone) is not null;

-- Enforce unique CPF/phone with friendly errors
create or replace function public.enforce_unique_profile_fields()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_cpf text;
  v_phone text;
begin
  v_cpf := public.normalize_cpf(new.cpf);
  v_phone := public.normalize_phone(new.phone);

  if v_cpf is not null then
    if exists (
      select 1
        from public.profiles p
       where p.user_id <> new.user_id
         and public.normalize_cpf(p.cpf) = v_cpf
    ) then
      raise exception 'cpf_duplicate' using errcode = '23505';
    end if;
  end if;

  if v_phone is not null then
    if exists (
      select 1
        from public.profiles p
       where p.user_id <> new.user_id
         and public.normalize_phone(p.phone) = v_phone
    ) then
      raise exception 'phone_duplicate' using errcode = '23505';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_unique_fields_guard on public.profiles;
create trigger profiles_unique_fields_guard
before insert or update on public.profiles
for each row
execute function public.enforce_unique_profile_fields();
