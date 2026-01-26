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
  status: "pendente" | "solicitado" | "em andamento" | "enviado" | "concluído";
  created_at: string;
  products: {
    name: string | null;
  } | null;
};

type ReceiptHistoryRecord = {
  id: string;
  points_earned: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  purchase_value: number;
  establishments: {
    name: string | null;
  } | null;
};

type ReceiptHistory = {
  id: string;
  points: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  purchase_value: number;
  establishments: {
    name: string | null;
  } | null;
};

const normalizeReceiptStatus = (status?: string | null): ReceiptHistory["status"] => {
  if (status === "approved" || status === "rejected") {
    return status;
  }
  if (status === "em_analise") {
    return "pending";
  }
  return "pending";
};

type LedgerEntry = {
  ledger_id: string;
  ledger_type: "earn" | "redeem" | "expire" | "adjustment";
  amount: number;
  created_at: string;
  receipt_status: "pending" | "approved" | "rejected" | null;
  redemption_status: "pendente" | "solicitado" | "em andamento" | "enviado" | "concluído" | null;
  store_name: string | null;
  product_name: string | null;
  protocol_number: string | null;
};

export type DeliveryData = {
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type UserContact = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
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

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("products")
      .select("id, name, description, image_url, points_cost, stock")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("products table not available:", error.message);
      return [];
    }

    return ((data ?? []) as ProductRecord[]).map(mapProduct);
  } catch {
    return [];
  }
};

export const fetchCurrentUserBalance = async (): Promise<number> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return 0;
  }

  try {
    const { data, error } = await supabase.rpc("get_user_balance" as never, {
      p_user_id: userData.user.id,
    } as never);

    if (error) {
      console.warn("get_user_balance function not available:", error.message);
      return 0;
    }

    return Number(data ?? 0);
  } catch {
    return 0;
  }
};

export const fetchCurrentUserPendingPoints = async (): Promise<number> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return 0;
  }

  try {
    const { data, error } = await supabase.rpc("get_pending_points" as never, {
      p_user_id: userData.user.id,
    } as never);

    if (error) {
      console.warn("get_pending_points function not available:", error.message);
      return 0;
    }

    return Number(data ?? 0);
  } catch {
    return 0;
  }
};

export const redeemProduct = async (
  productId: string,
  _deliveryData: DeliveryData,
): Promise<RedemptionResult | null> => {
  // Note: Delivery data is collected for UI validation but the current RPC
  // only accepts product_id. Address persistence requires backend update.
  const { data, error } = await supabase.rpc("redeem_product", {
    p_product_id: productId,
  });

  if (error) {
    console.error("Erro ao resgatar produto:", {
      productId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  const result = data as RedemptionResult[] | null;
  return result?.[0] ?? null;
};

export const fetchRedemptionHistory = async (userId: string): Promise<RedemptionHistory[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("redemptions")
      .select("id, points_spent, status, created_at, products(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("redemptions table not available:", error.message);
      return [];
    }

    return (data ?? []) as RedemptionHistory[];
  } catch {
    return [];
  }
};

export const fetchReceiptHistory = async (userId: string): Promise<ReceiptHistory[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("receipts")
      .select("id, points_earned, status, purchase_value, created_at, establishments(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("receipts table not available:", error.message);
      return [];
    }

    return ((data ?? []) as ReceiptHistoryRecord[]).map((receipt) => ({
      id: receipt.id,
      points: receipt.points_earned,
      status: normalizeReceiptStatus(receipt.status),
      created_at: receipt.created_at,
      purchase_value: receipt.purchase_value,
      establishments: receipt.establishments ? { name: receipt.establishments.name } : null,
    }));
  } catch {
    return [];
  }
};

export const fetchCurrentUserProfileName = async (): Promise<string | null> => {
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
      .select("full_name")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.warn("profiles table not available:", error.message);
      return null;
    }

    return (data as { full_name: string | null } | null)?.full_name ?? null;
  } catch {
    return null;
  }
};

export const fetchCurrentUserContact = async (): Promise<UserContact | null> => {
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
      .select("full_name, phone")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.warn("profiles table not available:", error.message);
      return {
        fullName: null,
        email: userData.user.email ?? null,
        phone: null,
      };
    }

    return {
      fullName: (data as { full_name: string | null } | null)?.full_name ?? null,
      email: userData.user.email ?? null,
      phone: (data as { phone: string | null } | null)?.phone ?? null,
    };
  } catch {
    return {
      fullName: null,
      email: userData.user.email ?? null,
      phone: null,
    };
  }
};

export const fetchUserLedger = async (userId: string, limit = 5): Promise<LedgerEntry[]> => {
  try {
    const { data, error } = await supabase.rpc("get_user_ledger" as never, {
      p_user_id: userId,
      p_limit: limit,
    } as never);

    if (error) {
      console.warn("get_user_ledger function not available:", error.message);
      return [];
    }

    return (data ?? []) as LedgerEntry[];
  } catch {
    return [];
  }
};

export const fetchCurrentUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user?.id ?? null;
};
