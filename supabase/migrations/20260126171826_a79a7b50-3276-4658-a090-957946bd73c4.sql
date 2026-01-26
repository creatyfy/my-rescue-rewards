-- 1. Adicionar colunas de endereço à tabela redemptions
ALTER TABLE public.redemptions
  ADD COLUMN IF NOT EXISTS delivery_cep text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_number text,
  ADD COLUMN IF NOT EXISTS delivery_neighborhood text,
  ADD COLUMN IF NOT EXISTS delivery_city text,
  ADD COLUMN IF NOT EXISTS delivery_state text;

-- 2. Recriar a função redeem_product com os novos parâmetros
CREATE OR REPLACE FUNCTION public.redeem_product(
  p_product_id uuid,
  p_delivery_cep text DEFAULT NULL,
  p_delivery_address text DEFAULT NULL,
  p_delivery_number text DEFAULT NULL,
  p_delivery_neighborhood text DEFAULT NULL,
  p_delivery_city text DEFAULT NULL,
  p_delivery_state text DEFAULT NULL
)
RETURNS TABLE(
  redemption_id uuid,
  product_id uuid,
  product_name text,
  points_spent integer,
  remaining_balance integer,
  stock_remaining integer,
  status redemption_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_cost integer;
  v_stock integer;
  v_active boolean;
  v_name text;
  v_balance integer;
  v_redemption_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select points_cost, stock, active, name
  into v_cost, v_stock, v_active, v_name
  from public.products
  where id = p_product_id
  for update;

  if v_name is null then
    raise exception 'product not found';
  end if;

  if v_active is not true then
    raise exception 'product inactive';
  end if;

  if v_stock <= 0 then
    raise exception 'out of stock';
  end if;

  v_balance := public.get_user_balance(auth.uid());
  if v_balance < v_cost then
    raise exception 'insufficient balance';
  end if;

  -- INSERT com campos de endereço e status 'pending'
  insert into public.redemptions(
    user_id,
    product_id,
    points_spent,
    status,
    delivery_cep,
    delivery_address,
    delivery_number,
    delivery_neighborhood,
    delivery_city,
    delivery_state
  )
  values (
    auth.uid(),
    p_product_id,
    v_cost,
    'pending',
    p_delivery_cep,
    p_delivery_address,
    p_delivery_number,
    p_delivery_neighborhood,
    p_delivery_city,
    p_delivery_state
  )
  returning id into v_redemption_id;

  insert into public.points_ledger(user_id, ledger_type, amount, redemption_id)
  values (auth.uid(), 'redeem', -v_cost, v_redemption_id);

  update public.products
  set stock = stock - 1
  where id = p_product_id;

  remaining_balance := public.get_user_balance(auth.uid());

  select stock into stock_remaining from public.products where id = p_product_id;

  redemption_id := v_redemption_id;
  product_id := p_product_id;
  product_name := v_name;
  points_spent := v_cost;
  status := 'pending';

  return next;
end;
$$;