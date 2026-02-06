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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const payloadSchema = z
  .object({
    email: z
      .string({ required_error: "email é obrigatório." })
      .trim()
      .email("Informe um e-mail válido."),
    turnstileToken: z
      .string()
      .trim()
      .optional(),
    redirectTo: z
      .string()
      .url("redirectTo deve ser uma URL válida.")
      .optional(),
  })
  .strict("Campos extras não são permitidos.");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ errors: ["Método não permitido."] }, 405);
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

  const turnstileResult = await verifyTurnstileToken(
    turnstileToken,
    req.headers.get("CF-Connecting-IP"),
  );

  if (!turnstileResult.success) {
    return jsonResponse({ errors: [turnstileResult.message] }, turnstileResult.status);
  }

  const validation = payloadSchema.safeParse(parsedBody);
  if (!validation.success) {
    return jsonResponse(
      {
        errors: validation.error.issues.map((i) =>
          i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message,
        ),
      },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return jsonResponse({ errors: ["Configuração do servidor inválida."] }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { email, redirectTo } = validation.data;

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || undefined,
  });

  if (error) {
    console.error("Reset password error:", error.message);
    // Always return success to prevent email enumeration
  }

  return jsonResponse({
    success: true,
    message: "Se o e-mail estiver cadastrado, você receberá um link de recuperação.",
  });
});
