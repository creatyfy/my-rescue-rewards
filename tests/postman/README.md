# Testes automatizados de ataques (Postman/Newman)

Esta suíte simula ataques comuns contra as Edge Functions e valida que a API **falha de forma segura**.

## Cenários cobertos

1. Envio de CPF inválido (`register-user`) → esperado `400`
2. Upload de arquivo falso (`.bat` disfarçado como imagem em `upload-receipt`) → esperado `400`
3. Upload acima de 10MB (`upload-receipt`) → esperado `413`
4. Manipulação de pontos (`submit-receipt` com campo extra `points_earned`) → esperado `400`
5. Tentativa de acesso admin por usuário comum (`admin-delete-user`) → esperado `403`
6. Loop de envio de comprovantes (`submit-receipt` repetido) → esperado `409` ou `429`

## Como executar

```bash
npm run postman:fixtures
npm run test:security:postman
```

## Pré-requisitos

- Projeto Supabase ativo e acessível
- Tokens válidos preenchidos no arquivo de environment
- Arquivo de environment: `tests/postman/security-attacks.postman_environment.json`

> Dica: duplique o arquivo de environment para uso local (ex.: `security-attacks.local.postman_environment.json`) e preencha os valores sensíveis sem commitar tokens reais.
