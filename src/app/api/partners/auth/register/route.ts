import crypto from "node:crypto";
import { hashPartnerPassword } from "@/lib/partner-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";

function code() { return `PC${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
  const limit = rateLimit({ key: `partner:register:${getClientIp(request)}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return noStoreJson({ error: "Too many applications from this connection. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const body = await readSafeJson<Record<string, unknown>>(request);
  if (!body) return noStoreJson({ error: "Invalid request." }, { status: 400 });
  const fullName = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");
  if (!fullName || fullName.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || !phone || !/^\+?[0-9\s()-]{7,20}$/.test(phone) || password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return noStoreJson({ error: "Use a valid name, email, phone number, and a password of 12+ characters with uppercase, lowercase, and a number." }, { status: 400 });
  }
  const admin = createServiceRoleClient();
  const { error } = await admin.from("partner_accounts").insert({
    full_name: fullName, email, phone, business_name: String(body.business_name ?? "").trim() || null,
    city: String(body.city ?? "").trim() || null, partner_type: String(body.partner_type ?? "individual"),
    referral_code: code(), status: "pending", password_hash: hashPartnerPassword(password),
  } as never);
  if (error?.code === "23505") return noStoreJson({ error: "An application already exists for this email." }, { status: 409 });
  if (error) return noStoreJson({ error: "Unable to submit your application." }, { status: 500 });
  return noStoreJson({ success: true });
}
