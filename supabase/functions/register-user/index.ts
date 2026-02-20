import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

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

const MAX_BODY_SIZE = 10_000;

const readBodyWithLimit = async (
  req: Request,
): Promise<{ ok: true; bodyText: string } | { ok: false; response: Response }> => {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return { ok: false, response: jsonResponse({ errors: ["Payload excede o limite permitido."] }, 413) };
  }

  if (!req.body) {
    return { ok: false, response: jsonResponse({ errors: ["Payload ausente."] }, 400) };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.length;
      if (total > MAX_BODY_SIZE) {
        return { ok: false, response: jsonResponse({ errors: ["Payload excede o limite permitido."] }, 413) };
      }
      chunks.push(value);
    }
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  return { ok: true, bodyText: new TextDecoder().decode(buffer) };
};

const cpfDigitsOnlyRegex = /^\d{11}$/;
const phoneDigitsOnlyRegex = /^\d{10,11}$/;

const isValidCpf = (cpf: string) => {
  if (!cpfDigitsOnlyRegex.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);

  const firstVerifier = (digits.slice(0, 9).reduce((acc, digit, index) => acc + digit * (10 - index), 0) * 10) % 11;
  const firstDigit = firstVerifier === 10 ? 0 : firstVerifier;
  if (firstDigit !== digits[9]) return false;

  const secondVerifier = (digits.slice(0, 10).reduce((acc, digit, index) => acc + digit * (11 - index), 0) * 10) % 11;
  const secondDigit = secondVerifier === 10 ? 0 : secondVerifier;
  return secondDigit === digits[10];
};

const registerPayloadSchema = z
  .object({
    turnstileToken: z.string({ required_error: "turnstileToken é obrigatório." }).trim().min(1),
    full_name: z.string({ required_error: "full_name é obrigatório." }).trim().min(3).max(100),
    email: z.string({ required_error: "email é obrigatório." }).trim().email(),
    cpf: z.string({ required_error: "cpf é obrigatório." }).trim().regex(cpfDigitsOnlyRegex).refine(isValidCpf, "cpf inválido pelo algoritmo oficial."),
    phone: z.string({ required_error: "phone é obrigatório." }).trim().regex(phoneDigitsOnlyRegex),
    password: z.string({ required_error: "password é obrigatório." }).min(6),
    ref_code: z.string().trim().toUpperCase().optional(),
  })
  .strict("Campos extras não são permitidos.");

// ── Referral helpers ──────────────────────────────────────────────────────────

/** SHA-256 digest as hex string */
const sha256Hex = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/** Generate a unique 8-char alphanumeric code (base36, uppercase) */
const generateReferralCode = (): string => {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  const hex = BigInt("0x" + uuid.slice(0, 12));
  return hex.toString(36).toUpperCase().slice(0, 8).padStart(8, "0");
};

/** Insert referral code for newly created user, retrying on duplicate code */
const createReferralCode = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<string | null> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const { error } = await supabase.rpc("generate_referral_code", {
      p_user_id: userId,
      p_code: code,
    });
    if (!error) return code;
    // If the error is NOT a unique constraint violation, abort early
    if (!error.message?.includes("unique") && !error.message?.includes("duplicate")) {
      console.warn("generate_referral_code error:", error.message);
      return null;
    }
  }
  console.warn("Failed to generate unique referral code after 5 attempts");
  return null;
};

/** Process referral bonus atomically */
const processReferral = async (
  supabase: ReturnType<typeof createClient>,
  refCode: string,
  newUserId: string,
  email: string,
  cpf: string,
): Promise<void> => {
  // Find referrer by code
  const { data: codeRow, error: lookupErr } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", refCode)
    .maybeSingle();

  if (lookupErr || !codeRow) {
    console.warn("Referral code not found or lookup error:", refCode, lookupErr?.message);
    return;
  }

  const referrerId = codeRow.user_id as string;

  // Prevent self-referral
  if (referrerId === newUserId) {
    console.warn("Self-referral attempt blocked for user:", newUserId);
    return;
  }

  const [emailHash, cpfHash] = await Promise.all([
    sha256Hex(email.toLowerCase().trim()),
    sha256Hex(cpf.replace(/\D/g, "")),
  ]);

  const { data: bonusData, error: bonusErr } = await supabase.rpc("process_referral_bonus", {
    p_referrer_id:      referrerId,
    p_referred_user_id: newUserId,
    p_email_hash:       emailHash,
    p_cpf_hash:         cpfHash,
  });

  if (bonusErr) {
    console.warn("process_referral_bonus error:", bonusErr.message);
    return;
  }

  // Notify referrer when the bonus is actually granted
  const result = bonusData as { points_granted?: boolean } | null;
  if (result?.points_granted) {
    const { error: notifErr } = await supabase.from("notifications").insert({
      user_id: referrerId,
      title: "Indicação bem-sucedida! 🎉",
      message: "Um amigo se cadastrou usando seu link de convite. Você ganhou 100 pontos de bônus!",
      tipo: "indicacao_aceita",
      is_read: false,
      arquivada: false,
    });
    if (notifErr) {
      console.warn("Erro ao inserir notificação de indicação:", notifErr.message);
    }
  }
};


// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Método não permitido", { status: 405, headers: corsHeaders });

  const bodyReadResult = await readBodyWithLimit(req);
  if (!bodyReadResult.ok) return bodyReadResult.response;

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(bodyReadResult.bodyText);
  } catch {
    return jsonResponse({ errors: ["Payload JSON inválido."] }, 400);
  }

  const turnstileToken =
    typeof parsedBody === "object" && parsedBody !== null && "turnstileToken" in parsedBody
      ? (parsedBody as { turnstileToken?: string }).turnstileToken
      : undefined;

  const turnstileValidation = await verifyTurnstileToken(turnstileToken, req.headers.get("CF-Connecting-IP"));
  if (!turnstileValidation.success) {
    return jsonResponse({ errors: [turnstileValidation.message] }, turnstileValidation.status);
  }

  const validationResult = registerPayloadSchema.safeParse(parsedBody);
  if (!validationResult.success) {
    return jsonResponse(
      { errors: validationResult.error.issues.map((issue) => issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message) },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return jsonResponse({ errors: ["Configuração do servidor inválida."] }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const { full_name, email, cpf, phone, password, ref_code } = validationResult.data;

  // 1. Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name, cpf, phone: `55${phone}` },
  });

  if (error) {
    console.error("Erro ao criar usuário:", error);
    return jsonResponse({ errors: ["Não foi possível concluir o cadastro."] }, 400);
  }

  const newUserId = data.user.id;

  // 2. Post-registration: referral code + bonus (non-blocking)
  try {
    // Generate and store the new user's own referral code
    await createReferralCode(supabase, newUserId);

    // If a ref_code was supplied, process the bonus
    if (ref_code) {
      await processReferral(supabase, ref_code, newUserId, email, cpf);
    }
  } catch (referralErr) {
    // Referral errors MUST NOT fail the registration
    console.warn("Non-critical referral error:", referralErr);
  }

  // 3. Send confirmation email via anon-key client
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (supabaseAnonKey) {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const siteUrl = Deno.env.get("VITE_PUBLIC_SITE_URL") || "https://my-rescue-rewards.lovable.app";
    const { error: resendError } = await anonClient.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${siteUrl}/dashboard` },
    });
    if (resendError) console.warn("Erro ao enviar e-mail de confirmação:", resendError.message);
  }

  return jsonResponse(
    { success: true, message: "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta." },
    201,
  );
});
