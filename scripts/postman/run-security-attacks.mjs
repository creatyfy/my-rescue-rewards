import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFile = process.argv[2] ?? 'tests/postman/security-attacks.postman_environment.json';
const environment = JSON.parse(readFileSync(resolve(envFile), 'utf8'));
const envMap = new Map(environment.values.map((v) => [v.key, process.env[v.key] || v.value]));

const required = ['BASE_URL', 'USER_TOKEN', 'NON_ADMIN_TOKEN', 'TARGET_USER_ID', 'QR_TOKEN', 'USER_RECEIPT_PATH', 'TURNSTILE_TOKEN'];
const missing = required.filter((key) => !envMap.get(key));
if (missing.length > 0) {
  console.error(`Variáveis ausentes: ${missing.join(', ')}`);
  process.exit(1);
}

const baseUrl = envMap.get('BASE_URL');
const jsonHeaders = { 'Content-Type': 'application/json' };

const results = [];

const assertStatus = async (name, response, expectedStatuses) => {
  const ok = expectedStatuses.includes(response.status);
  const body = await response.text();
  results.push({ name, status: response.status, expectedStatuses, ok, body });
};

// 1) CPF inválido
await assertStatus(
  'CPF inválido',
  await fetch(`${baseUrl}/functions/v1/register-user`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      full_name: 'Ataque CPF',
      email: `cpf.invalido+${Date.now()}@example.com`,
      cpf: '12345678900',
      phone: '11999999999',
      password: 'Teste@123456',
    }),
  }),
  [400],
);

// 2) Upload falso
{
  const buffer = readFileSync(resolve(envMap.get('FAKE_BAT_FILE_PATH')));
  const form = new FormData();
  form.set('file', new File([buffer], 'fake-receipt.jpg', { type: 'image/jpeg' }));

  await assertStatus(
    'Upload falso (.bat disfarçado)',
    await fetch(`${baseUrl}/functions/v1/upload-receipt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${envMap.get('USER_TOKEN')}` },
      body: form,
    }),
    [400],
  );
}

// 3) Upload > 10MB
{
  const buffer = readFileSync(resolve(envMap.get('OVERSIZED_FILE_PATH')));
  const form = new FormData();
  form.set('file', new File([buffer], 'oversized-receipt.jpg', { type: 'image/jpeg' }));

  await assertStatus(
    'Upload acima de 10MB',
    await fetch(`${baseUrl}/functions/v1/upload-receipt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${envMap.get('USER_TOKEN')}` },
      body: form,
    }),
    [413],
  );
}

// 4) Manipulação de pontos
await assertStatus(
  'Manipulação de pontos',
  await fetch(`${baseUrl}/functions/v1/submit-receipt`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${envMap.get('USER_TOKEN')}`,
    },
    body: JSON.stringify({
      qrCodeToken: envMap.get('QR_TOKEN'),
      purchaseValue: 1.99,
      receiptPath: envMap.get('USER_RECEIPT_PATH'),
      turnstileToken: envMap.get('TURNSTILE_TOKEN'),
      points_earned: 999999,
    }),
  }),
  [400],
);

// 5) Acesso admin indevido
await assertStatus(
  'Acesso admin por usuário comum',
  await fetch(`${baseUrl}/functions/v1/admin-delete-user`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${envMap.get('NON_ADMIN_TOKEN')}`,
    },
    body: JSON.stringify({ target_user_id: envMap.get('TARGET_USER_ID') }),
  }),
  [403],
);

// 6) Loop de envio de comprovantes
const loopAttempts = Number(envMap.get('LOOP_ATTEMPTS') || 5);
for (let attempt = 1; attempt <= loopAttempts; attempt += 1) {
  await assertStatus(
    `Loop comprovantes #${attempt}`,
    await fetch(`${baseUrl}/functions/v1/submit-receipt`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${envMap.get('USER_TOKEN')}`,
      },
      body: JSON.stringify({
        qrCodeToken: envMap.get('QR_TOKEN'),
        purchaseValue: 89.9,
        receiptPath: envMap.get('USER_RECEIPT_PATH'),
        turnstileToken: envMap.get('TURNSTILE_TOKEN'),
      }),
    }),
    [409, 429],
  );
}

let hasFailure = false;
for (const item of results) {
  if (item.ok) {
    console.log(`✅ ${item.name}: status ${item.status}`);
  } else {
    hasFailure = true;
    console.error(`❌ ${item.name}: status ${item.status}, esperado ${item.expectedStatuses.join(' ou ')}`);
    console.error(`   body: ${item.body}`);
  }
}

if (hasFailure) {
  process.exit(1);
}
