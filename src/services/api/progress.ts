import { createClient } from "@/services/supabase/client";

export async function getProgressData(userId: string) {
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
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sessions || [];
}
