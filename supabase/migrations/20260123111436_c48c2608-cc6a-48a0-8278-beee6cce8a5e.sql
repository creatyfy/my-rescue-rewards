-- Fix ambiguous column reference in submit_receipt function
-- The RETURNING clause columns conflict with the function's return table column names

CREATE OR REPLACE FUNCTION public.submit_receipt(
  p_qr_code_token text,
  p_purchase_value numeric,
  p_image_path text
)
RETURNS TABLE (
  receipt_id uuid,
  protocol_number text,
  points_earned integer,
  status public.receipt_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id uuid;
  v_points integer;
  v_protocol text;
  v_receipt_id uuid;
  v_status public.receipt_status;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT id
  INTO v_establishment_id
  FROM public.establishments
  WHERE qr_code_token = p_qr_code_token
    AND active = true;

  IF v_establishment_id IS NULL THEN
    RAISE EXCEPTION 'invalid establishment token';
  END IF;

  IF p_purchase_value IS NULL OR p_purchase_value < 10 THEN
    RAISE EXCEPTION 'purchase value below minimum';
  END IF;

  v_points := floor(p_purchase_value)::int;
  v_protocol := 'PR-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.receipts_protocol_seq')::text, 6, '0');

  INSERT INTO public.receipts(
    user_id,
    establishment_id,
    purchase_value,
    points_earned,
    status,
    protocol_number,
    image_path
  ) VALUES (
    auth.uid(),
    v_establishment_id,
    p_purchase_value,
    v_points,
    'pending',
    v_protocol,
    p_image_path
  )
  RETURNING id, receipts.protocol_number, receipts.points_earned, receipts.status
  INTO v_receipt_id, v_protocol, v_points, v_status;

  -- Assign to output columns using aliases
  receipt_id := v_receipt_id;
  protocol_number := v_protocol;
  points_earned := v_points;
  status := v_status;

  RETURN NEXT;
END;
$$;