import { supabase } from "./client";

type StoreMatch = {
  store_id: string;
  store_name: string;
};

type SubmittedReceipt = {
  receipt_id: string;
  points: number;
  status: "pending" | "approved" | "rejected";
};

type LegacySubmittedReceipt = {
  receipt_id: string;
  points?: number | null;
  points_earned?: number | null;
  protocol_number?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
};

type EstablishmentOption = {
  id: string;
  name: string;
  qr_code_token: string | null;
  active?: boolean | null;
};

const shouldRetryLegacySubmit = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("pgrst202") ||
    normalized.includes("could not find the function") ||
    normalized.includes("does not exist") ||
    normalized.includes("parameter") ||
    normalized.includes("p_receipt_image_url") ||
    normalized.includes("p_image_path") ||
    normalized.includes("qr_token")
  );
};

const normalizeSubmittedReceipt = (receipt: LegacySubmittedReceipt): SubmittedReceipt => {
  const status = receipt.status;
  if (status === "approved" || status === "rejected") {
    return {
      receipt_id: receipt.receipt_id,
      points: receipt.points ?? receipt.points_earned ?? 0,
      status,
    };
  }
  return {
    receipt_id: receipt.receipt_id,
    points: receipt.points ?? receipt.points_earned ?? 0,
    status: "pending",
  };
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
    console.info("Enviando comprovante para análise:", {
      qrCodeToken,
      purchaseValue,
      receiptPath,
    });
    const { data, error } = await supabase.rpc("submit_receipt" as never, {
      p_qr_value: qrCodeToken,
      p_purchase_value: purchaseValue,
      p_image_path: receiptPath,
    } as never);

    if (error) {
      const message = error.message ?? "";
      console.warn("submit_receipt function not available:", message);
      if (!shouldRetryLegacySubmit(message)) {
        throw error;
      }

      const legacyParams = [
        {
          p_qr_code_token: qrCodeToken,
          p_purchase_value: purchaseValue,
          p_image_path: receiptPath,
        },
        {
          p_qr_code_token: qrCodeToken,
          p_purchase_value: purchaseValue,
          p_receipt_image_url: receiptPath,
        },
        {
          qr_token: qrCodeToken,
          purchase_value: purchaseValue,
          image_url: receiptPath,
        },
      ] as const;

      for (const params of legacyParams) {
        const { data: legacyData, error: legacyError } = await supabase.rpc(
          "submit_receipt" as never,
          params as never,
        );

        if (legacyError) {
          console.warn("submit_receipt legacy call failed:", legacyError.message);
          continue;
        }

        const legacyResult = legacyData as LegacySubmittedReceipt[] | null;
        return legacyResult?.[0] ? normalizeSubmittedReceipt(legacyResult[0]) : null;
      }

      throw error;
    }

    const result = data as LegacySubmittedReceipt[] | null;
    if (result?.[0]) {
      const normalized = normalizeSubmittedReceipt(result[0]);
      console.info("Comprovante criado:", {
        receiptId: normalized.receipt_id,
        status: normalized.status,
      });
      return normalized;
    }
    return null;
  } catch (err) {
    throw err;
  }
};

export const fetchReceiptEstablishments = async (): Promise<
  { id: string; name: string; qrCodeToken: string | null }[]
> => {
  try {
    const { data, error } = await supabase
      .from("establishments")
      .select("id, name, qr_code_token, active")
      .order("name", { ascending: true });

    if (error) {
      console.warn("establishments table not available:", error.message);
      return [];
    }

    return ((data ?? []) as EstablishmentOption[])
      .filter((item) => item.active !== false)
      .map((item) => ({
        id: item.id,
        name: item.name,
        qrCodeToken: item.qr_code_token,
      }));
  } catch {
    return [];
  }
};
