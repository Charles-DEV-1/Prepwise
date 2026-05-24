"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Share2,
  Trophy,
  CheckCircle2,
  XCircle,
  Download,
  MessageCircle,
} from "lucide-react";
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

type SessionSummary = {
  score: number | null;
  total_questions: number | null;
};

type AnswerWithSubject = Answer & {
  question?: Answer["question"] & {
    subject?: { name?: string | null } | null;
  };
};

type SubjectStat = {
  label: string;
  correct: number;
  total: number;
  percent: number;
};

// ── Scorecard component (what gets captured as image) ──────
function ScoreCard({
  cardRef,
  score,
  correctCount,
  totalQuestions,
  subjectStats,
  userName,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  subjectStats: SubjectStat[];
  userName: string;
}) {
  const date = new Date().toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const scoreColor =
    score >= 60 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";

  const grade =
    score >= 80
      ? "Excellent"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Fair"
          : "Keep Practising";

  return (
    <div
      ref={cardRef}
      style={{
        width: "420px",
        background: "linear-gradient(135deg, #185FA5 0%, #1E3A8A 100%)",
        borderRadius: "20px",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
        color: "white",
        position: "absolute",
        left: "-9999px",
        top: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "800",
              letterSpacing: "-0.5px",
            }}
          >
            prepwise
          </div>
          <div style={{ fontSize: "11px", color: "#93C5FD", marginTop: "2px" }}>
            Smart Prep. Higher Scores.
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "10px",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: "600",
          }}
        >
          JAMB Mock Exam
        </div>
      </div>

      {/* Score circle area */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div
          style={{ fontSize: "13px", color: "#93C5FD", marginBottom: "8px" }}
        >
          {userName}&apos;s Score
        </div>
        <div
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "white",
            lineHeight: 1,
          }}
        >
          {score}%
        </div>
        <div
          style={{
            display: "inline-block",
            background: scoreColor,
            borderRadius: "20px",
            padding: "4px 16px",
            fontSize: "13px",
            fontWeight: "700",
            marginTop: "10px",
          }}
        >
          {grade}
        </div>
        <div style={{ fontSize: "13px", color: "#93C5FD", marginTop: "10px" }}>
          {correctCount} correct out of {totalQuestions} questions
        </div>
      </div>

      {/* Subject breakdown */}
      {subjectStats.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#93C5FD",
              marginBottom: "10px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Subject Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {subjectStats.slice(0, 4).map((stat) => (
              <div
                key={stat.label}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "white",
                    width: "100px",
                    flexShrink: 0,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    height: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${stat.percent}%`,
                      height: "100%",
                      background:
                        stat.percent >= 60
                          ? "#4ADE80"
                          : stat.percent >= 40
                            ? "#FCD34D"
                            : "#F87171",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "white",
                    width: "36px",
                    textAlign: "right",
                  }}
                >
                  {stat.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          paddingTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "#93C5FD" }}>{date}</div>
        <div style={{ fontSize: "11px", color: "#93C5FD" }}>
          prepwise-two-mu.vercel.app
        </div>
      </div>
    </div>
  );
}

// ── Main results page ──────────────────────────────────────
export function ResultsPage({ id }: { id: string }) {
  const supabase = useMemo(() => createClient(), []);
  const cardRef = useRef<HTMLDivElement>(null);

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [userName, setUserName] = useState("Student");

  const loadResults = useCallback(async () => {
    setLoading(true);

    // Get user name
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.full_name as string | undefined;
      if (name) {
        setUserName(name.split(" ")[0]);
      } else if (user.email) {
        setUserName(user.email.split("@")[0]);
      }
    }

    // Get session
    const { data: session } = await supabase
      .from("sessions")
      .select("score, total_questions")
      .eq("id", id)
      .single();

    if (session) {
      const s = session as SessionSummary;
      setScore(s.score ?? 0);
      setTotalQuestions(s.total_questions ?? 0);
    }

    // Get answers with questions
    const { data: answerData } = await supabase
      .from("answers")
      .select(
        `
        id, selected_answer, is_correct,
        question:questions (
          id, prompt, options, correct_answer,
          explanation, topic, year,
          subject:subjects ( name )
        )
      `,
      )
      .eq("session_id", id);

    if (answerData) {
      const rows = answerData as AnswerWithSubject[];
      setAnswers(rows);

      const stats: Record<string, { correct: number; total: number }> = {};
      rows.forEach((a) => {
        const subjectName = a.question?.subject?.name ?? "Unknown";
        if (!stats[subjectName]) stats[subjectName] = { correct: 0, total: 0 };
        stats[subjectName].total++;
        if (a.is_correct) stats[subjectName].correct++;
      });

      setSubjectStats(
        Object.entries(stats).map(([label, { correct, total }]) => ({
          label,
          correct,
          total,
          percent: Math.round((correct / total) * 100),
        })),
      );
    }

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  async function downloadCard() {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `prepwise-score-${score}percent.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }

    setDownloading(false);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `I just scored ${score}% on a JAMB Mock Exam on Prepwise! 🎯\n\nSubjects:\n${subjectStats.map((s) => `${s.label}: ${s.percent}%`).join("\n")}\n\nPractice free at prepwise-two-mu.vercel.app`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
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
      {/* Hidden scorecard for image capture */}
      <ScoreCard
        cardRef={cardRef}
        score={score}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        subjectStats={subjectStats}
        userName={userName}
      />

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

          {/* Share buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void downloadCard()}
              disabled={downloading}
            >
              <Download className="h-4 w-4" />
              {downloading ? "Generating..." : "Download card"}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={shareWhatsApp}
            >
              <MessageCircle className="h-4 w-4" />
              Share to WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Preview of sharecard */}
      <section className="rounded-2xl border border-border bg-[#F8FAFC] p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Your shareable result card
        </p>
        <div
          style={{
            background: "linear-gradient(135deg, #185FA5 0%, #1E3A8A 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            maxWidth: "420px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: "800" }}>prepwise</div>
            <div
              style={{
                fontSize: "10px",
                background: "rgba(255,255,255,0.2)",
                padding: "4px 10px",
                borderRadius: "8px",
              }}
            >
              JAMB Mock Exam
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#93C5FD",
                marginBottom: "4px",
              }}
            >
              {userName}&apos;s Score
            </div>
            <div style={{ fontSize: "48px", fontWeight: "800", lineHeight: 1 }}>
              {score}%
            </div>
            <div
              style={{ fontSize: "11px", color: "#93C5FD", marginTop: "6px" }}
            >
              {correctCount} / {totalQuestions} correct
            </div>
          </div>
          {subjectStats.slice(0, 3).map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <div style={{ fontSize: "11px", width: "80px", flexShrink: 0 }}>
                {stat.label}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "3px",
                  height: "5px",
                }}
              >
                <div
                  style={{
                    width: `${stat.percent}%`,
                    height: "100%",
                    background: stat.percent >= 60 ? "#4ADE80" : "#F87171",
                    borderRadius: "3px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  width: "30px",
                  textAlign: "right",
                }}
              >
                {stat.percent}%
              </div>
            </div>
          ))}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: "10px",
              marginTop: "12px",
              fontSize: "10px",
              color: "#93C5FD",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {new Date().toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>prepwise-two-mu.vercel.app</span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void downloadCard()}
            disabled={downloading}
            className="gap-1"
          >
            <Download className="h-3 w-3" />
            {downloading ? "Generating..." : "Download as image"}
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 gap-1"
            onClick={shareWhatsApp}
          >
            <MessageCircle className="h-3 w-3" />
            Share to WhatsApp
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
              `Weakest subject: ${[...subjectStats].sort((a, b) => a.percent - b.percent)[0]?.label ?? "—"}`,
              `Strongest subject: ${[...subjectStats].sort((a, b) => b.percent - a.percent)[0]?.label ?? "—"}`,
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
