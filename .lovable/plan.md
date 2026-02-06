

## Configurar Cloudflare Turnstile para proteção CAPTCHA

Para ativar a verificação de segurança (CAPTCHA) no seu app, precisamos configurar duas chaves do Cloudflare Turnstile:

1. **VITE_TURNSTILE_SITE_KEY** -- chave publica, usada no frontend (navegador do usuario)
2. **TURNSTILE_SECRET_KEY** -- chave secreta, usada no backend (funcoes do servidor)

---

### Como obter as chaves

1. Acesse [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) e crie uma conta gratuita (ou faca login se ja tiver).
2. No painel da Cloudflare, va em **Turnstile** no menu lateral.
3. Clique em **Add site**.
4. Preencha:
   - **Site name**: nome do seu app (ex: "Meu Resgate Rewards")
   - **Domain**: `my-rescue-rewards.lovable.app` (adicione tambem `lovableproject.com` para o ambiente de testes)
   - **Widget Mode**: escolha "Managed" (recomendado) ou "Invisible"
5. Apos criar, voce recebera:
   - **Site Key** (chave do site) -- essa e a `VITE_TURNSTILE_SITE_KEY`
   - **Secret Key** (chave secreta) -- essa e a `TURNSTILE_SECRET_KEY`

---

### O que sera configurado

| Chave | Onde | Tipo |
|-------|------|------|
| `VITE_TURNSTILE_SITE_KEY` | Codigo fonte (`.env`) | Publica -- visivel no navegador |
| `TURNSTILE_SECRET_KEY` | Backend (secret seguro) | Secreta -- nunca exposta ao usuario |

---

### Etapas de implementacao

1. **Adicionar `TURNSTILE_SECRET_KEY`** como secret seguro no backend (usando a ferramenta de secrets do Lovable Cloud).
2. **Adicionar `VITE_TURNSTILE_SITE_KEY`** no codigo fonte, pois e uma chave publica que precisa estar acessivel ao navegador.
3. **Verificar** que os fluxos de login, cadastro, reset de senha e alteracao de senha funcionam com o CAPTCHA ativo.

---

### Detalhes tecnicos

- A chave publica (`VITE_TURNSTILE_SITE_KEY`) sera adicionada ao arquivo `.env` como variavel `VITE_` para que o Vite a exponha ao frontend. Como e uma chave publica (publishable), e seguro armazena-la no codigo.
- A chave secreta (`TURNSTILE_SECRET_KEY`) sera armazenada como secret do backend, acessivel apenas pelas Edge Functions.
- O codigo atual ja esta preparado: o widget Turnstile so renderiza quando `VITE_TURNSTILE_SITE_KEY` existe, e o backend so valida o token quando `TURNSTILE_SECRET_KEY` esta configurada. Basta fornecer as chaves para ativar tudo automaticamente.

