import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Envia push notification (FCM HTTP v1) para todos os dispositivos de um usuário.
// Body: { user_id: string, title: string, body?: string, data?: Record<string,string> }

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: Record<string, string>): Promise<string> {
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: FCM_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned =
    b64url(enc.encode(JSON.stringify(header))) + "." + b64url(enc.encode(JSON.stringify(claim)));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsigned)),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "grant_type=" +
      encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") +
      "&assertion=" +
      jwt,
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("Falha no OAuth: " + JSON.stringify(json));
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405 });
  }
  try {
    const payload = await req.json();
    // Aceita chamada direta {user_id,title,body,data} OU payload de Database
    // Webhook (INSERT em public.notifications → record.user_id/title/message).
    let user_id: string, title: string, body: string | undefined, data: Record<string, unknown> | undefined;
    if (payload && payload.record) {
      user_id = payload.record.user_id;
      title = payload.record.title;
      body = payload.record.message;
      data = { notification_id: String(payload.record.id ?? ""), tipo: String(payload.record.tipo ?? "") };
    } else {
      ({ user_id, title, body, data } = payload);
    }
    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: "user_id e title são obrigatórios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const saRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!saRaw) {
      return new Response(
        JSON.stringify({ error: "FIREBASE_SERVICE_ACCOUNT não configurado" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    const sa = JSON.parse(saRaw) as Record<string, string>;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tokens, error } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", user_id);
    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "sem dispositivos" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken(sa);
    const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    let sent = 0;
    const invalid: string[] = [];
    for (const t of tokens) {
      const message = {
        message: {
          token: t.token,
          notification: { title, body: body ?? "" },
          data: data
            ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
            : undefined,
          android: {
            priority: "high",
            notification: {
              icon: "ic_stat_notify",
            },
          },
          apns: { headers: { "apns-priority": "10" } },
        },
      };
      const r = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      if (r.ok) {
        sent++;
      } else {
        const err = await r.json().catch(() => ({}));
        const code = err?.error?.details?.[0]?.errorCode || err?.error?.status;
        if (r.status === 404 || code === "UNREGISTERED" || code === "INVALID_ARGUMENT") {
          invalid.push(t.token);
        }
      }
    }

    // limpa tokens inválidos/expirados
    if (invalid.length) {
      await supabase.from("device_tokens").delete().in("token", invalid);
    }

    return new Response(JSON.stringify({ sent, invalid: invalid.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
