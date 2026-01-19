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

export const fetchEstablishmentByQrToken = async (qrCodeToken: string) => {
  const { data, error } = await supabase
    .from("establishments")
    .select("id, name")
    .eq("qr_code_token", qrCodeToken)
    .eq("active", true)
    .maybeSingle<EstablishmentMatch>();

  if (error) {
    throw error;
  }

  return data;
};

export const submitReceiptForCurrentUser = async ({
  qrCodeToken,
  purchaseValue,
  receiptPath,
}: {
  qrCodeToken: string;
  purchaseValue: number;
  receiptPath: string;
}) => {
  const { data, error } = await supabase.rpc("submit_receipt", {
    qr_token: qrCodeToken,
    purchase_value: purchaseValue,
    image_url: receiptPath,
  });

  if (error) {
    throw error;
  }

  const [receipt] = (data ?? []) as SubmittedReceipt[];
  return receipt ?? null;
};
