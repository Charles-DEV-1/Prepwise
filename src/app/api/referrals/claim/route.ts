// Prepcore — User Referral System
import { NextResponse } from "next/server";
import { z } from "zod";
import { referralClaimSchema } from "@/lib/user-referral-validations";
import { createClient } from "@/services/supabase/server";
import { processCashRewardClaim } from "@/services/user-referrals/claim";

export const runtime = "nodejs";

const claimRequestSchema = referralClaimSchema.extend({
  rewardId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const parsed = claimRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("referral_claim_failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not submit cash claim.",
      },
      { status: 500 },
    );
  }
}
