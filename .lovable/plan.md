

# Limpeza de dados de cadastro e comprovantes

## Resumo

Remover todos os dados de usuarios nao-admin e comprovantes do banco de dados, preservando apenas as 2 contas de administrador:
- **hiagoteste** (6468862c-9222-405d-a003-c6bf573571ff)
- **Welton dos Santos Nogueira** (35315e6d-62cc-464c-8299-4f3cd2c32ac9)

## Dados a serem removidos

| Tabela | Registros atuais | Acao |
|--------|------------------|------|
| profiles | 16 usuarios comuns | Deletar todos exceto admins |
| user_roles | 16 registros de users | Deletar todos exceto admins |
| receipts | 26 comprovantes | Deletar todos |
| points_ledger | 22 registros | Deletar todos |
| redemptions | 0 registros | Nada a fazer |
| notifications | 32 notificacoes | Deletar todos |
| admin_audit_logs | - | Manter (historico de auditoria) |

## Ordem de execucao (respeitando dependencias)

1. Deletar `points_ledger` (referencia receipts e redemptions)
2. Deletar `receipts` (todos os comprovantes)
3. Deletar `notifications` (todas as notificacoes)
4. Deletar `profiles` de usuarios nao-admin
5. Deletar `user_roles` de usuarios nao-admin
6. Deletar usuarios do `auth.users` via Edge Function admin (para liberar emails/CPFs/telefones para re-cadastro)

## Detalhes tecnicos

- As delecoes nas tabelas publicas serao feitas via SQL direto (ferramenta de insert/update/delete)
- A remocao dos usuarios de `auth.users` sera feita chamando a Edge Function `admin-delete-user` para cada usuario, ou diretamente via SQL na tabela auth (usando service role)
- Arquivos de avatar e comprovantes no Storage tambem serao limpos
- Os 2 admins e seus dados permanecem intactos

