"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flag, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sampleQuestions } from "@/constants/mock-data";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

export function ExamPage() {
  const [seconds, setSeconds] = useState(45 * 60);
  const { activeQuestionIndex, setActiveQuestionIndex, flaggedQuestionIds, toggleFlag, selectedAnswers, answerQuestion } = useAppStore();
  const questions = useMemo(() => Array.from({ length: 20 }, (_, index) => sampleQuestions[index % sampleQuestions.length]), []);
  const question = questions[activeQuestionIndex];

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card className="question-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>JAMB mock exam</CardTitle>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-[#F8FAFC] px-3 py-2 font-mono text-sm font-semibold text-navy">
            <TimerReset className="h-4 w-4 text-destructive" />
            {minutes}:{secs}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-slate-600">Question {activeQuestionIndex + 1} of {questions.length}</p>
          <p className="mt-3 text-lg font-semibold leading-8 text-navy md:text-xl">{question.prompt}</p>
          <div className="mt-6 space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                className={cn(
                  "answer-option w-full rounded-2xl p-4 text-left text-base font-medium transition",
                  selectedAnswers[question.id] === option && "answer-option-selected",
                )}
                onClick={() => answerQuestion(question, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={() => toggleFlag(question.id)}>
              <Flag className="h-4 w-4" />
              {flaggedQuestionIds.includes(question.id) ? "Unflag" : "Flag"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" disabled={activeQuestionIndex === 0} onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>Previous</Button>
              <Button disabled={activeQuestionIndex === questions.length - 1} onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="question-card">
        <CardHeader>
          <CardTitle>Question map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                className={cn(
                  "h-10 rounded-xl border border-border bg-white text-sm font-semibold text-navy transition hover:bg-softblue",
                  index === activeQuestionIndex && "border-primary bg-softblue text-primary",
                  selectedAnswers[item.id] && index !== activeQuestionIndex && "border-success bg-green-50 text-success",
                  flaggedQuestionIds.includes(item.id) && "ring-2 ring-amber",
                )}
                onClick={() => setActiveQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-6 w-full" variant="destructive">Submit exam</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit this mock exam?</DialogTitle>
                <DialogDescription>Your answers will be scored and a full results page will be generated.</DialogDescription>
              </DialogHeader>
              <Button asChild className="mt-4">
                <Link href="/results/demo-session">Generate results</Link>
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
