import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const MAX_BODY_SIZE = 10_000;

const readBodyWithLimit = async (
  req: Request,
): Promise<{ ok: true; bodyText: string } | { ok: false; response: Response }> => {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return {
      ok: false,
      response: jsonResponse({ errors: ["Payload excede o limite permitido."] }, 413),
    };
  }

  if (!req.body) {
    return {
      ok: false,
      response: jsonResponse({ errors: ["Payload ausente."] }, 400),
    };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      total += value.length;
      if (total > MAX_BODY_SIZE) {
        return {
          ok: false,
          response: jsonResponse({ errors: ["Payload excede o limite permitido."] }, 413),
        };
      }
      chunks.push(value);
    }
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  return {
    ok: true,
    bodyText: new TextDecoder().decode(buffer),
  };
};

const cpfDigitsOnlyRegex = /^\d{11}$/;
const phoneDigitsOnlyRegex = /^\d{10,11}$/;

const isValidCpf = (cpf: string) => {
  if (!cpfDigitsOnlyRegex.test(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  const firstVerifier =
    (digits
      .slice(0, 9)
      .reduce((acc, digit, index) => acc + digit * (10 - index), 0) *
      10) %
    11;
  const firstDigit = firstVerifier === 10 ? 0 : firstVerifier;

  if (firstDigit !== digits[9]) {
    return false;
  }

  const secondVerifier =
    (digits
      .slice(0, 10)
      .reduce((acc, digit, index) => acc + digit * (11 - index), 0) *
      10) %
    11;
  const secondDigit = secondVerifier === 10 ? 0 : secondVerifier;

  return secondDigit === digits[10];
};

const registerPayloadSchema = z
  .object({
    turnstileToken: z
      .string({ required_error: "turnstileToken é obrigatório." })
      .trim()
      .min(1, "turnstileToken é obrigatório."),
    full_name: z
      .string({ required_error: "full_name é obrigatório." })
      .trim()
      .min(3, "full_name deve ter no mínimo 3 caracteres.")
      .max(100, "full_name deve ter no máximo 100 caracteres."),
    email: z
      .string({ required_error: "email é obrigatório." })
      .trim()
      .email("email deve estar em um formato válido."),
    cpf: z
      .string({ required_error: "cpf é obrigatório." })
      .trim()
      .regex(cpfDigitsOnlyRegex, "cpf deve conter apenas números e 11 dígitos.")
      .refine(isValidCpf, "cpf inválido pelo algoritmo oficial."),
    phone: z
      .string({ required_error: "phone é obrigatório." })
      .trim()
      .regex(phoneDigitsOnlyRegex, "phone deve conter apenas números com 10 ou 11 dígitos."),
    password: z
      .string({ required_error: "password é obrigatório." })
      .min(6, "password deve ter no mínimo 6 caracteres."),
  })
  .strict("Campos extras não são permitidos.");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Método não permitido", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const bodyReadResult = await readBodyWithLimit(req);
  if (!bodyReadResult.ok) {
    return bodyReadResult.response;
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(bodyReadResult.bodyText);
  } catch {
    return jsonResponse({ errors: ["Payload JSON inválido."] }, 400);
  }

  const turnstileToken =
    typeof parsedBody === "object" && parsedBody !== null && "turnstileToken" in parsedBody
      ? (parsedBody as { turnstileToken?: string }).turnstileToken
      : undefined;

  const turnstileValidation = await verifyTurnstileToken(
    turnstileToken,
    req.headers.get("CF-Connecting-IP"),
  );

  if (!turnstileValidation.success) {
    return jsonResponse({ errors: [turnstileValidation.message] }, turnstileValidation.status);
  }

  const validationResult = registerPayloadSchema.safeParse(parsedBody);
  if (!validationResult.success) {
    return jsonResponse(
      {
        errors: validationResult.error.issues.map((issue) =>
          issue.path.length > 0
            ? `${issue.path.join(".")}: ${issue.message}`
            : issue.message,
        ),
      },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return jsonResponse({ errors: ["Configuração do servidor inválida."] }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const { full_name, email, cpf, phone, password } = validationResult.data;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: {
      full_name,
      cpf,
      phone: `55${phone}`,
    },
  });

  if (error) {
    console.error("Erro ao criar usuário:", error);
    return jsonResponse({ errors: ["Não foi possível concluir o cadastro."] }, 400);
  }

  // Send confirmation email via anon-key client
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (supabaseAnonKey) {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    const { error: resendError } = await anonClient.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: "https://my-rescue-rewards.lovable.app/auth?confirmed=true",
      },
    });
    if (resendError) {
      console.warn("Erro ao enviar e-mail de confirmação:", resendError.message);
    }
  }

  return jsonResponse(
    {
      success: true,
      message: "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta.",
    },
    201,
  );
});
