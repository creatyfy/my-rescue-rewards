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
  if (!token || !token.trim()) {
    return {
      success: false,
      status: 403,
      message: "Token do Turnstile ausente.",
    };
  }

  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY não configurada.");
    return {
      success: false,
      status: 500,
      message: "Configuração de segurança inválida.",
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
