import { forbiddenResponse, getAdminSessionUser } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await getAdminSessionUser())) return forbiddenResponse();

  const admin = createServiceRoleClient();

  const { data: referrals, error } = await admin
    .from("user_referrals")
    .select("user_id, partner_id, code, applied_at")
    .order("applied_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = referrals ?? [];
  if (rows.length === 0) {
    return NextResponse.json({ referrals: [] });
  }

  const userIds = rows.map((r) => r.user_id);
  const partnerIds = [...new Set(rows.map((r) => r.partner_id))];

  const [{ data: users }, { data: partners }, { data: subs }] =
    await Promise.all([
      admin.from("users").select("id, email, full_name").in("id", userIds),
      admin
        .from("partners")
        .select(
          "id, name, bulk_pro_active, bulk_pro_expires_at, is_active, wholesale_price_naira, student_price_naira",
        )
        .in("id", partnerIds),
      admin
        .from("subscriptions")
        .select("user_id, plan, status")
        .in("user_id", userIds)
        .eq("plan", "pro")
        .eq("status", "active"),
    ]);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));
  const partnerMap = new Map((partners ?? []).map((p) => [p.id, p]));
  const individualProSet = new Set((subs ?? []).map((s) => s.user_id));

  function partnerBulkActive(partnerId: string): boolean {
    const p = partnerMap.get(partnerId);
    if (!p?.is_active || !p.bulk_pro_active) return false;
    if (!p.bulk_pro_expires_at) return true;
    return new Date(p.bulk_pro_expires_at) > new Date();
  }

  const result = rows.map((r) => {
    const user = userMap.get(r.user_id);
    const partner = partnerMap.get(r.partner_id);
    const hasIndividual = individualProSet.has(r.user_id);
    const hasBulk = partnerBulkActive(r.partner_id);
    let pro_status: "free" | "individual" | "partner_bulk" = "free";
    if (hasIndividual) pro_status = "individual";
    else if (hasBulk) pro_status = "partner_bulk";

    return {
      user_id: r.user_id,
      code: r.code,
      applied_at: r.applied_at,
      partner_name: partner?.name ?? "Unknown",
      email: user?.email ?? null,
      full_name: user?.full_name ?? null,
      is_pro: pro_status !== "free",
      pro_status,
    };
  });

  return NextResponse.json({ referrals: result });
}
