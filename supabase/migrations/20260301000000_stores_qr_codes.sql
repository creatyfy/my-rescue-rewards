-- Stores and QR Codes
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  city text not null,
  state text not null,
  qr_code_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true
);

create trigger update_stores_updated_at
before update on public.stores
for each row execute function public.update_updated_at_column();

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  qr_value text not null,
  qr_image text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique (qr_value)
);

create unique index qr_codes_one_active_per_store
  on public.qr_codes (store_id)
  where is_active;

alter table public.stores
  add constraint stores_qr_code_id_fkey
  foreign key (qr_code_id)
  references public.qr_codes(id)
  on delete set null;

create or replace function public.enforce_admin_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
  elsif tg_op = 'UPDATE' then
    if new.created_by is distinct from old.created_by then
      raise exception 'created_by is immutable';
    end if;
  end if;

  return new;
end;
$$;

create trigger stores_set_created_by
before insert on public.stores
for each row execute function public.enforce_admin_created_by();

create trigger stores_lock_created_by
before update on public.stores
for each row execute function public.enforce_admin_created_by();

create trigger qr_codes_set_created_by
before insert on public.qr_codes
for each row execute function public.enforce_admin_created_by();

create trigger qr_codes_lock_created_by
before update on public.qr_codes
for each row execute function public.enforce_admin_created_by();

alter table public.stores enable row level security;
alter table public.qr_codes enable row level security;

create policy "Stores: admins select"
  on public.stores
  for select
  using (public.is_admin());

create policy "Stores: admins insert"
  on public.stores
  for insert
  with check (public.is_admin());

create policy "Stores: admins update"
  on public.stores
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Stores: admins delete"
  on public.stores
  for delete
  using (public.is_admin());

create policy "QR Codes: admins select"
  on public.qr_codes
  for select
  using (public.is_admin());

create policy "QR Codes: admins insert"
  on public.qr_codes
  for insert
  with check (public.is_admin());

create policy "QR Codes: admins update"
  on public.qr_codes
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "QR Codes: admins delete"
  on public.qr_codes
  for delete
  using (public.is_admin());

create or replace function public.get_store_by_qr_value(p_qr_value text)
returns table (
  store_id uuid,
  store_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select s.id, s.name
  from public.qr_codes q
  join public.stores s on s.id = q.store_id
  where q.qr_value = p_qr_value
    and q.is_active = true
    and s.is_active = true
  limit 1;
end;
$$;

grant execute on function public.get_store_by_qr_value(text) to authenticated;

create or replace function public.generate_store_qr_code(p_store_id uuid)
returns table (
  qr_code_id uuid,
  qr_value text,
  qr_image text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr_code_id uuid;
  v_qr_value text;
  v_qr_image text;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if not exists (select 1 from public.stores where id = p_store_id) then
    raise exception 'store not found';
  end if;

  update public.qr_codes
  set is_active = false
  where store_id = p_store_id
    and is_active = true;

  v_qr_value := encode(gen_random_bytes(16), 'hex');
  v_qr_image := 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' || v_qr_value;

  insert into public.qr_codes (store_id, qr_value, qr_image, is_active)
  values (p_store_id, v_qr_value, v_qr_image, true)
  returning id, qr_value, qr_image, created_at
  into v_qr_code_id, qr_value, qr_image, created_at;

  update public.stores
  set qr_code_id = v_qr_code_id
  where id = p_store_id;

  qr_code_id := v_qr_code_id;
  return next;
end;
$$;

grant execute on function public.generate_store_qr_code(uuid) to authenticated;

alter table public.receipts
  drop constraint if exists receipts_establishment_id_fkey;

alter table public.receipts
  rename column establishment_id to store_id;

alter table public.receipts
  add constraint receipts_store_id_fkey
  foreign key (store_id)
  references public.stores(id)
  on delete restrict;

create or replace function public.get_user_ledger(p_user_id uuid, p_limit integer default 20)
returns table (
  ledger_id uuid,
  ledger_type ledger_type,
  amount integer,
  created_at timestamptz,
  receipt_status receipt_status,
  redemption_status redemption_status,
  store_name text,
  product_name text,
  protocol_number text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_user_id <> auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    pl.id as ledger_id,
    pl.type as ledger_type,
    pl.amount,
    pl.created_at,
    r.status as receipt_status,
    rd.status as redemption_status,
    s.name as store_name,
    p.name as product_name,
    r.protocol_number
  from public.points_ledger pl
  left join public.receipts r
    on pl.reference_type = 'receipt'
   and pl.reference_id = r.id
  left join public.stores s
    on r.store_id = s.id
  left join public.redemptions rd
    on pl.reference_type = 'redemption'
   and pl.reference_id = rd.id
  left join public.products p
    on rd.product_id = p.id
  where pl.user_id = p_user_id
  order by pl.created_at desc
  limit greatest(coalesce(p_limit, 20), 1);
end;
$$;

grant execute on function public.get_user_ledger(uuid, integer) to authenticated;

create or replace function public.submit_receipt(
  p_qr_value text,
  p_purchase_value numeric,
  p_image_path text
)
returns table (
  receipt_id uuid,
  protocol_number text,
  points_earned integer,
  status public.receipt_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_points integer;
  v_protocol text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select q.store_id
  into v_store_id
  from public.qr_codes q
  join public.stores s on s.id = q.store_id
  where q.qr_value = p_qr_value
    and q.is_active = true
    and s.is_active = true;

  if v_store_id is null then
    raise exception 'invalid store qr';
  end if;

  if p_purchase_value is null or p_purchase_value < 10 then
    raise exception 'purchase value below minimum';
  end if;

  v_points := floor(p_purchase_value)::int;
  v_protocol := 'PR-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.receipts_protocol_seq')::text, 6, '0');

  insert into public.receipts(
    user_id,
    store_id,
    purchase_value,
    points_earned,
    status,
    protocol_number,
    image_path
  ) values (
    auth.uid(),
    v_store_id,
    p_purchase_value,
    v_points,
    'pending',
    v_protocol,
    p_image_path
  )
  returning id, protocol_number, points_earned, status
  into receipt_id, protocol_number, points_earned, status;

  return next;
end;
$$;

grant execute on function public.submit_receipt(text, numeric, text) to authenticated;
