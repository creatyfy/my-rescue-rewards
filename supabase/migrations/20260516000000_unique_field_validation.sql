create or replace function public.is_unique_field_available(field_type text, field_value text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_value text;
  has_conflict boolean;
begin
  if field_value is null or length(trim(field_value)) = 0 then
    return true;
  end if;

  if field_type = 'email' then
    normalized_value := lower(trim(field_value));
    select exists(
      select 1
        from auth.users
       where lower(email) = normalized_value
    ) into has_conflict;
    return not has_conflict;
  elsif field_type = 'cpf' then
    normalized_value := public.normalize_cpf(field_value);
    if normalized_value is null then
      return true;
    end if;
    select exists(
      select 1
        from public.profiles
       where public.normalize_cpf(cpf) = normalized_value
    ) into has_conflict;
    return not has_conflict;
  elsif field_type = 'telefone' then
    normalized_value := public.normalize_phone(field_value);
    if normalized_value is null then
      return true;
    end if;
    select exists(
      select 1
        from public.profiles
       where public.normalize_phone(phone) = normalized_value
    ) into has_conflict;
    return not has_conflict;
  end if;

  raise exception 'invalid_field_type';
end;
$$;
