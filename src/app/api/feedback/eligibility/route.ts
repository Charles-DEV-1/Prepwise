import { noStoreJson } from "@/lib/api-security";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { createClient } from "@/services/supabase/server";

const MIN_COMPLETED_ACTIVITIES = 3;
const SUBMISSION_COOLDOWN_DAYS = 45;
const PROMPT_COOLDOWN_HOURS = 24;

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noStoreJson({ eligible: false }, { status: 401 });
  const limit = rateLimit({ key: `feedback:eligibility:${user.id}:${getClientIp(request)}`, limit: 30, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return noStoreJson({ eligible: false }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

  const admin = createServiceRoleClient();
  const [practice, exams, stateResult] = await Promise.all([
    admin.from("sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("mode", "practice").not("completed_at", "is", null),
    admin.from("sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("mode", "mock").not("completed_at", "is", null),
    admin.from("feedback_prompt_state").select("postponed_until, last_submitted_at, last_prompted_at").eq("user_id", user.id).maybeSingle(),
  ]);
  const now = new Date();
  const state = stateResult.data;
  const postponed = state?.postponed_until && new Date(state.postponed_until) > now;
  const recentlySubmitted = state?.last_submitted_at && new Date(state.last_submitted_at).getTime() + SUBMISSION_COOLDOWN_DAYS * 86_400_000 > now.getTime();
  const recentlyPrompted = state?.last_prompted_at && new Date(state.last_prompted_at).getTime() + PROMPT_COOLDOWN_HOURS * 3_600_000 > now.getTime();
  const eligible = ((practice.count ?? 0) >= MIN_COMPLETED_ACTIVITIES || (exams.count ?? 0) >= MIN_COMPLETED_ACTIVITIES) && !postponed && !recentlySubmitted && !recentlyPrompted;
  if (eligible) await admin.from("feedback_prompt_state").upsert({ user_id: user.id, last_prompted_at: now.toISOString(), updated_at: now.toISOString() } as never);
  return noStoreJson({ eligible });
}
