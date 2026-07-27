import type { createClient } from "@/services/supabase/client";

type AppSupabaseClient = ReturnType<typeof createClient>;

export const RANKS = [
  { name: "Beginner", emoji: "🌱", min: 0, color: "#64748B" },
  { name: "Studious", emoji: "📚", min: 100, color: "#185FA5" },
  { name: "Sharp", emoji: "⚡", min: 300, color: "#D97706" },
  { name: "Genius", emoji: "🧠", min: 600, color: "#7C3AED" },
  { name: "Legend", emoji: "🏆", min: 1000, color: "#DC2626" },
];

export function getRankInfo(points: number) {
  const rank = [...RANKS].reverse().find((r) => points >= r.min) ?? RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const progress = nextRank
    ? Math.round(((points - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;
  return { ...rank, nextRank, progress, points };
}

export async function awardPoints(
  supabase: AppSupabaseClient,
  userId: string,
  type: "practice" | "mock" | "quiz" | "streak",
  score?: number,
) {
  let points = 0;

  if (type === "practice") points += 10;
  if (type === "mock") points += 25;
  if (type === "quiz") points += 20;
  if (type === "streak") points += 5;

  // Bonus points for high scores
  if (score !== undefined) {
    if (score >= 90) points += 20;
    else if (score >= 70) points += 10;
  }

  const { data: before } = await supabase
    .from("user_points")
    .select("total_points")
    .eq("user_id", userId)
    .maybeSingle();
  const previousPoints = Number(before?.total_points ?? 0);
  const { error } = await supabase.rpc("add_user_points", {
    p_user_id: userId,
    p_points: points,
    p_session_type: type,
  } as never);

  if (error) return 0;

  const { data: after } = await supabase
    .from("user_points")
    .select("total_points")
    .eq("user_id", userId)
    .maybeSingle();
  const nextPoints = Number(after?.total_points ?? previousPoints + points);
  const previousRank = getRankInfo(previousPoints);
  const nextRank = getRankInfo(nextPoints);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("prepcore:points-awarded", {
        detail: {
          points,
          rankUp:
            previousRank.name !== nextRank.name
              ? { previous: previousRank.name, next: nextRank.name, emoji: nextRank.emoji }
              : undefined,
        },
      }),
    );
  }

  return points;
}

export async function getUserPoints(
  supabase: AppSupabaseClient,
  userId: string,
) {
  const { data } = await supabase
    .from("user_points")
    .select("total_points, rank, sessions_completed, quizzes_completed")
    .eq("user_id", userId)
    .maybeSingle();

  const points = (data as { total_points?: number } | null)?.total_points ?? 0;
  return getRankInfo(points);
}
