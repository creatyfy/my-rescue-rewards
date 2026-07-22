-- =====================================================================
-- Landing page pública: funções de leitura seguras para visitantes anônimos
-- ---------------------------------------------------------------------
-- As tabelas establishments/products têm RLS "select to authenticated",
-- então um visitante deslogado não consegue lê-las diretamente.
-- Estas funções SECURITY DEFINER expõem SOMENTE campos de marketing
-- (nome, logo, imagem, pontos, contagens) — nunca qr_code_token nem
-- qualquer dado sensível — e são liberadas para o papel anon.
-- =====================================================================

-- Lojas parceiras (apenas ativas), campos públicos
create or replace function public.get_public_partners()
returns table (
  id uuid,
  name text,
  logo_url text,
  description text
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.name, e.logo_url, e.description
  from public.establishments e
  where e.active = true
  order by e.name asc;
$$;

-- Prêmios em destaque (produtos ativos com estoque), campos públicos
create or replace function public.get_public_prizes()
returns table (
  id uuid,
  name text,
  image_url text,
  points_cost integer,
  prize_value_reais numeric,
  stock integer
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.image_url, p.points_cost, p.prize_value_reais, p.stock
  from public.products p
  where p.active = true
  order by p.points_cost asc;
$$;

-- Números agregados para a faixa de estatísticas (sem expor linhas)
create or replace function public.get_public_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'partner_count',       (select count(*) from public.establishments where active = true),
    'prize_count',         (select count(*) from public.products where active = true),
    'points_distributed',  (select coalesce(sum(amount), 0) from public.points_ledger where ledger_type = 'earn' and amount > 0),
    'redemptions_count',   (select count(*) from public.redemptions),
    'members_count',       (select count(*) from public.profiles)
  );
$$;

-- Permissões: visitantes anônimos e usuários autenticados podem chamar
grant execute on function public.get_public_partners() to anon, authenticated;
grant execute on function public.get_public_prizes()   to anon, authenticated;
grant execute on function public.get_public_stats()    to anon, authenticated;
