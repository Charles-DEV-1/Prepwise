import { createClient } from "@/services/supabase/client";
import type { ExamType } from "@/types/app";

export async function getProgressData(
  userId: string,
  examType: ExamType = "jamb",
) {
  const supabase = createClient();

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(
      `
      id,
      score,
      total_questions,
      created_at
    `,
    )
    .eq("user_id", userId)
    .eq("exam_type", examType)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sessions || [];
}
