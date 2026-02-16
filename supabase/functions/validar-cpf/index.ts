import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

const isValidCpfAlgorithm = (cpf: string): boolean => {
  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const digits = cpf.split("").map(Number);
  const fv = (digits.slice(0, 9).reduce((a, d, i) => a + d * (10 - i), 0) * 10) % 11;
  if ((fv === 10 ? 0 : fv) !== digits[9]) return false;
  const sv = (digits.slice(0, 10).reduce((a, d, i) => a + d * (11 - i), 0) * 10) % 11;
  return (sv === 10 ? 0 : sv) === digits[10];
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
    const { valor } = await req.json();
    const digits = String(valor ?? "").replace(/\D/g, "");

    if (digits.length !== 11) {
      return jsonResponse({ erro: "cpf_invalido" }, 400);
    }

    // Validate CPF algorithm before checking uniqueness
    if (!isValidCpfAlgorithm(digits)) {
      return jsonResponse({ erro: "cpf_invalido_algoritmo" }, 400);
    }

    const { data, error } = await supabase.rpc("is_unique_field_available", {
      field_type: "cpf",
      field_value: digits,
    });

    if (error) {
      console.error("Erro ao validar CPF:", error);
      return new Response("Erro ao validar", {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (data === true) {
      return jsonResponse({ disponivel: true }, 200);
    }

    return jsonResponse({ disponivel: false }, 200);
  } catch (error) {
    console.error("Erro inesperado:", error);
    return new Response("Erro inesperado", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
