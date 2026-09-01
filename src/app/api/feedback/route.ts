import { z } from "zod";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { createClient } from "@/services/supabase/server";

const feedbackSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(4000).optional().transform((value) => value || null), idempotencyKey: z.string().uuid() });

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noStoreJson({ error: "Unauthorized." }, { status: 401 });
  const limit = rateLimit({ key: `feedback:submit:${user.id}:${getClientIp(request)}`, limit: 6, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return noStoreJson({ error: "Please wait before sending more feedback." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const parsed = feedbackSchema.safeParse(await readSafeJson<unknown>(request));
  if (!parsed.success) return noStoreJson({ error: "Choose a rating from 1 to 5 before sending." }, { status: 400 });

  const admin = createServiceRoleClient();
  const [practice, exams, profile] = await Promise.all([
    admin.from("sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("mode", "practice").not("completed_at", "is", null),
    admin.from("sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("mode", "mock").not("completed_at", "is", null),
    admin.from("users").select("plan").eq("id", user.id).maybeSingle(),
  ]);
  const now = new Date().toISOString();
  const { error } = await admin.from("feedback").insert({ user_id: user.id, rating: parsed.data.rating, comment: parsed.data.comment, feedback_type: "general", source_page: "/dashboard", prompt_trigger: "completed_sessions", practice_count_at_submission: practice.count ?? 0, exam_count_at_submission: exams.count ?? 0, user_plan: profile.data?.plan === "pro" ? "pro" : "free", idempotency_key: parsed.data.idempotencyKey } as never);
  if (error && error.code !== "23505") { console.error("feedback_insert_failed", error.code); return noStoreJson({ error: "We couldn't send your feedback. Please try again." }, { status: 500 }); }
  await admin.from("feedback_prompt_state").upsert({ user_id: user.id, last_submitted_at: now, postponed_until: null, updated_at: now } as never);
  return noStoreJson({ success: true });
}
