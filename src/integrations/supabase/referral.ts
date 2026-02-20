import { supabase } from "@/integrations/supabase/client";
import { getAppBaseUrl } from "@/lib/app-url";

export interface ReferralStats {
  total_referred: number;
  total_points_earned: number;
}

/** Fetch the current user's referral code */
export async function fetchMyReferralCode(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("referral_codes" as never)
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { code: string }).code;
}

/** Check if the referral welcome modal has already been shown */
export async function hasReferralWelcomeBeenShown(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc(
    "has_referral_welcome_been_shown" as never,
    { p_user_id: userId } as never,
  );
  if (error) return false;
  return Boolean(data);
}

/** Mark the referral welcome modal as shown (so it never shows again) */
export async function markReferralWelcomeShown(userId: string): Promise<void> {
  await supabase.rpc(
    "mark_referral_welcome_shown" as never,
    { p_user_id: userId } as never,
  );
}

/** Get referral stats for the current user */
export async function fetchReferralStats(userId: string): Promise<ReferralStats> {
  const { data, error } = await supabase.rpc(
    "get_referral_stats" as never,
    { p_user_id: userId } as never,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = data as any[];
  if (error || !rows || rows.length === 0) {
    return { total_referred: 0, total_points_earned: 0 };
  }
  const row = rows[0] as ReferralStats;
  return { total_referred: row.total_referred ?? 0, total_points_earned: row.total_points_earned ?? 0 };
}

/** Build the shareable referral link */
export function buildReferralLink(code: string): string {
  const base = getAppBaseUrl();
  return `${base}/auth?mode=register&ref=${code}`;
}
