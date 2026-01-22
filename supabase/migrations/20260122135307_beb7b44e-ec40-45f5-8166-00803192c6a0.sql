-- Core enums
create type public.app_role as enum ('admin', 'user');
create type public.receipt_status as enum ('pending', 'approved', 'rejected');
create type public.ledger_type as enum ('earn', 'redeem', 'expire', 'adjustment');
create type public.redemption_status as enum ('pending', 'completed', 'cancelled');

-- Timestamp helper
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (no roles stored here)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Roles table (separate)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Establishments
create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  qr_code_token text not null unique,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_establishments_updated_at
before update on public.establishments
for each row execute function public.update_updated_at_column();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  points_cost integer not null,
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

-- Receipts
create sequence if not exists public.receipts_protocol_seq;

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  establishment_id uuid not null references public.establishments(id) on delete restrict,
  purchase_value numeric(12,2) not null,
  points_earned integer not null,
  status public.receipt_status not null default 'pending',
  protocol_number text not null unique,
  image_path text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index receipts_user_id_idx on public.receipts(user_id);
create index receipts_status_idx on public.receipts(status);

create trigger update_receipts_updated_at
before update on public.receipts
for each row execute function public.update_updated_at_column();

-- Redemptions
create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete restrict,
  points_spent integer not null,
  status public.redemption_status not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index redemptions_user_id_idx on public.redemptions(user_id);

create trigger update_redemptions_updated_at
before update on public.redemptions
for each row execute function public.update_updated_at_column();

-- Points ledger
create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ledger_type public.ledger_type not null,
  amount integer not null,
  receipt_id uuid references public.receipts(id) on delete set null,
  redemption_id uuid references public.redemptions(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index points_ledger_user_id_idx on public.points_ledger(user_id);
create index points_ledger_expires_at_idx on public.points_ledger(expires_at);

-- =====================
-- SECURITY DEFINER helpers
-- =====================
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

-- One-time bootstrap for first admin only
create or replace function public.bootstrap_first_admin(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_exists boolean;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'cannot grant admin to another user';
  end if;

  select exists(select 1 from public.user_roles where role = 'admin') into admin_exists;
  if admin_exists then
    return false;
  end if;

  insert into public.user_roles(user_id, role)
  values (p_user_id, 'admin')
  on conflict do nothing;

  return true;
end;
$$;

-- Balance: sum of non-expired ledger entries
create or replace function public.get_user_balance(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0)::int
  from public.points_ledger
  where user_id = p_user_id
    and (expires_at is null or expires_at > now());
$$;

create or replace function public.get_pending_points(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(points_earned), 0)::int
  from public.receipts
  where user_id = p_user_id
    and status = 'pending';
$$;

-- Ledger feed for dashboard/history
create or replace function public.get_user_ledger(
  p_user_id uuid,
  p_limit integer default 10
)
returns table (
  ledger_id uuid,
  ledger_type public.ledger_type,
  amount integer,
  created_at timestamptz,
  receipt_status public.receipt_status,
  redemption_status public.redemption_status,
  establishment_name text,
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
    r.status as receipt_status,
    rd.status as redemption_status,
    e.name as establishment_name,
    p.name as product_name,
    r.protocol_number
  from public.points_ledger l
  left join public.receipts r on r.id = l.receipt_id
  left join public.establishments e on e.id = r.establishment_id
  left join public.redemptions rd on rd.id = l.redemption_id
  left join public.products p on p.id = rd.product_id
  where l.user_id = p_user_id
  order by l.created_at desc
  limit greatest(p_limit, 1);
$$;

-- Submit receipt
create or replace function public.submit_receipt(
  p_qr_code_token text,
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
  v_establishment_id uuid;
  v_points integer;
  v_protocol text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select id
  into v_establishment_id
  from public.establishments
  where qr_code_token = p_qr_code_token
    and active = true;

  if v_establishment_id is null then
    raise exception 'invalid establishment token';
  end if;

  if p_purchase_value is null or p_purchase_value < 10 then
    raise exception 'purchase value below minimum';
  end if;

  v_points := floor(p_purchase_value)::int;
  v_protocol := 'PR-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.receipts_protocol_seq')::text, 6, '0');

  insert into public.receipts(
    user_id,
    establishment_id,
    purchase_value,
    points_earned,
    status,
    protocol_number,
    image_path
  ) values (
    auth.uid(),
    v_establishment_id,
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

-- Trigger: when a receipt gets approved, credit points once
create or replace function public.on_receipt_status_change()
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
        receipt_id,
        expires_at
      )
      select
        new.user_id,
        'earn',
        new.points_earned,
        new.id,
        now() + interval '365 days'
      where not exists (
        select 1 from public.points_ledger pl
        where pl.receipt_id = new.id
          and pl.ledger_type = 'earn'
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger receipt_status_change
after update of status on public.receipts
for each row
execute function public.on_receipt_status_change();

-- Redeem product (atomic)
create or replace function public.redeem_product(p_product_id uuid)
returns table (
  redemption_id uuid,
  product_id uuid,
  product_name text,
  points_spent integer,
  remaining_balance integer,
  stock_remaining integer,
  status public.redemption_status
)
language plpgsql
security definer
set search_path = public
as $$
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

  insert into public.redemptions(user_id, product_id, points_spent, status)
  values (auth.uid(), p_product_id, v_cost, 'completed')
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
  status := 'completed';

  return next;
end;
$$;

-- =====================
-- RLS
-- =====================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.establishments enable row level security;
alter table public.products enable row level security;
alter table public.receipts enable row level security;
alter table public.redemptions enable row level security;
alter table public.points_ledger enable row level security;

-- Profiles: user can manage own
create policy "Profiles: select own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Profiles: insert own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Profiles: update own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id);

-- Roles: only admins can see/manage roles
create policy "User roles: admins select"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "User roles: admins insert"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "User roles: admins update"
on public.user_roles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "User roles: admins delete"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Establishments: everyone authenticated can read active; admins manage
create policy "Establishments: select active"
on public.establishments
for select
to authenticated
using (active = true or public.has_role(auth.uid(), 'admin'));

create policy "Establishments: admins write"
on public.establishments
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Products: everyone authenticated can read active; admins manage
create policy "Products: select active"
on public.products
for select
to authenticated
using (active = true or public.has_role(auth.uid(), 'admin'));

create policy "Products: admins write"
on public.products
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Receipts: user can insert/select own; admin can select/update
create policy "Receipts: insert own"
on public.receipts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Receipts: select own"
on public.receipts
for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Receipts: admin update"
on public.receipts
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Redemptions: user can insert/select own; admin can select
create policy "Redemptions: insert own"
on public.redemptions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Redemptions: select own"
on public.redemptions
for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Redemptions: admin update"
on public.redemptions
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Points ledger: user can select own; admin can select
create policy "Ledger: select own"
on public.points_ledger
for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- Do not allow direct writes from clients (writes happen via security definer functions/triggers)

-- =====================
-- STORAGE: buckets + policies
-- =====================
insert into storage.buckets (id, name, public)
values
  ('receipts', 'receipts', false),
  ('products', 'products', true),
  ('establishments', 'establishments', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- receipts: owner upload to folder user_id/*
create policy "Receipts: users upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Receipts: users update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Receipts: users delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Receipts: owner or admin read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'receipts'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(), 'admin')
  )
);

-- public buckets: anyone authenticated can read; admins can write
create policy "Public buckets: read"
on storage.objects
for select
to authenticated
using (bucket_id in ('products','establishments','avatars'));

create policy "Public buckets: admin write"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('products','establishments','avatars') and public.has_role(auth.uid(), 'admin'));

create policy "Public buckets: admin update"
on storage.objects
for update
to authenticated
using (bucket_id in ('products','establishments','avatars') and public.has_role(auth.uid(), 'admin'));

create policy "Public buckets: admin delete"
on storage.objects
for delete
to authenticated
using (bucket_id in ('products','establishments','avatars') and public.has_role(auth.uid(), 'admin'));
