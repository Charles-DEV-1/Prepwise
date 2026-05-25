import { forbiddenResponse, getAdminSessionUser } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSessionUser())) return forbiddenResponse();

  const { id } = await params;
  const body = await request.json();
  const admin = createServiceRoleClient();

  const updates: Record<string, unknown> = {};
  const fields = [
    "name",
    "slug",
    "city",
    "contact_name",
    "contact_phone",
    "contact_email",
    "notes",
    "commission_percent",
    "is_active",
    "bulk_pro_active",
    "bulk_pro_expires_at",
    "wholesale_price_naira",
    "student_price_naira",
  ] as const;

  for (const field of fields) {
    if (field in body) updates[field] = body[field];
  }

  const { data, error } = await admin
    .from("partners")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ partner: data });
}
