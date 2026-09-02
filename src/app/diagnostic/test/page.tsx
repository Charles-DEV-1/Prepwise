// Prepcore - Free Diagnostic Test

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDiagnosticQuestions, saveDiagnosticResult, type DiagnosticQuestion } from "@/services/api/diagnostic";
import { isDepartment, type Department } from "@/lib/departments";

type Answer = { questionId: string; selectedAnswer: string; correctAnswer: string; subject: string; topic: string | null };

export default function DiagnosticTestPage() {
  const router = useRouter();
  const departmentParam = useSearchParams().get("department");
  const department: Department | null = isDepartment(departmentParam) ? departmentParam : null;
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "saving">("loading");

  useEffect(() => {
    if (!department) { setStatus("error"); return; }
    void getDiagnosticQuestions(department).then((loaded) => { setQuestions(loaded); setStatus(loaded.length >= 20 ? "ready" : "error"); }).catch(() => setStatus("error"));
  }, [department]);

  if (status === "loading") return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>;
  if (status === "error" || !department || !questions[index]) return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 text-center"><div><h1 className="text-2xl font-bold text-navy">We need a few more questions</h1><p className="mt-3 max-w-md text-slate-600">This subject set is still being prepared. Please try another department or come back soon.</p><Button className="mt-6" onClick={() => router.push("/diagnostic")}>Choose another department</Button></div></main>;

  const question = questions[index];
  async function next() {
    if (!selected || !department) return;
    const nextAnswers = [...answers, { questionId: question.id, selectedAnswer: selected, correctAnswer: question.correct_answer, subject: question.subject_name, topic: question.topic }];
    if (index < 19) { setAnswers(nextAnswers); setIndex(index + 1); setSelected(null); return; }
    setStatus("saving");
    const subjectBreakdown: Record<string, { correct: number; total: number }> = {};
    const weakTopics = new Map<string, number>();
    nextAnswers.forEach((answer) => { const item = subjectBreakdown[answer.subject] ?? { correct: 0, total: 0 }; item.total += 1; if (answer.selectedAnswer === answer.correctAnswer) item.correct += 1; else if (answer.topic) weakTopics.set(`${answer.subject} - ${answer.topic}`, (weakTopics.get(`${answer.subject} - ${answer.topic}`) ?? 0) + 1); subjectBreakdown[answer.subject] = item; });
    const result = await saveDiagnosticResult({ department, subjectsTested: Object.keys(subjectBreakdown), totalQuestions: nextAnswers.length, totalCorrect: nextAnswers.filter((answer) => answer.selectedAnswer === answer.correctAnswer).length, subjectBreakdown, weakTopics: [...weakTopics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([topic]) => topic) });
    router.push(`/diagnostic/results?token=${result.sessionToken}`);
  }

  return <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-navy sm:py-14"><div className="mx-auto max-w-2xl"><div className="flex items-center justify-between text-sm font-semibold"><span>Free JAMB diagnostic</span><span>{index + 1} of 20</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full bg-primary transition-all" style={{ width: `${((index + 1) / 20) * 100}%` }} /></div><Card className="mt-8 border-border bg-white shadow-soft"><CardContent className="p-5 sm:p-8"><p className="text-sm font-semibold text-primary">{question.subject_name}</p><h1 className="mt-4 text-xl font-bold leading-8 sm:text-2xl">{question.prompt}</h1><div className="mt-7 space-y-3">{Object.entries(question.options).map(([key, value]) => <button key={key} type="button" onClick={() => setSelected(key)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${selected === key ? "border-primary bg-[#EFF6FF]" : "border-border hover:border-blue-300"}`}><span className="font-bold text-primary">{key}</span><span>{value}</span></button>)}</div><Button className="mt-7 w-full sm:w-auto" disabled={!selected || status === "saving"} onClick={() => void next()}>{status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : index === 19 ? "See my results" : "Next"}<ArrowRight className="h-4 w-4" /></Button></CardContent></Card></div></main>;
}