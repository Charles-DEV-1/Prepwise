// Prepcore — User Referral System
import { createServiceRoleClient } from "@/services/supabase/admin";
import { sendReferralCashClaimEmail } from "@/services/user-referrals/mailer";
import type { UserReferralReward } from "@/types/app";

export type ClaimCashRewardInput = {
  userId: string;
  rewardId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  userName: string;
  userEmail: string;
};

export async function processCashRewardClaim(
  input: ClaimCashRewardInput,
): Promise<void> {
  const admin = createServiceRoleClient();

  const { data: reward, error: rewardError } = await admin
    .from("user_referral_rewards" as never)
    .select("*")
    .eq("id", input.rewardId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (rewardError) throw rewardError;

  const row = reward as UserReferralReward | null;
  if (!row) {
    throw new Error("Reward not found.");
  }
  if (row.cash_claimed) {
    throw new Error("This reward has already been claimed.");
  }
  if (row.admin_paid) {
    throw new Error("This reward has already been paid.");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await admin
    .from("user_referral_rewards" as never)
    .update({
      cash_claimed: true,
      cash_claim_requested_at: now,
      bank_name: input.bankName,
      account_number: input.accountNumber,
      account_name: input.accountName,
    } as never)
    .eq("id", input.rewardId)
    .eq("user_id", input.userId);

  if (updateError) throw updateError;

  await sendReferralCashClaimEmail({
    name: input.userName,
    email: input.userEmail,
    rewardBatch: row.reward_batch,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    accountName: input.accountName,
  });

  await admin
    .from("user_referral_rewards" as never)
    .update({ notification_sent: true } as never)
    .eq("id", input.rewardId)
    .eq("user_id", input.userId);
}
