import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  // Validate caller is admin
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

  // Resolve caller role internally
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !roleData) {
    console.error("Erro ao validar permissão:", roleError);
    return jsonResponse({ error: "Apenas administradores podem excluir contas de outros usuários." }, 403);
  }

  // Get target user ID from request body
  let targetUserId: string;
  try {
    const body = await req.json();
    targetUserId = body.target_user_id;
  } catch {
    return jsonResponse({ error: "Corpo da requisição inválido." }, 400);
  }

  if (!targetUserId) {
    return jsonResponse({ error: "ID do usuário alvo é obrigatório." }, 400);
  }

  // Prevent admin from deleting themselves via this endpoint
  if (targetUserId === userData.user.id) {
    return jsonResponse({ error: "Use o endpoint de exclusão de conta própria." }, 400);
  }

  try {
    // Get profile data for avatar cleanup
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (profileError) {
      console.warn("Erro ao buscar avatar:", profileError.message);
    }

    // Delete avatar from storage
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
      .eq("user_id", targetUserId);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    // Delete user roles
    const { error: roleDeleteError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId);

    if (roleDeleteError) {
      console.warn("Erro ao remover roles:", roleDeleteError.message);
    }

    // Anonymize redemption delivery addresses
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
      .eq("user_id", targetUserId);

    if (redemptionUpdateError) {
      console.warn("Erro ao limpar endereços de resgate:", redemptionUpdateError.message);
    }

    // Delete user from auth.users to allow re-registration with same email/cpf/phone
    const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (userDeleteError) {
      console.warn("Erro ao deletar usuário do auth:", userDeleteError.message);
    }

    // Log admin action
    await supabaseUser.rpc("log_admin_action", {
      p_action: "delete_user",
      p_target_table: "profiles",
      p_target_id: targetUserId,
      p_details: {
        deleted_by: userData.user.id,
        timestamp: new Date().toISOString(),
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return jsonResponse({ error: "Erro ao excluir conta" }, 500);
  }
});
