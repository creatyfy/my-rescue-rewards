import { supabase } from "./client";
import { getPublicUrl, uploadEstablishmentImage, uploadProductImage } from "./storage";

export type ReceiptReviewStatus = "pending" | "approved" | "rejected";

export type AdminReceipt = {
  id: string;
  protocol_number: string;
  purchase_value: number;
  points_earned: number;
  status: ReceiptReviewStatus;
  image_url: string | null;
  created_at: string;
  user_id: string;
  establishments: {
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
    const { data, error } = await supabase.rpc("is_admin" as never);

    if (error) {
      console.warn("is_admin function not available:", error.message);
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
};

export const fetchPendingReceipts = async (): Promise<AdminReceipt[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("receipts")
      .select(
        "id, protocol_number, purchase_value, points_earned, status, image_url, created_at, user_id, establishments(name)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("receipts table not available:", error.message);
      return [];
    }

    return (data ?? []) as AdminReceipt[];
  } catch {
    return [];
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

  const { error } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
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

  const { data, error } = await (supabase as any)
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

  const { data, error } = await (supabase as any)
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
  const { error } = await (supabase as any).from("establishments").delete().eq("id", id);

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

  const { data, error } = await (supabase as any)
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

  const { data, error } = await (supabase as any)
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
  const { error } = await (supabase as any).from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
};
