-- Fix admin redemption status update function to enforce finalization rules
create or replace function public.update_redemption_status_admin(
  p_redemption_id uuid,
  p_new_status text
)
returns table (
  id uuid,
  status public.redemption_status,
  user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status public.redemption_status;
  v_user_id uuid;
begin
  raise log 'admin redemption status update request: admin_id=%, redemption_id=%, new_status=%',
    auth.uid(), p_redemption_id, p_new_status;

  if not public.is_admin() then
    raise log 'admin redemption status update forbidden: admin_id=%', auth.uid();
    raise exception 'Apenas administradores podem atualizar resgates.' using errcode = '42501';
  end if;

  if p_new_status is null or p_new_status not in ('concluido', 'cancelado') then
    raise log 'admin redemption status update invalid status: new_status=%', p_new_status;
    raise exception 'Status inválido para atualização.' using errcode = '22023';
  end if;

  select status, user_id
    into v_current_status, v_user_id
  from public.redemptions
  where id = p_redemption_id
  for update;

  if not found then
    raise log 'admin redemption status update not found: redemption_id=%', p_redemption_id;
    raise exception 'Resgate não encontrado.' using errcode = 'PGRST116';
  end if;

  raise log 'admin redemption status update current status: redemption_id=%, current_status=%',
    p_redemption_id, v_current_status;
  raise log 'admin redemption status update new status: redemption_id=%, new_status=%',
    p_redemption_id, p_new_status;

  if v_current_status <> 'em_analise' then
    raise log 'admin redemption status update blocked final state: redemption_id=%, current_status=%',
      p_redemption_id, v_current_status;
    raise exception 'Resgate já finalizado e não pode ser alterado.' using errcode = '22023';
  end if;

  update public.redemptions
  set status = p_new_status::public.redemption_status,
      updated_at = now()
  where id = p_redemption_id
  returning redemptions.id, redemptions.status, redemptions.user_id
    into id, status, user_id;

  if p_new_status = 'concluido' then
    insert into public.notifications (user_id, title, message)
    values (v_user_id, 'Resgate aprovado', 'Seu resgate foi aprovado com sucesso.');
  elsif p_new_status = 'cancelado' then
    insert into public.notifications (user_id, title, message)
    values (v_user_id, 'Resgate cancelado', 'Seu resgate foi cancelado. Consulte os detalhes.');
  end if;

  return next;
end;
$$;

grant execute on function public.update_redemption_status_admin(uuid, text) to authenticated;
