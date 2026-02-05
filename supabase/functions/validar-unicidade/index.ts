import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

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

  try {
    const { tipo, valor } = await req.json();
    const normalizedType = String(tipo ?? "").trim().toLowerCase();

    if (!["cpf", "email", "telefone"].includes(normalizedType)) {
      return jsonResponse({ erro: "tipo_invalido" }, 400);
    }

    const { data, error } = await supabase.rpc("is_unique_field_available", {
      field_type: normalizedType,
      field_value: valor ?? "",
    });

    if (error) {
      console.error("Erro ao validar unicidade:", error);
      return jsonResponse({ erro: "falha_validacao" }, 500);
    }

    if (data === true) {
      return jsonResponse({ disponivel: true }, 200);
    }

    return jsonResponse({ disponivel: false }, 409);
  } catch (error) {
    console.error("Erro inesperado:", error);
    return jsonResponse({ erro: "falha_inesperada" }, 500);
  }
});
