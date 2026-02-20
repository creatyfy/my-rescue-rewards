import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const payloadSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório.").max(200),
  message: z.string().trim().min(1, "Mensagem é obrigatória.").max(1000),
  store_id: z.string().uuid().nullable().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Authenticate caller via JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Não autenticado." }, 401);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: { user }, error: authError } = await callerClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: "Não autenticado." }, 401);
  }

  // Verify admin role via RPC
  const { data: isAdmin, error: roleError } = await callerClient.rpc("is_admin");
  if (roleError || !isAdmin) {
    return jsonResponse({ error: "Acesso restrito a administradores." }, 403);
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Corpo da requisição inválido." }, 400);
  }

  const validation = payloadSchema.safeParse(body);
  if (!validation.success) {
    return jsonResponse({ error: validation.error.errors[0].message }, 400);
  }

  const { title, message, store_id } = validation.data;

  // Use service role for bulk operations
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Fetch all active user IDs from profiles and optionally the store name
  const [profilesResult, storeResult] = await Promise.all([
    adminClient.from("profiles").select("user_id"),
    store_id
      ? adminClient.from("establishments").select("name").eq("id", store_id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (profilesResult.error) {
    console.error("Erro ao buscar usuários:", profilesResult.error);
    return jsonResponse({ error: "Erro ao buscar usuários ativos." }, 500);
  }

  const userIds: string[] = (profilesResult.data ?? []).map((p: { user_id: string }) => p.user_id);

  if (userIds.length === 0) {
    return jsonResponse({ error: "Nenhum usuário ativo encontrado." }, 400);
  }

  // Build notification message enriched with store name when available
  const storeName: string | null = storeResult.data?.name ?? null;
  const notificationMessage = storeName
    ? `[${storeName}] ${message}`
    : message;

  // Save campaign record first
  const { data: campaign, error: campaignError } = await adminClient
    .from("campaigns")
    .insert({
      title,
      message,
      store_id: store_id ?? null,
      admin_id: user.id,
      status: "disparada",
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    console.error("Erro ao salvar campanha:", campaignError);
    return jsonResponse({ error: "Erro ao salvar campanha." }, 500);
  }

  // Respond immediately so HTTP request is not blocked
  const responseBody = JSON.stringify({
    success: true,
    campaign_id: campaign.id,
    recipients: userIds.length,
  });

  // Dispatch notifications asynchronously using EdgeRuntime.waitUntil if available,
  // otherwise fire-and-forget via Promise (Deno Deploy supports this pattern)
  const dispatchNotifications = async () => {
    const notifications = userIds.map((uid) => ({
      user_id: uid,
      title,
      message: notificationMessage,
      tipo: "campanha_promocional" as const,
      is_read: false,
      arquivada: false,
    }));

    // Insert in batches of 500 to stay within limits
    const batchSize = 500;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error: insertError } = await adminClient
        .from("notifications")
        .insert(batch);
      if (insertError) {
        console.error(`Erro ao inserir lote de notificações (offset ${i}):`, insertError);
      } else {
        console.log(`Lote ${i / batchSize + 1} enviado: ${batch.length} notificações`);
      }
    }

    console.log(`Campanha ${campaign.id} disparada para ${userIds.length} usuários.`);
  };

  // Use EdgeRuntime.waitUntil when available (Supabase Deno Deploy)
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime;
  if (runtime?.waitUntil) {
    runtime.waitUntil(dispatchNotifications());
  } else {
    // Fallback: fire-and-forget (still async, won't block response)
    dispatchNotifications().catch((e) => console.error("Dispatch error:", e));
  }

  return new Response(responseBody, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
