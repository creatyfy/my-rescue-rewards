-- Ensure delivery fields exist and align redemption status enum to required values
alter table public.redemptions
  add column if not exists delivery_cep text,
  add column if not exists delivery_address text,
  add column if not exists delivery_number text,
  add column if not exists delivery_neighborhood text,
  add column if not exists delivery_city text,
  add column if not exists delivery_state text;

alter type public.redemption_status
  add value if not exists 'pendente';

alter type public.redemption_status
  add value if not exists 'em_andamento';

alter type public.redemption_status
  add value if not exists 'enviado';

alter type public.redemption_status
  add value if not exists 'concluido';

alter type public.redemption_status
  add value if not exists 'cancelado';

update public.redemptions
set status = case
  when status::text in ('pendente', 'solicitado', 'pending') then 'pendente'
  when status::text in ('em andamento', 'em_andamento') then 'em_andamento'
  when status::text in ('enviado') then 'enviado'
  when status::text in ('concluído', 'concluido', 'completed') then 'concluido'
  when status::text in ('cancelado', 'cancelled') then 'cancelado'
  else 'pendente'
end;

alter table public.redemptions
  alter column status set default 'pendente';

alter table public.redemptions
  drop constraint if exists redemptions_status_valid,
  add constraint redemptions_status_valid check (
    status in ('pendente', 'em_andamento', 'enviado', 'concluido', 'cancelado')
  );

create or replace function public.redeem_product(
  p_product_id uuid,
  p_delivery_cep text,
  p_delivery_address text,
  p_delivery_number text,
  p_delivery_neighborhood text,
  p_delivery_city text,
  p_delivery_state text
)
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

  if p_delivery_cep is null or btrim(p_delivery_cep) = '' then
    raise exception 'Informe o CEP.' using errcode = '22023';
  end if;

  if p_delivery_address is null or btrim(p_delivery_address) = '' then
    raise exception 'Informe o endereço.' using errcode = '22023';
  end if;

  if p_delivery_number is null or btrim(p_delivery_number) = '' then
    raise exception 'Informe o número.' using errcode = '22023';
  end if;

  if p_delivery_neighborhood is null or btrim(p_delivery_neighborhood) = '' then
    raise exception 'Informe o bairro.' using errcode = '22023';
  end if;

  if p_delivery_city is null or btrim(p_delivery_city) = '' then
    raise exception 'Informe a cidade.' using errcode = '22023';
  end if;

  if p_delivery_state is null or btrim(p_delivery_state) = '' then
    raise exception 'Informe o estado.' using errcode = '22023';
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
    v_product.id,
    v_product.points_cost,
    'pendente',
    p_delivery_cep,
    p_delivery_address,
    p_delivery_number,
    p_delivery_neighborhood,
    p_delivery_city,
    p_delivery_state
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

  status := 'pendente';

  return next;
end;
$$;

grant execute on function public.redeem_product(uuid, text, text, text, text, text, text) to authenticated;

create or replace function public.handle_redemption_cancelled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelado' and old.status is distinct from new.status then
    if old.status not in ('enviado', 'concluido') then
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

create or replace function public.notify_redemption_approved()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_product_name text;
  v_title text;
  v_message text;
begin
  if tg_op = 'INSERT' and new.status = 'concluido' then
    select name into v_product_name
    from public.products
    where id = new.product_id;

    v_title := 'Resgate aprovado';
    v_message := 'Seu resgate do prêmio ' || coalesce(v_product_name, 'desconhecido') || ' foi aprovado.';

    insert into public.notifications (user_id, title, message)
    values (new.user_id, v_title, v_message);
  end if;

  return new;
end;
$$;
