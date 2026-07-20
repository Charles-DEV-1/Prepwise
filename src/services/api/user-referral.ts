// Prepcore — User Referral System
"use client";

import {
  clearUserReferralCode,
  getUserReferralCode,
} from "@/lib/user-referral-storage";
import type { ReferralClaimValues } from "@/lib/user-referral-validations";
import { createClient } from "@/services/supabase/client";
import type { UserReferralReward } from "@/types/app";

export type UserReferralStats = {
  code: string;
  totalSignups: number;
  totalConverted: number;
  rewards: UserReferralReward[];
  nextRewardAt: number;
};

type UserReferralSignupRow = {
  converted_to_pro: boolean;
};

type UserReferralRewardRow = UserReferralReward;

export async function getUserReferralCodeForUser(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await (
    supabase as unknown as {
      rpc: (fn: string) => Promise<{ data: string | null; error: Error | null }>;
    }
  ).rpc("ensure_user_referral_code");

  if (error) throw error;
  if (!data) throw new Error("Could not generate referral code.");
  return data;
}

export async function recordReferralSignup(code: string): Promise<void> {
  const supabase = createClient();
  const normalized = code.trim().toUpperCase();
  if (!normalized) return;

  await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: { p_code: string },
      ) => Promise<{ data: unknown; error: Error | null }>;
    }
  ).rpc("record_user_referral_signup", { p_code: normalized });
}

export async function applyUserReferralFromStorage(): Promise<void> {
  const code = getUserReferralCode();
  if (!code) return;

  await recordReferralSignup(code);
  clearUserReferralCode();
}

export async function getReferralStats(userId: string): Promise<UserReferralStats> {
  const supabase = createClient();
  const code = await getUserReferralCodeForUser();

  const { data: signups, error: signupsError } = await supabase
    .from("user_referral_signups" as never)
    .select("converted_to_pro")
    .eq("referrer_id", userId);

  if (signupsError) throw signupsError;

  const signupRows = (signups ?? []) as UserReferralSignupRow[];
  const totalSignups = signupRows.length;
  const totalConverted = signupRows.filter((row) => row.converted_to_pro).length;

  const { data: rewards, error: rewardsError } = await supabase
    .from("user_referral_rewards" as never)
    .select("*")
    .eq("user_id", userId)
    .order("reward_batch", { ascending: true });

  if (rewardsError) throw rewardsError;

  const rewardRows = (rewards ?? []) as UserReferralRewardRow[];
  const remainder = totalConverted % 5;
  const nextRewardAt = remainder === 0 && totalConverted > 0 ? 5 : 5 - remainder;

  return {
    code,
    totalSignups,
    totalConverted,
    rewards: rewardRows,
    nextRewardAt,
  };
}

export async function claimCashReward(
  rewardId: string,
  bankDetails: ReferralClaimValues,
): Promise<void> {
  const response = await fetch("/api/referrals/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rewardId,
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
    }),
  });

  const data = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Could not submit cash claim.");
  }
}
