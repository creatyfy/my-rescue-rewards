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

    if (!tipo) {
      return new Response("Tipo inválido", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data, error } = await supabase.rpc("is_unique_field_available", {
      field_type: tipo,
      field_value: valor ?? "",
    });

    if (error) {
      console.error("Erro ao validar unicidade:", error);
      return new Response("Erro ao validar", {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ disponivel: data === true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erro inesperado:", error);
    return new Response("Erro inesperado", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
