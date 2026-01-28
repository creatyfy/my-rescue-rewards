-- Normalize existing stored CPF/phone values to remove masks
update public.profiles
set cpf = public.normalize_cpf(cpf),
    phone = public.normalize_phone(phone);

-- Normalize incoming CPF/phone before enforcing uniqueness
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

  new.cpf := v_cpf;
  new.phone := v_phone;

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
