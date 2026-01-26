alter type public.redemption_status
  add value if not exists 'cancelado';

alter table public.redemptions
  add column if not exists delivery_cep text,
  add column if not exists delivery_address text,
  add column if not exists delivery_number text,
  add column if not exists delivery_neighborhood text,
  add column if not exists delivery_city text,
  add column if not exists delivery_state text;

create or replace function public.handle_redemption_cancelled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelado' and old.status is distinct from new.status then
    if old.status not in ('enviado', 'concluído') then
      if not exists (
        select 1
        from public.points_ledger
        where redemption_id = new.id
          and ledger_type = 'adjustment'
      ) then
        insert into public.points_ledger (user_id, ledger_type, amount, redemption_id)
        values (new.user_id, 'adjustment', new.points_spent, new.id);
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_redemption_cancelled on public.redemptions;
create trigger on_redemption_cancelled
after update of status on public.redemptions
for each row
execute function public.handle_redemption_cancelled();
