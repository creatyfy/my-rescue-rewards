import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Envia push para todos os dispositivos de um usuário.
// Android -> FCM (HTTP v1). iOS -> APNs (HTTP/2) direto.
// Body: { user_id, title, body?, data? }  OU  payload de Database Webhook.

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const APNS_BUNDLE_ID = "br.com.meuresgate.app";

// ---------- utils ----------
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

// ---------- FCM (Android) ----------
async function getFcmAccessToken(sa: Record<string, string>): Promise<string> {
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
      "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") +
      "&assertion=" + jwt,
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("Falha no OAuth FCM: " + JSON.stringify(json));
  return json.access_token as string;
}

// ---------- APNs (iOS) ----------
async function makeApnsJwt(): Promise<string> {
  const keyId = Deno.env.get("APNS_KEY_ID");
  const teamId = Deno.env.get("APNS_TEAM_ID");
  const p8 = Deno.env.get("APNS_AUTH_KEY");
  if (!keyId || !teamId || !p8) throw new Error("APNS_KEY_ID/APNS_TEAM_ID/APNS_AUTH_KEY ausentes");
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId };
  const claim = { iss: teamId, iat: now };
  const unsigned =
    b64url(enc.encode(JSON.stringify(header))) + "." + b64url(enc.encode(JSON.stringify(claim)));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(p8),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(unsigned)),
  );
  return `${unsigned}.${b64url(sig)}`;
}

async function sendApns(
  jwt: string, token: string, title: string, body: string,
  data: Record<string, string> | undefined, host: string,
): Promise<Response> {
  const payload = {
    aps: { alert: { title, body }, sound: "notification.wav" },
    ...(data ?? {}),
  };
  return await fetch(`https://${host}/3/device/${token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": APNS_BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405 });
  }
  try {
    const payload = await req.json();
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
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }
    const dataStr = data
      ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      : undefined;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: rows, error } = await supabase
      .from("device_tokens")
      .select("token, platform")
      .eq("user_id", user_id);
    if (error) throw error;
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "sem dispositivos" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    const androidTokens = rows.filter((r) => r.platform !== "ios").map((r) => r.token);
    const iosTokens = rows.filter((r) => r.platform === "ios").map((r) => r.token);

    let sent = 0;
    const invalid: string[] = [];

    // ---- Android (FCM) ----
    if (androidTokens.length) {
      const saRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
      if (saRaw) {
        const sa = JSON.parse(saRaw) as Record<string, string>;
        const accessToken = await getFcmAccessToken(sa);
        const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
        for (const token of androidTokens) {
          const message = {
            message: {
              token,
              notification: { title, body: body ?? "" },
              data: dataStr,
              android: {
                priority: "high",
                notification: {
                  icon: "ic_stat_notify",
                  sound: "notification",
                  channel_id: "meu_resgate_default",
                },
              },
            },
          };
          const r = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(message),
          });
          if (r.ok) sent++;
          else {
            const err = await r.json().catch(() => ({}));
            const code = err?.error?.details?.[0]?.errorCode || err?.error?.status;
            if (r.status === 404 || code === "UNREGISTERED" || code === "INVALID_ARGUMENT") invalid.push(token);
          }
        }
      }
    }

    // ---- iOS (APNs) ----
    if (iosTokens.length) {
      const jwt = await makeApnsJwt();
      for (const token of iosTokens) {
        // tenta produção; se BadDeviceToken, tenta sandbox (build de teste)
        let r = await sendApns(jwt, token, title, body ?? "", dataStr, "api.push.apple.com");
        if (r.status === 400) {
          const reason = (await r.json().catch(() => ({})))?.reason;
          if (reason === "BadDeviceToken") {
            r = await sendApns(jwt, token, title, body ?? "", dataStr, "api.sandbox.push.apple.com");
          }
        }
        if (r.ok) sent++;
        else {
          const reason = (await r.json().catch(() => ({})))?.reason;
          if (reason === "BadDeviceToken" || reason === "Unregistered") invalid.push(token);
        }
      }
    }

    if (invalid.length) {
      await supabase.from("device_tokens").delete().in("token", invalid);
    }
    return new Response(JSON.stringify({ sent, invalid: invalid.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
