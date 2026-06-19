import type { Database, Json } from "@/types/database";
import type { createClient } from "@/services/supabase/client";
import type { ExamType } from "@/types/app";

type AppSupabaseClient = ReturnType<typeof createClient>;

export type QuestionForSession = {
  id: string;
  prompt: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  topic: string;
  year: number | null;
  subject_id: string;
  exam_type: ExamType;
};

export type SubjectForExam = {
  id: string;
  name: string;
  exam_type: ExamType;
  question_count: number;
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
    year: row.year ?? null,
    subject_id: row.subject_id,
    exam_type: "exam_type" in row ? (row.exam_type as ExamType) : "jamb",
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
  examType: ExamType = "jamb",
): Promise<QuestionForSession[]> {
  if (examType === "jamb") {
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
  }

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, prompt, options, correct_answer, explanation, topic, year, subject_id, exam_type",
    )
    .eq("subject_id", subjectId)
    .eq("exam_type", examType)
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

export async function getSubjectsByExamType(
  supabase: AppSupabaseClient,
  examType: ExamType,
): Promise<SubjectForExam[]> {
  const { data: rpcSubjects, error: rpcError } = await supabase.rpc(
    "get_subjects_by_exam_type",
    { p_exam_type: examType } as never,
  );

  if (!rpcError && rpcSubjects) {
    return (
      rpcSubjects as unknown as Array<{
        subject_id: string;
        subject_name: string;
        question_count: number;
        exam_type?: ExamType;
      }>
    ).map((subject) => ({
      id: subject.subject_id,
      name: subject.subject_name,
      exam_type: (subject.exam_type ?? examType) as ExamType,
      question_count: subject.question_count ?? 0,
    }));
  }

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, exam_type")
    .eq("exam_type", examType)
    .order("name", { ascending: true });

  if (error || !data) return [];

  return data.map((subject) => ({
    id: subject.id,
    name: subject.name,
    exam_type: subject.exam_type as ExamType,
    question_count: 0,
  }));
}

export async function getAvailableYears(
  supabase: AppSupabaseClient,
  subjectId: string,
  examType: ExamType,
): Promise<number[]> {
  const { data: rpcYears, error: rpcError } = await supabase.rpc(
    "get_available_years",
    { p_subject_id: subjectId, p_exam_type: examType } as never,
  );

  if (!rpcError && rpcYears) {
    return (rpcYears as Array<{ year: number } | number>)
      .map((item) => (typeof item === "number" ? item : item.year))
      .filter((year) => Number.isFinite(year));
  }

  const { data, error } = await supabase
    .from("questions")
    .select("year")
    .eq("subject_id", subjectId)
    .eq("exam_type", examType)
    .not("year", "is", null)
    .order("year", { ascending: false });

  if (error || !data) return [];

  return [
    ...new Set(
      data
        .map((row) => row.year)
        .filter((year): year is number => year !== null),
    ),
  ];
}

export async function getQuestionsBySubjectYear(
  supabase: AppSupabaseClient,
  subjectId: string,
  examType: ExamType,
  year: number,
  limit = 25,
): Promise<QuestionForSession[]> {
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, prompt, options, correct_answer, explanation, topic, year, subject_id, exam_type",
    )
    .eq("subject_id", subjectId)
    .eq("exam_type", examType)
    .eq("year", year)
    .limit(Math.max(limit * 4, limit));

  if (error || !data) return [];

  return shuffle(data)
    .map((row) => normalizeQuestion(row))
    .filter(isQuestionForSession)
    .slice(0, limit);
}
