alter table public.profiles
  add constraint profiles_user_id_key unique (user_id);

alter table public.user_roles
  add constraint user_roles_user_id_role_key unique (user_id, role);

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, phone, cpf, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

create or replace function public.get_user_balance(p_user_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_user_id <> auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select coalesce(sum(amount), 0)
    into v_balance
    from public.points_ledger
   where user_id = p_user_id
     and (expires_at is null or expires_at > now());

  return v_balance;
end;
$$;

create or replace function public.get_pending_points(p_user_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pending integer;
begin
  if p_user_id <> auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select coalesce(sum(points_earned), 0)
    into v_pending
    from public.receipts
   where user_id = p_user_id
     and status = 'pending';

  return v_pending;
end;
$$;

grant execute on function public.get_user_balance(uuid) to authenticated;
grant execute on function public.get_pending_points(uuid) to authenticated;
