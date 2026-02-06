

# Security Audit Report - Current Risk Assessment

## Findings Table

| # | Original Finding | Current Status | Risk | Justification |
|---|-----------------|---------------|------|---------------|
| 1 | **Validacoes backend** | Parcialmente mitigado | **ATENCAO** | Login/cadastro passam por Edge Functions com Zod `.strict()`. Porem `submit-receipt` no frontend chama `supabase.rpc()` diretamente, ignorando a Edge Function que tem Turnstile + Zod. |
| 2 | **Confirmacao de e-mail** | Mitigado | **OK** | `config.toml` tem `enable_confirmations = true`. `register-user` cria com `email_confirm: false` e envia email. `login-user` bloqueia contas nao confirmadas (403). Nao ha `supabase.auth.signUp` no frontend. |
| 3 | **CAPTCHA (Turnstile)** | Parcialmente mitigado | **CRITICO** | Login e cadastro passam por Edge Functions com Turnstile. Porem o envio de comprovantes (`receipts.ts`) chama `supabase.rpc("submit_receipt")` diretamente, contornando completamente o Turnstile da Edge Function `submit-receipt`. |
| 4 | **Upload de arquivos** | Parcialmente mitigado | **ATENCAO** | Comprovantes passam por `upload-receipt` (valida MIME, reprocessa imagem, 10MB). Porem uploads de produtos, estabelecimentos e avatares vao direto para o Storage sem validacao de tipo/tamanho no backend. |
| 5 | **Protecao contra abuso** | Parcialmente mitigado | **ATENCAO** | A funcao SQL `submit_receipt` tem rate limit e fingerprint. Porem como o frontend chama o RPC diretamente (sem Edge Function), o rate limit do SQL eh a unica camada - sem Turnstile. |
| 6 | **Pontos e valores** | Mitigado | **OK** | Calculo esta no backend via `calculate_receipt_points()` + `submit_receipt()`. Trigger `on_receipt_status_change` gerencia creditos/ajustes corretamente. |
| 7 | **Permissoes e Admin** | Mitigado | **OK** | `is_admin()` e `has_role()` sao `SECURITY DEFINER`. RLS policies usam `has_role()`. `bootstrap_first_admin` desabilitado. Promoca/rebaixamento restrito a admins existentes. `user_roles` so acessivel por admins. |
| 8 | **Responses e dados sensiveis** | Mitigado | **OK** | Respostas de erro sao genericas. Sem vazamento de stack traces. |
| 9 | **Bypass de frontend (Postman/API direta)** | Parcialmente mitigado | **CRITICO** | Login/cadastro agora passam por Edge Functions (sem acesso direto ao `signUp`/`signInWithPassword`). Porem o envio de comprovantes ainda eh feito via RPC direta, contornando a Edge Function. Password reset (`ForgotPassword.tsx`) usa `supabase.auth.resetPasswordForEmail` diretamente sem Turnstile. |

---

## Must-Fix Before Production (Top 5)

1. **CRITICO: Frontend envia comprovantes via RPC direta, contornando a Edge Function `submit-receipt`**
   - `src/integrations/supabase/receipts.ts` chama `supabase.rpc("submit_receipt")` diretamente
   - Isso ignora: Turnstile, Zod validation, body size limit, e a verificacao de fingerprint da Edge Function
   - **Fix**: Alterar `submitReceiptForCurrentUser` para chamar `supabase.functions.invoke("submit-receipt")` com o turnstileToken

2. **CRITICO: Password reset sem Turnstile**
   - `ForgotPassword.tsx` chama `supabase.auth.resetPasswordForEmail()` diretamente
   - Um atacante pode abusar dessa rota para spammar emails de reset via Postman
   - **Fix**: Criar Edge Function `reset-password` com Turnstile e redirecionar o frontend

3. **ATENCAO: Uploads admin (produtos/estabelecimentos/avatares) sem validacao backend**
   - `uploadProductImage`, `uploadEstablishmentImage`, `uploadAvatarForCurrentUser` fazem upload direto ao Storage
   - Sem validacao de MIME real, sem reprocessamento de imagem, sem limite de tamanho no backend
   - Protegido apenas por RLS (admins podem escrever)
   - **Fix**: Criar Edge Functions de upload similares a `upload-receipt` ou adicionar Storage Policies restritivas

4. **ATENCAO: `TURNSTILE_SECRET_KEY` nao esta nos secrets configurados**
   - O unico secret encontrado foi `LOVABLE_API_KEY`
   - Sem o secret, todas as Edge Functions que usam Turnstile retornam erro 500
   - **Fix**: Configurar o secret `TURNSTILE_SECRET_KEY` imediatamente

5. **ATENCAO: `resendConfirmationEmail` no frontend chama `supabase.auth.resend()` diretamente**
   - Sem rate limit ou Turnstile no reenvio de email de confirmacao
   - Atacante pode automatizar reenvios infinitos via Postman
   - **Fix**: Mover para Edge Function com Turnstile

---

## Concrete Exploit Example (CRITICAL #1)

**Submissao de comprovantes falsos em massa via Postman, sem CAPTCHA:**

```text
POST https://rymywtllzgysesdzstof.supabase.co/rest/v1/rpc/submit_receipt
Headers:
  apikey: <anon_key>
  Authorization: Bearer <user_jwt>
  Content-Type: application/json

Body:
{
  "p_qr_code_token": "<token_valido_de_estabelecimento>",
  "p_purchase_value": 9999.99,
  "p_image_path": "<user_id>/qualquer-imagem-existente.jpg"
}
```

Este request ignora completamente:
- Turnstile (sem CAPTCHA)
- Zod schema validation
- Body size limit (10KB)
- A Edge Function `submit-receipt` inteira

O unico controle restante eh o rate limit SQL dentro da funcao `submit_receipt()` e a verificacao de fingerprint -- que depende de parametros que podem nao estar sendo passados corretamente pelo RPC direto (o RPC espera `p_image_path`, nao `p_receipt_image_url`).

---

## Technical Implementation Plan

### 1. Redirecionar submissao de comprovantes para Edge Function

**Arquivo**: `src/integrations/supabase/receipts.ts`

Alterar `submitReceiptForCurrentUser` para:
- Receber `turnstileToken` como parametro
- Chamar `supabase.functions.invoke("submit-receipt", { body: { qrCodeToken, purchaseValue, receiptPath, turnstileToken } })`
- Remover todas as chamadas `supabase.rpc("submit_receipt")`

**Arquivos afetados**: `src/pages/Scan.tsx` (adicionar widget Turnstile e passar token)

### 2. Criar Edge Function `reset-password`

- Validar Turnstile
- Chamar `supabase.auth.resetPasswordForEmail()` server-side
- Atualizar `ForgotPassword.tsx` para usar a Edge Function

### 3. Adicionar validacao de upload para admin

- Frontend: adicionar validacao de tipo (JPG/PNG) e tamanho (10MB) nos formularios de produto e estabelecimento
- Backend: considerar Storage Policies ou Edge Functions dedicadas

### 4. Configurar `TURNSTILE_SECRET_KEY`

- Sem este secret, login e cadastro estao retornando erro 500

### 5. Proteger reenvio de confirmacao

- Mover `resendConfirmationEmail` para Edge Function com Turnstile
- Ou adicionar rate limit no frontend (com consciencia de que eh contornavel)

