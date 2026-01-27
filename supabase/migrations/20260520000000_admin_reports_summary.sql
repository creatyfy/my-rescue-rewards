CREATE OR REPLACE FUNCTION public.fetch_admin_reports_summary(
  p_establishment_id uuid DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  receipts_total bigint,
  receipts_approved bigint,
  receipts_rejected bigint,
  receipts_pending bigint,
  receipts_purchase_value numeric,
  receipts_points_earned bigint,
  redemptions_total bigint,
  redemptions_completed bigint,
  redemptions_pending bigint,
  redemptions_cancelled bigint,
  redemptions_points_spent bigint,
  active_products bigint,
  active_establishments bigint,
  distinct_users bigint,
  total_transactions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_search text;
  v_start timestamptz;
  v_end timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
    v_search := '%' || trim(p_search) || '%';
  ELSE
    v_search := NULL;
  END IF;

  IF p_start_date IS NOT NULL THEN
    v_start := p_start_date::timestamptz;
  END IF;

  IF p_end_date IS NOT NULL THEN
    v_end := p_end_date::timestamptz + interval '1 day' - interval '1 millisecond';
  END IF;

  RETURN QUERY
  WITH search_users AS (
    SELECT DISTINCT u.id AS user_id
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE v_search IS NOT NULL
      AND (
        u.email ILIKE v_search
        OR p.full_name ILIKE v_search
        OR p.cpf ILIKE v_search
        OR p.phone ILIKE v_search
      )
  ),
  receipt_scope AS (
    SELECT r.*
    FROM public.receipts r
    WHERE (p_establishment_id IS NULL OR r.establishment_id = p_establishment_id)
      AND (v_start IS NULL OR r.created_at >= v_start)
      AND (v_end IS NULL OR r.created_at <= v_end)
      AND (v_search IS NULL OR r.user_id IN (SELECT user_id FROM search_users))
  ),
  redemption_scope AS (
    SELECT rd.*
    FROM public.redemptions rd
    WHERE (v_start IS NULL OR rd.created_at >= v_start)
      AND (v_end IS NULL OR rd.created_at <= v_end)
      AND (v_search IS NULL OR rd.user_id IN (SELECT user_id FROM search_users))
      AND (
        p_establishment_id IS NULL
        OR rd.user_id IN (SELECT DISTINCT user_id FROM receipt_scope)
      )
  ),
  product_scope AS (
    SELECT p.*
    FROM public.products p
    WHERE (v_start IS NULL OR p.created_at >= v_start)
      AND (v_end IS NULL OR p.created_at <= v_end)
  ),
  establishment_scope AS (
    SELECT e.*
    FROM public.establishments e
    WHERE (v_start IS NULL OR e.created_at >= v_start)
      AND (v_end IS NULL OR e.created_at <= v_end)
      AND (p_establishment_id IS NULL OR e.id = p_establishment_id)
  )
  SELECT
    COUNT(*) AS receipts_total,
    COUNT(*) FILTER (WHERE status = 'approved') AS receipts_approved,
    COUNT(*) FILTER (WHERE status = 'rejected') AS receipts_rejected,
    COUNT(*) FILTER (WHERE status IS NULL OR status NOT IN ('approved', 'rejected')) AS receipts_pending,
    COALESCE(SUM(purchase_value), 0) AS receipts_purchase_value,
    COALESCE(SUM(points_earned) FILTER (WHERE status = 'approved'), 0) AS receipts_points_earned,
    (SELECT COUNT(*) FROM redemption_scope) AS redemptions_total,
    (SELECT COUNT(*) FROM redemption_scope WHERE status = 'completed') AS redemptions_completed,
    (SELECT COUNT(*) FROM redemption_scope WHERE status = 'pending') AS redemptions_pending,
    (SELECT COUNT(*) FROM redemption_scope WHERE status = 'cancelled') AS redemptions_cancelled,
    (SELECT COALESCE(SUM(points_spent), 0) FROM redemption_scope WHERE status = 'completed') AS redemptions_points_spent,
    (SELECT COUNT(*) FROM product_scope WHERE active) AS active_products,
    (SELECT COUNT(*) FROM establishment_scope WHERE active) AS active_establishments,
    (SELECT COUNT(DISTINCT user_id) FROM receipt_scope) AS distinct_users,
    (SELECT COUNT(*) FROM receipt_scope) + (SELECT COUNT(*) FROM redemption_scope) AS total_transactions
  FROM receipt_scope;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_admin_reports_summary(uuid, text, date, date) TO authenticated;
