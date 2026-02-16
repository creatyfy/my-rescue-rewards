import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { fileTypeFromBuffer } from "https://esm.sh/file-type@19.6.0";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"]);
const MIN_PURCHASE_VALUE = 10;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getExtensionFromMime = (mimeType: string) =>
  mimeType === "image/png" ? "png" : "jpg";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ errors: ["Método não permitido."] }, 405);
  }

  // 1. Auth
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return jsonResponse({ errors: ["Token de autenticação ausente."] }, 401);
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonResponse({ errors: ["Formato inválido. Envie multipart/form-data."] }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ errors: ["Configuração do servidor inválida."] }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ errors: ["Usuário não autenticado."] }, 401);
  }

  // 2. Parse multipart
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonResponse({ errors: ["Payload multipart inválido."] }, 400);
  }

  // 3. Extract fields
  const turnstileToken = formData.get("turnstileToken");
  const qrCodeToken = formData.get("qrCodeToken");
  const purchaseValueRaw = formData.get("purchaseValue");
  const fileEntry = formData.get("file");

  // 4. Validate Turnstile
  const turnstileResult = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
    req.headers.get("CF-Connecting-IP"),
  );
  if (!turnstileResult.success) {
    return jsonResponse({ errors: [turnstileResult.message] }, turnstileResult.status);
  }

  // 5. Validate fields
  const errors: string[] = [];

  if (!qrCodeToken || typeof qrCodeToken !== "string" || !qrCodeToken.trim()) {
    errors.push("QR Code do estabelecimento é obrigatório.");
  }

  const purchaseValue = Number(purchaseValueRaw);
  if (!purchaseValueRaw || isNaN(purchaseValue) || purchaseValue < MIN_PURCHASE_VALUE) {
    errors.push(`Valor mínimo de compra é R$ ${MIN_PURCHASE_VALUE},00.`);
  }

  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    errors.push("Comprovante é obrigatório.");
  }

  if (errors.length > 0) {
    return jsonResponse({ errors }, 400);
  }

  // 6. Validate file
  const file = fileEntry as File;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return jsonResponse({ errors: ["Arquivo excede o limite de 10MB."] }, 413);
  }

  let fileBuffer: Uint8Array;
  try {
    fileBuffer = new Uint8Array(await file.arrayBuffer());
  } catch {
    return jsonResponse({ errors: ["Não foi possível ler o arquivo enviado."] }, 400);
  }

  if (fileBuffer.byteLength === 0) {
    return jsonResponse({ errors: ["Arquivo vazio não é permitido."] }, 400);
  }

  const detectedType = await fileTypeFromBuffer(fileBuffer);
  if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType.mime)) {
    return jsonResponse({ errors: ["Tipo de arquivo inválido. Apenas JPG e PNG são permitidos."] }, 400);
  }

  // 7. Upload to Storage (validated file, skip heavy re-encoding)
  const extension = getExtensionFromMime(detectedType.mime);
  const filePath = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(filePath, fileBuffer, {
      contentType: detectedType.mime,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError.message);
    return jsonResponse({ errors: ["Não foi possível salvar o comprovante."] }, 500);
  }

  // 9. Submit receipt via RPC
  const { data, error: rpcError } = await supabase.rpc("submit_receipt", {
    p_qr_code_token: (qrCodeToken as string).trim(),
    p_purchase_value: purchaseValue,
    p_image_path: filePath,
  });

  if (rpcError) {
    const msg = rpcError.message || "";
    console.error("RPC error:", msg);

    // Clean up orphan file
    await supabase.storage.from("receipts").remove([filePath]).catch(() => {});

    if (msg.includes("invalid establishment token")) {
      return jsonResponse({ errors: ["Estabelecimento inválido."] }, 400);
    }
    if (msg.includes("purchase value below minimum")) {
      return jsonResponse({ errors: ["Valor mínimo de compra é R$ 10,00."] }, 400);
    }

    return jsonResponse({ errors: ["Não foi possível enviar o comprovante."] }, 400);
  }

  const submitted = Array.isArray(data) ? data[0] : null;

  return jsonResponse({
    success: true,
    receipt: {
      protocol_number: submitted?.protocol_number ?? null,
      points_earned: submitted?.points_earned ?? null,
      status: submitted?.status ?? null,
    },
    message: "Comprovante enviado com sucesso.",
  });
});
