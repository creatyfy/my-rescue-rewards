import { supabase } from "./client";
import { getPublicUrl, uploadEstablishmentImage, uploadProductImage } from "./storage";

export type ReceiptReviewStatus = "pending" | "approved" | "rejected";

export type AdminReceipt = {
  id: string;
  purchase_value: number;
  points: number;
  status: ReceiptReviewStatus;
  receipt_image_url: string | null;
  created_at: string;
  user_id: string;
  store_name: string | null;
};

export type AdminEstablishment = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  qr_code_token: string;
  logo_url: string | null;
  active: boolean;
  created_at: string;
};

// REMOVIDO: AdminStore e AdminQrCode - tabelas não existem no schema atual
// O sistema usa "establishments" para lojas parceiras

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  stock: number;
  active: boolean;
  created_at: string;
};

export type AdminRedemption = {
  id: string;
  status:
    | "pendente"
    | "solicitado"
    | "em andamento"
    | "enviado"
    | "cancelado"
    | "concluído"
    | "pending"
    | "completed"
    | "cancelled";
  points_spent: number;
  created_at: string;
  user_id: string;
  product_name: string | null;
  delivery_cep: string | null;
  delivery_address: string | null;
  delivery_number: string | null;
  delivery_neighborhood: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
};

export type AdminReceiptSummary = {
  id: string;
  status: ReceiptReviewStatus;
  purchase_value: number;
  points: number;
  created_at: string;
  establishment_id: string | null;
  establishment_name: string | null;
  user_id: string;
};

const normalizeReceiptStatus = (status?: string | null): ReceiptReviewStatus => {
  if (status === "approved" || status === "rejected") {
    return status;
  }
  if (status === "em_analise") {
    return "pending";
  }
  return "pending";
};

export const fetchAdminStatus = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("is_admin");

    if (error) {
      console.warn("is_admin function not available:", error.message);
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
};

// REMOVIDO: bootstrapFirstAdmin - auto-promoção desabilitada por segurança
// A promoção de admin só pode ser feita por outro admin via promote_user_to_admin

export type AdminUser = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase.rpc("list_users_for_admin");

    if (error) {
      console.warn("list_users_for_admin failed:", error.message);
      return [];
    }

    return (data ?? []) as AdminUser[];
  } catch {
    return [];
  }
};

export const promoteUserToAdmin = async (targetUserId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("promote_user_to_admin", {
    p_target_user_id: targetUserId,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const demoteAdminToUser = async (targetUserId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("demote_admin_to_user", {
    p_target_user_id: targetUserId,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const fetchPendingReceipts = async (): Promise<AdminReceipt[]> => {
  const result = await fetchAdminReceipts({ status: "pending" });
  return result.items;
};

export const fetchAdminReceipts = async (params?: {
  status?: ReceiptReviewStatus;
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: AdminReceipt[]; total: number; page: number; pageSize: number }> => {
  const status = params?.status;
  const query = (params?.query ?? "").trim();
  const pageSize = Math.max(1, Math.min(params?.pageSize ?? 20, 50));
  const page = Math.max(1, params?.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let q = supabase
      .from("receipts")
      .select(
        "id, purchase_value, points_earned, status, image_path, created_at, user_id, establishments(name)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (status) {
      q = q.eq("status", status);
    }

    if (query) {
      q = q.or(`establishments.name.ilike.%${query}%`);
    }

    const { data, error, count } = await q.range(from, to);

    if (error) {
      console.warn("receipts query failed:", error.message);
      return { items: [], total: 0, page, pageSize };
    }

    const items = (data ?? []).map((receipt) => ({
      id: receipt.id,
      purchase_value: receipt.purchase_value,
      points: receipt.points_earned,
      status: normalizeReceiptStatus(receipt.status),
      receipt_image_url: receipt.image_path,
      created_at: receipt.created_at,
      user_id: receipt.user_id,
      store_name: receipt.establishments?.name ?? null,
    })) as AdminReceipt[];

    return {
      items,
      total: Number(count ?? 0),
      page,
      pageSize,
    };
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
};

export const reviewReceipt = async (receiptId: string, status: ReceiptReviewStatus) => {
  console.info("Tentativa de revisão de comprovante:", { receiptId, status });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("Usuário não autenticado.");
  }

  const reviewTimestamp = new Date().toISOString();
  const reviewedAt = reviewTimestamp;
  const reviewedBy = userData.user.id;
  const { error } = await supabase
    .from("receipts")
    .update({
      status,
      reviewed_at: reviewedAt,
      reviewed_by: reviewedBy,
    })
    .eq("id", receiptId);

  if (error) {
    console.error("Erro ao atualizar comprovante:", {
      receiptId,
      status,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const message = error.message.toLowerCase();
    if (message.includes("permission") || message.includes("not authorized") || message.includes("forbidden")) {
      console.warn("Erro de permissão ao revisar comprovante:", {
        receiptId,
        status,
        message: error.message,
      });
    }
    throw error;
  }

  return true;
};

export const fetchAdminReceiptsSummary = async (): Promise<AdminReceiptSummary[]> => {
  try {
    const { data, error } = await supabase
      .from("receipts")
      .select(
        "id, status, purchase_value, points_earned, created_at, establishment_id, establishments(name), user_id",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("receipts table not available:", error.message);
      return [];
    }

    return (data ?? []).map((receipt) => ({
      id: receipt.id,
      status: normalizeReceiptStatus(receipt.status),
      purchase_value: receipt.purchase_value,
      points: receipt.points_earned,
      created_at: receipt.created_at,
      establishment_id: receipt.establishment_id ?? null,
      establishment_name: receipt.establishments?.name ?? null,
      user_id: receipt.user_id,
    })) as AdminReceiptSummary[];
  } catch {
    return [];
  }
};

export const fetchAdminRedemptions = async (): Promise<AdminRedemption[]> => {
  try {
    const { data, error } = await supabase
      .from("redemptions")
      .select(
        "id, status, points_spent, created_at, user_id, delivery_cep, delivery_address, delivery_number, delivery_neighborhood, delivery_city, delivery_state, products(name)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("redemptions table not available:", error.message);
      return [];
    }

    return (data ?? []).map((redemption) => ({
      id: redemption.id,
      status: redemption.status,
      points_spent: redemption.points_spent,
      created_at: redemption.created_at,
      user_id: redemption.user_id,
      product_name: redemption.products?.name ?? null,
      delivery_cep: redemption.delivery_cep ?? null,
      delivery_address: redemption.delivery_address ?? null,
      delivery_number: redemption.delivery_number ?? null,
      delivery_neighborhood: redemption.delivery_neighborhood ?? null,
      delivery_city: redemption.delivery_city ?? null,
      delivery_state: redemption.delivery_state ?? null,
    })) as AdminRedemption[];
  } catch {
    return [];
  }
};

export type AdminProfile = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
};

export const fetchAdminProfiles = async (): Promise<AdminProfile[]> => {
  try {
    const { data, error } = await supabase.from("profiles").select("user_id, full_name, phone");

    if (error) {
      console.warn("profiles table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminProfile[];
  } catch {
    return [];
  }
};

export const updateAdminRedemptionStatus = async (
  redemptionId: string,
  status: "pendente" | "solicitado" | "em andamento" | "enviado" | "cancelado" | "concluído",
) => {
  const { error } = await supabase.from("redemptions").update({ status }).eq("id", redemptionId);

  if (error) {
    throw error;
  }

  return true;
};

export const fetchAdminProducts = async (): Promise<AdminProduct[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, image_url, points_cost, stock, active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("products table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminProduct[];
  } catch {
    return [];
  }
};

export const fetchAdminEstablishments = async (): Promise<AdminEstablishment[]> => {
  try {
    const { data, error } = await supabase
      .from("establishments")
      .select("id, name, description, address, qr_code_token, logo_url, active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("establishments table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminEstablishment[];
  } catch {
    return [];
  }
};

// REMOVIDO: funções de stores e qr_codes - tabelas não existem no schema
// O sistema usa "establishments" para lojas parceiras com qr_code_token

export const createEstablishment = async (input: {
  name: string;
  description?: string | null;
  address?: string | null;
  qrCodeToken: string;
  logoFile?: File | null;
  logoUrl?: string | null;
  active: boolean;
}) => {
  const logoUrl = input.logoFile
    ? getPublicUrl("establishments", await uploadEstablishmentImage(input.logoFile))
    : input.logoUrl ?? null;

  const { data, error } = await supabase
    .from("establishments")
    .insert({
      name: input.name,
      description: input.description ?? null,
      address: input.address ?? null,
      qr_code_token: input.qrCodeToken,
      logo_url: logoUrl,
      active: input.active,
    })
    .select("id, name, description, address, qr_code_token, logo_url, active, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminEstablishment;
};

export const updateEstablishment = async (input: {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  qrCodeToken: string;
  logoFile?: File | null;
  logoUrl?: string | null;
  active: boolean;
}) => {
  const logoUrl = input.logoFile
    ? getPublicUrl("establishments", await uploadEstablishmentImage(input.logoFile))
    : input.logoUrl ?? null;

  const { data, error } = await supabase
    .from("establishments")
    .update({
      name: input.name,
      description: input.description ?? null,
      address: input.address ?? null,
      qr_code_token: input.qrCodeToken,
      logo_url: logoUrl,
      active: input.active,
    })
    .eq("id", input.id)
    .select("id, name, description, address, qr_code_token, logo_url, active, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminEstablishment;
};

export const deleteEstablishment = async (id: string) => {
  const { error } = await supabase.from("establishments").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
};

export const createProduct = async (input: {
  name: string;
  description?: string | null;
  pointsCost: number;
  stock: number;
  imageFile?: File | null;
  imageUrl?: string | null;
  active: boolean;
}) => {
  const imageUrl = input.imageFile
    ? getPublicUrl("products", await uploadProductImage(input.imageFile))
    : input.imageUrl ?? null;

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description ?? null,
      points_cost: input.pointsCost,
      stock: input.stock,
      image_url: imageUrl,
      active: input.active,
    })
    .select("id, name, description, image_url, points_cost, stock, active, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminProduct;
};

export const updateProduct = async (input: {
  id: string;
  name: string;
  description?: string | null;
  pointsCost: number;
  stock: number;
  imageFile?: File | null;
  imageUrl?: string | null;
  active: boolean;
}) => {
  const imageUrl = input.imageFile
    ? getPublicUrl("products", await uploadProductImage(input.imageFile))
    : input.imageUrl ?? null;

  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description ?? null,
      points_cost: input.pointsCost,
      stock: input.stock,
      image_url: imageUrl,
      active: input.active,
    })
    .eq("id", input.id)
    .select("id, name, description, image_url, points_cost, stock, active, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminProduct;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
};
