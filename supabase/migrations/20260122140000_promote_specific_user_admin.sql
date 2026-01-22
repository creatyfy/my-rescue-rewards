do $$
declare
  v_user_id uuid;
  v_updated_count integer;
begin
  select id
    into v_user_id
    from auth.users
   where email = 'atendimentocreaty.fy@gmail.com';

  if v_user_id is null then
    raise exception 'User with email % not found', 'atendimentocreaty.fy@gmail.com';
  end if;

  if exists (
    select 1
      from public.user_roles
     where user_id = v_user_id
       and role = 'admin'
  ) then
    return;
  end if;

  update public.user_roles
     set role = 'admin'
   where user_id = v_user_id
     and role = 'user';

  get diagnostics v_updated_count = row_count;

  if v_updated_count = 0 then
    raise exception 'No role row found for user % in user_roles', v_user_id;
  end if;
end $$;
