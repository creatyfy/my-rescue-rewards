-- Create a secure RPC function to list user profiles for admins
CREATE OR REPLACE FUNCTION public.list_profiles_for_admin()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;