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

const loginPayloadSchema = z
  .object({
    email: z
      .string({ required_error: "email é obrigatório." })
      .trim()
      .email("email deve estar em um formato válido."),
    password: z
      .string({ required_error: "password é obrigatório." })
      .min(6, "password deve ter no mínimo 6 caracteres."),
    turnstileToken: z
      .string({ required_error: "turnstileToken é obrigatório." })
      .trim()
      .min(1, "turnstileToken é obrigatório."),
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

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
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

  const validationResult = loginPayloadSchema.safeParse(parsedBody);
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
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables.");
    return jsonResponse({ errors: ["Configuração do servidor inválida."] }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { email, password } = validationResult.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return jsonResponse({ errors: ["Credenciais inválidas."] }, 401);
  }

  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut();
    return jsonResponse(
      {
        errors: ["Seu cadastro está aguardando confirmação de e-mail."],
      },
      403,
    );
  }

  return jsonResponse(
    {
      success: true,
      message: "Login realizado com sucesso.",
    },
    200,
  );
});
