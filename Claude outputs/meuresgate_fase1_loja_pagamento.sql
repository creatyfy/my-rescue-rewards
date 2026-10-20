-- =========================================================================
-- Meu Resgate — FASE 1: fundação da Loja com pagamento (Pix/cartão) + híbrido
-- Projeto: quhfnktjmkakskuhjamf
--
-- 100% ADITIVO: só adiciona coluna/tabelas/políticas novas.
-- NÃO altera products.points_cost, redemptions, receipts nem points_ledger.
-- O resgate por pontos continua funcionando exatamente igual.
-- =========================================================================

-- 1) Preço em R$ no produto (opcional). Produto só é "comprável" se tiver preço.
alter table public.products
  add column if not exists price_reais numeric(12,2);

-- 2) Configurações da loja (linha única) — regras do híbrido e entrega.
--    points_to_brl = valor de 1 ponto em R$ (ajustável). Placeholder: 100 pts = R$1,00.
create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  points_to_brl numeric(12,4) not null default 0.01,
  max_points_discount_pct integer not null default 100 check (max_points_discount_pct between 0 and 100),
  min_cash_reais numeric(12,2) not null default 1.00,
  delivery_fee_reais numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (true) on conflict (id) do nothing;

alter table public.store_settings enable row level security;

drop policy if exists "Settings: read" on public.store_settings;
create policy "Settings: read"
  on public.store_settings for select to authenticated using (true);

drop policy if exists "Settings: admin write" on public.store_settings;
create policy "Settings: admin write"
  on public.store_settings for update to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- 3) Pedidos (compra em dinheiro, com desconto opcional em pontos = híbrido).
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text,
  price_reais        numeric(12,2) not null,          -- preço cheio do produto
  points_applied     integer       not null default 0, -- pontos usados como desconto
  discount_reais     numeric(12,2) not null default 0, -- desconto gerado pelos pontos
  delivery_fee_reais numeric(12,2) not null default 0,
  amount_reais       numeric(12,2) not null,           -- valor a pagar (preço - desconto + entrega)
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','delivered','cancelled','expired')),
  payment_provider text,
  payment_id       text,
  pix_qr_code      text,
  pix_copia_cola   text,
  -- entrega (mesmo padrão dos resgates)
  delivery_cep text, delivery_address text, delivery_number text,
  delivery_neighborhood text, delivery_city text, delivery_state text,
  created_at timestamptz not null default now(),
  paid_at    timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx  on public.orders(status);

alter table public.orders enable row level security;

-- usuário vê os próprios pedidos; admin vê todos
drop policy if exists "Orders: select own or admin" on public.orders;
create policy "Orders: select own or admin"
  on public.orders for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

-- admin atualiza (ex.: marcar como entregue)
drop policy if exists "Orders: admin update" on public.orders;
create policy "Orders: admin update"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- Sem INSERT/UPDATE direto pelo usuário: criação e confirmação de pagamento
-- acontecem só via funções SECURITY DEFINER / edge functions (Fase 2).

-- mantém updated_at atualizado (reusa a função que já existe no projeto)
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at_column();

-- Fim da Fase 1.
