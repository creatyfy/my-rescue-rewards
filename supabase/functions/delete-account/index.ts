import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
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

const getAvatarPathFromUrl = (avatarUrl: string | null) => {
  if (!avatarUrl) {
    return null;
  }

  const marker = "/avatars/";
  const index = avatarUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return avatarUrl.slice(index + marker.length);
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

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return new Response("Não autenticado", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data: userData, error: userError } = await supabaseUser.auth.getUser();

  if (userError || !userData?.user) {
    console.error("Erro ao validar usuário:", userError);
    return new Response("Não autenticado", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const userId = userData.user.id;

  try {
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.warn("Erro ao buscar avatar:", profileError.message);
    }

    const avatarPath = getAvatarPathFromUrl(profileData?.avatar_url ?? null);
    if (avatarPath) {
      const { error: deleteError } = await supabaseAdmin.storage
        .from("avatars")
        .remove([avatarPath]);

      if (deleteError) {
        console.warn("Erro ao remover avatar:", deleteError.message);
      }
    }

    // Delete profile record (this will hide user from admin panel via INNER JOIN)
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    const { error: roleDeleteError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (roleDeleteError) {
      console.warn("Erro ao remover roles:", roleDeleteError.message);
    }

    const { error: redemptionUpdateError } = await supabaseAdmin
      .from("redemptions")
      .update({
        delivery_cep: null,
        delivery_address: null,
        delivery_number: null,
        delivery_neighborhood: null,
        delivery_city: null,
        delivery_state: null,
      })
      .eq("user_id", userId);

    if (redemptionUpdateError) {
      console.warn("Erro ao limpar endereços de resgate:", redemptionUpdateError.message);
    }

    // Delete user from auth.users — frees up email, CPF and phone for re-registration
    const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (userDeleteError) {
      throw new Error(`Erro ao deletar usuário do auth: ${userDeleteError.message}`);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return new Response("Erro ao excluir conta", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
