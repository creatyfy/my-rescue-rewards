create or replace function public.generate_receipt_protocol()
returns text
language plpgsql
as $$
declare
  new_protocol text;
begin
  new_protocol := 'MR-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
  return new_protocol;
end;
$$;

alter table public.receipts
  add column protocol_number text not null default public.generate_receipt_protocol();

create unique index receipts_protocol_number_key on public.receipts (protocol_number);

alter table public.receipts
  add constraint receipts_purchase_value_min check (purchase_value >= 10);

create or replace function public.submit_receipt(qr_token text, purchase_value numeric, image_url text)
returns table (
  receipt_id uuid,
  protocol_number text,
  establishment_id uuid,
  establishment_name text,
  points_earned integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_establishment public.establishments%rowtype;
  v_points integer;
begin
  if purchase_value < 10 then
    raise exception 'Valor mínimo é R$ 10,00.' using errcode = '22023';
  end if;

  select *
    into v_establishment
  from public.establishments
  where qr_code_token = qr_token
    and active = true
  limit 1;

  if not found then
    raise exception 'QR Code inválido.' using errcode = '22023';
  end if;

  v_points := floor(purchase_value)::int;

  insert into public.receipts (
    user_id,
    establishment_id,
    purchase_value,
    points_earned,
    image_url
  )
  values (
    auth.uid(),
    v_establishment.id,
    purchase_value,
    v_points,
    image_url
  )
  returning id, protocol_number
  into receipt_id, protocol_number;

  establishment_id := v_establishment.id;
  establishment_name := v_establishment.name;
  points_earned := v_points;

  return next;
end;
$$;

grant execute on function public.submit_receipt(text, numeric, text) to authenticated;
