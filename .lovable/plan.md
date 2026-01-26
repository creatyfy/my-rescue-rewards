

# Plano: Adicionar Campos de Endereço de Entrega aos Resgates

## Resumo

Este plano implementa a persistência completa dos dados de endereço de entrega na tabela `redemptions`, atualizando a função RPC `redeem_product` para aceitar e salvar esses dados, e modificando o frontend para enviar os dados corretamente.

---

## Etapa 1: Migração do Banco de Dados

### 1.1 Adicionar colunas de endereço na tabela `redemptions`

Novas colunas a serem adicionadas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `delivery_cep` | text | CEP de entrega |
| `delivery_address` | text | Logradouro |
| `delivery_number` | text | Número |
| `delivery_neighborhood` | text | Bairro |
| `delivery_city` | text | Cidade |
| `delivery_state` | text | Estado (UF) |

### 1.2 Recriar a função RPC `redeem_product`

A função será atualizada para:
- Aceitar 6 novos parâmetros opcionais de endereço
- Persistir os dados de endereço no INSERT
- Alterar o status inicial de `'completed'` para `'pending'`

**Alteração crítica:** Resgates serão criados como `'pending'`, permitindo controle administrativo do fluxo de entrega.

---

## Etapa 2: Atualizar o Frontend - Camada de Dados

### 2.1 Arquivo: `src/integrations/supabase/store.ts`

Atualizar a função `redeemProduct` para enviar os dados de endereço:

```typescript
export const redeemProduct = async (
  productId: string,
  deliveryData: DeliveryData,
): Promise<RedemptionResult | null> => {
  const { data, error } = await supabase.rpc("redeem_product", {
    p_product_id: productId,
    p_delivery_cep: deliveryData.cep,
    p_delivery_address: deliveryData.address,
    p_delivery_number: deliveryData.number,
    p_delivery_neighborhood: deliveryData.neighborhood,
    p_delivery_city: deliveryData.city,
    p_delivery_state: deliveryData.state,
  });
  // ... resto da lógica
};
```

---

## Etapa 3: Atualizar os Tipos TypeScript

### 3.1 Arquivo: `src/integrations/supabase/admin.ts`

Adicionar campos de endereço ao tipo `AdminRedemption`:

```typescript
export type AdminRedemption = {
  id: string;
  status: "pending" | "completed" | "cancelled";
  points_spent: number;
  created_at: string;
  user_id: string;
  product_name: string | null;
  // Novos campos de endereço
  delivery_cep: string | null;
  delivery_address: string | null;
  delivery_number: string | null;
  delivery_neighborhood: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
};
```

### 3.2 Atualizar a query `fetchAdminRedemptions`

```typescript
const { data, error } = await supabase
  .from("redemptions")
  .select(`
    id, status, points_spent, created_at, user_id,
    delivery_cep, delivery_address, delivery_number,
    delivery_neighborhood, delivery_city, delivery_state,
    products(name)
  `)
  .order("created_at", { ascending: false });
```

---

## Etapa 4: Atualizar o Painel Administrativo

### 4.1 Arquivo: `src/components/admin/AdminRedemptionsPanel.tsx`

Atualizar a função `getDeliverySummary` para exibir o endereço real:

```typescript
const getDeliverySummary = (redemption: AdminRedemption) => {
  if (!redemption.delivery_address) {
    return "Não informado";
  }
  
  const parts = [
    redemption.delivery_address,
    redemption.delivery_number,
    redemption.delivery_neighborhood,
    redemption.delivery_city,
    redemption.delivery_state,
    redemption.delivery_cep,
  ].filter(Boolean);
  
  return parts.join(", ");
};
```

---

## Detalhes Técnicos

### SQL da Migração Completa

```sql
-- 1. Adicionar colunas de endereço à tabela redemptions
ALTER TABLE public.redemptions
  ADD COLUMN IF NOT EXISTS delivery_cep text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_number text,
  ADD COLUMN IF NOT EXISTS delivery_neighborhood text,
  ADD COLUMN IF NOT EXISTS delivery_city text,
  ADD COLUMN IF NOT EXISTS delivery_state text;

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
RETURNS TABLE(
  redemption_id uuid,
  product_id uuid,
  product_name text,
  points_spent integer,
  remaining_balance integer,
  stock_remaining integer,
  status redemption_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_cost integer;
  v_stock integer;
  v_active boolean;
  v_name text;
  v_balance integer;
  v_redemption_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select points_cost, stock, active, name
  into v_cost, v_stock, v_active, v_name
  from public.products
  where id = p_product_id
  for update;

  if v_name is null then
    raise exception 'product not found';
  end if;

  if v_active is not true then
    raise exception 'product inactive';
  end if;

  if v_stock <= 0 then
    raise exception 'out of stock';
  end if;

  v_balance := public.get_user_balance(auth.uid());
  if v_balance < v_cost then
    raise exception 'insufficient balance';
  end if;

  -- INSERT com campos de endereço e status 'pending'
  insert into public.redemptions(
    user_id,
    product_id,
    points_spent,
    status,
    delivery_cep,
    delivery_address,
    delivery_number,
    delivery_neighborhood,
    delivery_city,
    delivery_state
  )
  values (
    auth.uid(),
    p_product_id,
    v_cost,
    'pending',  -- Status inicial alterado de 'completed' para 'pending'
    p_delivery_cep,
    p_delivery_address,
    p_delivery_number,
    p_delivery_neighborhood,
    p_delivery_city,
    p_delivery_state
  )
  returning id into v_redemption_id;

  insert into public.points_ledger(user_id, ledger_type, amount, redemption_id)
  values (auth.uid(), 'redeem', -v_cost, v_redemption_id);

  update public.products
  set stock = stock - 1
  where id = p_product_id;

  remaining_balance := public.get_user_balance(auth.uid());

  select stock into stock_remaining from public.products where id = p_product_id;

  redemption_id := v_redemption_id;
  product_id := p_product_id;
  product_name := v_name;
  points_spent := v_cost;
  status := 'pending';

  return next;
end;
$$;
```

---

## Fluxo Atualizado

```text
Usuário                  Frontend                   Backend (RPC)              Admin Panel
   |                         |                           |                          |
   |-- Preenche endereço --> |                           |                          |
   |                         |-- Envia p/ RPC ---------->|                          |
   |                         |   (com 6 params)          |                          |
   |                         |                           |-- Persiste no DB ------->|
   |                         |                           |   status = 'pending'     |
   |                         |<-- Retorna sucesso -------|                          |
   |<-- Toast de sucesso ----|                           |                          |
   |                         |                           |                          |
   |                         |                           |   Admin visualiza        |
   |                         |                           |   e atualiza status ---->|
```

---

## Arquivos a Serem Modificados

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Adicionar colunas e recriar RPC |
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

