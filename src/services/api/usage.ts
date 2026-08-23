import type { createClient } from "@/services/supabase/client";

type AppSupabaseClient = ReturnType<typeof createClient>;

export async function incrementMockExamUsage(
  supabase: AppSupabaseClient,
  userId: string,
) {
  const today = new Date().toISOString().split("T")[0];

  await supabase.rpc("increment_mock_exam_usage", {
    p_user_id: userId,
    p_date: today,
  });
}
