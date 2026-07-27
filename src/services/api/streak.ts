import { awardPoints } from "@/services/api/points";
import type { createClient } from "@/services/supabase/client";

type AppSupabaseClient = ReturnType<typeof createClient>;

type StreakRow = {
  id: string;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
  last_activity_at: string | null;
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isActiveStreak(lastActivityAt: string | null) {
  if (!lastActivityAt) return false;
  return Date.now() - new Date(lastActivityAt).getTime() <= 24 * 60 * 60 * 1000;
}

export async function getCurrentStreak(
  supabase: AppSupabaseClient,
  userId: string,
) {
  const { data: streak } = await supabase
    .from("streaks")
    .select("id, current_count, longest_count, last_activity_date, last_activity_at")
    .eq("user_id", userId)
    .maybeSingle<StreakRow>();

  if (!streak) return 0;

  if (isActiveStreak(streak.last_activity_at)) {
    return streak.current_count;
  }

  if (streak.current_count !== 0) {
    await supabase
      .from("streaks")
      .update({ current_count: 0 } as never)
      .eq("id", streak.id);
  }

  return 0;
}

export async function updateStreak(
  supabase: AppSupabaseClient,
  userId: string,
) {
  const today = getDateKey();

  const { data: streak } = await supabase
    .from("streaks")
    .select("id, current_count, longest_count, last_activity_date, last_activity_at")
    .eq("user_id", userId)
    .maybeSingle<StreakRow>();

  // No streak record yet - create one from this completed practice/mock.
  if (!streak) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_count: 1,
      longest_count: 1,
      last_activity_date: today,
      last_activity_at: new Date().toISOString(),
    } as never);
    return;
  }

  // More activity on the same day keeps the 24-hour streak window alive but
  // does not increment the day count twice.
  if (streak.last_activity_date === today) {
    await supabase
      .from("streaks")
      .update({ last_activity_at: new Date().toISOString() } as never)
      .eq("id", streak.id);
    return;
  }

  // A new calendar day within 24 hours continues the streak.
  if (isActiveStreak(streak.last_activity_at)) {
    const newCount = streak.current_count + 1;
    await supabase
      .from("streaks")
      .update({
        current_count: newCount,
        longest_count: Math.max(newCount, streak.longest_count),
        last_activity_date: today,
        last_activity_at: new Date().toISOString(),
      } as never)
      .eq("id", streak.id);
    // Award 5 points for maintaining streak
    await awardPoints(supabase, userId, "streak");
    return;
  }

  // Missed one or more days - start a fresh streak from today's activity.
  await supabase
    .from("streaks")
    .update({
      current_count: 1,
      longest_count: streak.longest_count,
      last_activity_date: today,
      last_activity_at: new Date().toISOString(),
    } as never)
    .eq("id", streak.id);
}
