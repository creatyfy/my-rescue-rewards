

# Plano de Refatoracao: Seguranca e UX

## Resumo

Este plano aborda 7 problemas identificados, reorganizando o fluxo da aplicacao para centralizar validacoes no backend, eliminar acessos diretos inseguros, melhorar o tratamento de erros e a experiencia do usuario.

---

## 1. Bloquear acesso direto as tabelas (RLS mais restritivo)

**Situacao atual:** O frontend faz queries diretas (`supabase.from("profiles").upsert(...)`, `supabase.from("receipts").select(...)`, etc.) em pelo menos 5 arquivos. As tabelas `profiles`, `receipts`, `establishments`, `products`, `redemptions` e `notifications` possuem RLS, mas permitem CRUD direto do frontend.

**O que muda:**
- As tabelas que ja estao protegidas por RLS com escopo do usuario (profiles, receipts, notifications) continuarao funcionando via queries diretas para **leitura** -- isso e seguro pois o RLS garante que o usuario so ve seus proprios dados.
- **Escrita** em `profiles` (update de nome, telefone, avatar) sera migrada para uma Edge Function dedicada (`update-profile`), eliminando o `upsert` direto.
- As tabelas admin (`establishments`, `products`) ja estao protegidas por RLS admin-only -- os CRUDs diretos do painel admin sao seguros pois o RLS impede acesso de usuarios comuns.

**Arquivos afetados:**
- `src/integrations/supabase/profile.ts` -- refatorar `updateCurrentUserProfile` para chamar Edge Function
- Nova Edge Function: `supabase/functions/update-profile/index.ts`

---

## 2. Signup usando Edge Function (ja implementado, mas precisa revisao)

**Situacao atual:** O cadastro **ja usa** a Edge Function `register-user` com validacao server-side (Turnstile, CPF, telefone, nome, Zod). Nao ha chamada direta a `/auth/v1/signup` no frontend.

**O que muda:** Nenhuma alteracao necessaria neste ponto -- o fluxo ja esta correto. Sera apenas revisado para garantir que nenhuma rota alternativa permita signup direto.

---

## 3. Redirecionar para `/verifique-seu-email` apos cadastro

**Situacao atual:** Apos cadastro bem-sucedido, o usuario permanece na tela de login com um toast discreto.

**O que muda:**
- Criar nova pagina `/verifique-seu-email` com design explicativo (icone de e-mail, instrucoes claras, botao para reenviar confirmacao).
- Apos cadastro bem-sucedido em `Auth.tsx`, redirecionar com `navigate("/verifique-seu-email", { state: { email } })`.
- A pagina exibira o e-mail cadastrado e um botao para reenviar o link de confirmacao.

**Arquivos afetados:**
- Novo arquivo: `src/pages/VerifyEmail.tsx`
- `src/pages/Auth.tsx` -- substituir `setMode("login")` por `navigate("/verifique-seu-email")`
- `src/App.tsx` -- adicionar rota `/verifique-seu-email`

---

## 4. Erros inline no formulario de cadastro

**Situacao atual:** Erros de validacao de campos unicos (CPF, email, telefone) ja aparecem inline. Porem, erros do servidor (ex: "Nao foi possivel concluir o cadastro") aparecem apenas como toast.

**O que muda:**
- Adicionar estado `formError` para exibir erros gerais do servidor acima do botao de submit (em um alerta vermelho visivel).
- Manter os erros inline dos campos individuais como ja estao.
- Remover toasts de erro no fluxo de cadastro, substituindo por mensagens inline.

**Arquivos afetados:**
- `src/pages/Auth.tsx` -- adicionar estado `formError`, exibir acima do botao, limpar ao submeter

---

## 5. Unificar upload + submissao de comprovante em uma unica Edge Function

**Situacao atual:** O frontend faz 2 chamadas separadas:
1. `uploadReceiptForCurrentUser(file)` -- envia imagem para Edge Function `upload-receipt`
2. `submitReceiptForCurrentUser(...)` -- envia dados para Edge Function `submit-receipt`

Se a etapa 2 falhar, o arquivo ja foi salvo (arquivo orfao).

**O que muda:**
- Criar nova Edge Function `submit-receipt-v2` que recebe tudo em um unico `multipart/form-data` (arquivo + dados JSON).
- Fluxo interno da Edge Function:
  1. Validar autenticacao
  2. Validar Turnstile
  3. Validar dados (token QR, valor minimo R$10)
  4. Validar e processar imagem (tipo, tamanho)
  5. Somente se tudo valido: fazer upload para Storage + criar registro no banco
- Remover a Edge Function `upload-receipt` (ou mante-la apenas para uso interno).
- Atualizar o frontend para enviar tudo em uma unica chamada.

**Arquivos afetados:**
- Nova Edge Function: `supabase/functions/submit-receipt-v2/index.ts`
- `src/integrations/supabase/receipts.ts` -- refatorar `submitReceiptForCurrentUser`
- `src/integrations/supabase/storage.ts` -- remover `uploadReceiptForCurrentUser` (ou marcar como deprecated)
- `src/pages/Scan.tsx` -- simplificar `handleSubmit` e `handleManualSubmit` para chamada unica

---

## 6. Retorno estruturado da Edge Function de comprovante

**Situacao atual:** A Edge Function `submit-receipt` ja retorna JSON estruturado com campos `errors[]` ou `success + receipt`. Porem o frontend nem sempre exibe a mensagem real do erro.

**O que muda:**
- Na nova `submit-receipt-v2`, manter o padrao `{ errors: ["mensagem clara"] }` com status HTTP apropriado.
- No frontend, extrair e exibir a mensagem exata do erro retornado pelo servidor (ja parcialmente implementado, mas sera reforçado).

**Arquivos afetados:**
- `src/integrations/supabase/receipts.ts` -- melhorar extracao de erros
- `src/pages/Scan.tsx` -- exibir erro real no toast

---

## 7. Mascara monetaria no campo "Valor da compra"

**Situacao atual:** O campo `purchaseValue` e um input de texto simples sem mascara.

**O que muda:**
- Implementar mascara `R$ 0,00` no campo de valor.
- Ao digitar, formatar automaticamente com separador decimal brasileiro.
- Ao submeter, converter para numero (ex: "1.234,56" -> 1234.56).
- Validacao de minimo R$10,00 tanto no frontend quanto no backend (backend ja valida).

**Arquivos afetados:**
- `src/pages/Scan.tsx` -- adicionar funcoes `formatCurrency` e `parseCurrency`, aplicar no input

---

## Secao Tecnica

### Nova Edge Function: `submit-receipt-v2/index.ts`

```text
POST multipart/form-data
Fields:
  - file: File (imagem JPG/PNG, max 10MB)
  - qrCodeToken: string
  - purchaseValue: number
  - turnstileToken: string

Fluxo:
  1. Verificar Authorization header
  2. Parse multipart/form-data
  3. Verificar Turnstile token
  4. Validar qrCodeToken (existe estabelecimento ativo?)
  5. Validar purchaseValue >= 10
  6. Validar arquivo (tipo via magic bytes, tamanho, re-encode)
  7. Upload para Storage bucket "receipts"
  8. Chamar RPC submit_receipt
  9. Retornar { success, receipt } ou { errors }
```

### Nova Edge Function: `update-profile/index.ts`

```text
POST JSON
Fields:
  - full_name?: string (min 3, max 100)
  - phone?: string (10-11 digitos)
  - avatar_url?: string

Fluxo:
  1. Verificar Authorization header
  2. Validar campos com Zod
  3. Atualizar profiles via service role
  4. Retornar perfil atualizado
```

### Nova pagina: `VerifyEmail.tsx`

```text
Rota: /verifique-seu-email
Layout:
  - Icone de e-mail grande
  - Titulo: "Verifique seu e-mail"
  - Texto: "Enviamos um link de confirmacao para {email}"
  - Botao: "Reenviar e-mail de confirmacao"
  - Link: "Voltar para o login"
```

### Ordem de implementacao

1. Criar pagina `/verifique-seu-email` e rota
2. Refatorar Auth.tsx (redirect pos-cadastro + erros inline)
3. Criar Edge Function `submit-receipt-v2` (upload unificado)
4. Atualizar frontend do Scan para usar nova Edge Function
5. Adicionar mascara monetaria no campo de valor
6. Criar Edge Function `update-profile`
7. Refatorar `profile.ts` para usar nova Edge Function
8. Testes end-to-end

