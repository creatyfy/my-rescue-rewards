export type TurnstileValidationResult =
  | { success: true }
  | { success: false; status: number; message: string };

type TurnstileApiResponse = {
  success: boolean;
  "error-codes"?: string[];
};

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verifyTurnstileToken = async (
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileValidationResult> => {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");

  // If Turnstile is not configured on the server, skip validation entirely
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY não configurada — validação ignorada.");
    return { success: true };
  }

  if (!token || !token.trim()) {
    return {
      success: false,
      status: 403,
      message: "Token do Turnstile ausente.",
    };
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token.trim(),
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Falha ao validar token no Turnstile:", response.status);
    return {
      success: false,
      status: 403,
      message: "Não foi possível validar o Turnstile.",
    };
  }

  const validation = (await response.json()) as TurnstileApiResponse;
  if (!validation.success) {
    console.warn("Turnstile inválido:", validation["error-codes"] ?? []);
    return {
      success: false,
      status: 403,
      message: "Validação do Turnstile falhou.",
    };
  }

  return { success: true };
};
