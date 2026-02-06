import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { fileTypeFromBuffer } from "https://esm.sh/file-type@19.6.0";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

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
  if (mimeType === "image/webp") return "webp";
  return "jpg";
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
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
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

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin" as never);
  if (adminError || !isAdmin) {
    return jsonResponse({ error: "Permissão negada." }, 403);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonResponse({ error: "Payload multipart inválido." }, 400);
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

  const detectedType = await fileTypeFromBuffer(fileBuffer);
  if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType.mime)) {
    return jsonResponse({ error: "Tipo de arquivo inválido. Apenas PNG, JPG e WebP são permitidos." }, 400);
  }

  const declaredMime = fileEntry.type?.toLowerCase();
  if (declaredMime && !ALLOWED_MIME_TYPES.has(declaredMime)) {
    return jsonResponse({ error: "MIME type declarado é inválido. Apenas PNG, JPG e WebP são permitidos." }, 400);
  }

  const extension = getExtensionFromMime(detectedType.mime);
  const filePath = `products/${crypto.randomUUID()}.${extension}`;

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabaseAdmin.storage
    .from("products")
    .upload(filePath, fileBuffer, {
      contentType: detectedType.mime,
      upsert: false,
    });

  if (error) {
    return jsonResponse({ error: "Não foi possível salvar a imagem." }, 400);
  }

  return jsonResponse({ success: true, path: data.path, message: "Upload realizado com sucesso." }, 200);
});
