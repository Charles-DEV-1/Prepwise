import { slugifyPartnerName } from "@/lib/admin-auth";
import { forbiddenResponse, getAdminSessionUser } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await getAdminSessionUser())) return forbiddenResponse();

  const admin = createServiceRoleClient();
  const partnerQuery = admin.from("partners") as unknown as {
    select: (columns: string) => {
      order: (
        column: string,
        options: { ascending: boolean },
      ) => Promise<{
        data: unknown[] | null;
        error: { message: string } | null;
      }>;
    };
  };
  const { data: partners, error } = await partnerQuery
    .select("*, referral_codes(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: stats } = await admin
    .from("partner_referral_stats")
    .select("*");

  const statsMap = new Map(
    (stats ?? []).map((s) => [
      (s as { partner_id: string }).partner_id,
      s as { signups: number; pro_conversions: number },
    ]),
  );

  type PartnerWithCodes = {
    id: string;
    referral_codes?: unknown[];
    [key: string]: unknown;
  };

  const enriched = ((partners ?? []) as PartnerWithCodes[]).map((row) => {
    const stat = statsMap.get(row.id);
    return {
      ...row,
      signups: Number(stat?.signups ?? 0),
      pro_conversions: Number(stat?.pro_conversions ?? 0),
    };
  });

  return NextResponse.json({ partners: enriched });
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSessionUser())) return forbiddenResponse();

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug =
    String(body.slug ?? "").trim() || slugifyPartnerName(name) || "partner";
  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("partners")
    .insert({
      name,
      slug,
      city: body.city ?? null,
      contact_name: body.contact_name ?? null,
      contact_phone: body.contact_phone ?? null,
      contact_email: body.contact_email ?? null,
      notes: body.notes ?? null,
      commission_percent: body.commission_percent ?? null,
      is_active: body.is_active ?? true,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ partner: data });
}
