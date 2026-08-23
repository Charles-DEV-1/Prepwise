"use client";

import { awardPoints } from "@/services/api/points";
import { ReportQuestion } from "@/components/ui/report-question";
import { AIExplanation } from "@/components/ui/ai-explanation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/services/supabase/client";
import { updateStreak } from "@/services/api/streak";
import {
  getAvailableYears,
  getSessionQuestions,
  getSubjectsByExamType,
  type QuestionForSession,
  type SubjectForExam,
} from "@/services/api/questions";
import { saveSessionResult } from "@/services/api/sessions";
import { useExamStore } from "@/store/examStore";
import { cn } from "@/lib/utils";
import { AnswerFeedback, Stagger, StaggerItem } from "@/components/ui/motion";
import type { ExamGoal } from "@/types/app";

const SUBJECTS = [
  { label: "English", id: "11111111-1111-1111-1111-111111111111" },
  { label: "Mathematics", id: "22222222-2222-2222-2222-222222222222" },
  { label: "Physics", id: "33333333-3333-3333-3333-333333333333" },
  { label: "Chemistry", id: "44444444-4444-4444-4444-444444444444" },
  { label: "Biology", id: "55555555-5555-5555-5555-555555555555" },
  { label: "Economics", id: "66666666-6666-6666-6666-666666666666" },
  { label: "Government", id: "77777777-7777-7777-7777-777777777777" },
  { label: "Literature", id: "88888888-8888-8888-8888-888888888888" },
  { label: "CRS", id: "99999999-9999-9999-9999-999999999999" },
  { label: "Geography", id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
];

type PointsSupabaseClient = Parameters<typeof awardPoints>[0];
type PracticeSubject = { label: string; id: string };

export function PracticePage() {
  const { activeExamType, setActiveExamType } = useExamStore();
  const [selectedSubject, setSelectedSubject] = useState<PracticeSubject>(
    SUBJECTS[0],
  );
  const [waecSubjects, setWaecSubjects] = useState<SubjectForExam[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [examGoals, setExamGoals] = useState<ExamGoal>(["jamb"]);
  const [questions, setQuestions] = useState<QuestionForSession[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [sessionSaved, setSessionSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [questionDirection, setQuestionDirection] = useState<1 | -1>(1);
  const reducedMotion = useReducedMotion();

  const supabase = useMemo(() => createClient(), []);
  const canUseActiveExam = examGoals.includes(activeExamType);
  const subjectsForActiveExam: PracticeSubject[] =
    activeExamType === "jamb"
      ? SUBJECTS
      : waecSubjects.map((subject) => ({
          id: subject.id,
          label: subject.name,
        }));

  useEffect(() => {
    async function loadExamContext() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("exam_goals")
          .eq("id", user.id)
          .maybeSingle();
        const goals = ((data as { exam_goals?: ExamGoal | null } | null)
          ?.exam_goals ?? ["jamb"]) as ExamGoal;
        setExamGoals(goals);
        if (!goals.includes(activeExamType)) setActiveExamType(goals[0]);
      }

      setWaecSubjects(await getSubjectsByExamType(supabase, "waec"));
    }

    void loadExamContext();
  }, [activeExamType, setActiveExamType, supabase]);

  useEffect(() => {
    if (activeExamType === "jamb") {
      setSelectedSubject(SUBJECTS[0]);
      setSelectedYear(null);
      setAvailableYears([]);
      return;
    }

    const firstWaecSubject = waecSubjects[0];
    if (firstWaecSubject) {
      setSelectedSubject({
        id: firstWaecSubject.id,
        label: firstWaecSubject.name,
      });
    }
  }, [activeExamType, waecSubjects]);

  useEffect(() => {
    if (activeExamType !== "waec" || !selectedSubject.id) return;

    async function loadYears() {
      const years = await getAvailableYears(
        supabase,
        selectedSubject.id,
        "waec",
      );
      setAvailableYears(years);
      setSelectedYear(years[0] ?? null);
    }

    void loadYears();
  }, [activeExamType, selectedSubject.id, supabase]);

  const loadQuestions = useCallback(async () => {
    if (!canUseActiveExam || (activeExamType === "waec" && !selectedYear)) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setQuestionIndex(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setAnswered(0);
    setSelectedAnswers({});
    setSessionSaved(false);
    setLoadError(null);

    try {
      const nextQuestions = await getSessionQuestions(
        selectedSubject.id,
        25,
        activeExamType,
      );
      setQuestions(nextQuestions);
    } catch (error) {
      setQuestions([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load questions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeExamType,
    canUseActiveExam,
    selectedSubject.id,
    selectedYear,
  ]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  function handleSelect(optionKey: string) {
    if (!submitted) setSelected(optionKey);
  }

  function handleSubmit() {
    if (!selected || !question) return;
    const updatedAnswers = { ...selectedAnswers, [question.id]: selected };
    const nextAnswered = answered + 1;
    const nextScore = score + (selected === question.correct_answer ? 1 : 0);
    const nextAccuracy = Math.round((nextScore / nextAnswered) * 100);

    setSubmitted(true);
    setAnswered(nextAnswered);
    setSelectedAnswers(updatedAnswers);
    if (selected === question.correct_answer) setScore(nextScore);

    if (questionIndex === questions.length - 1) {
      void savePracticeSession(updatedAnswers, nextAccuracy);
    }
  }

  async function savePracticeSession(
    answers: Record<string, string>,
    finalAccuracy: number,
  ) {
    if (sessionSaved) return;
    setSessionSaved(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSessionSaved(false);
      return;
    }

    const sessionId = await saveSessionResult(supabase, {
      userId: user.id,
      mode: "practice",
      score: finalAccuracy,
      questions,
      selectedAnswers: answers,
      examType: activeExamType,
    });

    if (!sessionId) {
      setSessionSaved(false);
      return;
    }

    await updateStreak(supabase, user.id);
    await awardPoints(
      supabase as PointsSupabaseClient,
      user.id,
      "practice",
      finalAccuracy,
    );
  }

  function changeQuestion(nextIndex: number, direction: 1 | -1) {
    setQuestionDirection(direction);
    setQuestionIndex(nextIndex);
    const nextQuestion = questions[nextIndex];
    const existingAnswer = nextQuestion ? selectedAnswers[nextQuestion.id] : undefined;
    setSelected(existingAnswer ?? null);
    setSubmitted(Boolean(existingAnswer));
  }

  function nextQuestion() {
    changeQuestion(questionIndex + 1, 1);
  }

  function previousQuestion() {
    if (questionIndex > 0) changeQuestion(questionIndex - 1, -1);
  }

  const question = questions[questionIndex];
  const progress =
    questions.length > 0
      ? Math.round((questionIndex / questions.length) * 100)
      : 0;
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0;
  const examLabel = activeExamType.toUpperCase();

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-xl border border-border bg-white p-1">
        {(["jamb", "waec"] as const).map((examType) => (
          <Button
            key={examType}
            size="sm"
            variant={activeExamType === examType ? "default" : "ghost"}
            onClick={() => setActiveExamType(examType)}
          >
            {examType.toUpperCase()}
          </Button>
        ))}
      </div>

      {!canUseActiveExam ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-semibold text-navy">
              {examLabel} is not in your exam goals yet.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Switch exam goals in settings to unlock this practice mode.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <CardTitle>Choose subject</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {subjectsForActiveExam.map((subject) => (
                  <Button
                    key={subject.id}
                    variant={
                      selectedSubject.id === subject.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject.label}
                  </Button>
                ))}
              </div>

              {activeExamType === "waec" && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-navy">Year</p>
                  <select
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    value={selectedYear ?? ""}
                    onChange={(event) =>
                      setSelectedYear(Number(event.target.value))
                    }
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-[#F8FAFC] p-4 space-y-3">
                <p className="text-sm font-semibold text-navy">
                  Session summary
                </p>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Questions answered</span>
                  <span className="font-medium">{answered}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Correct</span>
                  <span className="font-medium text-green-600">{score}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Accuracy</span>
                  <span
                    className={cn(
                      "font-medium",
                      accuracy >= 60
                        ? "text-green-600"
                        : accuracy >= 40
                          ? "text-amber-500"
                          : "text-red-500",
                    )}
                  >
                    {answered > 0 ? `${accuracy}%` : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{selectedSubject.label} practice</CardTitle>
                <Badge className="border-blue-200 bg-softblue text-primary">
                  {questionIndex + 1} / {questions.length || "-"}
                </Badge>
              </div>
              <Progress value={progress} />
            </CardHeader>

            <CardContent className="p-6 pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : loadError ? (
                <div className="py-20 text-center space-y-4">
                  <p className="text-lg font-semibold text-navy">Questions could not load</p>
                  <p className="text-sm text-slate-500">{loadError}</p>
                  <Button onClick={loadQuestions}>Try again</Button>
                </div>
              ) : !question ? (
                <div className="py-20 text-center space-y-4">
                  <p className="text-lg font-semibold text-navy">
                    You finished all {selectedSubject.label} questions.
                  </p>
                  <p className="text-slate-500">
                    Final score: {score} / {answered} ({accuracy}%)
                  </p>
                  <Button onClick={loadQuestions}>Restart practice</Button>
                </div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={question.id}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: questionDirection * 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: questionDirection * -18 }}
                    transition={{ duration: reducedMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                  <div className="mb-4 flex gap-2">
                    {question.year && (
                      <Badge className="text-xs">
                        {examLabel} {question.year}
                      </Badge>
                    )}
                    {question.topic && (
                      <Badge className="text-xs">{question.topic}</Badge>
                    )}
                  </div>

                  <p className="text-lg font-semibold leading-8 text-navy md:text-xl">
                    {question.prompt}
                  </p>

                  <Stagger className="mt-6 space-y-3" delay={0.04}>
                    {Object.entries(question.options).map(([key, value]) => (
                      <StaggerItem key={key}>
                        <button
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl border border-border p-4 text-left text-base font-medium transition hover:border-primary hover:bg-softblue",
                          selected === key &&
                            !submitted &&
                            "border-primary bg-softblue",
                          submitted &&
                            key === question.correct_answer &&
                            "border-green-500 bg-green-50",
                          submitted &&
                            selected === key &&
                            key !== question.correct_answer &&
                            "border-red-400 bg-red-50",
                        )}
                        onClick={() => handleSelect(key)}
                      >
                        <span>
                          <span className="mr-3 font-bold text-primary">
                            {key}.
                          </span>
                          {value}
                        </span>
                        {submitted && key === question.correct_answer && (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                        )}
                        {submitted &&
                          selected === key &&
                          key !== question.correct_answer && (
                            <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                          )}
                        </button>
                      </StaggerItem>
                    ))}
                  </Stagger>

                  {submitted && (
                    <AnswerFeedback
                      correct={selected === question.correct_answer}
                      className={cn(
                        "mt-5 border p-4",
                        selected === question.correct_answer
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50",
                      )}
                    >
                      <div>
                        <p
                        className={cn(
                          "font-semibold mb-2",
                          selected === question.correct_answer
                            ? "text-green-700"
                            : "text-red-600",
                        )}
                      >
                        {selected === question.correct_answer
                          ? "Correct"
                          : `Incorrect - Answer is ${question.correct_answer}`}
                        </p>
                        <p className="text-sm leading-6 text-slate-600">
                          {question.explanation}
                        </p>
                      </div>
                    </AnswerFeedback>
                  )}

                  {submitted && (
                    <AIExplanation
                      question={question.prompt}
                      options={question.options}
                      correctAnswer={question.correct_answer}
                      explanation={question.explanation}
                      subject={selectedSubject.label}
                    />
                  )}

                  {submitted && <ReportQuestion questionId={question.id} />}

                  <div className="mt-6 flex justify-between gap-3">
                    <Button variant="outline" onClick={previousQuestion} disabled={questionIndex === 0}>
                      Previous question
                    </Button>
                    {!submitted ? (
                      <Button disabled={!selected} onClick={handleSubmit}>
                        Submit answer
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion}>Next question</Button>
                    )}
                  </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
