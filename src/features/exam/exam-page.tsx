"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

import { Flag, TimerReset, AlertTriangle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { awardPoints } from "@/services/api/points";
import { createClient } from "@/services/supabase/client";
import { updateStreak } from "@/services/api/streak";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { useUserPlan } from "@/hooks/use-user-plan";
import { incrementMockExamUsage } from "@/services/api/usage";
import { canTakeMockExam } from "@/services/api/usage";
import {
  getSubjectsByExamType,
  getRandomQuestionsBySubject,
  type QuestionForSession,
  type SubjectForExam,
} from "@/services/api/questions";
import type { ExamType } from "@/types/app";

const EXAM_SUBJECTS = [
  { label: "English", id: "11111111-1111-1111-1111-111111111111" },
  { label: "Mathematics", id: "22222222-2222-2222-2222-222222222222" },
  { label: "Physics", id: "33333333-3333-3333-3333-333333333333" },
  { label: "Biology", id: "55555555-5555-5555-5555-555555555555" },
];

const JAMB_DURATION = 7200;
const WAEC_DURATION = 3600;
const JAMB_QUESTIONS_PER_SUBJECT = 45;
const WAEC_TOTAL_QUESTIONS = 50;

type Question = QuestionForSession & {
  subject_label: string;
};

type ExamPhase = "setup" | "exam" | "submitting";

export function ExamPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { isPro } = useUserPlan();
  const [limitReached, setLimitReached] = useState(false);
  const [remaining, setRemaining] = useState(3);
  const [phase, setPhase] = useState<ExamPhase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(JAMB_DURATION);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType>("jamb");
  const [jambSubjects, setJambSubjects] = useState<SubjectForExam[]>([]);
  const [waecSubjects, setWaecSubjects] = useState<SubjectForExam[]>([]);
  const [selectedJambSubjectIds, setSelectedJambSubjectIds] = useState<
    string[]
  >([]);
  const [selectedWaecSubjectId, setSelectedWaecSubjectId] = useState("");

  const {
    activeQuestionIndex,
    setActiveQuestionIndex,
    flaggedQuestionIds,
    toggleFlag,
    selectedAnswers,
    answerQuestion,
    resetExam,
  } = useAppStore();

  const question = questions[activeQuestionIndex];
  const selectedWaecSubject = waecSubjects.find(
    (subject) => subject.id === selectedWaecSubjectId,
  );
  const examTitle =
    selectedExamType === "waec"
      ? `WAEC Mock${selectedWaecSubject ? ` - ${selectedWaecSubject.name}` : ""}`
      : "JAMB Mock Exam";

  const handleSubmit = useCallback(async () => {
    setPhase("submitting");
    setSubmitOpen(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) correct++;
    });

    const scorePercent =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    // Save session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        mode: "mock",
        score: scorePercent,
        total_questions: questions.length,
        exam_type: selectedExamType,
        completed_at: new Date().toISOString(),
      } as never)
      .select("id")
      .single();

    if (sessionError || !session) {
      router.push("/dashboard");
      return;
    }

    const sessionId = (session as { id: string }).id;
    if (user) {
      await incrementMockExamUsage(supabase, user.id);
    }
    // Save all answers
    const answerRows = questions.map((q) => ({
      session_id: sessionId,
      question_id: q.id,
      selected_answer: selectedAnswers[q.id] ?? null,
      is_correct: selectedAnswers[q.id] === q.correct_answer,
      exam_type: selectedExamType,
    }));
    await awardPoints(supabase, user.id, "mock", scorePercent);
    await supabase.from("answers").insert(answerRows as never);
    await updateStreak(supabase, user.id);

    router.push(`/results/${sessionId}`);
  }, [questions, selectedAnswers, selectedExamType, supabase, router]);

  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      setSubjectsLoading(true);
      const [nextJambSubjects, nextWaecSubjects] = await Promise.all([
        getSubjectsByExamType(supabase, "jamb"),
        getSubjectsByExamType(supabase, "waec"),
      ]);
      console.log("JAMB subjects:", nextJambSubjects);
      console.log("WAEC subjects:", nextWaecSubjects);
      setJambSubjects(nextJambSubjects);
      setWaecSubjects(nextWaecSubjects);
      setSelectedWaecSubjectId(nextWaecSubjects[0]?.id ?? "");
      setSubjectsLoading(false);
      const firstThree = nextJambSubjects
        .filter((s) => s?.name && !s.name.toLowerCase().includes("english"))
        .slice(0, 3)
        .map((s) => s.id);
      setSelectedJambSubjectIds(firstThree);
    }
    void loadSubjects();
  }, [supabase]);

  // Timer
  useEffect(() => {
    if (phase !== "exam") return;
    if (seconds <= 0) {
      void handleSubmit();
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [handleSubmit, phase, seconds]);

  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const timerRed = seconds < 10 * 60;
  const timerAmber = seconds < 30 * 60 && !timerRed;

  async function startExam() {
    setLoading(true);
    resetExam();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { allowed, remaining } = await canTakeMockExam(
        supabase,
        user.id,
        isPro,
      );
      if (!allowed) {
        setLimitReached(true);
        setLoading(false);
        return;
      }
      setRemaining(remaining - 1);
    }

    const selectedSubjects =
      selectedExamType === "waec"
        ? waecSubjects
            .filter((subject) => subject.id === selectedWaecSubjectId)
            .map((subject) => ({ id: subject.id, label: subject.name }))
        : [
            EXAM_SUBJECTS[0],
            ...(jambSubjects.length > 0
              ? jambSubjects
                  .filter((subject) =>
                    selectedJambSubjectIds.includes(subject.id),
                  )
                  .slice(0, 3)
                  .map((subject) => ({ id: subject.id, label: subject.name }))
              : EXAM_SUBJECTS.slice(1)),
          ];

    const questionGroups = await Promise.all(
      selectedSubjects.map(async (subject) => {
        const picked = await getRandomQuestionsBySubject(
          supabase,
          subject.id,
          selectedExamType === "waec"
            ? WAEC_TOTAL_QUESTIONS
            : JAMB_QUESTIONS_PER_SUBJECT,
          selectedExamType,
        );
        return picked.map((question) => ({
          ...question,
          subject_label: subject.label,
        }));
      }),
    );

    // Shuffle all questions together
    const shuffled = questionGroups.flat().sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setSeconds(selectedExamType === "waec" ? WAEC_DURATION : JAMB_DURATION);
    setPhase("exam");
    setLoading(false);
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  // ── SETUP SCREEN ──────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Choose mock exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["jamb", "waec"] as const).map((examType) => (
                <button
                  key={examType}
                  type="button"
                  className={cn(
                    "rounded-2xl border p-5 text-left transition hover:border-primary",
                    selectedExamType === examType &&
                      "border-primary bg-softblue",
                  )}
                  onClick={() => setSelectedExamType(examType)}
                >
                  <p className="font-bold text-navy">
                    {examType === "jamb" ? "JAMB Mock" : "WAEC Mock"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {examType === "jamb"
                      ? "English Language plus three subjects."
                      : "One WAEC subject with a one-hour timer."}
                  </p>
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-[#F8FAFC] p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Questions</span>
                <span className="font-semibold text-navy">
                  {selectedExamType === "jamb"
                    ? "180 questions"
                    : "50 questions"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-navy">
                  {selectedExamType === "jamb" ? "2 hours" : "1 hour"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subjects</span>
                <span className="font-semibold text-navy">
                  {selectedExamType === "jamb"
                    ? "English locked + 3 subjects"
                    : (selectedWaecSubject?.name ?? "Choose one subject")}
                </span>
              </div>
            </div>

            {selectedExamType === "jamb" ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-navy">
                  English Language is locked. Pick 3 more subjects.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {subjectsLoading ? (
                    <p className="text-sm text-slate-400 col-span-2">
                      Loading subjects...
                    </p>
                  ) : (
                    jambSubjects
                      .filter(
                        (subject) =>
                          subject?.name &&
                          !subject.name.toLowerCase().includes("english"),
                      )
                      .map((subject) => {
                        const checked = selectedJambSubjectIds.includes(
                          subject.id,
                        );
                        return (
                          <Button
                            key={subject.id}
                            type="button"
                            variant={checked ? "default" : "outline"}
                            onClick={() =>
                              setSelectedJambSubjectIds((current) =>
                                checked
                                  ? current.filter((id) => id !== subject.id)
                                  : current.length < 3
                                    ? [...current, subject.id]
                                    : current,
                              )
                            }
                          >
                            {subject.name}
                          </Button>
                        );
                      })
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-navy">
                  Choose WAEC subject
                </p>
                <select
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  value={selectedWaecSubjectId}
                  onChange={(event) =>
                    setSelectedWaecSubjectId(event.target.value)
                  }
                >
                  {waecSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="rounded-2xl border border-amber/30 bg-amber/5 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                Once you start, the timer cannot be paused. Make sure you are
                ready before beginning.
              </p>
            </div>
            {limitReached && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center space-y-3">
                <p className="font-semibold text-red-700">
                  Daily limit reached
                </p>
                <p className="text-sm text-slate-600">
                  Free accounts can take 3 mock exams per day. Upgrade to Pro
                  for unlimited exams.
                </p>
                <Button asChild size="sm">
                  <NextLink href="/upgrade">
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Pro
                  </NextLink>
                </Button>
              </div>
            )}

            {!limitReached && !isPro && (
              <p className="text-center text-xs text-slate-400">
                Free plan: {remaining} mock exam{remaining !== 1 ? "s" : ""}{" "}
                remaining today
              </p>
            )}
            <Button
              className="w-full"
              size="lg"
              onClick={startExam}
              disabled={loading}
            >
              {loading ? "Loading questions..." : "Start Exam →"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── SUBMITTING ────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">📊</div>
          <p className="text-lg font-semibold text-navy">
            Calculating your results...
          </p>
          <p className="text-slate-500 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  // ── EXAM SCREEN ───────────────────────────────────────────
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      {/* Question card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{examTitle}</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Question {activeQuestionIndex + 1} of {questions.length}
              {question && (
                <span className="ml-2 text-primary font-medium">
                  · {question.subject_label}
                </span>
              )}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm font-bold transition",
              timerRed && "border-red-300 bg-red-50 text-red-600",
              timerAmber && "border-amber/30 bg-amber/5 text-amber",
              !timerRed &&
                !timerAmber &&
                "border-border bg-[#F8FAFC] text-navy",
            )}
          >
            <TimerReset className="h-4 w-4" />
            {minutes}:{secs}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {question && (
            <>
              {/* Year badge */}
              {question.year && (
                <span className="inline-block text-xs border border-border rounded-full px-2 py-0.5 text-slate-500 mb-4">
                  JAMB {question.year} · {question.topic}
                </span>
              )}

              {/* Question text */}
              <p className="text-lg font-semibold leading-8 text-navy md:text-xl">
                {question.prompt}
              </p>

              {/* Options */}
              <div className="mt-6 space-y-3">
                {Object.entries(question.options).map(([key, value]) => (
                  <button
                    key={key}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left text-base font-medium transition hover:border-primary hover:bg-softblue",
                      selectedAnswers[question.id] === key &&
                        "border-primary bg-softblue",
                    )}
                    onClick={() => answerQuestion(question as never, key)}
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold text-primary">
                      {key}
                    </span>
                    {value}
                  </button>
                ))}
              </div>

              {/* Nav */}
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => toggleFlag(question.id)}
                  className={cn(
                    flaggedQuestionIds.includes(question.id) &&
                      "border-amber text-amber",
                  )}
                >
                  <Flag className="h-4 w-4" />
                  {flaggedQuestionIds.includes(question.id) ? "Unflag" : "Flag"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={activeQuestionIndex === 0}
                    onClick={() =>
                      setActiveQuestionIndex(activeQuestionIndex - 1)
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={activeQuestionIndex === questions.length - 1}
                    onClick={() =>
                      setActiveQuestionIndex(activeQuestionIndex + 1)
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sidebar — question map + submit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question map</CardTitle>
          <p className="text-xs text-slate-500">
            {answeredCount} answered · {unansweredCount} remaining
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                className={cn(
                  "h-9 rounded-lg border border-border bg-white text-xs font-semibold text-navy transition hover:bg-softblue",
                  index === activeQuestionIndex &&
                    "border-primary bg-softblue text-primary",
                  selectedAnswers[item.id] &&
                    index !== activeQuestionIndex &&
                    "border-green-400 bg-green-50 text-green-700",
                  flaggedQuestionIds.includes(item.id) && "ring-2 ring-amber",
                )}
                onClick={() => setActiveQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-green-400 bg-green-50" />
              Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-primary bg-softblue" />
              Current
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded ring-2 ring-amber border border-border" />
              Flagged
            </div>
          </div>

          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button className="mt-6 w-full" variant="destructive">
                Submit exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit exam?</DialogTitle>
                <DialogDescription>
                  {unansweredCount > 0
                    ? `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? "s" : ""}. Unanswered questions count as wrong.`
                    : "You have answered all questions. Ready to submit?"}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSubmitOpen(false)}
                >
                  Continue exam
                </Button>
                <Button className="flex-1" onClick={() => void handleSubmit()}>
                  Submit now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
