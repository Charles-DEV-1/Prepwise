import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";
import { createServiceRoleClient } from "@/services/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });

  const ipLimit = rateLimit({ key: `auth:signup:ip:${getClientIp(request)}`, limit: 10, windowMs: 60 * 60 * 1000 });
  if (!ipLimit.allowed) return noStoreJson({ error: "Too many signup attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } });

  const body = await readSafeJson<Record<string, unknown>>(request);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return noStoreJson({ error: "Enter a valid email address." }, { status: 400 });

  const emailLimit = rateLimit({ key: `auth:signup:email:${email}`, limit: 3, windowMs: 15 * 60 * 1000 });
  if (!emailLimit.allowed) return noStoreJson({ error: "Please wait before requesting another verification email." }, { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } });

  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("users").select("id").eq("email", email).maybeSingle();
  if (error) return noStoreJson({ error: "Unable to check this email. Please try again." }, { status: 500 });
  if (data) return noStoreJson({ error: "An account already exists for this email. Please log in instead." }, { status: 409 });

  return noStoreJson({ available: true });
}
