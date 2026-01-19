create or replace function public.handle_receipt_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points integer;
begin
  if new.status = 'approved' and old.status is distinct from new.status then
    v_points := floor(new.purchase_value)::integer;

    if v_points < 10 then
      v_points := 0;
    end if;

    new.points_earned := v_points;

    if v_points > 0 then
      insert into public.points_ledger (
        user_id,
        amount,
        type,
        reference_type,
        reference_id,
        expires_at
      )
      values (
        new.user_id,
        v_points,
        'earn',
        'receipt',
        new.id,
        now() + interval '365 days'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_receipt_approved on public.receipts;
create trigger on_receipt_approved
before update of status on public.receipts
for each row
execute function public.handle_receipt_approved();

create or replace function public.handle_redemption_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.points_ledger (
    user_id,
    amount,
    type,
    reference_type,
    reference_id
  )
  values (
    new.user_id,
    -new.points_spent,
    'redeem',
    'redemption',
    new.id
  );

  return new;
end;
$$;

drop trigger if exists on_redemption_created on public.redemptions;
create trigger on_redemption_created
after insert on public.redemptions
for each row
execute function public.handle_redemption_created();

create or replace function public.expire_old_points()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.points_ledger (
    user_id,
    amount,
    type,
    reference_type,
    reference_id
  )
  select
    pl.user_id,
    -pl.amount,
    'expire',
    'earn',
    pl.id
  from public.points_ledger pl
  where pl.type = 'earn'
    and pl.expires_at is not null
    and pl.expires_at <= now()
    and not exists (
      select 1
      from public.points_ledger pl_expire
      where pl_expire.type = 'expire'
        and pl_expire.reference_id = pl.id
    );
end;
$$;
