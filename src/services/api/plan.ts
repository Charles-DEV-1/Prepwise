"use client";

import { createClient } from "@/services/supabase/client";

export type Plan = "free" | "pro";
export type PlanSource = "free" | "individual" | "partner_bulk";

export type EffectivePlan = {
  plan: Plan;
  source: PlanSource;
  partnerName?: string;
};

function isIndividualPro(sub: {
  plan: string;
  status: string;
  current_period_end: string | null;
}): boolean {
  return (
    sub.plan === "pro" &&
    sub.status === "active" &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date())
  );
}

function isPartnerBulkProActive(partner: {
  bulk_pro_active: boolean;
  bulk_pro_expires_at: string | null;
}): boolean {
  if (!partner.bulk_pro_active) return false;
  if (!partner.bulk_pro_expires_at) return true;
  return new Date(partner.bulk_pro_expires_at) > new Date();
}

export async function getEffectivePlan(): Promise<EffectivePlan> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { plan: "free", source: "free" };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (sub && isIndividualPro(sub)) {
    return { plan: "pro", source: "individual" };
  }

  const { data: referralRow } = await supabase
    .from("user_referrals")
    .select("partner_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const referral = referralRow as { partner_id: string } | null;
  if (!referral) {
    return { plan: "free", source: "free" };
  }

  const { data: partnerRow } = await supabase
    .from("partners")
    .select("name, bulk_pro_active, bulk_pro_expires_at, is_active")
    .eq("id", referral.partner_id)
    .maybeSingle();

  const partner = partnerRow as {
    name: string;
    bulk_pro_active: boolean;
    bulk_pro_expires_at: string | null;
    is_active: boolean;
  } | null;

  if (
    partner &&
    partner.is_active &&
    isPartnerBulkProActive({
      bulk_pro_active: partner.bulk_pro_active,
      bulk_pro_expires_at: partner.bulk_pro_expires_at,
    })
  ) {
    return {
      plan: "pro",
      source: "partner_bulk",
      partnerName: partner.name,
    };
  }

  return { plan: "free", source: "free", partnerName: partner?.name };
}

export function formatPlanSource(
  source: PlanSource,
  partnerName?: string,
): string {
  if (source === "individual") return "Prepcore Pro (direct payment)";
  if (source === "partner_bulk" && partnerName) {
    return `Pro via ${partnerName} (lesson center plan)`;
  }
  return "Free plan";
}
