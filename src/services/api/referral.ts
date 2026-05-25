"use client";

import { clearReferralCookie, getReferralCookie } from "@/lib/referral";
import { createClient } from "@/services/supabase/client";

export type ReferralApplyResult = {
  success: boolean;
  code?: string;
  partner_name?: string;
  partner_id?: string;
  error?: string;
};

export type UserReferral = {
  code: string;
  partner_id: string;
  partner_name: string;
  applied_at: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "This referral code is not valid.",
  already_referred: "You already have a lesson center linked to your account.",
  expired: "This referral code has expired.",
  max_uses_reached: "This referral code has reached its usage limit.",
  not_authenticated: "Please sign in to apply a referral code.",
};

export function referralErrorMessage(error?: string): string {
  if (!error) return "Could not apply referral code.";
  return ERROR_MESSAGES[error] ?? "Could not apply referral code.";
}

export async function applyReferralCode(
  code: string,
): Promise<ReferralApplyResult> {
  const supabase = createClient();
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "invalid_code" };
  }

  // RPC added in referral migration; typed in Database when Supabase CLI regenerates types
  const { data, error } = await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: { p_code: string },
      ) => Promise<{ data: ReferralApplyResult | null; error: Error | null }>;
    }
  ).rpc("apply_referral_code", { p_code: normalized });

  if (error) {
    return { success: false, error: "invalid_code" };
  }

  const result = data as ReferralApplyResult | null;
  if (!result) return { success: false, error: "invalid_code" };
  return result;
}

export async function applyReferralFromCookie(): Promise<ReferralApplyResult | null> {
  const code = getReferralCookie();
  if (!code) return null;

  const existing = await getMyReferral();
  if (existing) {
    clearReferralCookie();
    return null;
  }

  const result = await applyReferralCode(code);
  if (result.success) clearReferralCookie();
  return result;
}

export async function getMyReferral(): Promise<UserReferral | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_referrals")
    .select("code, partner_id, applied_at, partners(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as {
    code: string;
    partner_id: string;
    applied_at: string;
    partners: { name: string } | { name: string }[] | null;
  };

  const partners = row.partners;
  const partnerName = Array.isArray(partners)
    ? partners[0]?.name
    : partners?.name;

  if (!partnerName) return null;

  return {
    code: row.code,
    partner_id: row.partner_id,
    partner_name: partnerName,
    applied_at: row.applied_at,
  };
}
