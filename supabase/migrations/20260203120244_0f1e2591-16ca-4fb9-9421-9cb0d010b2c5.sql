-- Atualizar função list_users_for_admin para filtrar apenas usuários com perfil existente
CREATE OR REPLACE FUNCTION public.list_users_for_admin()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o chamador é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  
  -- Retornar apenas usuários que existem na tabela profiles
  RETURN QUERY
  SELECT 
    p.user_id,
    u.email::text,
    p.full_name::text,
    COALESCE(ur.role::text, 'user') AS role,
    p.created_at
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;