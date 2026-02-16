

## Correção do Fluxo de Cadastro de Conta

### Problemas Identificados

1. **Validação de CPF inconsistente entre frontend e backend**: A edge function `validar-cpf` apenas verifica se o CPF ja existe no banco de dados, mas NAO valida se o CPF e matematicamente valido. Isso faz com que o campo mostre "Disponivel" para CPFs invalidos. Porem, na hora de submeter o formulario, a edge function `register-user` valida o algoritmo do CPF via Zod e rejeita o cadastro com erro "cpf invalido pelo algoritmo oficial".

2. **Validacao de CPF no frontend apenas no momento errado**: O formulario nao valida o algoritmo do CPF antes de mostrar "Disponivel". O usuario ve feedback positivo e so descobre que o CPF e invalido apos clicar em "Criar conta".

3. **Mensagem de erro generica**: Quando o cadastro falha, a mensagem de erro vem diretamente do Zod do backend ("cpf: cpf invalido pelo algoritmo oficial"), que nao e amigavel ao usuario.

### Solucao

#### 1. Adicionar validacao de algoritmo de CPF na edge function `validar-cpf`

Antes de verificar unicidade no banco, validar se o CPF passa no algoritmo oficial (mesma logica que ja existe em `register-user`). Retornar erro 400 se o CPF for invalido.

```text
Fluxo atual:    CPF digitado -> verifica unicidade -> "Disponivel"
Fluxo corrigido: CPF digitado -> valida algoritmo -> verifica unicidade -> "Disponivel"
```

#### 2. Adicionar validacao de algoritmo de CPF no frontend (Auth.tsx)

No `handleChange` ou no `shouldValidateField`, antes de chamar a edge function de unicidade, verificar se o CPF passa no algoritmo. Se nao passar, mostrar mensagem de erro inline ("CPF invalido") sem fazer a chamada ao servidor.

#### 3. Tratar erro de CPF invalido na resposta da edge function

Quando `validar-cpf` retornar erro 400 (CPF invalido pelo algoritmo), exibir mensagem clara como "CPF invalido. Verifique os digitos informados." em vez de "Disponivel".

### Arquivos a Modificar

- **`supabase/functions/validar-cpf/index.ts`**: Adicionar funcao `isValidCpf` (mesma do `register-user`) e validar antes de consultar o banco.
- **`src/pages/Auth.tsx`**: Adicionar validacao de algoritmo de CPF no frontend antes de chamar a edge function. Exibir mensagem de erro adequada para CPFs invalidos.

### Detalhes Tecnicos

#### Edge Function `validar-cpf`
- Importar/replicar a funcao `isValidCpf` do `register-user`
- Antes de chamar `supabase.rpc("is_unique_field_available")`, validar o algoritmo
- Retornar `{ erro: "cpf_invalido_algoritmo" }` com status 400 se falhar

#### Frontend `Auth.tsx`
- Criar funcao `isValidCpf` local (ou importar de um utilitario compartilhado)
- No `validateUniqueField` para CPF, verificar algoritmo antes de chamar a edge function
- Se invalido, definir status "invalid" com mensagem "CPF invalido. Verifique os digitos."
- Isso evita chamadas desnecessarias ao servidor

