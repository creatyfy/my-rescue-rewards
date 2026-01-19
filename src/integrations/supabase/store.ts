import { supabase } from "./client";

type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  stock: number;
};

type RedemptionResult = {
  redemption_id: string;
  product_id: string;
  product_name: string;
  points_spent: number;
  remaining_balance: number;
  stock_remaining: number;
  status: "pending" | "completed" | "cancelled";
};

type RedemptionHistory = {
  id: string;
  points_spent: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  products: {
    name: string | null;
  } | null;
};

type ReceiptHistory = {
  id: string;
  points_earned: number;
  status: "pending" | "approved" | "rejected";
  protocol_number: string;
  created_at: string;
  establishments: {
    name: string | null;
  } | null;
};

type LedgerEntry = {
  ledger_id: string;
  ledger_type: "earn" | "redeem" | "expire" | "adjustment";
  amount: number;
  created_at: string;
  receipt_status: "pending" | "approved" | "rejected" | null;
  redemption_status: "pending" | "completed" | "cancelled" | null;
  establishment_name: string | null;
  product_name: string | null;
  protocol_number: string | null;
};

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

const mapProduct = (product: ProductRecord): Product => ({
  id: product.id,
  name: product.name,
  description: product.description ?? "",
  imageUrl: product.image_url ?? FALLBACK_PRODUCT_IMAGE,
  pointsCost: product.points_cost,
  stock: product.stock,
});

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, image_url, points_cost, stock")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .returns<ProductRecord[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProduct);
};

export const fetchCurrentUserBalance = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return 0;
  }

  const { data, error } = await supabase.rpc("get_user_balance", {
    p_user_id: userData.user.id,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
};

export const fetchCurrentUserPendingPoints = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return 0;
  }

  const { data, error } = await supabase.rpc("get_pending_points", {
    p_user_id: userData.user.id,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
};

export const redeemProduct = async (productId: string) => {
  const { data, error } = await supabase.rpc("redeem_product", {
    p_product_id: productId,
  });

  if (error) {
    throw error;
  }

  const [result] = (data ?? []) as RedemptionResult[];
  return result ?? null;
};

export const fetchRedemptionHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from("redemptions")
    .select("id, points_spent, status, created_at, products(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<RedemptionHistory[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const fetchReceiptHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from("receipts")
    .select("id, points_earned, status, protocol_number, created_at, establishments(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ReceiptHistory[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const fetchCurrentUserProfileName = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.full_name ?? null;
};

export const fetchUserLedger = async (userId: string, limit = 5) => {
  const { data, error } = await supabase.rpc("get_user_ledger", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as LedgerEntry[];
};

export const fetchCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user?.id ?? null;
};
