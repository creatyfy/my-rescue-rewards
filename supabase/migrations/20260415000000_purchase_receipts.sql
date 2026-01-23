create table if not exists public.purchase_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  store_id uuid not null references public.stores(id) on delete restrict,
  qr_code_id uuid not null references public.qr_codes(id) on delete restrict,
  purchase_value numeric(12,2) not null,
  points integer not null,
  receipt_image_url text,
  status public.receipt_status not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create index if not exists purchase_receipts_user_id_idx on public.purchase_receipts(user_id);
create index if not exists purchase_receipts_store_id_idx on public.purchase_receipts(store_id);
create index if not exists purchase_receipts_status_idx on public.purchase_receipts(status);

alter table public.purchase_receipts enable row level security;

create policy "Purchase receipts: insert own"
on public.purchase_receipts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Purchase receipts: select own"
on public.purchase_receipts
for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Purchase receipts: admin update"
on public.purchase_receipts
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

alter table public.points_ledger
  add column if not exists purchase_receipt_id uuid;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'points_ledger_purchase_receipt_id_fkey'
      and table_name = 'points_ledger'
      and table_schema = 'public'
  ) then
    alter table public.points_ledger
      add constraint points_ledger_purchase_receipt_id_fkey
      foreign key (purchase_receipt_id)
      references public.purchase_receipts(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists points_ledger_purchase_receipt_id_idx
  on public.points_ledger(purchase_receipt_id);

create or replace function public.get_pending_points(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(points), 0)::int
  from public.purchase_receipts
  where user_id = p_user_id
    and status = 'pending';
$$;

create or replace function public.get_user_ledger(
  p_user_id uuid,
  p_limit integer default 20
)
returns table (
  ledger_id uuid,
  ledger_type public.ledger_type,
  amount integer,
  created_at timestamptz,
  receipt_status public.receipt_status,
  redemption_status public.redemption_status,
  store_name text,
  product_name text,
  protocol_number text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id as ledger_id,
    l.ledger_type,
    l.amount,
    l.created_at,
    pr.status as receipt_status,
    rd.status as redemption_status,
    s.name as store_name,
    p.name as product_name,
    null::text as protocol_number
  from public.points_ledger l
  left join public.purchase_receipts pr on pr.id = l.purchase_receipt_id
  left join public.stores s on s.id = pr.store_id
  left join public.redemptions rd on rd.id = l.redemption_id
  left join public.products p on p.id = rd.product_id
  where l.user_id = p_user_id
  order by l.created_at desc
  limit greatest(coalesce(p_limit, 20), 1);
$$;

create or replace function public.submit_receipt(
  p_qr_code_token text,
  p_purchase_value numeric,
  p_receipt_image_url text
)
returns table (
  receipt_id uuid,
  points integer,
  status public.receipt_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_qr_code_id uuid;
  v_points integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select q.store_id, q.id
    into v_store_id, v_qr_code_id
  from public.qr_codes q
  join public.stores s on s.id = q.store_id
  where q.qr_value = p_qr_code_token
    and q.is_active = true
    and s.is_active = true
  limit 1;

  if v_store_id is null then
    raise exception 'invalid store qr';
  end if;

  if p_purchase_value is null or p_purchase_value < 10 then
    raise exception 'purchase value below minimum';
  end if;

  v_points := floor(p_purchase_value)::int;

  insert into public.purchase_receipts (
    user_id,
    store_id,
    qr_code_id,
    purchase_value,
    points,
    status,
    receipt_image_url
  ) values (
    auth.uid(),
    v_store_id,
    v_qr_code_id,
    p_purchase_value,
    v_points,
    'pending',
    p_receipt_image_url
  )
  returning id, points, status
  into receipt_id, points, status;

  return next;
end;
$$;

create or replace function public.on_purchase_receipt_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE') then
    if new.status = 'approved' and old.status is distinct from 'approved' then
      insert into public.points_ledger(
        user_id,
        ledger_type,
        amount,
        purchase_receipt_id,
        expires_at
      )
      select
        new.user_id,
        'earn',
        new.points,
        new.id,
        now() + interval '365 days'
      where not exists (
        select 1 from public.points_ledger pl
        where pl.purchase_receipt_id = new.id
          and pl.ledger_type = 'earn'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists purchase_receipt_status_change on public.purchase_receipts;
create trigger purchase_receipt_status_change
after update of status on public.purchase_receipts
for each row
execute function public.on_purchase_receipt_status_change();

grant execute on function public.submit_receipt(text, numeric, text) to authenticated;
