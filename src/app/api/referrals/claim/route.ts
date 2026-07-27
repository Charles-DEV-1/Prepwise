// Prepcore — User Referral System
import { z } from "zod";
import { referralClaimSchema } from "@/lib/user-referral-validations";
import { createClient } from "@/services/supabase/server";
import { processCashRewardClaim } from "@/services/user-referrals/claim";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";

export const runtime = "nodejs";

const claimRequestSchema = referralClaimSchema.extend({
  rewardId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return noStoreJson({ error: "Unauthorized" }, { status: 401 });
    }
    const limit = rateLimit({ key: `referrals:claim:${user.id}:${getClientIp(request)}`, limit: 3, windowMs: 24 * 60 * 60 * 1000 });
    if (!limit.allowed) return noStoreJson({ error: "Too many cash-claim attempts. Please try again tomorrow." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

    const body = await readSafeJson<unknown>(request);
    const parsed = claimRequestSchema.safeParse(body);
    if (!parsed.success) {
      return noStoreJson(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const profileRow = profile as {
      full_name: string | null;
      email: string | null;
    } | null;

    await processCashRewardClaim({
      userId: user.id,
      rewardId: parsed.data.rewardId,
      bankName: parsed.data.bankName,
      accountNumber: parsed.data.accountNumber,
      accountName: parsed.data.accountName,
      userName:
        profileRow?.full_name ??
        (user.user_metadata?.full_name as string | undefined) ??
        "Prepcore user",
      userEmail: profileRow?.email ?? user.email ?? "unknown@prepcore.com.ng",
    });

    return noStoreJson({ success: true });
  } catch (error) {
    console.error("referral_claim_failed", error);
    return noStoreJson({ error: "Could not submit cash claim." }, { status: 500 });
  }
}
