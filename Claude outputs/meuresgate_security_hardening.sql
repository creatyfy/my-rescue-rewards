-- =========================================================================
-- Meu Resgate — Correção de segurança (2026-10-02)
-- Projeto: quhfnktjmkakskuhjamf
--
-- O QUE FAZ:
-- 1) Fecha funções de uso interno (fraude de pontos + fila de e-mail) para
--    anon/authenticated. O service_role (edge functions) continua funcionando.
-- 2) Adiciona trava "só o próprio dono ou admin" nas funções que leem saldo/
--    extrato/indicação por usuário (corrige IDOR) e bloqueia anon.
-- 3) Protege funções de trigger (não devem ser chamáveis via API REST).
-- 4) Corrige search_path mutável nas funções de fila de e-mail.
--
-- SEGURO: não altera tabelas nem dados. Verificado contra o código do app —
-- nenhum fluxo legítimo (cadastro, indicação, saldo, e-mail) quebra.
-- REVERSÍVEL.
--
-- COMO APLICAR:
--   Supabase Dashboard -> SQL Editor -> New query -> cole tudo -> Run.
-- =========================================================================

-- ---- 1) Funções de uso interno: só service_role ----
REVOKE EXECUTE ON FUNCTION public.process_referral_bonus(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.process_referral_bonus(uuid, uuid, text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.generate_referral_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.generate_referral_code(uuid, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- ---- 2) Leitura por usuário: trava dono-ou-admin + bloqueia anon ----
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id uuid)
 RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select coalesce(sum(amount), 0)::int
  from public.points_ledger
  where user_id = p_user_id
    and (p_user_id = auth.uid() or public.is_admin())
    and (expires_at is null or expires_at > now());
$function$;

CREATE OR REPLACE FUNCTION public.get_pending_points(p_user_id uuid)
 RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select coalesce(sum(points_earned), 0)::int
  from public.receipts
  where user_id = p_user_id
    and (p_user_id = auth.uid() or public.is_admin())
    and status = 'pending';
$function$;

CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
 RETURNS TABLE(total_referred integer, total_points_earned integer)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*)::int                                        AS total_referred,
    (COUNT(*) FILTER (WHERE points_granted) * 100)::int  AS total_points_earned
  FROM public.referral_events
  WHERE referrer_id = p_user_id
    AND (p_user_id = auth.uid() OR public.is_admin())
    AND status = 'valid';
$function$;

CREATE OR REPLACE FUNCTION public.get_user_ledger(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(ledger_id uuid, ledger_type ledger_type, amount integer, created_at timestamp with time zone, receipt_status receipt_status, redemption_status redemption_status, establishment_name text, product_name text, protocol_number text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
    and (p_user_id = auth.uid() or public.is_admin())
  order by l.created_at desc
  limit greatest(p_limit, 1);
$function$;

REVOKE EXECUTE ON FUNCTION public.get_user_balance(uuid)         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_pending_points(uuid)       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_referral_stats(uuid)       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_ledger(uuid, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_user_balance(uuid)         TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.get_pending_points(uuid)       TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.get_referral_stats(uuid)       TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.get_user_ledger(uuid, integer) TO authenticated, service_role;

-- ---- 3) Funções de trigger: não chamáveis via RPC ----
REVOKE EXECUTE ON FUNCTION public.handle_new_user()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_notification()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_receipt_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_redemption_approved()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_receipt_status_change()     FROM PUBLIC, anon, authenticated;

-- ---- 4) search_path fixo nas funções de fila de e-mail ----
ALTER FUNCTION public.enqueue_email(text, jsonb)                SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint)               SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   SET search_path = public, pgmq;

-- Fim.
