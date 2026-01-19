import { supabase } from "./client";

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop();
  return extension ? extension.toLowerCase() : "jpg";
};

const buildFileName = (file: File) => `${crypto.randomUUID()}.${getFileExtension(file)}`;

export const uploadReceiptForCurrentUser = async (file: File) => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Usuário não autenticado.");
  }

  const path = `${data.user.id}/${buildFileName(file)}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  return uploadData.path;
};

export const createSignedReceiptUrl = async (path: string, expiresIn = 60) => {
  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
};

export const uploadProductImage = async (file: File) => {
  const path = `products/${buildFileName(file)}`;
  const { data, error } = await supabase.storage.from("products").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return data.path;
};

export const uploadEstablishmentImage = async (file: File) => {
  const path = `establishments/${buildFileName(file)}`;
  const { data, error } = await supabase.storage
    .from("establishments")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data.path;
};

export const uploadAvatarForCurrentUser = async (file: File) => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Usuário não autenticado.");
  }

  const path = `${data.user.id}/avatar.${getFileExtension(file)}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  return uploadData.path;
};

export const getPublicUrl = (bucket: string, path: string) =>
  supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
