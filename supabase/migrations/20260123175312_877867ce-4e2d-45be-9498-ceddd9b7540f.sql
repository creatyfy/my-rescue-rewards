-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Notifications: select own"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Notifications: update own"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System inserts via triggers (no direct user insert)
-- Notifications are created by triggers with SECURITY DEFINER

-- Function to create notification for receipt status change
CREATE OR REPLACE FUNCTION public.notify_receipt_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_establishment_name TEXT;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only trigger on status change to approved or rejected
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get establishment name
    SELECT name INTO v_establishment_name
    FROM public.establishments
    WHERE id = NEW.establishment_id;

    IF NEW.status = 'approved' THEN
      v_title := 'Comprovante aprovado';
      v_message := 'Seu comprovante da loja ' || COALESCE(v_establishment_name, 'desconhecida') || ' foi aprovado. Os pontos já foram creditados.';
      
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (NEW.user_id, v_title, v_message);
      
    ELSIF NEW.status = 'rejected' THEN
      v_title := 'Comprovante rejeitado';
      v_message := 'Seu comprovante da loja ' || COALESCE(v_establishment_name, 'desconhecida') || ' foi rejeitado. Verifique as informações enviadas.';
      
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (NEW.user_id, v_title, v_message);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for receipt status changes
CREATE TRIGGER trigger_notify_receipt_status
AFTER UPDATE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.notify_receipt_status_change();

-- Function to create notification for redemption approval
CREATE OR REPLACE FUNCTION public.notify_redemption_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_product_name TEXT;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only notify when status changes to 'completed' (approved)
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    -- Get product name
    SELECT name INTO v_product_name
    FROM public.products
    WHERE id = NEW.product_id;

    v_title := 'Resgate aprovado';
    v_message := 'Seu resgate do prêmio ' || COALESCE(v_product_name, 'desconhecido') || ' foi aprovado.';
    
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (NEW.user_id, v_title, v_message);
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for redemption creation (when approved)
CREATE TRIGGER trigger_notify_redemption_approved
AFTER INSERT ON public.redemptions
FOR EACH ROW
EXECUTE FUNCTION public.notify_redemption_approved();