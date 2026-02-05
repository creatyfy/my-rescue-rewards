import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fileTypeFromBuffer } from "https://esm.sh/file-type@19.6.0";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const getExtensionFromMime = (mimeType: string) => {
  if (mimeType === "image/png") return "png";
  return "jpg";
};

const hasExternalReference = (formData: FormData) => {
  const blockedFields = ["url", "link", "fileUrl", "receiptUrl", "receiptPath", "path"];

  for (const field of blockedFields) {
    const value = formData.get(field);
    if (typeof value === "string" && /https?:\/\/|:\/\//i.test(value)) {
      return true;
    }
  }

  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido. Use POST." }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return jsonResponse({ error: "Token de autenticação ausente." }, 401);
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonResponse({ error: "Formato inválido. Envie multipart/form-data." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Configuração do servidor inválida." }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: "Usuário não autenticado." }, 401);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonResponse({ error: "Payload multipart inválido." }, 400);
  }

  if (hasExternalReference(formData)) {
    return jsonResponse({ error: "Links ou referências externas não são permitidos." }, 400);
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return jsonResponse({ error: "Arquivo inválido. Envie o campo 'file'." }, 400);
  }

  if (fileEntry.size === 0) {
    return jsonResponse({ error: "Arquivo vazio não é permitido." }, 400);
  }

  if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
    return jsonResponse({ error: "Arquivo excede o limite de 10MB." }, 413);
  }

  let fileBuffer: Uint8Array;
  try {
    fileBuffer = new Uint8Array(await fileEntry.arrayBuffer());
  } catch {
    return jsonResponse({ error: "Não foi possível ler o arquivo enviado." }, 400);
  }

  if (fileBuffer.byteLength === 0) {
    return jsonResponse({ error: "Arquivo vazio não é permitido." }, 400);
  }

  if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
    return jsonResponse({ error: "Arquivo excede o limite de 10MB." }, 413);
  }

  const detectedType = await fileTypeFromBuffer(fileBuffer);
  if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType.mime)) {
    return jsonResponse({ error: "Tipo de arquivo inválido. Apenas PNG, JPG e JPEG são permitidos." }, 400);
  }

  const declaredMime = fileEntry.type?.toLowerCase();
  if (declaredMime && !ALLOWED_MIME_TYPES.has(declaredMime)) {
    return jsonResponse({ error: "MIME type declarado é inválido. Apenas PNG, JPG e JPEG são permitidos." }, 400);
  }

  let processedImage: Uint8Array;
  try {
    const decoded = await Image.decode(fileBuffer);
    processedImage = detectedType.mime === "image/png"
      ? await decoded.encode()
      : await decoded.encodeJPEG(90);
  } catch {
    return jsonResponse({ error: "Falha ao processar imagem. Envie uma imagem válida." }, 400);
  }

  if (processedImage.byteLength === 0) {
    return jsonResponse({ error: "Falha ao processar imagem enviada." }, 400);
  }

  if (processedImage.byteLength > MAX_FILE_SIZE_BYTES) {
    return jsonResponse({ error: "Imagem processada excede o limite de 10MB." }, 413);
  }

  const extension = getExtensionFromMime(detectedType.mime);
  const filePath = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from("receipts")
    .upload(filePath, processedImage, {
      contentType: detectedType.mime,
      upsert: false,
    });

  if (error) {
    return jsonResponse({ error: `Erro ao salvar comprovante: ${error.message}` }, 400);
  }

  return jsonResponse({ path: data.path, message: "Upload realizado com sucesso." }, 200);
});
