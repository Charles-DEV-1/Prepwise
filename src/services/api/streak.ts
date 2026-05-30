import { awardPoints } from "@/services/api/points";
import type { createClient } from "@/services/supabase/client";

type AppSupabaseClient = ReturnType<typeof createClient>;

type StreakRow = {
  id: string;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterdayDateKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return getDateKey(yesterday);
}

function isActiveStreakDate(lastActivityDate: string | null) {
  if (!lastActivityDate) return false;

  return (
    lastActivityDate === getDateKey() ||
    lastActivityDate === getYesterdayDateKey()
  );
}

export async function getCurrentStreak(
  supabase: AppSupabaseClient,
  userId: string,
) {
  const { data: streak } = await supabase
    .from("streaks")
    .select("id, current_count, longest_count, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle<StreakRow>();

  if (!streak) return 0;

  if (isActiveStreakDate(streak.last_activity_date)) {
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
  const yesterday = getYesterdayDateKey();

  const { data: streak } = await supabase
    .from("streaks")
    .select("id, current_count, longest_count, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle<StreakRow>();

  // No streak record yet - create one from this completed practice/mock.
  if (!streak) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_count: 1,
      longest_count: 1,
      last_activity_date: today,
    } as never);
    return;
  }

  // Already completed a qualifying activity today.
  if (streak.last_activity_date === today) return;

  // Completed a qualifying activity yesterday - continue streak.
  if (streak.last_activity_date === yesterday) {
    const newCount = streak.current_count + 1;
    await supabase
      .from("streaks")
      .update({
        current_count: newCount,
        longest_count: Math.max(newCount, streak.longest_count),
        last_activity_date: today,
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
    } as never)
    .eq("id", streak.id);
}
