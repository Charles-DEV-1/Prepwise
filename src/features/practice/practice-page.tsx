"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { sampleQuestions, subjects } from "@/constants/mock-data";
import { cn } from "@/lib/utils";

export function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const question = sampleQuestions[questionIndex % sampleQuestions.length];
  const correct = selected === question.answer;

  function nextQuestion() {
    setQuestionIndex((index) => index + 1);
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="question-card">
        <CardHeader>
          <CardTitle>Choose practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((subject) => (
              <Button key={subject} variant={selectedSubject === subject ? "default" : "outline"} onClick={() => setSelectedSubject(subject)}>
                {subject}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary">Past years</Button>
            <Button variant="outline">Random drill</Button>
          </div>
          <div className="rounded-2xl border border-border bg-[#F8FAFC] p-4">
            <p className="text-sm font-semibold text-navy">Session summary</p>
            <p className="mt-2 text-sm text-slate-600">Question {questionIndex + 1} - {selectedSubject} - instant feedback enabled</p>
          </div>
        </CardContent>
      </Card>

      <Card className="question-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{question.subject} practice</CardTitle>
            <Badge className="border-blue-200 bg-softblue text-primary">{Math.min(100, (questionIndex + 1) * 10)}%</Badge>
          </div>
          <Progress value={Math.min(100, (questionIndex + 1) * 10)} />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-lg font-semibold leading-8 text-navy md:text-xl">{question.prompt}</p>
          <div className="mt-6 space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                className={cn(
                  "answer-option flex w-full items-center justify-between rounded-2xl p-4 text-left text-base font-medium transition",
                  selected === option && "answer-option-selected",
                  submitted && option === question.answer && "answer-option-correct",
                  submitted && selected === option && option !== question.answer && "answer-option-wrong",
                )}
                onClick={() => !submitted && setSelected(option)}
              >
                {option}
                {submitted && option === question.answer && <CheckCircle2 className="h-5 w-5 text-success" />}
                {submitted && selected === option && option !== question.answer && <XCircle className="h-5 w-5 text-destructive" />}
              </button>
            ))}
          </div>
          {submitted && (
            <div className="mt-5 rounded-2xl border border-border bg-[#F8FAFC] p-4">
              <p className={cn("font-semibold", correct ? "text-success" : "text-destructive")}>{correct ? "Correct" : "Not quite"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{question.explanation}</p>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            {!submitted ? (
              <Button disabled={!selected} onClick={() => setSubmitted(true)}>Submit answer</Button>
            ) : (
              <Button onClick={nextQuestion}>Next question</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
