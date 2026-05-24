import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateStreak(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: streak } = await supabase
    .from("streaks")
    .select("id, current_count, longest_count, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle();

  // No streak record yet — create one
  if (!streak) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_count: 1,
      longest_count: 1,
      last_activity_date: today,
    });
    return;
  }

  // Already studied today — do nothing
  if (streak.last_activity_date === today) return;

  // Studied yesterday — continue streak
  if (streak.last_activity_date === yesterdayStr) {
    const newCount = streak.current_count + 1;
    await supabase
      .from("streaks")
      .update({
        current_count: newCount,
        longest_count: Math.max(newCount, streak.longest_count),
        last_activity_date: today,
      })
      .eq("id", streak.id);
    return;
  }

  // Missed one or more days — reset streak to 1
  await supabase
    .from("streaks")
    .update({
      current_count: 1,
      longest_count: streak.longest_count, // keep best streak ever
      last_activity_date: today,
    })
    .eq("id", streak.id);
}
