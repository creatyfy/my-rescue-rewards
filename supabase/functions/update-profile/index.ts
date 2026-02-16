import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

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

const profileSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(3, "Nome deve ter no mínimo 3 caracteres.")
      .max(100, "Nome deve ter no máximo 100 caracteres.")
      .optional(),
    phone: z
      .string()
      .regex(/^\d{12,13}$/, "Telefone inválido. Formato esperado: 55 + DDD + número.")
      .optional(),
    avatar_url: z
      .string()
      .url("URL do avatar inválida.")
      .max(500, "URL do avatar muito longa.")
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

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return jsonResponse({ errors: ["Token de autenticação ausente."] }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
    return jsonResponse({ errors: ["Configuração do servidor inválida."] }, 500);
  }

  // Validate user with anon key + auth header
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ errors: ["Usuário não autenticado."] }, 401);
  }

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return jsonResponse({ errors: ["Payload JSON inválido."] }, 400);
  }

  const result = profileSchema.safeParse(parsedBody);
  if (!result.success) {
    return jsonResponse(
      {
        errors: result.error.issues.map((i) =>
          i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message,
        ),
      },
      400,
    );
  }

  const updates = result.data;

  if (Object.keys(updates).length === 0) {
    return jsonResponse({ errors: ["Nenhum campo para atualizar."] }, 400);
  }

  // Use service role to update profile
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const payload: Record<string, unknown> = {};
  if (updates.full_name !== undefined) payload.full_name = updates.full_name;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;

  const { data, error } = await adminClient
    .from("profiles")
    .update(payload)
    .eq("user_id", userData.user.id)
    .select("full_name, cpf, phone, avatar_url, created_at")
    .single();

  if (error) {
    console.error("Profile update error:", error.message);
    return jsonResponse({ errors: ["Não foi possível atualizar o perfil."] }, 500);
  }

  return jsonResponse({
    success: true,
    profile: data,
  });
});
