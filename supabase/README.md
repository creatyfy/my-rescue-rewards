# Supabase - Autenticação e integrações

## Auto-confirm de e-mail

Para habilitar auto-confirm de e-mail no Supabase (evitar confirmação por e-mail):

1. Acesse o Dashboard do Supabase do projeto.
2. Vá em **Authentication → Providers → Email**.
3. Desative a opção **Confirm email**.
4. Salve as alterações.

> Observação: essa configuração deve ser aplicada tanto no ambiente de desenvolvimento quanto em produção.

## Migrações incluídas

A migração `20250103000000_auth_trigger_helpers.sql` adiciona:

- Trigger `on_auth_user_created` em `auth.users`.
- Criação automática de `profiles` e `user_roles` (role `user`).
- Funções helper `get_user_balance(user_id)` e `get_pending_points(user_id)`.

Para aplicar localmente:

```bash
supabase db reset
```

Ou, em produção, aplique a migração via pipeline/CLI conforme o fluxo do projeto.
