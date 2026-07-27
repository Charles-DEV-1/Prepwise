import { NextResponse } from "next/server";
import { getPartnerSession } from "@/lib/partner-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
export async function GET() {
  const session = await getPartnerSession(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createServiceRoleClient();
  const [partner, conversions, withdrawals] = await Promise.all([
    admin.from("partner_accounts").select("id,full_name,email,business_name,referral_code,status,commission_per_sale,total_earned,total_withdrawn,pending_balance,reserved_balance,minimum_withdrawal,created_at").eq("id",session.partnerId).single(),
    admin.from("partner_referral_conversions").select("id,user_name,user_email,signed_up_at,converted_to_pro,converted_at,commission_amount,commission_status").eq("partner_id",session.partnerId).order("signed_up_at",{ascending:false}).limit(100),
    admin.from("partner_withdrawals").select("id,amount,status,requested_at,completed_at,failure_reason,bank_name").eq("partner_id",session.partnerId).order("requested_at",{ascending:false}).limit(50),
  ]);
  if (partner.error || !partner.data) return NextResponse.json({ error: "Partner account not found" }, { status: 404 });
  return NextResponse.json({ partner: partner.data, conversions: conversions.data ?? [], withdrawals: withdrawals.data ?? [] });
}
