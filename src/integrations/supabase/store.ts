import { supabase } from "./client";

type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  stock: number;
  price_reais: number | null;
};

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  stock: number;
  priceReais: number | null;
};

type RedemptionResult = {
  redemption_id: string;
  product_id: string;
  product_name: string;
  points_spent: number;
  remaining_balance: number;
  stock_remaining: number;
  status: RedemptionStatus;
};

type RedemptionHistory = {
  id: string;
  points_spent: number;
  status: RedemptionStatus;
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

export type RedemptionStatus = "em_analise" | "concluido" | "cancelado";

const normalizeRedemptionStatus = (status?: string | null): RedemptionStatus => {
  if (status === "concluido" || status === "cancelado" || status === "em_analise") {
    return status;
  }
  if (status === "completed") {
    return "concluido";
  }
  if (status === "cancelled") {
    return "cancelado";
  }
  return "em_analise";
};

type LedgerEntry = {
  ledger_id: string;
  ledger_type: "earn" | "redeem" | "expire" | "adjustment";
  amount: number;
  created_at: string;
  receipt_status: "pending" | "approved" | "rejected" | null;
  redemption_status: RedemptionStatus | null;
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
  priceReais: product.price_reais ?? null,
});

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("products")
      .select("id, name, description, image_url, points_cost, stock, price_reais")
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

// ----- Loja com pagamento em dinheiro (compra + híbrido) -----

export type StoreSettings = {
  pointsToBrl: number;
  maxPointsDiscountPct: number;
  minCashReais: number;
  deliveryFeeReais: number;
  pixKey: string | null;
  pixOwnerName: string | null;
  whatsapp: string | null;
  paymentInstructions: string | null;
};

export const fetchStoreSettings = async (): Promise<StoreSettings | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from("store_settings")
      .select(
        "points_to_brl, max_points_discount_pct, min_cash_reais, delivery_fee_reais, pix_key, pix_owner_name, whatsapp, payment_instructions",
      )
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      pointsToBrl: Number(data.points_to_brl ?? 0),
      maxPointsDiscountPct: Number(data.max_points_discount_pct ?? 100),
      minCashReais: Number(data.min_cash_reais ?? 0),
      deliveryFeeReais: Number(data.delivery_fee_reais ?? 0),
      pixKey: data.pix_key ?? null,
      pixOwnerName: data.pix_owner_name ?? null,
      whatsapp: data.whatsapp ?? null,
      paymentInstructions: data.payment_instructions ?? null,
    };
  } catch {
    return null;
  }
};

export const createOrder = async (
  productId: string,
  pointsToUse: number,
  delivery: DeliveryData,
): Promise<string | null> => {
  const { data, error } = await supabase.rpc("create_order" as never, {
    p_product_id: productId,
    p_points_to_use: pointsToUse,
    p_delivery_cep: delivery.cep,
    p_delivery_address: delivery.address,
    p_delivery_number: delivery.number,
    p_delivery_neighborhood: delivery.neighborhood,
    p_delivery_city: delivery.city,
    p_delivery_state: delivery.state,
  } as never);
  if (error) throw error;
  return (data as string) ?? null;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "expired";

export type Order = {
  id: string;
  productName: string | null;
  priceReais: number;
  pointsApplied: number;
  discountReais: number;
  deliveryFeeReais: number;
  amountReais: number;
  status: OrderStatus;
  createdAt: string;
};

export const fetchMyOrders = async (): Promise<Order[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  try {
    const { data, error } = await (supabase as any)
      .from("orders")
      .select(
        "id, product_name, price_reais, points_applied, discount_reais, delivery_fee_reais, amount_reais, status, created_at",
      )
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });
    if (error) return [];
    return ((data ?? []) as Record<string, unknown>[]).map((o) => ({
      id: o.id as string,
      productName: (o.product_name as string) ?? null,
      priceReais: Number(o.price_reais),
      pointsApplied: Number(o.points_applied),
      discountReais: Number(o.discount_reais),
      deliveryFeeReais: Number(o.delivery_fee_reais),
      amountReais: Number(o.amount_reais),
      status: o.status as OrderStatus,
      createdAt: o.created_at as string,
    }));
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
  deliveryData: DeliveryData,
): Promise<RedemptionResult | null> => {
  const { data, error } = await supabase.rpc("redeem_product", {
    p_product_id: productId,
    p_delivery_cep: deliveryData.cep,
    p_delivery_address: deliveryData.address,
    p_delivery_number: deliveryData.number,
    p_delivery_neighborhood: deliveryData.neighborhood,
    p_delivery_city: deliveryData.city,
    p_delivery_state: deliveryData.state,
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

  const result = data as unknown as RedemptionResult[] | null;
  const redemption = result?.[0];
  if (!redemption) {
    return null;
  }

  return {
    ...redemption,
    status: normalizeRedemptionStatus(redemption.status),
  };
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

    return (data ?? []).map((redemption: RedemptionHistory) => ({
      ...redemption,
      status: normalizeRedemptionStatus(redemption.status),
    }));
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

    return (data ?? []).map((entry: LedgerEntry) => ({
      ...entry,
      redemption_status: entry.redemption_status ? normalizeRedemptionStatus(entry.redemption_status) : null,
    }));
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

export const resolveCurrentUserPrivileges = async (): Promise<{ canViewValueEquivalent: boolean }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { canViewValueEquivalent: false };
  }

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.warn("user privileges could not be resolved:", error.message);
      return { canViewValueEquivalent: false };
    }

    return { canViewValueEquivalent: Boolean(data) };
  } catch {
    return { canViewValueEquivalent: false };
  }
};
