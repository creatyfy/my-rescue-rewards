

# Plano de Implementação: Nova Regra de Pontos para Produtos (1 Real = 600 Pontos)

## Resumo Executivo

Este plano implementa uma mudança significativa no sistema de pontos para **produtos/prêmios**, onde o administrador informa o valor em reais e o sistema calcula automaticamente os pontos necessários usando a fórmula **valor x 600**.

**Nota importante**: Esta regra de 600 pontos/real é específica para **definição de preço de produtos (prêmios)**. A regra atual de 10 pontos/real para **comprovantes de compra** permanece inalterada, pois são regras de negócio distintas:
- **Comprovantes**: Usuário ganha 10 pontos por R$1 gasto
- **Produtos**: Custo em pontos = valor do prêmio x 600

---

## Fases de Implementação

### Fase 1: Configuração Centralizada do Multiplicador

Criar um arquivo de configuração centralizado para evitar "hardcode" espalhado no sistema.

**Arquivo novo**: `src/lib/points-config.ts`
- Constante `PRODUCT_POINTS_MULTIPLIER = 600`
- Constante `RECEIPT_POINTS_MULTIPLIER = 10` (já existente, para referência)
- Funções utilitárias:
  - `calculateProductPoints(valueInReais: number): number`
  - `calculateProductValue(points: number): number`

---

### Fase 2: Atualização do Schema do Banco de Dados

**Tabela `products`** - Adicionar novas colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `prize_value_reais` | `numeric` | Valor do prêmio em reais informado pelo admin |
| `points_calculated` | `integer` | Pontos calculados automaticamente (valor x 600) |
| `points_manual_edit` | `boolean` | Flag indicando se o admin editou manualmente |

**Nota**: A coluna `points_cost` existente continuará sendo a fonte da verdade para o custo final em pontos (seja calculado ou editado).

---

### Fase 3: Reformulação do Formulário de Produtos

**Arquivo**: `src/components/admin/AdminProductsPanel.tsx`

**Novo fluxo do formulário**:

1. **Campo "Valor do prêmio (R$)"** (novo campo principal)
   - Input numérico para valor em reais
   - Ao digitar, calcula automaticamente os pontos

2. **Campo "Custo em pontos"** (campo existente, modificado)
   - Inicialmente em modo somente leitura
   - Exibe o valor calculado automaticamente
   - Mostra mensagem de confirmação

3. **Bloco de confirmação** (novo)
   - Mensagem: "Com base no valor do prêmio informado, este produto exigirá X pontos para resgate. Deseja confirmar ou editar esse valor?"
   - Botões: "Confirmar" e "Editar pontos"

4. **Comportamento dos botões**:
   - **Confirmar**: Mantém valor calculado, campo permanece bloqueado
   - **Editar pontos**: Libera o campo para edição manual

**Estado do formulário atualizado**:
```
type ProductFormState = {
  id?: string;
  name: string;
  description: string;
  prizeValueReais: string;      // NOVO
  pointsCost: string;           // existente
  pointsManualEdit: boolean;    // NOVO
  pointsConfirmed: boolean;     // NOVO (controle de UI)
  stock: string;
  imageUrl: string;
  imageFile: File | null;
  active: boolean;
};
```

---

### Fase 4: Atualização das Funções de Backend (Admin)

**Arquivo**: `src/integrations/supabase/admin.ts`

**Alterações em `createProduct`**:
- Aceitar novos parâmetros: `prizeValueReais`, `pointsManualEdit`
- Salvar todos os campos no banco

**Alterações em `updateProduct`**:
- Mesma lógica de create
- Preservar histórico de edições manuais

**Tipo `AdminProduct` atualizado**:
```
type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  prize_value_reais: number | null;  // NOVO
  points_calculated: number | null;   // NOVO
  points_manual_edit: boolean;        // NOVO
  stock: number;
  active: boolean;
  created_at: string;
};
```

---

### Fase 5: Validações

**No formulário (frontend)**:
- Valor do prêmio deve ser maior que 0
- Pontos finais devem ser maior que 0
- Não permitir salvar sem pontos definidos/confirmados

**Fluxo de validação**:
1. Admin informa valor em reais
2. Sistema calcula pontos automaticamente
3. Admin deve clicar "Confirmar" ou "Editar pontos"
4. Só após confirmação/edição o botão "Salvar" é habilitado

---

### Fase 6: Exibição na Interface do Usuário

**Arquivos afetados**:
- `src/components/store/ProductCard.tsx` - Exibir valor equivalente em R$
- `src/pages/Store.tsx` - Mostrar conversão para usuário

**Adicionar na loja**:
- Abaixo do custo em pontos: "Equivale a R$ X,XX" (usando a fórmula inversa: pontos / 600)

---

## Detalhes Técnicos

### Migration SQL para o Banco de Dados

```sql
-- Adicionar novas colunas à tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS prize_value_reais numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS points_calculated integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS points_manual_edit boolean DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.products.prize_value_reais IS 'Valor do prêmio em reais informado pelo administrador';
COMMENT ON COLUMN public.products.points_calculated IS 'Pontos calculados automaticamente (valor x 600)';
COMMENT ON COLUMN public.products.points_manual_edit IS 'Indica se o custo em pontos foi editado manualmente';
```

### Arquivo de Configuração

```typescript
// src/lib/points-config.ts

// Multiplicadores centralizados
export const PRODUCT_POINTS_MULTIPLIER = 600;
export const RECEIPT_POINTS_MULTIPLIER = 10;

// Funções utilitárias para produtos
export function calculateProductPoints(valueInReais: number): number {
  return Math.floor(valueInReais * PRODUCT_POINTS_MULTIPLIER);
}

export function calculateProductValue(points: number): number {
  return points / PRODUCT_POINTS_MULTIPLIER;
}

// Funções utilitárias para comprovantes (já existentes no sistema)
export function calculateReceiptPoints(valueInReais: number): number {
  return Math.floor(valueInReais * RECEIPT_POINTS_MULTIPLIER);
}
```

---

## Arquivos a Serem Modificados

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/lib/points-config.ts` | **Criar** - Configuração centralizada |
| `src/components/admin/AdminProductsPanel.tsx` | **Modificar** - Novo formulário |
| `src/integrations/supabase/admin.ts` | **Modificar** - Tipos e funções CRUD |
| `src/components/store/ProductCard.tsx` | **Modificar** - Exibir equivalente em R$ |
| `src/pages/Store.tsx` | **Modificar** - Conversão visual |
| Migration SQL | **Criar** - Novas colunas na tabela products |

---

## Fluxo Visual do Novo Formulário

```text
+--------------------------------------------------+
|  NOVO PRODUTO                                     |
+--------------------------------------------------+
|  Nome: [____________________]                     |
|  Descrição: [_______________]                     |
|                                                   |
|  Valor do prêmio (R$): [500.00]                  |
|                                                   |
|  Custo em pontos: [300.000] (somente leitura)    |
|                                                   |
|  +----------------------------------------------+ |
|  | Com base no valor informado, este produto    | |
|  | exigirá 300.000 pontos para resgate.        | |
|  |                                              | |
|  | Deseja confirmar ou editar esse valor?       | |
|  |                                              | |
|  | [Confirmar]  [Editar pontos]                 | |
|  +----------------------------------------------+ |
|                                                   |
|  Estoque: [____]                                  |
|  Imagem: [Selecionar arquivo]                    |
|  [x] Produto ativo                               |
|                                                   |
|  [Cancelar]  [Salvar]                            |
+--------------------------------------------------+
```

---

## Considerações de Compatibilidade

1. **Produtos existentes**: Produtos já cadastrados terão `prize_value_reais` e `points_calculated` como NULL, e `points_manual_edit` como FALSE. O sistema continuará funcionando normalmente usando `points_cost`.

2. **Migração gradual**: Ao editar um produto existente, o admin pode optar por informar o valor em reais e recalcular, ou manter o custo em pontos atual.

3. **Futuro**: O multiplicador 600 está centralizado em `points-config.ts`, permitindo alteração fácil sem refatoração do sistema.

