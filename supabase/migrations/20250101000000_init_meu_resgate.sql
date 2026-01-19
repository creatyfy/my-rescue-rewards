create extension if not exists "pgcrypto";

create type app_role as enum ('user', 'admin');
create type receipt_status as enum ('pending', 'approved', 'rejected');
create type ledger_type as enum ('earn', 'redeem', 'expire', 'adjustment');
create type redemption_status as enum ('pending', 'completed', 'cancelled');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now()
);

create table establishments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  qr_code_token text not null,
  logo_url text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  purchase_value numeric(12,2) not null,
  points_earned integer not null default 0,
  image_url text,
  status receipt_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type ledger_type not null,
  reference_type text,
  reference_id uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  points_cost integer not null,
  stock integer not null default 0,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  points_spent integer not null,
  status redemption_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table establishments enable row level security;
alter table receipts enable row level security;
alter table points_ledger enable row level security;
alter table products enable row level security;
alter table redemptions enable row level security;
