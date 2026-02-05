-- Update the trigger function to handle:
-- 1. Rejection after approval (remove points)
-- 2. Points edit after approval (adjust difference)
CREATE OR REPLACE FUNCTION public.on_receipt_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_existing_amount integer;
  v_difference integer;
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    -- Case 1: Approving a receipt (was not approved before)
    IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
      -- Insert points only if not already credited
      INSERT INTO public.points_ledger(
        user_id,
        ledger_type,
        amount,
        receipt_id,
        expires_at
      )
      SELECT
        NEW.user_id,
        'earn',
        NEW.points_earned,
        NEW.id,
        now() + interval '365 days'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.points_ledger pl
        WHERE pl.receipt_id = NEW.id
          AND pl.ledger_type = 'earn'
      );
      
    -- Case 2: Rejecting or pending after it was approved (remove points)
    ELSIF NEW.status IN ('rejected', 'pending') AND OLD.status = 'approved' THEN
      -- Get the existing earn amount
      SELECT amount INTO v_existing_amount
      FROM public.points_ledger
      WHERE receipt_id = NEW.id AND ledger_type = 'earn'
      LIMIT 1;
      
      IF v_existing_amount IS NOT NULL AND v_existing_amount > 0 THEN
        -- Create adjustment entry to remove the points
        INSERT INTO public.points_ledger(
          user_id,
          ledger_type,
          amount,
          receipt_id
        ) VALUES (
          NEW.user_id,
          'adjustment',
          -v_existing_amount,
          NEW.id
        );
      END IF;
      
    -- Case 3: Points changed while still approved (adjust difference)
    ELSIF NEW.status = 'approved' AND OLD.status = 'approved' AND NEW.points_earned IS DISTINCT FROM OLD.points_earned THEN
      -- Get the existing earn amount
      SELECT amount INTO v_existing_amount
      FROM public.points_ledger
      WHERE receipt_id = NEW.id AND ledger_type = 'earn'
      LIMIT 1;
      
      IF v_existing_amount IS NOT NULL THEN
        v_difference := NEW.points_earned - v_existing_amount;
        
        IF v_difference != 0 THEN
          -- Create adjustment entry for the difference
          INSERT INTO public.points_ledger(
            user_id,
            ledger_type,
            amount,
            receipt_id
          ) VALUES (
            NEW.user_id,
            'adjustment',
            v_difference,
            NEW.id
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;