import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPartnerSession, PARTNER_SESSION_COOKIE, sessionTokenHash } from "@/lib/partner-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
export async function POST() { const session = await getPartnerSession(); if (session) await createServiceRoleClient().from("partner_sessions").delete().eq("token", sessionTokenHash(session.token)); (await cookies()).delete(PARTNER_SESSION_COOKIE); return NextResponse.json({ success: true }); }
