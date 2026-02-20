
# Sistema Completo de Indicação por Link Individual

## Visão Geral

O sistema será construído sobre a arquitetura existente: Edge Functions para operações seguras, RPC functions no banco para atomicidade transacional, RLS para segurança de dados, e componentes React seguindo os padrões já estabelecidos.

---

## Parte 1 — Banco de Dados (2 tabelas novas + 1 RPC + migrações)

### Tabela: `referral_codes`
Armazena o código único e permanente de cada usuário.

```text
referral_codes
├── id           uuid PK
├── user_id      uuid (ref: profiles.user_id) UNIQUE NOT NULL
├── code         text UNIQUE NOT NULL  ← ex: "ABC123XY"
└── created_at   timestamptz
```

- O `code` é gerado no momento do cadastro, via trigger na tabela `profiles` (quando o novo usuário é inserido) ou diretamente pela Edge Function `register-user`.
- Será gerado com `gen_random_uuid()` truncado em 8 chars alfanuméricos (maiúsculas), garantindo unicidade com `UNIQUE CONSTRAINT`.
- **RLS**: cada usuário lê apenas o próprio código. Nenhuma escrita direta — só via funções SECURITY DEFINER.

### Tabela: `referral_events`
Guarda cada evento de indicação, incluindo o "fingerprint" de identidade para detectar recorrência. Esta tabela persiste mesmo após a exclusão de conta.

```text
referral_events
├── id                  uuid PK
├── referrer_id         uuid NOT NULL  ← dono do link que recebeu pontos
├── referred_user_id    uuid NOT NULL  ← ID do novo usuário na época do cadastro
├── email_hash          text NOT NULL  ← SHA-256 do e-mail normalizado
├── cpf_hash            text NOT NULL  ← SHA-256 do CPF (apenas dígitos)
├── points_granted      boolean DEFAULT false
├── status              text DEFAULT 'valid'  ← 'valid' | 'recorrencia_detectada'
└── created_at          timestamptz
```

- Os hashes (email e CPF) são armazenados em vez dos valores reais, preservando a privacidade e o compliance com LGPD.
- Mesmo após exclusão de conta (`delete-account`), esses registros permanecem para impedir nova pontuação com a mesma identidade.

### Tabela: `referral_welcome_shown`
Controla se o modal de boas-vindas já foi exibido ao usuário.

```text
referral_welcome_shown
├── user_id    uuid PK (ref: profiles.user_id)
└── shown_at   timestamptz DEFAULT now()
```

### RPC Function: `process_referral_bonus`
Função SECURITY DEFINER que executa de forma atômica:
1. Verifica se já existe `referral_event` com os mesmos hashes (email ou CPF).
2. Se não existir: insere `referral_event` com `points_granted = true`, credita 100 pontos no `points_ledger` do referenciador com descrição "Bônus por indicação de novo usuário".
3. Se existir (recorrência): insere `referral_event` com `points_granted = false` e `status = 'recorrencia_detectada'`. Não credita pontos. Não bloqueia o cadastro.

### RLS Policies
- `referral_codes`: SELECT próprio, sem INSERT/UPDATE/DELETE direto.
- `referral_events`: SELECT para admins + referenciador vê os próprios. Sem escrita direta.
- `referral_welcome_shown`: SELECT/INSERT/UPDATE próprios.

---

## Parte 2 — Edge Function: `register-user` (modificação)

A função atual já cria o usuário. Será expandida para:

1. Aceitar parâmetro opcional `ref_code` (código de indicação).
2. Após criação bem-sucedida do usuário:
   - Gerar `referral_code` único de 8 chars para o novo usuário e inserir em `referral_codes`.
   - Se `ref_code` foi fornecido:
     - Consultar `referral_codes` para encontrar o `referrer_id`.
     - Chamar `process_referral_bonus` com: `referrer_id`, `referred_user_id`, `email_hash`, `cpf_hash`.
3. Tudo dentro de um bloco try/catch que **não falha o cadastro** em caso de erro na parte de indicação (o cadastro sempre tem prioridade).

**Geração do código único:**
```typescript
// Algoritmo de geração: UUID v4 → base36 → 8 chars uppercase
const generateReferralCode = () => {
  const uuid = crypto.randomUUID().replace(/-/g, '');
  const hex = BigInt('0x' + uuid.slice(0, 12));
  return hex.toString(36).toUpperCase().slice(0, 8).padStart(8, '0');
};
```

Com retry em caso de conflito de unicidade.

---

## Parte 3 — Frontend: Captura do `ref` na URL

### Arquivo: `src/pages/Auth.tsx`
- Ao inicializar, verificar `searchParams.get("ref")`.
- Armazenar no `sessionStorage` com chave `referral_code`.
- Ao enviar o formulário de cadastro, incluir `ref_code: sessionStorage.getItem("referral_code") || undefined` no payload para `register-user`.

A URL de cadastro será: `https://my-rescue-rewards.lovable.app/auth?mode=register&ref=CODIGO`

---

## Parte 4 — Modal "Indique e Ganhe" após primeiro login

### Novo componente: `src/components/referral/ReferralWelcomeModal.tsx`

Exibido no **Dashboard** (`src/pages/Dashboard.tsx`) após o primeiro login de usuário não-admin:

**Lógica de controle:**
1. Na carga do Dashboard, verificar se o usuário tem registro em `referral_welcome_shown`.
2. Se não tem: buscar o código do usuário em `referral_codes`, exibir o modal.
3. Ao fechar/copiar: inserir registro em `referral_welcome_shown` para nunca mais exibir.

**Conteúdo do modal:**
```text
┌─────────────────────────────────────┐
│  🎉 Seu link de convite exclusivo!  │
│                                     │
│  Compartilhe e ganhe 100 pontos     │
│  por cada amigo que se cadastrar.   │
│                                     │
│  [https://...app/auth?mode=register │
│   &ref=ABCD1234              ]      │
│                                     │
│  [Copiar link]        [Fechar]      │
└─────────────────────────────────────┘
```

---

## Parte 5 — Tela "Indique e Ganhe" no Perfil

### Nova página: `src/pages/Referral.tsx`

Rota: `/profile/referral`

Conteúdo:
- Link exclusivo do usuário com botão "Copiar".
- Botão "Compartilhar" (Web Share API com fallback).
- Total de indicados válidos (count de `referral_events` com `points_granted = true`).
- Total de pontos ganhos por indicação (sum calculado).

### RPC: `get_referral_stats(p_user_id uuid)`
Retorna: `total_referred int`, `total_points_earned int`.

### Integração com menu do Perfil (`src/pages/Profile.tsx`)
Adicionar item "Indique e Ganhe" no array `menuItems` (apenas para não-admins).

### Integração com Sidebar (`src/components/layout/sidebarMenuConfig.ts`)
Não alterar — a seção fica apenas dentro do perfil para não poluir o menu principal.

---

## Parte 6 — `delete-account` Edge Function (modificação mínima)

A função de exclusão de conta **não apaga** registros de `referral_events` — por design, esses dados precisam persistir para detectar recorrência. Isso já está garantido pela arquitetura proposta (a Edge Function atual não conhece essa tabela, então nada muda lá).

Apenas adicionar: ao deletar o usuário, **não** apagar `referral_events` (que usa `referrer_id` e hashes, não o `user_id` do excluído como FK com CASCADE).

---

## Diagrama de Fluxo

```text
Novo usuário acessa /auth?mode=register&ref=ABCD1234
            │
            ▼
  sessionStorage.setItem('referral_code', 'ABCD1234')
            │
            ▼
  Preenche cadastro → POST register-user (com ref_code)
            │
            ▼
  Edge Function register-user:
  1. Cria usuário no auth
  2. Gera code único → insere em referral_codes
  3. Busca referrer por ref_code
  4. Chama process_referral_bonus(referrer_id, new_user_id, email_hash, cpf_hash)
     ├── Verifica hashes existentes
     ├── Se novo: +100 pontos no ledger do referrer, event status='valid'
     └── Se recorrente: event status='recorrencia_detectada', sem pontos
            │
            ▼
  Redireciona → /verifique-seu-email
            │
            ▼
  Confirma e-mail → Login → Dashboard
            │
            ▼
  Dashboard verifica referral_welcome_shown
  ├── Não mostrado: exibe modal com link, marca como shown
  └── Já mostrado: segue normal
```

---

## Arquivos a Criar/Modificar

**Novos:**
- `supabase/migrations/20260220000001_referral_system.sql` — tabelas + RPC + RLS + trigger
- `supabase/functions/register-user/index.ts` — substituição completa (adiciona ref_code)
- `src/components/referral/ReferralWelcomeModal.tsx` — modal de boas-vindas
- `src/pages/Referral.tsx` — tela "Indique e Ganhe"
- `src/integrations/supabase/referral.ts` — funções de integração

**Modificados:**
- `src/pages/Auth.tsx` — captura `ref` da URL e envia no cadastro
- `src/pages/Dashboard.tsx` — renderiza `ReferralWelcomeModal`
- `src/pages/Profile.tsx` — adiciona item "Indique e Ganhe" no menu
- `src/App.tsx` — adiciona rota `/profile/referral`

---

## Garantias de Segurança e Integridade

- Hashes SHA-256 de email e CPF: dados sensíveis nunca em texto claro no banco.
- Operação transacional via `process_referral_bonus` (SECURITY DEFINER): impossível criar pontos sem inserir o evento correspondente.
- `UNIQUE CONSTRAINT` em `referral_codes.code` + `referral_codes.user_id`: sem duplicatas.
- `referral_events` sem FK com CASCADE para `auth.users`: registros sobrevivem à exclusão de conta.
- Falha na indicação **não** impede o cadastro: bloco `try/catch` isolado na Edge Function.
- `referral_welcome_shown` com PK em `user_id`: modal exibido exatamente uma vez.
