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

type EstablishmentOption = {
  id: string;
  name: string;
  qr_code_token: string | null;
  active?: boolean | null;
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

/**
 * Unified receipt submission: sends file + metadata in a single multipart request.
 * The backend validates everything before uploading the file, avoiding orphan files.
 */
export const submitReceiptWithFile = async ({
  qrCodeToken,
  purchaseValue,
  file,
  turnstileToken,
}: {
  qrCodeToken: string;
  purchaseValue: number;
  file: File;
  turnstileToken: string;
}): Promise<SubmittedReceipt | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("qrCodeToken", qrCodeToken);
  formData.append("purchaseValue", String(purchaseValue));
  formData.append("turnstileToken", turnstileToken);

  const { data, error } = await supabase.functions.invoke("submit-receipt-v2", {
    body: formData,
  });

  if (error) {
    const contextStatus = (error as { context?: { status?: number } }).context?.status;
    const errorData = data as { errors?: string[] } | null;
    const message = errorData?.errors?.[0] || error.message || "Erro ao enviar comprovante.";

    if (contextStatus === 409) {
      throw new Error("Comprovante já enviado.");
    }
    if (contextStatus === 429) {
      throw new Error("Muitas tentativas. Tente novamente em alguns minutos.");
    }
    throw new Error(message);
  }

  const result = data as {
    success?: boolean;
    receipt?: {
      protocol_number?: string | null;
      points_earned?: number | null;
      status?: string | null;
    };
  } | null;

  if (!result?.success || !result.receipt) {
    return null;
  }

  const status = result.receipt.status;
  return {
    receipt_id: result.receipt.protocol_number ?? "",
    points: result.receipt.points_earned ?? 0,
    status: status === "approved" || status === "rejected" ? status : "pending",
  };
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
