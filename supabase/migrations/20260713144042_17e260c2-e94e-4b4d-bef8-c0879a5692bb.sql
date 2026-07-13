CREATE OR REPLACE FUNCTION public.get_store_by_qr_value(p_qr_value text)
 RETURNS TABLE(store_id uuid, store_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id AS store_id, name AS store_name
  FROM public.establishments
  WHERE lower(qr_code_token) = lower(btrim(p_qr_value))
    AND active = true
  LIMIT 1;
$function$;