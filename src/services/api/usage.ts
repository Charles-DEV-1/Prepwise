import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_MOCK_LIMIT = 3;

export async function canTakeMockExam(
  supabase: any,
  userId: string,
  isPro: boolean,
): Promise<{ allowed: boolean; remaining: number }> {
  if (isPro) return { allowed: true, remaining: 999 };

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("daily_usage")
    .select("mock_exams_taken")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  const taken = data?.mock_exams_taken ?? 0;
  const remaining = Math.max(0, FREE_MOCK_LIMIT - taken);

  return { allowed: taken < FREE_MOCK_LIMIT, remaining };
}

export async function incrementMockExamUsage(supabase: any, userId: string) {
  const today = new Date().toISOString().split("T")[0];

  await supabase.from("daily_usage").upsert(
    {
      user_id: userId,
      date: today,
      mock_exams_taken: 1,
    },
    {
      onConflict: "user_id,date",
      ignoreDuplicates: false,
    },
  );

  // Increment the count
  await supabase.rpc("increment_mock_exam_usage", {
    p_user_id: userId,
    p_date: today,
  });
}
