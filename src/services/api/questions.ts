import type { Database, Json } from "@/types/database";
import type { createClient } from "@/services/supabase/client";

type AppSupabaseClient = ReturnType<typeof createClient>;

export type QuestionForSession = {
  id: string;
  prompt: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  topic: string;
  year: number;
  subject_id: string;
};

function isOptionMap(value: Json): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((option) => typeof option === "string")
  );
}

function normalizeQuestion(
  row: Database["public"]["Functions"]["get_random_questions"]["Returns"][number],
): QuestionForSession | null {
  if (!isOptionMap(row.options)) return null;

  return {
    id: row.id,
    prompt: row.prompt,
    options: row.options,
    correct_answer: row.correct_answer,
    explanation: row.explanation ?? "",
    topic: row.topic ?? "",
    year: row.year ?? 0,
    subject_id: row.subject_id,
  };
}

function isQuestionForSession(
  question: QuestionForSession | null,
): question is QuestionForSession {
  return question !== null;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function getRandomQuestionsBySubject(
  supabase: AppSupabaseClient,
  subjectId: string,
  limit: number,
): Promise<QuestionForSession[]> {
  const { data: randomQuestions, error: rpcError } = await supabase.rpc(
    "get_random_questions",
    {
      p_subject_id: subjectId,
      p_limit: limit,
    } as never,
  );

  const randomRows = randomQuestions as
    | Database["public"]["Functions"]["get_random_questions"]["Returns"]
    | null;

  if (!rpcError && randomRows) {
    return randomRows.map(normalizeQuestion).filter(isQuestionForSession);
  }

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, prompt, options, correct_answer, explanation, topic, year, subject_id",
    )
    .eq("subject_id", subjectId)
    .order("year", { ascending: false })
    .limit(Math.max(limit * 4, limit));

  if (error || !data) return [];

  const rows =
    data as Database["public"]["Functions"]["get_random_questions"]["Returns"];

  return shuffle(rows)
    .map(normalizeQuestion)
    .filter(isQuestionForSession)
    .slice(0, limit);
}
