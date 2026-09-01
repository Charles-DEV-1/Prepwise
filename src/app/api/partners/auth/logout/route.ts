import { cookies } from "next/headers";
import { getPartnerSession, PARTNER_SESSION_COOKIE, sessionTokenHash } from "@/lib/partner-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { hasTrustedOrigin, noStoreJson } from "@/lib/api-security";
export async function POST(request: Request) { if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 }); const session = await getPartnerSession(); if (session) await createServiceRoleClient().from("partner_sessions").delete().eq("token", sessionTokenHash(session.token)); (await cookies()).delete(PARTNER_SESSION_COOKIE); return noStoreJson({ success: true }); }
