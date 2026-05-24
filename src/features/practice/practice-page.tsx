"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/services/supabase/client";
import { updateStreak } from "@/services/api/streak";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  { label: "English", id: "11111111-1111-1111-1111-111111111111" },
  { label: "Mathematics", id: "22222222-2222-2222-2222-222222222222" },
  { label: "Physics", id: "33333333-3333-3333-3333-333333333333" },
  { label: "Chemistry", id: "44444444-4444-4444-4444-444444444444" },
  { label: "Biology", id: "55555555-5555-5555-5555-555555555555" },
  { label: "Economics", id: "66666666-6666-6666-6666-666666666666" },
];

type Question = {
  id: string;
  prompt: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  topic: string;
  year: number;
};

export function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const supabase = useMemo(() => createClient(), []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setQuestionIndex(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setAnswered(0);

    const { data, error } = await supabase
      .from("questions")
      .select("id, prompt, options, correct_answer, explanation, topic, year")
      .eq("subject_id", selectedSubject.id)
      .order("year", { ascending: false });

    if (!error && data) {
      // Shuffle and take 25
      const questionRows = data as Question[];
      const shuffled = [...questionRows].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 25));
    }
    setLoading(false);
  }, [selectedSubject.id, supabase]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  function handleSelect(optionKey: string) {
    if (!submitted) setSelected(optionKey);
  }

  function handleSubmit() {
    if (!selected || !question) return;
    setSubmitted(true);
    setAnswered((a) => a + 1);
    if (selected === question.correct_answer) {
      setScore((s) => s + 1);
    }

    // Save answer to Supabase (fire and forget)
    void saveAnswer();
  }

  async function saveAnswer() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !question) return;
    // Answer saving — will wire to sessions in next step
    await updateStreak(supabase as unknown as SupabaseClient, user.id);
  }

  function nextQuestion() {
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  }

  const question = questions[questionIndex];
  const progress =
    questions.length > 0
      ? Math.round((questionIndex / questions.length) * 100)
      : 0;
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      {/* Left — subject selector */}
      <Card>
        <CardHeader>
          <CardTitle>Choose subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-2">
            {SUBJECTS.map((subject) => (
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

          {/* Session summary */}
          <div className="rounded-2xl border border-border bg-[#F8FAFC] p-4 space-y-3">
            <p className="text-sm font-semibold text-navy">Session summary</p>
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
                {answered > 0 ? `${accuracy}%` : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right — question card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{selectedSubject.label} practice</CardTitle>
            <Badge className="border-blue-200 bg-softblue text-primary">
              {questionIndex + 1} / {questions.length || "—"}
            </Badge>
          </div>
          <Progress value={progress} />
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !question ? (
            <div className="py-20 text-center space-y-4">
              <p className="text-lg font-semibold text-navy">
                🎉 You finished all {selectedSubject.label} questions!
              </p>
              <p className="text-slate-500">
                Final score: {score} / {answered} ({accuracy}%)
              </p>
              <Button onClick={loadQuestions}>Restart practice</Button>
            </div>
          ) : (
            <>
              {/* Year + topic badge */}
              <div className="mb-4 flex gap-2">
                {question.year && (
                  <Badge className="text-xs">JAMB {question.year}</Badge>
                )}
                {question.topic && (
                  <Badge className="text-xs">{question.topic}</Badge>
                )}
              </div>

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
                ))}
              </div>

              {/* Explanation */}
              {submitted && (
                <div
                  className={cn(
                    "mt-5 rounded-2xl border p-4",
                    selected === question.correct_answer
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50",
                  )}
                >
                  <p
                    className={cn(
                      "font-semibold mb-2",
                      selected === question.correct_answer
                        ? "text-green-700"
                        : "text-red-600",
                    )}
                  >
                    {selected === question.correct_answer
                      ? "✓ Correct!"
                      : `✗ Incorrect — Answer is ${question.correct_answer}`}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex justify-end gap-3">
                {!submitted ? (
                  <Button disabled={!selected} onClick={handleSubmit}>
                    Submit answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>Next question →</Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
