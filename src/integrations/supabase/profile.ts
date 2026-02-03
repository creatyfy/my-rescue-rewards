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

  const payload: {
    user_id: string;
    full_name?: string | null;
    cpf?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  } = {
    user_id: userData.user.id,
  };

  if (typeof input.fullName !== "undefined") {
    payload.full_name = input.fullName;
  }

  if (typeof input.cpf !== "undefined") {
    payload.cpf = input.cpf;
  }

  if (typeof input.phone !== "undefined") {
    payload.phone = input.phone;
  }

  if (typeof input.avatarUrl !== "undefined") {
    payload.avatar_url = input.avatarUrl;
  }

  const { data, error } = await (supabase as any)
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("full_name, cpf, phone, avatar_url, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data ?? null, userData.user);
};

export const updateCurrentUserPassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user?.email) {
    throw new Error("Usuário não autenticado.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw signInError;
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

export const deleteCurrentUserData = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("Usuário não autenticado.");
  }

  let avatarUrl: string | null = null;

  try {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.warn("profiles table not available:", error.message);
    } else {
      avatarUrl = data?.avatar_url ?? null;
    }
  } catch (error) {
    console.warn("Não foi possível carregar avatar para exclusão:", error);
  }

  const avatarPath = getAvatarPathFromUrl(avatarUrl);

  if (avatarPath) {
    const { error: deleteError } = await supabase.storage.from("avatars").remove([avatarPath]);

    if (deleteError) {
      console.warn("Não foi possível remover avatar:", deleteError.message);
    }
  }

  const { error: profileError } = await (supabase as any)
    .from("profiles")
    .update({
      full_name: null,
      cpf: null,
      phone: null,
      avatar_url: null,
    })
    .eq("user_id", userData.user.id);

  if (profileError) {
    throw profileError;
  }

  return true;
};

export const logoutCurrentUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};
