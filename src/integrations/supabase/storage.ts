import { supabase } from "./client";

const MAX_ADMIN_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const validateImageFile = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato inválido. Envie uma imagem JPG, PNG ou WebP.");
  }
  if (file.size > MAX_ADMIN_UPLOAD_SIZE) {
    throw new Error("O arquivo deve ter no máximo 10MB.");
  }
};

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop();
  return extension ? extension.toLowerCase() : "jpg";
};

const buildFileName = (file: File) => `${crypto.randomUUID()}.${getFileExtension(file)}`;

export const uploadReceiptForCurrentUser = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke<{ path: string; error?: string }>(
    "upload-receipt",
    {
      body: formData,
    },
  );

  if (error) {
    throw new Error(error.message || "Erro ao enviar comprovante.");
  }

  if (!data?.path) {
    throw new Error(data?.error || "Falha no upload do comprovante.");
  }

  return data.path;
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
  validateImageFile(file);
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
  validateImageFile(file);
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
  validateImageFile(file);
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
