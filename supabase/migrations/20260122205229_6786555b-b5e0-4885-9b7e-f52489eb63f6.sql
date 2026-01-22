-- Create function to get store by QR code value
CREATE OR REPLACE FUNCTION public.get_store_by_qr_value(p_qr_value text)
RETURNS TABLE(store_id uuid, store_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id as store_id, name as store_name
  FROM public.establishments
  WHERE qr_code_token = p_qr_value
    AND active = true;
$$;