"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Clock,
  CheckCircle2,
  XCircle,
  Crown,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/services/supabase/client";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  prompt: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  topic: string;
  year: number;
  subject_name?: string;
};

type LeaderboardEntry = {
  user_id: string;
  score: number;
  total_questions: number;
  percent: number;
  completed_at: string;
  user_name: string;
};

type Phase =
  | "loading"
  | "intro"
  | "quiz"
  | "results"
  | "already_done"
  | "no_quiz";

export function WeeklyQuizPage() {
  const supabase = createClient();

  const [phase, setPhase] = useState<Phase>("loading");
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("You");
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [weekLabel, setWeekLabel] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const loadQuiz = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);
    const name = user.user_metadata?.full_name as string | undefined;
    setCurrentUserName(
      name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "You",
    );

    // Get current active quiz
    const today = new Date().toISOString().split("T")[0];
    const { data: quiz } = (await supabase
      .from("weekly_quizzes")
      .select("id, week_start, week_end, question_ids")
      .eq("is_active", true)
      .lte("week_start", today)
      .gte("week_end", today)
      .single()) as unknown as {
      data: {
        id: string;
        week_start: string;
        week_end: string;
        question_ids: string[];
      } | null;
    };

    if (!quiz) {
      setPhase("no_quiz");
      return;
    }

    setQuizId(quiz.id);

    // Format week label
    const start = new Date(quiz.week_start);
    const end = new Date(quiz.week_end);
    setWeekLabel(
      `${start.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`,
    );

    // Time left
    const endDate = new Date(quiz.week_end);
    endDate.setHours(23, 59, 59);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    setTimeLeft(
      diffDays > 0 ? `${diffDays}d ${diffHours}h left` : `${diffHours}h left`,
    );

    // Check if user already completed this quiz
    const { data: existing } = (await supabase
      .from("weekly_quiz_entries")
      .select("score, total_questions, completed_at")
      .eq("quiz_id", quiz.id)
      .eq("user_id", user.id)
      .single()) as unknown as {
      data: {
        score: number;
        total_questions: number;
        completed_at: string;
      } | null;
    };

    if (existing) {
      setScore(existing.score);
      await loadLeaderboard(quiz.id, user.id);
      setPhase("already_done");
      return;
    }

    // Load questions
    const { data: questionData } = await supabase
      .from("questions")
      .select(
        `
        id, prompt, options, correct_answer,
        explanation, topic, year,
        subject:subjects(name)
      `,
      )
      .in("id", quiz.question_ids);

    if (questionData) {
      const mapped = questionData.map((q: never) => ({
        ...(q as object),
        subject_name:
          (q as { subject?: { name?: string } }).subject?.name ?? "General",
      })) as Question[];
      // Keep original quiz order
      const ordered = (quiz.question_ids as string[])
        .map((qid) => mapped.find((q) => q.id === qid))
        .filter(Boolean) as Question[];
      setQuestions(ordered);
    }

    await loadLeaderboard(quiz.id, user.id);
    setPhase("intro");
  }, [supabase]);

  async function loadLeaderboard(qId: string, userId: string) {
    const { data: entries } = await supabase
      .from("weekly_quiz_entries")
      .select("user_id, score, total_questions, completed_at")
      .eq("quiz_id", qId)
      .order("score", { ascending: false })
      .limit(10);

    if (!entries) return;

    // Get user names
    const userIds = entries.map(
      (e: never) => (e as { user_id: string }).user_id,
    );
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", userIds);

    const userMap: Record<string, string> = {};
    (users ?? []).forEach((u: never) => {
      const user = u as { id: string; full_name?: string; email?: string };
      const name =
        user.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Student";
      userMap[user.id] = name;
    });

    const board: LeaderboardEntry[] = entries.map((e: never) => {
      const entry = e as {
        user_id: string;
        score: number;
        total_questions: number;
        completed_at: string;
      };
      return {
        user_id: entry.user_id,
        score: entry.score,
        total_questions: entry.total_questions,
        percent:
          entry.total_questions > 0
            ? Math.round((entry.score / entry.total_questions) * 100)
            : 0,
        completed_at: entry.completed_at,
        user_name: userMap[entry.user_id] ?? "Student",
      };
    });

    setLeaderboard(board);

    const mine = board.find((e) => e.user_id === userId);
    if (mine) setMyEntry(mine);
  }

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const question = questions[currentIndex];

  function handleSelect(key: string) {
    if (!submitted) setSelectedAnswer(key);
  }

  function handleSubmit() {
    if (!selectedAnswer || !question) return;
    setSubmitted(true);
    setAnswers((prev) => ({ ...prev, [question.id]: selectedAnswer }));
  }

  function handleNext() {
    setSelectedAnswer(null);
    setSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      void finishQuiz();
    }
  }

  async function finishQuiz() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !quizId) return;

    const finalAnswers = { ...answers };
    if (selectedAnswer && question) {
      finalAnswers[question.id] = selectedAnswer;
    }

    const correct = questions.filter(
      (q) => finalAnswers[q.id] === q.correct_answer,
    ).length;

    setScore(correct);

    // Save entry to weekly_quiz_entries
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.from("weekly_quiz_entries").insert([
        {
          quiz_id: quizId,
          user_id: user.id,
          score: correct,
          total_questions: questions.length,
          answers: finalAnswers,
          completed_at: new Date().toISOString(),
        },
      ] as any);

      if (response?.error) {
        console.error("Error saving quiz entry:", response.error);
        // Still continue to results even if save fails
      }

      await loadLeaderboard(quizId, user.id);
      setPhase("results");
    } catch (err) {
      console.error("Error in finishQuiz:", err);
      setPhase("results");
    }
  }

  const progress =
    questions.length > 0
      ? Math.round(
          ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100,
        )
      : 0;

  // ── LOADING ───────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading this week's quiz...</p>
      </div>
    );
  }

  // ── NO QUIZ ───────────────────────────────────────────────
  if (phase === "no_quiz") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="py-16 text-center space-y-4">
            <div className="text-5xl">📅</div>
            <p className="text-xl font-bold text-navy">No quiz this week yet</p>
            <p className="text-sm text-slate-500">
              A new quiz drops every Monday. Check back soon!
            </p>
            <Button asChild variant="outline">
              <Link href="/practice">Practice in the meantime</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700 gap-1">
            <Trophy className="h-3 w-3" />
            Weekly Quiz
          </Badge>
          <h1 className="text-2xl font-bold text-navy">
            This week's challenge
          </h1>
          <p className="text-slate-500 text-sm">{weekLabel}</p>
        </div>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-softblue p-3">
                <p className="text-xl font-bold text-primary">
                  {questions.length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Questions</p>
              </div>
              <div className="rounded-xl bg-softblue p-3">
                <p className="text-xl font-bold text-primary">Mixed</p>
                <p className="text-xs text-slate-500 mt-0.5">Subjects</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="font-bold text-amber-600 text-sm">{timeLeft}</p>
                <p className="text-xs text-slate-500 mt-0.5">Remaining</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-[#F8FAFC] p-4 space-y-2">
              <p className="text-sm font-semibold text-navy">How it works</p>
              <ul className="space-y-1">
                {[
                  "Answer 20 questions from all subjects",
                  "You can only attempt this quiz once",
                  "Top 10 scores appear on the leaderboard",
                  "Leaderboard resets every Monday",
                ].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setPhase("quiz")}
            >
              Start Quiz →
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard preview */}
        {leaderboard.length > 0 && (
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Current leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                entries={leaderboard}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────
  if (phase === "quiz" && question) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Badge className="border-amber-200 bg-amber-50 text-amber-700 gap-1">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </Badge>
        </div>
        <Progress value={progress} />

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-6 space-y-5">
            {/* Subject + year badge */}
            <div className="flex gap-2">
              {question.subject_name && (
                <Badge className="border-border text-xs">
                  {question.subject_name}
                </Badge>
              )}
              {question.year && (
                <Badge className="border-border text-xs">
                  JAMB {question.year}
                </Badge>
              )}
            </div>

            {/* Question */}
            <p className="text-lg font-semibold leading-8 text-navy">
              {question.prompt}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value]) => (
                <button
                  key={key}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition",
                    "hover:border-primary hover:bg-softblue",
                    selectedAnswer === key &&
                      !submitted &&
                      "border-primary bg-softblue",
                    submitted &&
                      key === question.correct_answer &&
                      "border-green-500 bg-green-50",
                    submitted &&
                      selectedAnswer === key &&
                      key !== question.correct_answer &&
                      "border-red-400 bg-red-50",
                  )}
                  onClick={() => handleSelect(key)}
                  disabled={submitted}
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold text-primary">
                    {key}
                  </span>
                  {value}
                  {submitted && key === question.correct_answer && (
                    <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-green-500" />
                  )}
                  {submitted &&
                    selectedAnswer === key &&
                    key !== question.correct_answer && (
                      <XCircle className="ml-auto h-4 w-4 flex-shrink-0 text-red-500" />
                    )}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {submitted && (
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  selectedAnswer === question.correct_answer
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50",
                )}
              >
                <p
                  className={cn(
                    "font-semibold text-sm mb-1",
                    selectedAnswer === question.correct_answer
                      ? "text-green-700"
                      : "text-red-600",
                  )}
                >
                  {selectedAnswer === question.correct_answer
                    ? "✓ Correct!"
                    : `✗ Wrong — Answer is ${question.correct_answer}`}
                </p>
                <p className="text-xs text-slate-600 leading-5">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end">
              {!submitted ? (
                <Button disabled={!selectedAnswer} onClick={handleSubmit}>
                  Submit answer
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentIndex < questions.length - 1
                    ? "Next question →"
                    : "Finish quiz →"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────
  if (phase === "results" || phase === "already_done") {
    const percent =
      questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : (myEntry?.percent ?? 0);
    const total = questions.length || myEntry?.total_questions || 20;
    const myRank =
      leaderboard.findIndex((e) => e.user_id === currentUserId) + 1;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Score hero */}
        <div className="soft-blue-gradient rounded-[2rem] border border-border p-6 shadow-soft text-center space-y-3">
          <Badge className="border-amber-200 bg-white text-amber-700 gap-1">
            <Trophy className="h-3 w-3" />
            Weekly Quiz Complete
          </Badge>
          <div>
            <p className="text-sm text-slate-500">Your score</p>
            <p
              className={cn(
                "text-6xl font-bold",
                percent >= 60
                  ? "text-green-600"
                  : percent >= 40
                    ? "text-amber-500"
                    : "text-red-500",
              )}
            >
              {percent}%
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {score} correct out of {total} questions
            </p>
          </div>
          {myRank > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-base px-4 py-1">
              #{myRank} on the leaderboard
            </Badge>
          )}
          {phase === "already_done" && (
            <p className="text-xs text-slate-400">
              You already completed this week's quiz
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              This week's leaderboard
              <span className="ml-auto text-xs font-normal text-slate-400">
                {weekLabel}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-sm">
                Be the first on the leaderboard!
              </p>
            ) : (
              <LeaderboardList
                entries={leaderboard}
                currentUserId={currentUserId}
              />
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/leaderboard">
              <Trophy className="h-4 w-4" />
              View full leaderboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/practice">
              <RotateCcw className="h-4 w-4" />
              Practice now
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exam">Take mock exam</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Leaderboard list component ─────────────────────────────
function LeaderboardList({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
}) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isMe = entry.user_id === currentUserId;
        return (
          <div
            key={entry.user_id}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3 transition",
              isMe
                ? "border-primary bg-softblue"
                : "border-border bg-white hover:bg-[#F8FAFC]",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg w-7 text-center flex-shrink-0">
                {index < 3 ? (
                  medals[index]
                ) : (
                  <span className="text-sm font-bold text-slate-400">
                    #{index + 1}
                  </span>
                )}
              </span>
              <div>
                <p
                  className={cn(
                    "font-semibold text-sm",
                    isMe ? "text-primary" : "text-navy",
                  )}
                >
                  {entry.user_name}
                  {isMe && (
                    <span className="ml-2 text-xs font-normal text-primary/70">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {entry.score} / {entry.total_questions} correct
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-bold text-lg",
                  entry.percent >= 60
                    ? "text-green-600"
                    : entry.percent >= 40
                      ? "text-amber-500"
                      : "text-red-500",
                )}
              >
                {entry.percent}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
