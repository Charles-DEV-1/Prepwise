// Prepcore - Free Diagnostic Test

import { createClient } from "@/services/supabase/client";
import { DEPARTMENT_SUBJECTS, type Department } from "@/lib/departments";
import type { Json } from "@/types/database";

export type DiagnosticQuestion = {
  id: string;
  subject_id: string;
  prompt: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string | null;
  subject_name: string;
};

const FALLBACK_SUBJECTS: Record<string, string> = {
  "Christian Religious Studies": "Biology",
};

function asOptions(value: Json): Record<string, string> {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export async function getDiagnosticQuestions(department: Department): Promise<DiagnosticQuestion[]> {
  const supabase = createClient();
  const requestedSubjects = DEPARTMENT_SUBJECTS[department];
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("exam_type", "jamb")
    .in("name", [...requestedSubjects, ...Object.values(FALLBACK_SUBJECTS)]);

  if (!subjects?.length) return [];
  const subjectByName = new Map(subjects.map((subject) => [subject.name, subject]));
  const results = await Promise.all(requestedSubjects.map(async (requestedName) => {
    const direct = subjectByName.get(requestedName);
    const fallbackName = FALLBACK_SUBJECTS[requestedName];
    const fallback = fallbackName ? subjectByName.get(fallbackName) : undefined;
    const candidates = direct ? [{ subject: direct, name: direct.name }, ...(fallback ? [{ subject: fallback, name: fallback.name }] : [])] : fallback ? [{ subject: fallback, name: fallback.name }] : [];

    for (const candidate of candidates) {
      const { data: questions } = await supabase
      .from("questions")
      .select("id, subject_id, prompt, options, correct_answer, topic")
      .eq("subject_id", candidate.subject.id)
      .eq("exam_type", "jamb")
      .limit(20);
      if (questions && questions.length >= 5) {
        return [...questions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map((question) => ({ ...question, options: asOptions(question.options), subject_name: candidate.name }));
      }
    }
    return [];
  }));

  return results.flat().sort(() => Math.random() - 0.5);
}

export async function saveDiagnosticResult(params: {
  department: Department;
  subjectsTested: string[];
  totalQuestions: number;
  totalCorrect: number;
  subjectBreakdown: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
}) {
  const supabase = createClient();
  const sessionToken = crypto.randomUUID();
  const scorePercent = params.totalQuestions ? Math.round((params.totalCorrect / params.totalQuestions) * 100) : 0;
  const estimatedJambScore = Math.round(scorePercent * 3.6);
  const { error } = await supabase.from("diagnostic_test_results").insert({
    department: params.department,
    subjects_tested: params.subjectsTested,
    total_questions: params.totalQuestions,
    total_correct: params.totalCorrect,
    score_percent: scorePercent,
    estimated_jamb_score: estimatedJambScore,
    weak_topics: params.weakTopics,
    subject_breakdown: params.subjectBreakdown,
    session_token: sessionToken,
    user_agent: typeof navigator === "undefined" ? null : navigator.userAgent,
  });
  if (error) throw error;
  if (typeof window !== "undefined") localStorage.setItem("prepcore_diagnostic_token", sessionToken);
  return { sessionToken, scorePercent, estimatedJambScore };
}