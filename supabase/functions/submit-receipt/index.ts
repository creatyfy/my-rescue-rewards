import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const payloadSchema = z
  .object({
    qrCodeToken: z.string({ required_error: "qrCodeToken é obrigatório." }).trim().min(1),
    purchaseValue: z.number({ required_error: "purchaseValue é obrigatório." }).positive(),
    receiptPath: z.string({ required_error: "receiptPath é obrigatório." }).trim().min(1),
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

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return jsonResponse({ errors: ["Token de autenticação ausente."] }, 401);
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

  const validationResult = payloadSchema.safeParse(parsedBody);
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
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ errors: ["Usuário não autenticado."] }, 401);
  }

  const { qrCodeToken, purchaseValue, receiptPath } = validationResult.data;

  const userId = userData.user.id;
  const normalizedReceiptPath = receiptPath.trim();
  if (!normalizedReceiptPath.startsWith(`${userId}/`)) {
    return jsonResponse({ errors: ["Comprovante inválido para o usuário autenticado."] }, 400);
  }

  const { data: receiptFile, error: downloadError } = await supabase.storage
    .from("receipts")
    .download(normalizedReceiptPath);

  if (downloadError || !receiptFile) {
    return jsonResponse({ errors: ["Não foi possível validar o comprovante enviado."] }, 400);
  }

  const receiptFingerprint = toHex(
    await crypto.subtle.digest("SHA-256", await receiptFile.arrayBuffer()),
  );

  const { data, error } = await supabase.rpc("submit_receipt" as never, {
    p_qr_code_token: qrCodeToken,
    p_purchase_value: purchaseValue,
    p_receipt_image_url: normalizedReceiptPath,
    p_receipt_fingerprint: receiptFingerprint,
  } as never);

  if (error) {
    const message = error.message || "Erro ao enviar comprovante.";
    if (message.includes("duplicate_receipt")) {
      return jsonResponse({ errors: ["Comprovante já enviado."] }, 409);
    }

    if (message.includes("rate_limit_")) {
      return jsonResponse({ errors: ["Muitas tentativas. Tente novamente em alguns minutos."] }, 429);
    }

    return jsonResponse({ errors: ["Não foi possível enviar o comprovante."] }, 400);
  }

  const submitted = Array.isArray(data) ? data[0] : null;

  return jsonResponse(
    {
      success: true,
      receipt: {
        protocol_number:
          submitted && typeof submitted === "object" && "protocol_number" in submitted
            ? (submitted as { protocol_number?: string }).protocol_number ?? null
            : null,
        points_earned:
          submitted && typeof submitted === "object" && "points_earned" in submitted
            ? (submitted as { points_earned?: number }).points_earned ?? null
            : null,
        status:
          submitted && typeof submitted === "object" && "status" in submitted
            ? (submitted as { status?: string }).status ?? null
            : null,
      },
      message: "Comprovante enviado com sucesso.",
    },
    200,
  );
});
