import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { createServiceRoleClient } from "@/services/supabase/admin";

const ALOC_URL = "https://questions.aloc.com.ng/api/v2/m";
const MAX_SESSION_QUESTIONS = 180;
const ALOC_BATCH_SIZE = 40;

const subjectSlugs: Record<string, string> = {
  english: "english",
  mathematics: "mathematics",
  physics: "physics",
  chemistry: "chemistry",
  biology: "biology",
  economics: "economics",
  government: "government",
  literature: "englishlit",
  crs: "crk",
  geography: "geography",
  commerce: "commerce",
  accounting: "accounting",
};

type SessionRequest = {
  subjectId?: string;
  examType?: "jamb" | "waec";
  limit?: number;
};

type StoredQuestion = {
  id: string;
  prompt: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  topic: string;
  year: number | null;
  subject_id: string;
  exam_type: "jamb" | "waec";
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function optionMap(value: unknown): Record<string, string> | null {
  if (Array.isArray(value)) {
    const keys = ["A", "B", "C", "D", "E"];
    const mapped = Object.fromEntries(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item, index) => [keys[index] ?? String(index + 1), item]),
    );
    return Object.keys(mapped).length >= 2 ? mapped : null;
  }
  if (!value || typeof value !== "object") return null;
  const mapped = Object.entries(value as Record<string, unknown>).reduce<
    Record<string, string>
  >((result, [key, item]) => {
    if (typeof item === "string") {
      result[key.replace(/^option\s*/i, "").toUpperCase()] = item;
    }
    return result;
  }, {});
  return Object.keys(mapped).length >= 2 ? mapped : null;
}

function normalizeAlocQuestion(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const prompt = row.question ?? row.prompt ?? row.text;
  const options = optionMap(row.options ?? row.option ?? row.choices);
  const answer = String(row.answer ?? row.correct_answer ?? row.correct_option ?? "")
    .replace(/^option\s*/i, "")
    .trim()
    .toUpperCase();
  const correctAnswer = options?.[answer]
    ? answer
    : Object.entries(options ?? {}).find(([, text]) => text.trim() === String(row.answer ?? "").trim())?.[0];

  if (typeof prompt !== "string" || !options || !correctAnswer) return null;
  return {
    source_question_id: String(row.id ?? row.question_id ?? `${prompt}-${answer}`),
    prompt,
    options,
    correct_answer: correctAnswer,
    explanation: String(row.solution ?? row.explanation ?? ""),
    topic: String(row.topic ?? row.section ?? ""),
    year: Number.isFinite(Number(row.year)) ? Number(row.year) : null,
  };
}

async function isProUser(userId: string) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  const hasIndividualPro = Boolean(
    data &&
      data.plan === "pro" &&
      data.status === "active" &&
      (!data.current_period_end || data.current_period_end > now),
  );
  if (hasIndividualPro) return true;

  const { data: referral } = await supabase
    .from("user_referrals")
    .select("partner_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!referral) return false;

  const { data: partner } = await supabase
    .from("partners")
    .select("is_active, bulk_pro_active, bulk_pro_expires_at")
    .eq("id", (referral as { partner_id: string }).partner_id)
    .maybeSingle();
  return Boolean(
    partner &&
      partner.is_active &&
      partner.bulk_pro_active &&
      (!partner.bulk_pro_expires_at || partner.bulk_pro_expires_at > now),
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as SessionRequest | null;
  const subjectId = body?.subjectId;
  const examType = body?.examType;
  const limit = Math.min(Math.max(Number(body?.limit) || 25, 1), MAX_SESSION_QUESTIONS);
  if (!subjectId || (examType !== "jamb" && examType !== "waec")) {
    return NextResponse.json({ error: "Invalid question request" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data: subject } = await admin
    .from("subjects")
    .select("id, name")
    .eq("id", subjectId)
    .maybeSingle();
  if (!subject) return NextResponse.json({ error: "Unknown subject" }, { status: 404 });

  const isPro = await isProUser(user.id);
  let query = admin
    .from("questions")
    .select("id, prompt, options, correct_answer, explanation, topic, year, subject_id, exam_type")
    .eq("subject_id", subjectId)
    .eq("exam_type", examType)
    .limit(Math.max(limit * 4, ALOC_BATCH_SIZE));
  if (!isPro) {
    // `source` is added by the accompanying SQL migration; generated types
    // will include it after the next Supabase type generation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).eq("source", "supabase");
  }
  const initialResult = await query;
  let questions = initialResult.data;
  if (initialResult.error) {
    return NextResponse.json({ error: "Could not load questions" }, { status: 500 });
  }

  // Seed a provider batch once per subject/exam combination. Subsequent Pro
  // sessions shuffle the stored rows and make no ALOC request.
  const { count: cachedAlocCount } = isPro
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (admin.from("questions") as any)
        .select("id", { count: "exact", head: true })
        .eq("subject_id", subjectId)
        .eq("exam_type", examType)
        .eq("source", "aloc")
    : { count: 0 };

  if (isPro && (cachedAlocCount ?? 0) === 0) {
    const token = process.env.ALOC_ACCESS_TOKEN;
    const slug = subjectSlugs[subject.name.trim().toLowerCase()];
    if (token && slug) {
      const type = examType === "jamb" ? "utme" : "wassce";
      const response = await fetch(`${ALOC_URL}/${ALOC_BATCH_SIZE}?subject=${encodeURIComponent(slug)}&type=${type}`, {
        headers: { Accept: "application/json", AccessToken: token },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (response.ok) {
        const payload = (await response.json()) as { data?: unknown } | unknown[];
        const raw = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
        const imported = raw.map(normalizeAlocQuestion).filter(Boolean).map((question) => ({
          ...question,
          subject_id: subjectId,
          exam_type: examType,
          source: "aloc",
        }));
        if (imported.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin.from("questions") as any).upsert(imported, {
            onConflict: "source,source_question_id",
            ignoreDuplicates: true,
          } as never);
          ({ data: questions } = await admin
            .from("questions")
            .select("id, prompt, options, correct_answer, explanation, topic, year, subject_id, exam_type")
            .eq("subject_id", subjectId)
            .eq("exam_type", examType)
            .limit(Math.max(limit * 4, ALOC_BATCH_SIZE)));
        }
      }
    }
  }

  return NextResponse.json({ questions: shuffle((questions ?? []) as StoredQuestion[]).slice(0, limit), isPro });
}
