# Auditoria de Segurança SaaS (Supabase + Edge Functions + Lovable)

Data: 2026-02-05
Escopo analisado: Edge Functions, frontend e migrations SQL do repositório.

## Checklist executivo

1. **Validações backend** — **ATENÇÃO**
2. **Confirmação de e-mail** — **ATENÇÃO**
3. **CAPTCHA (Turnstile)** — **ATENÇÃO**
4. **Upload de arquivos** — **ATENÇÃO**
5. **Proteção contra abuso** — **OK**
6. **Pontos e valores** — **ATENÇÃO**
7. **Permissões e Admin** — **ATENÇÃO**
8. **Responses e dados sensíveis** — **OK**
9. **Bypass de frontend (Postman/API direta)** — **CRÍTICO**

## Principais evidências técnicas

- `register-user`, `login-user` e `submit-receipt` validam payload com Zod `.strict()` e bloqueiam campos extras; `register-user` também valida CPF por algoritmo oficial e regex de telefone.
- Turnstile é validado no backend antes do `safeParse` e antes da lógica de negócio nas Edge Functions que o implementam.
- `upload-receipt` valida autenticação, tamanho, arquivo vazio, MIME real via `file-type`, reprocessa imagem com `imagescript`, gera nome com UUID e rejeita referências externas.
- Função SQL `submit_receipt` aplica rate limit por usuário/IP e bloqueio de duplicidade por fingerprint único.
- Cálculo de pontos está no backend via `calculate_receipt_points()` + constraint de integridade.
- Risco de bypass: tela de Auth ainda usa `supabase.auth.signUp/signInWithPassword` diretamente (sem passar por Edge Functions com Turnstile/validações backend).

## Recomendações prioritárias

1. **Migrar login/cadastro do frontend para Edge Functions (`register-user` e `login-user`)** e remover fluxo direto de `supabase.auth.signUp/signInWithPassword` no cliente.
2. **Forçar confirmação de e-mail no Auth do Supabase** para impedir sessões antes da confirmação, independentemente do frontend.
3. **Remover ou restringir RPC público `is_admin()`** (ou substituir por endpoint interno) para reduzir enumeração de papel.
4. **Adicionar limite de tamanho de body (JSON) em Edge Functions** para mitigar payloads gigantes.
5. **Padronizar upload via backend para todos os uploads sensíveis** (quando houver validações de conteúdo obrigatórias).
