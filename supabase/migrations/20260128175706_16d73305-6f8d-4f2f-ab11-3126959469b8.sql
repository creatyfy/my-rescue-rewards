-- Create trigger for receipts status change notifications
DROP TRIGGER IF EXISTS trigger_notify_receipt_status ON public.receipts;
CREATE TRIGGER trigger_notify_receipt_status
  AFTER UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_receipt_status_change();

-- Update redemption trigger function to fire on UPDATE (not just INSERT)
CREATE OR REPLACE FUNCTION public.notify_redemption_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_product_name TEXT;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Trigger on UPDATE when status changes to 'completed'
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
    SELECT name INTO v_product_name
    FROM public.products
    WHERE id = NEW.product_id;

    v_title := 'Resgate aprovado';
    v_message := 'Seu resgate do prêmio ' || COALESCE(v_product_name, 'desconhecido') || ' foi aprovado e será enviado em breve.';
    
    INSERT INTO public.notifications (user_id, title, message, tipo)
    VALUES (NEW.user_id, v_title, v_message, 'resgate_aprovado');
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for redemptions status change notifications
DROP TRIGGER IF EXISTS trigger_notify_redemption ON public.redemptions;
CREATE TRIGGER trigger_notify_redemption
  AFTER UPDATE ON public.redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_redemption_approved();