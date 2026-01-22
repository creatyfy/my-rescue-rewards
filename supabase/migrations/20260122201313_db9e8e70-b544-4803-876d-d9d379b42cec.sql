-- 1. Criar tabela de auditoria para ações administrativas
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index para consultas por admin e data
CREATE INDEX idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem visualizar logs de auditoria
CREATE POLICY "Audit logs: admins select"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Apenas inserção via functions (não diretamente)
-- Não criar policy de INSERT para usuários - apenas via SECURITY DEFINER functions

-- 2. Função para registrar ações de auditoria (uso interno)
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_table text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_table, target_id, details)
  VALUES (auth.uid(), p_action, p_target_table, p_target_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 3. Função segura para promover usuário a admin (APENAS admin pode promover OUTRO usuário)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(p_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Verificar se quem chama é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: only admins can promote users';
  END IF;

  -- Impedir auto-promoção
  IF auth.uid() = p_target_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot promote yourself';
  END IF;

  -- Verificar se usuário alvo existe na tabela de roles
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_target_user_id) THEN
    RAISE EXCEPTION 'user not found in roles table';
  END IF;

  -- Verificar se já é admin
  IF public.has_role(p_target_user_id, 'admin') THEN
    RETURN FALSE; -- já é admin
  END IF;

  -- Atualizar role para admin
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = p_target_user_id AND role = 'user';

  -- Registrar ação de auditoria
  PERFORM public.log_admin_action(
    'promote_to_admin',
    'user_roles',
    p_target_user_id,
    jsonb_build_object('promoted_by', auth.uid(), 'timestamp', now())
  );

  RETURN TRUE;
END;
$$;

-- 4. Função segura para rebaixar admin a usuário comum
CREATE OR REPLACE FUNCTION public.demote_admin_to_user(p_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: only admins can demote users';
  END IF;

  -- Impedir auto-rebaixamento
  IF auth.uid() = p_target_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot demote yourself';
  END IF;

  IF NOT public.has_role(p_target_user_id, 'admin') THEN
    RETURN FALSE; -- não é admin
  END IF;

  UPDATE public.user_roles
  SET role = 'user'
  WHERE user_id = p_target_user_id AND role = 'admin';

  PERFORM public.log_admin_action(
    'demote_to_user',
    'user_roles',
    p_target_user_id,
    jsonb_build_object('demoted_by', auth.uid(), 'timestamp', now())
  );

  RETURN TRUE;
END;
$$;

-- 5. Função para listar usuários (apenas admins)
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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::text,
    p.full_name,
    ur.role::text,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- 6. Deprecar bootstrap_first_admin (manter mas bloquear)
-- Nota: não podemos deletar pois pode quebrar código existente
-- Vamos alterar para sempre retornar false
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- FUNÇÃO DESABILITADA POR SEGURANÇA
  -- Promoção de admin deve ser feita apenas por outro admin via promote_user_to_admin
  RAISE EXCEPTION 'bootstrap_first_admin is disabled. Admin promotion must be done by an existing admin.';
END;
$$;