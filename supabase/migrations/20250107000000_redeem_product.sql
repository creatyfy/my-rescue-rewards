create or replace function public.redeem_product(p_product_id uuid)
returns table (
  redemption_id uuid,
  product_id uuid,
  product_name text,
  points_spent integer,
  remaining_balance integer,
  stock_remaining integer,
  status redemption_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_balance integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select *
    into v_product
  from public.products
  where id = p_product_id
    and active = true
  for update;

  if not found then
    raise exception 'Produto indisponível.' using errcode = '22023';
  end if;

  if v_product.stock <= 0 then
    raise exception 'Produto sem estoque.' using errcode = '22023';
  end if;

  select coalesce(sum(amount), 0)
    into v_balance
  from public.points_ledger
  where user_id = auth.uid()
    and (expires_at is null or expires_at > now());

  if v_balance < v_product.points_cost then
    raise exception 'Saldo insuficiente.' using errcode = '22023';
  end if;

  update public.products
  set stock = stock - 1
  where id = v_product.id;

  insert into public.redemptions (
    user_id,
    product_id,
    points_spent,
    status
  )
  values (
    auth.uid(),
    v_product.id,
    v_product.points_cost,
    'completed'
  )
  returning id
  into redemption_id;

  product_id := v_product.id;
  product_name := v_product.name;
  points_spent := v_product.points_cost;
  remaining_balance := v_balance - v_product.points_cost;

  select stock
    into stock_remaining
  from public.products
  where id = v_product.id;

  status := 'completed';

  return next;
end;
$$;

grant execute on function public.redeem_product(uuid) to authenticated;
