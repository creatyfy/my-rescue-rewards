
# Plano: Adicionar Campos de Endereço de Entrega aos Resgates

## Resumo

Este plano adiciona campos de endereço de entrega na tabela `redemptions` e atualiza todo o fluxo para que os dados coletados no frontend sejam persistidos no banco de dados e exibidos no painel administrativo.

---

## 1. Migração do Banco de Dados

Adicionar as seguintes colunas à tabela `redemptions`:

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `delivery_cep` | text | Sim | CEP de entrega |
| `delivery_address` | text | Sim | Logradouro |
| `delivery_number` | text | Sim | Número |
| `delivery_neighborhood` | text | Sim | Bairro |
| `delivery_city` | text | Sim | Cidade |
| `delivery_state` | text | Sim | Estado (UF) |

```text
SQL Migration:
+-------------------------------------------+
|  ALTER TABLE redemptions                  |
|  ADD COLUMN delivery_cep text,            |
|  ADD COLUMN delivery_address text,        |
|  ADD COLUMN delivery_number text,         |
|  ADD COLUMN delivery_neighborhood text,   |
|  ADD COLUMN delivery_city text,           |
|  ADD COLUMN delivery_state text;          |
+-------------------------------------------+
```

---

## 2. Atualizar a Função RPC `redeem_product`

Modificar a função para:
- Aceitar 6 novos parâmetros de endereço
- Persistir os dados de endereço na tabela `redemptions`
- Alterar o status inicial de `'completed'` para `'pending'`

**Parâmetros atualizados:**
- `p_product_id` (existente)
- `p_delivery_cep` (novo)
- `p_delivery_address` (novo)
- `p_delivery_number` (novo)
- `p_delivery_neighborhood` (novo)
- `p_delivery_city` (novo)
- `p_delivery_state` (novo)

**Alteração crítica:** O status inicial será `'pending'` ao invés de `'completed'`, permitindo que o administrador controle o fluxo de entrega.

---

## 3. Atualizar o Frontend - Camada de Dados

**Arquivo:** `src/integrations/supabase/store.ts`

- Atualizar a chamada RPC `redeemProduct` para enviar os dados de endereço como parâmetros
- Atualizar o tipo `RedemptionResult` para refletir o novo status padrão `pending`

---

## 4. Atualizar os Tipos TypeScript

**Arquivo:** `src/integrations/supabase/admin.ts`

- Adicionar campos de endereço ao tipo `AdminRedemption`
- Atualizar a query `fetchAdminRedemptions` para buscar os novos campos

---

## 5. Atualizar o Painel Administrativo

**Arquivo:** `src/components/admin/AdminRedemptionsPanel.tsx`

- Exibir os dados de endereço de entrega na tabela de resgates
- Adicionar uma coluna ou seção expandida para mostrar o endereço completo

---

## Detalhes Técnicos

### Migração SQL Completa

```text
-- 1. Adicionar colunas de endereço
ALTER TABLE public.redemptions
  ADD COLUMN delivery_cep text,
  ADD COLUMN delivery_address text,
  ADD COLUMN delivery_number text,
  ADD COLUMN delivery_neighborhood text,
  ADD COLUMN delivery_city text,
  ADD COLUMN delivery_state text;

-- 2. Recriar a função redeem_product com os novos parâmetros
CREATE OR REPLACE FUNCTION public.redeem_product(
  p_product_id uuid,
  p_delivery_cep text DEFAULT NULL,
  p_delivery_address text DEFAULT NULL,
  p_delivery_number text DEFAULT NULL,
  p_delivery_neighborhood text DEFAULT NULL,
  p_delivery_city text DEFAULT NULL,
  p_delivery_state text DEFAULT NULL
)
RETURNS TABLE(...) -- mesma estrutura de retorno
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Lógica existente de validação...
  -- INSERT atualizado com campos de endereço
  -- Status inicial = 'pending' ao invés de 'completed'
$$;
```

### Fluxo Atualizado

```text
+----------------+     +------------------+     +------------------+
|   Usuário      | --> |   Frontend       | --> |   Backend RPC    |
|  preenche      |     |  envia dados     |     |  persiste no DB  |
|  endereço      |     |  p/ API          |     |  status=pending  |
+----------------+     +------------------+     +------------------+
                                                        |
                                                        v
                                          +------------------+
                                          |   Admin Panel    |
                                          |  visualiza e     |
                                          |  atualiza status |
                                          +------------------+
```

---

## Arquivos a Serem Modificados

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Adicionar colunas e atualizar RPC |
| `src/integrations/supabase/store.ts` | Enviar dados de endereço na chamada RPC |
| `src/integrations/supabase/admin.ts` | Adicionar campos ao tipo e query |
| `src/components/admin/AdminRedemptionsPanel.tsx` | Exibir endereço na tabela |

---

## Resultado Esperado

1. Dados de endereço são salvos no banco ao realizar resgate
2. Resgates são criados com status `pending` (pendente)
3. Administrador visualiza endereço completo no painel de resgates
4. Fluxo de controle administrativo centralizado funciona corretamente
5. Nenhuma funcionalidade existente é quebrada
