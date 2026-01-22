import { supabase } from "./client";
import { getPublicUrl, uploadEstablishmentImage, uploadProductImage } from "./storage";

export type ReceiptReviewStatus = "pending" | "approved" | "rejected";

export type AdminReceipt = {
  id: string;
  protocol_number: string;
  purchase_value: number;
  points_earned: number;
  status: ReceiptReviewStatus;
  image_path: string | null;
  created_at: string;
  user_id: string;
  stores: {
    name: string | null;
  } | null;
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

export type AdminStore = {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  is_active: boolean;
  qr_code_id: string | null;
  created_at: string;
};

export type AdminQrCode = {
  id: string;
  store_id: string;
  qr_value: string;
  qr_image: string | null;
  is_active: boolean;
  created_at: string;
};

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
  status: "pending" | "completed" | "cancelled";
  points_spent: number;
  created_at: string;
};

export type AdminReceiptSummary = {
  id: string;
  status: ReceiptReviewStatus;
  purchase_value: number;
  points_earned: number;
  created_at: string;
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

export const bootstrapFirstAdmin = async (): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase.rpc("bootstrap_first_admin", {
    p_user_id: userData.user.id,
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
        "id, protocol_number, purchase_value, points_earned, status, image_path, created_at, user_id, stores(name)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (status) {
      q = q.eq("status", status);
    }

    if (query) {
      // Busca por protocolo OU nome da loja (relacionamento via FK)
      q = q.or(`protocol_number.ilike.%${query}%,stores.name.ilike.%${query}%`);
    }

    const { data, error, count } = await q.range(from, to);

    if (error) {
      console.warn("receipts query failed:", error.message);
      return { items: [], total: 0, page, pageSize };
    }

    return {
      items: (data ?? []) as AdminReceipt[],
      total: Number(count ?? 0),
      page,
      pageSize,
    };
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
};

export const reviewReceipt = async (receiptId: string, status: ReceiptReviewStatus) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("receipts")
    .update({
      status,
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", receiptId);

  if (error) {
    throw error;
  }

  return true;
};

export const fetchAdminReceiptsSummary = async (): Promise<AdminReceiptSummary[]> => {
  try {
    const { data, error } = await supabase
      .from("receipts")
      .select("id, status, purchase_value, points_earned, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("receipts table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminReceiptSummary[];
  } catch {
    return [];
  }
};

export const fetchAdminRedemptions = async (): Promise<AdminRedemption[]> => {
  try {
    const { data, error } = await supabase
      .from("redemptions")
      .select("id, status, points_spent, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("redemptions table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminRedemption[];
  } catch {
    return [];
  }
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

export const fetchAdminStores = async (): Promise<AdminStore[]> => {
  try {
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, phone, city, state, is_active, qr_code_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("stores table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminStore[];
  } catch {
    return [];
  }
};

export const fetchActiveQrCodesForStores = async (storeIds: string[]): Promise<AdminQrCode[]> => {
  if (storeIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("id, store_id, qr_value, qr_image, is_active, created_at")
      .in("store_id", storeIds)
      .eq("is_active", true);

    if (error) {
      console.warn("qr_codes table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminQrCode[];
  } catch {
    return [];
  }
};

export const createStore = async (input: {
  name: string;
  phone: string;
  city: string;
  state: string;
  isActive: boolean;
}) => {
  const { data, error } = await supabase
    .from("stores")
    .insert({
      name: input.name,
      phone: input.phone,
      city: input.city,
      state: input.state,
      is_active: input.isActive,
    })
    .select("id, name, phone, city, state, is_active, qr_code_id, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminStore;
};

export const updateStore = async (input: {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  isActive: boolean;
}) => {
  const { data, error } = await supabase
    .from("stores")
    .update({
      name: input.name,
      phone: input.phone,
      city: input.city,
      state: input.state,
      is_active: input.isActive,
    })
    .eq("id", input.id)
    .select("id, name, phone, city, state, is_active, qr_code_id, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminStore;
};

export const deactivateStore = async (id: string) => {
  const { data, error } = await supabase
    .from("stores")
    .update({ is_active: false })
    .eq("id", id)
    .select("id, name, phone, city, state, is_active, qr_code_id, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as AdminStore;
};

export const generateStoreQrCode = async (storeId: string) => {
  const { data, error } = await supabase.rpc("generate_store_qr_code" as never, {
    p_store_id: storeId,
  } as never);

  if (error) {
    throw error;
  }

  const result = data as
    | {
        qr_code_id: string;
        qr_value: string;
        qr_image: string | null;
        created_at: string;
      }[]
    | null;
  const payload = result?.[0];
  if (!payload) {
    return null;
  }

  return {
    id: payload.qr_code_id,
    store_id: storeId,
    qr_value: payload.qr_value,
    qr_image: payload.qr_image,
    is_active: true,
    created_at: payload.created_at,
  } satisfies AdminQrCode;
};

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
