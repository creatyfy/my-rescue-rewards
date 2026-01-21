import { supabase } from "./client";

type EstablishmentMatch = {
  id: string;
  name: string;
};

type SubmittedReceipt = {
  receipt_id: string;
  protocol_number: string;
  establishment_id: string;
  establishment_name: string;
  points_earned: number;
};

export const fetchEstablishmentByQrToken = async (qrCodeToken: string): Promise<EstablishmentMatch | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from("establishments")
      .select("id, name")
      .eq("qr_code_token", qrCodeToken)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.warn("establishments table not available:", error.message);
      return null;
    }

    return data as EstablishmentMatch | null;
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
      qr_token: qrCodeToken,
      purchase_value: purchaseValue,
      image_url: receiptPath,
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
