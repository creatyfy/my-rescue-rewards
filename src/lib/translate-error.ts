/**
 * Translates common Supabase / auth English error messages to Portuguese.
 */

const ERROR_MAP: [RegExp, string][] = [
  [/invalid login credentials/i, "Credenciais inválidas. Verifique seu e-mail e senha."],
  [/email not confirmed/i, "Seu e-mail ainda não foi confirmado."],
  [/user already registered/i, "Este e-mail já está cadastrado."],
  [/new password should be different/i, "A nova senha deve ser diferente da senha atual."],
  [/password should be at least/i, "A senha deve ter no mínimo 6 caracteres."],
  [/unable to validate email/i, "Não foi possível validar o e-mail informado."],
  [/user not found/i, "Usuário não encontrado."],
  [/token expired/i, "O link expirou. Solicite um novo."],
  [/invalid.*token/i, "Link inválido ou expirado. Solicite um novo."],
  [/email rate limit exceeded/i, "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."],
  [/rate limit/i, "Muitas tentativas. Aguarde alguns minutos."],
  [/signup is disabled/i, "O cadastro está temporariamente indisponível."],
  [/password is too short/i, "A senha deve ter no mínimo 6 caracteres."],
  [/same_password/i, "A nova senha deve ser diferente da senha atual."],
  [/session_not_found/i, "Sessão não encontrada. Faça login novamente."],
  [/refresh_token_not_found/i, "Sessão expirada. Faça login novamente."],
  [/over_email_send_rate_limit/i, "Muitas tentativas de envio de e-mail. Aguarde alguns minutos."],
];

export function translateError(message: string): string {
  if (!message) return message;

  for (const [pattern, translation] of ERROR_MAP) {
    if (pattern.test(message)) {
      return translation;
    }
  }

  return message;
}
