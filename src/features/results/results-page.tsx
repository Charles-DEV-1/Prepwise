"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, Share2, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/services/supabase/client";
import { cn } from "@/lib/utils";

type Answer = {
  id: string;
  selected_answer: string | null;
  is_correct: boolean;
  question: {
    id: string;
    prompt: string;
    options: Record<string, string>;
    correct_answer: string;
    explanation: string;
    topic: string;
    year: number;
  };
};

type SubjectStat = {
  label: string;
  correct: number;
  total: number;
  percent: number;
};

export function ResultsPage({ id }: { id: string }) {
  const supabase = createClient();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    void loadResults();
  }, [id]);

  async function loadResults() {
    setLoading(true);

    // Get session
    const { data: session } = await supabase
      .from("sessions")
      .select("score, total_questions")
      .eq("id", id)
      .single();

    if (session) {
      setScore(session.score ?? 0);
      setTotalQuestions(session.total_questions ?? 0);
    }

    // Get answers with questions
    const { data: answerData } = await supabase
      .from("answers")
      .select(
        `
        id,
        selected_answer,
        is_correct,
        question:questions (
          id, prompt, options, correct_answer,
          explanation, topic, year,
          subject:subjects ( name )
        )
      `,
      )
      .eq("session_id", id);

    if (answerData) {
      setAnswers(answerData as never);

      // Build subject stats
      const stats: Record<string, { correct: number; total: number }> = {};
      answerData.forEach((a: never) => {
        const subjectName =
          (a as never as { question: { subject: { name: string } } }).question
            ?.subject?.name ?? "Unknown";
        if (!stats[subjectName]) stats[subjectName] = { correct: 0, total: 0 };
        stats[subjectName].total++;
        if ((a as never as { is_correct: boolean }).is_correct) {
          stats[subjectName].correct++;
        }
      });

      const statsArray = Object.entries(stats).map(
        ([label, { correct, total }]) => ({
          label,
          correct,
          total,
          percent: Math.round((correct / total) * 100),
        }),
      );
      setSubjectStats(statsArray);
    }

    setLoading(false);
  }

  const wrongAnswers = answers.filter((a) => !a.is_correct);
  const correctCount = answers.filter((a) => a.is_correct).length;
  const displayedWrong = showAll ? wrongAnswers : wrongAnswers.slice(0, 5);

  const scoreColor =
    score >= 60
      ? "text-green-600"
      : score >= 40
        ? "text-amber-500"
        : "text-red-500";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">📊</div>
          <p className="text-lg font-semibold text-navy">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <section className="soft-blue-gradient rounded-[2rem] border border-border p-6 shadow-soft md:p-8">
        <Badge className="border-blue-200 bg-white text-primary">
          Exam complete
        </Badge>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Your score</p>
            <h1
              className={cn(
                "mt-1 text-7xl font-bold tracking-tight",
                scoreColor,
              )}
            >
              {score}%
            </h1>
            <p className="mt-2 text-base font-medium text-slate-600">
              {correctCount} correct out of {totalQuestions} questions
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {score >= 60
                ? "Great performance! Keep practising to improve further."
                : score >= 40
                  ? "Good effort. Focus on your weak subjects to improve."
                  : "Keep going — consistent practice will raise your score."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const text = `I scored ${score}% on a JAMB Mock Exam on Prepwise! 🎯\nPractice for free at prepwise-two-mu.vercel.app`;
              void navigator.share?.({ text }) ??
                navigator.clipboard.writeText(text);
            }}
          >
            <Share2 className="h-4 w-4" />
            Share result
          </Button>
        </div>
      </section>

      {/* Subject breakdown */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {subjectStats.map((stat) => (
          <Card key={stat.label} className="border-border bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="font-semibold text-navy">{stat.label}</p>
              <p
                className={cn(
                  "mt-2 text-2xl font-bold",
                  stat.percent >= 60
                    ? "text-green-600"
                    : stat.percent >= 40
                      ? "text-amber-500"
                      : "text-red-500",
                )}
              >
                {stat.percent}%
              </p>
              <p className="text-xs text-slate-500 mb-3">
                {stat.correct} / {stat.total} correct
              </p>
              <Progress value={stat.percent} />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Performance + Wrong answers */}
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber" />
              Performance summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              `Total questions: ${totalQuestions}`,
              `Correct answers: ${correctCount}`,
              `Wrong answers: ${wrongAnswers.length}`,
              `Score: ${score}%`,
              `Weakest subject: ${subjectStats.sort((a, b) => a.percent - b.percent)[0]?.label ?? "—"}`,
              `Strongest subject: ${subjectStats.sort((a, b) => b.percent - a.percent)[0]?.label ?? "—"}`,
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-[#F8FAFC] px-4 py-3 text-sm text-slate-600"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>
              Wrong answers review
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({wrongAnswers.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wrongAnswers.length === 0 ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-700">Perfect score!</p>
                <p className="text-sm text-slate-500 mt-1">
                  You answered every question correctly.
                </p>
              </div>
            ) : (
              <>
                {displayedWrong.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-2xl border border-border bg-[#F8FAFC] p-4 space-y-3"
                  >
                    <p className="font-semibold text-navy text-sm leading-6">
                      {answer.question?.prompt}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-3.5 w-3.5" />
                        Your answer:{" "}
                        {answer.selected_answer
                          ? `${answer.selected_answer}. ${answer.question?.options[answer.selected_answer] ?? ""}`
                          : "Not answered"}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Correct: {answer.question?.correct_answer}.{" "}
                        {answer.question?.options[
                          answer.question.correct_answer
                        ] ?? ""}
                      </span>
                    </div>
                    {answer.question?.explanation && (
                      <p className="text-xs text-slate-500 leading-5 border-t border-border pt-2">
                        {answer.question.explanation}
                      </p>
                    )}
                  </div>
                ))}
                {wrongAnswers.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll
                      ? "Show less"
                      : `Show all ${wrongAnswers.length} wrong answers`}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/exam">
            <RotateCcw className="h-4 w-4" />
            Retake exam
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/practice">Practice weak subjects</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
