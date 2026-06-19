// Prepcore - JAMB/WAEC exam awareness

import type { createClient } from "@/services/supabase/client";
import type { ExamType } from "@/types/app";
import type { QuestionForSession } from "@/services/api/questions";

type AppSupabaseClient = ReturnType<typeof createClient>;

export async function saveSessionResult(
  supabase: AppSupabaseClient,
  input: {
    userId: string;
    mode: "practice" | "mock";
    score: number;
    questions: QuestionForSession[];
    selectedAnswers: Record<string, string>;
    examType: ExamType;
  },
): Promise<string | null> {
  const answeredQuestions =
    input.mode === "practice"
      ? input.questions.filter((q) => input.selectedAnswers[q.id])
      : input.questions;

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: input.userId,
      mode: input.mode,
      score: input.score,
      total_questions: answeredQuestions.length,
      exam_type: input.examType,
      completed_at: new Date().toISOString(),
    } as never)
    .select("id")
    .single();

  if (sessionError || !session) return null;

  const sessionId = (session as { id: string }).id;
  const answerRows = answeredQuestions.map((q) => ({
    session_id: sessionId,
    question_id: q.id,
    selected_answer: input.selectedAnswers[q.id] ?? null,
    is_correct: input.selectedAnswers[q.id] === q.correct_answer,
    exam_type: input.examType,
  }));

  if (answerRows.length > 0) {
    await supabase.from("answers").insert(answerRows as never);
  }

  return sessionId;
}
