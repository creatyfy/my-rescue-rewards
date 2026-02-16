import { supabase } from "./client";
import { getPublicUrl, uploadAvatarForCurrentUser } from "./storage";

type ProfileRecord = {
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type UserProfile = {
  fullName: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

type ProfileUpdateInput = {
  fullName?: string | null;
  cpf?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

const mapProfile = (
  profile: ProfileRecord | null,
  user: { email?: string | null; created_at: string; user_metadata?: Record<string, unknown> },
): UserProfile => {
  const metadata = user.user_metadata ?? {};
  const fullName =
    profile?.full_name ??
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    user.email ??
    "";

  return {
    fullName,
    email: user.email ?? "",
    cpf: profile?.cpf ?? (metadata.cpf as string | undefined) ?? null,
    phone: profile?.phone ?? (metadata.phone as string | undefined) ?? null,
    avatarUrl: profile?.avatar_url ?? (metadata.avatar_url as string | undefined) ?? null,
    createdAt: profile?.created_at ?? user.created_at,
  };
};

export const fetchCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return null;
  }

  try {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("full_name, cpf, phone, avatar_url, created_at")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.warn("profiles table not available:", error.message);
      return mapProfile(null, userData.user);
    }

    return mapProfile(data ?? null, userData.user);
  } catch {
    return mapProfile(null, userData.user);
  }
};

export const updateCurrentUserProfile = async (input: ProfileUpdateInput): Promise<UserProfile> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("Usuário não autenticado.");
  }

  const payload: Record<string, string | null> = {};

  if (typeof input.fullName !== "undefined") {
    payload.full_name = input.fullName ?? null;
  }

  if (typeof input.cpf !== "undefined") {
    const cpfClean = input.cpf?.replace(/\D/g, "") || null;
    payload.cpf = cpfClean;
  }

  if (typeof input.phone !== "undefined") {
    const phoneClean = input.phone?.replace(/\D/g, "") || null;
    payload.phone = phoneClean;
  }

  if (typeof input.avatarUrl !== "undefined") {
    payload.avatar_url = input.avatarUrl ?? null;
  }

  if (Object.keys(payload).length === 0) {
    // Nothing to update, just return current profile
    const current = await fetchCurrentUserProfile();
    if (!current) throw new Error("Perfil não encontrado.");
    return current;
  }

  const { data, error } = await supabase.functions.invoke("update-profile", {
    body: payload,
  });

  if (error) {
    const errorData = data as { errors?: string[] } | null;
    const message = errorData?.errors?.[0] || error.message || "Erro ao atualizar perfil.";
    throw new Error(message);
  }

  const result = data as {
    success?: boolean;
    profile?: ProfileRecord;
  } | null;

  if (!result?.success || !result.profile) {
    throw new Error("Não foi possível atualizar o perfil.");
  }

  return mapProfile(result.profile, userData.user);
};

export const updateCurrentUserPassword = async ({
  currentPassword,
  newPassword,
  turnstileToken,
}: {
  currentPassword: string;
  newPassword: string;
  turnstileToken: string;
}) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user?.email) {
    throw new Error("Usuário não autenticado.");
  }

  if (!turnstileToken) {
    throw new Error("Token do Turnstile ausente.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuração do servidor inválida.");
  }

  const loginResponse = await fetch(`${supabaseUrl}/functions/v1/login-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      email: userData.user.email,
      password: currentPassword,
      turnstileToken,
    }),
  });

  const loginPayload = await loginResponse.json().catch(() => ({}));
  if (!loginResponse.ok) {
    const message =
      typeof loginPayload === "object" &&
      loginPayload !== null &&
      Array.isArray((loginPayload as { errors?: string[] }).errors)
        ? (loginPayload as { errors?: string[] }).errors?.[0]
        : "";
    throw new Error(message || "Não foi possível validar sua senha atual.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw updateError;
  }

  return true;
};

export const updateCurrentUserAvatar = async (file: File) => {
  const path = await uploadAvatarForCurrentUser(file);
  const publicUrl = getPublicUrl("avatars", path);

  await updateCurrentUserProfile({ avatarUrl: publicUrl });

  return publicUrl;
};

export const deleteCurrentUserData = async () => {
  const { data, error } = await supabase.functions.invoke("delete-account");

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error("Não foi possível apagar seus dados pessoais. Tente novamente.");
  }

  return true;
};

export const logoutCurrentUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};
