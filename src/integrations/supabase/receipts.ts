import { supabase } from "./client";

type StoreMatch = {
  store_id: string;
  store_name: string;
};

type SubmittedReceipt = {
  receipt_id: string;
  protocol_number: string;
  points_earned: number;
  status: "pending" | "approved" | "rejected";
};

export const fetchStoreByQrValue = async (
  qrValue: string,
): Promise<{ id: string; name: string } | null> => {
  try {
    const { data, error } = await supabase.rpc("get_store_by_qr_value" as never, {
      p_qr_value: qrValue,
    } as never);

    if (error) {
      console.warn("get_store_by_qr_value function not available:", error.message);
      return null;
    }

    const result = data as StoreMatch[] | null;
    const match = result?.[0];
    if (!match) {
      return null;
    }
    return { id: match.store_id, name: match.store_name };
  } catch {
    return null;
  }
};

export const submitReceiptForCurrentUser = async ({
  qrCodeToken,
  purchaseValue,
  receiptPath,
}: {
  qrCodeToken: string;
  purchaseValue: number;
  receiptPath: string;
}): Promise<SubmittedReceipt | null> => {
  try {
    const { data, error } = await supabase.rpc("submit_receipt" as never, {
      p_qr_code_token: qrCodeToken,
      p_purchase_value: purchaseValue,
      p_image_path: receiptPath,
    } as never);

    if (error) {
      console.warn("submit_receipt function not available:", error.message);
      throw error;
    }

    const result = data as SubmittedReceipt[] | null;
    return result?.[0] ?? null;
  } catch (err) {
    throw err;
  }
};
