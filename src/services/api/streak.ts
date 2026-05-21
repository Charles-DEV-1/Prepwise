type StreakRow = {
  id: string;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
};

type StreakClient = {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        single(): PromiseLike<{ data: StreakRow | null }>;
      };
    };
    insert(values: unknown): PromiseLike<unknown>;
    update(values: unknown): {
      eq(column: string, value: string): PromiseLike<unknown>;
    };
  };
};

export async function updateStreak(supabase: unknown, userId: string) {
  const client = supabase as StreakClient;
  const today = new Date().toISOString().split("T")[0];

  const { data: streak } = await client
    .from("streaks")
    .select("id, current_count, longest_count, last_activity_date")
    .eq("user_id", userId)
    .single();

  if (!streak) {
    await client.from("streaks").insert({
      user_id: userId,
      current_count: 1,
      longest_count: 1,
      last_activity_date: today,
    });
    return;
  }

  if (streak.last_activity_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newCount =
    streak.last_activity_date === yesterdayStr ? streak.current_count + 1 : 1;

  await client
    .from("streaks")
    .update({
      current_count: newCount,
      longest_count: Math.max(newCount, streak.longest_count),
      last_activity_date: today,
    })
    .eq("id", streak.id);
}
