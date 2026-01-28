-- Função para verificar disponibilidade de campos únicos (CPF, email, telefone)
CREATE OR REPLACE FUNCTION public.is_unique_field_available(
  field_type text,
  field_value text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validação de entrada
  IF field_value IS NULL OR field_value = '' THEN
    RETURN true;
  END IF;

  -- Verificar CPF
  IF field_type = 'cpf' THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE cpf = field_value
    );
  END IF;

  -- Verificar telefone (normalizado com 55)
  IF field_type = 'telefone' OR field_type = 'phone' THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE phone = field_value
    );
  END IF;

  -- Verificar e-mail
  IF field_type = 'email' THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE lower(email) = lower(field_value)
    );
  END IF;

  -- Tipo inválido
  RETURN true;
END;
$$;

-- Permitir que a função seja chamada anonimamente (para validação no cadastro)
GRANT EXECUTE ON FUNCTION public.is_unique_field_available(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_unique_field_available(text, text) TO authenticated;