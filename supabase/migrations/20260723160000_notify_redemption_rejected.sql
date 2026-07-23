-- Notifica o usuário TAMBÉM quando o resgate é reprovado/cancelado pelo admin
-- (antes só notificava quando aprovado).
create or replace function public.notify_redemption_approved()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_product_name text;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    select name into v_product_name from public.products where id = new.product_id;

    if new.status = 'completed' then
      insert into public.notifications (user_id, title, message, tipo)
      values (
        new.user_id,
        'Resgate aprovado',
        'Seu resgate do prêmio ' || coalesce(v_product_name, 'desconhecido') || ' foi aprovado e será enviado em breve.',
        'resgate_aprovado'
      );
    elsif new.status = 'cancelled' then
      insert into public.notifications (user_id, title, message, tipo)
      values (
        new.user_id,
        'Resgate não aprovado',
        'Seu resgate do prêmio ' || coalesce(v_product_name, 'desconhecido') || ' não foi aprovado. Os pontos foram devolvidos à sua conta.',
        'resgate_cancelado'
      );
    end if;
  end if;

  return new;
end;
$function$;
