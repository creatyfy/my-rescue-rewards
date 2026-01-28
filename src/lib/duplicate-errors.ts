export const DUPLICATE_FIELD_MESSAGES = {
  cpf: "Este CPF já está vinculado a outro cadastro.",
  email: "Este e-mail já está em uso. Utilize outro ou recupere sua conta.",
  phone: "Este telefone já está vinculado a outro usuário.",
} as const;

type ErrorLike = {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

const toMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "";
  }

  const maybeError = error as ErrorLike;
  return [maybeError.message, maybeError.details, maybeError.hint, maybeError.code]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
};

export const getDuplicateFieldMessage = (error: unknown): string | null => {
  const message = toMessage(error);

  if (!message) {
    return null;
  }

  if (message.includes("cpf_duplicate") || message.includes("profiles_cpf_unique_idx")) {
    return DUPLICATE_FIELD_MESSAGES.cpf;
  }

  if (message.includes("phone_duplicate") || message.includes("profiles_phone_unique_idx")) {
    return DUPLICATE_FIELD_MESSAGES.phone;
  }

  if (
    message.includes("user already registered") ||
    (message.includes("email") && message.includes("duplicate")) ||
    message.includes("auth_users_email_lower_unique")
  ) {
    return DUPLICATE_FIELD_MESSAGES.email;
  }

  return null;
};
