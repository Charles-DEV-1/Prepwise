import { hasTrustedOrigin, noStoreJson } from "@/lib/api-security";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { createClient } from "@/services/supabase/server";

const COOLDOWN_DAYS = 7;
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noStoreJson({ error: "Unauthorized." }, { status: 401 });
  const limit = rateLimit({ key: `feedback:postpone:${user.id}:${getClientIp(request)}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return noStoreJson({ success: true });
  const now = new Date();
  await createServiceRoleClient().from("feedback_prompt_state").upsert({ user_id: user.id, postponed_until: new Date(now.getTime() + COOLDOWN_DAYS * 86_400_000).toISOString(), updated_at: now.toISOString() } as never);
  return noStoreJson({ success: true });
}
