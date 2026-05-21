import type { SupabaseClient } from "@supabase/supabase-js";

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
) {
  // Run all queries in parallel for speed
  const [sessionsResult, profileResult, streakResult] = await Promise.all([
    // All completed sessions
    supabase
      .from("sessions")
      .select("id, score, total_questions, mode, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

    // User profile (exam date, target score)
    supabase
      .from("users")
      .select("exam_date, target_score, exam_type")
      .eq("id", userId)
      .single(),

    // Streak
    supabase
      .from("streaks")
      .select("current_count, longest_count, last_activity_date")
      .eq("user_id", userId)
      .single(),
  ]);

  const sessions = sessionsResult.data ?? [];
  const profile = profileResult.data;
  const streak = streakResult.data;

  // Calculate stats
  const totalQuestionsAnswered = sessions.reduce(
    (sum, s) => sum + (s.total_questions ?? 0),
    0,
  );

  const completedSessions = sessions.filter((s) => s.score !== null);
  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            completedSessions.length,
        )
      : 0;

  // Days until exam
  let daysUntilExam = null;
  if (profile?.exam_date) {
    const examDate = new Date(profile.exam_date);
    const today = new Date();
    const diff = Math.ceil(
      (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    daysUntilExam = diff > 0 ? diff : 0;
  }

  // Recent sessions (last 3)
  const recentSessions = sessions.slice(0, 3).map((s) => ({
    id: s.id,
    type: s.mode === "mock" ? "Mock exam" : "Practice",
    score: s.score ?? 0,
    totalQuestions: s.total_questions ?? 0,
    date: new Date(s.created_at).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    }),
  }));

  // Get weak topics from answers
  const { data: weakData } = await supabase
    .from("answers")
    .select(
      `
      is_correct,
      question:questions (
        topic,
        subject:subjects ( name )
      )
    `,
    )
    .in(
      "session_id",
      sessions.slice(0, 10).map((s) => s.id),
    );

  // Calculate accuracy per topic
  const topicMap: Record<
    string,
    { correct: number; total: number; subject: string }
  > = {};

  if (weakData) {
    weakData.forEach((a: never) => {
      const topic = (a as never as { question: { topic: string } }).question
        ?.topic;
      const subject = (
        a as never as { question: { subject: { name: string } } }
      ).question?.subject?.name;
      const isCorrect = (a as never as { is_correct: boolean }).is_correct;
      if (!topic || !subject) return;
      if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0, subject };
      topicMap[topic].total++;
      if (isCorrect) topicMap[topic].correct++;
    });
  }

  const weakTopics = Object.entries(topicMap)
    .map(([topic, { correct, total, subject }]) => ({
      topic,
      subject,
      accuracy: Math.round((correct / total) * 100),
    }))
    .filter((t) => t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  return {
    averageScore,
    totalQuestionsAnswered,
    streak: streak?.current_count ?? 0,
    daysUntilExam,
    examType: profile?.exam_type ?? "JAMB",
    targetScore: profile?.target_score ?? 200,
    recentSessions,
    weakTopics,
    hasSessions: sessions.length > 0,
  };
}
