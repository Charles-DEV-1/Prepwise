import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/services/supabase/admin";

export const PARTNER_SESSION_COOKIE = "prepcore_partner_session";
const SESSION_DAYS = 7;

export function hashPartnerPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPartnerPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
export function sessionTokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
export async function createPartnerSession(partnerId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const admin = createServiceRoleClient();
  const { error } = await admin.from("partner_sessions").insert({
    partner_id: partnerId, token: sessionTokenHash(token),
    expires_at: new Date(Date.now() + SESSION_DAYS * 86400000).toISOString(),
  } as never);
  if (error) throw new Error("Could not create partner session.");
  return token;
}
export async function getPartnerSession() {
  const token = (await cookies()).get(PARTNER_SESSION_COOKIE)?.value;
  if (!token) return null;
  const admin = createServiceRoleClient();
  const { data } = await admin.from("partner_sessions").select("partner_id, expires_at")
    .eq("token", sessionTokenHash(token)).maybeSingle();
  if (!data || new Date(data.expires_at) <= new Date()) return null;
  return { partnerId: data.partner_id, token };
}
