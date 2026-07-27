import { cookies } from "next/headers";
import { createPartnerSession, PARTNER_SESSION_COOKIE, verifyPartnerPassword } from "@/lib/partner-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
  const limit = rateLimit({ key: `partner:login:${getClientIp(request)}`, limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) return noStoreJson({ error: "Too many sign-in attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const body = await readSafeJson<Record<string, unknown>>(request);
  if (!body) return noStoreJson({ error: "Invalid request." }, { status: 400 });
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const admin = createServiceRoleClient();
  const { data: partner } = await admin.from("partner_accounts").select("id, password_hash") .eq("email", email).maybeSingle() as { data: { id: string; password_hash: string | null } | null };
  if (!partner?.password_hash || !verifyPartnerPassword(password, partner.password_hash)) return noStoreJson({ error: "Incorrect email or password." }, { status: 401 });
  const token = await createPartnerSession(partner.id);
  (await cookies()).set(PARTNER_SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return noStoreJson({ success: true });
}
