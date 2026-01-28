-- Create function to update redemption status by admin
-- Maps frontend status (em_analise, concluido, cancelado) to DB status (pending, completed, cancelled)
CREATE OR REPLACE FUNCTION public.update_redemption_status_admin(
  p_redemption_id uuid,
  p_new_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_db_status public.redemption_status;
BEGIN
  -- Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  -- Map frontend status to database enum
  CASE p_new_status
    WHEN 'concluido' THEN v_db_status := 'completed';
    WHEN 'cancelado' THEN v_db_status := 'cancelled';
    WHEN 'em_analise' THEN v_db_status := 'pending';
    WHEN 'completed' THEN v_db_status := 'completed';
    WHEN 'cancelled' THEN v_db_status := 'cancelled';
    WHEN 'pending' THEN v_db_status := 'pending';
    ELSE RAISE EXCEPTION 'invalid status: %', p_new_status;
  END CASE;

  -- Update the redemption
  UPDATE public.redemptions
  SET 
    status = v_db_status,
    updated_at = now()
  WHERE id = p_redemption_id;

  -- Log the action
  PERFORM public.log_admin_action(
    'update_redemption_status',
    'redemptions',
    p_redemption_id,
    jsonb_build_object('new_status', p_new_status, 'db_status', v_db_status::text)
  );

  RETURN true;
END;
$$;