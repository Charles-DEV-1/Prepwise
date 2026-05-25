import { forbiddenResponse, getAdminSessionUser } from "@/lib/admin-api-auth";
import { normalizeReferralCode } from "@/lib/referral";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!(await getAdminSessionUser())) return forbiddenResponse();

  const body = await request.json();
  const partnerId = String(body.partner_id ?? "").trim();
  const code = normalizeReferralCode(String(body.code ?? ""));

  if (!partnerId || !code) {
    return NextResponse.json(
      { error: "partner_id and code are required" },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("referral_codes")
    .insert({
      partner_id: partnerId,
      code,
      label: body.label ?? null,
      is_active: body.is_active ?? true,
      expires_at: body.expires_at ?? null,
      max_uses: body.max_uses ?? null,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ referral_code: data });
}
