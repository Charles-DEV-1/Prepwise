// Prepcore - Free Diagnostic Test

import Link from "next/link";
import { ArrowRight, FlaskConical, Landmark, Palette } from "lucide-react";
import { DEPARTMENT_LABELS, DEPARTMENT_SUBJECTS, type Department } from "@/lib/departments";
import { Card, CardContent } from "@/components/ui/card";

const icons: Record<Department, typeof FlaskConical> = { science: FlaskConical, arts: Palette, commercial: Landmark };

export default function DiagnosticPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-navy sm:py-20">
      <div className="mx-auto max-w-[480px]">
        <Link href="/" className="text-sm font-bold text-primary">Prepcore</Link>
        <h1 className="mt-10 text-4xl font-bold leading-tight">Find out your weak areas - free, no signup</h1>
        <p className="mt-4 leading-7 text-slate-600">Answer 20 real JAMB questions and see exactly where you stand in under 5 minutes.</p>
        <div className="mt-8 space-y-4">
          {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((department) => {
            const Icon = icons[department];
            return (
              <Link key={department} href={`/diagnostic/test?department=${department}`}>
                <Card className="group mb-4 border-border bg-white transition hover:-translate-y-0.5 hover:border-primary hover:shadow-soft">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-primary"><Icon className="h-6 w-6" /></div>
                    <div className="min-w-0 flex-1"><h2 className="font-bold">{DEPARTMENT_LABELS[department]}</h2><div className="mt-2 flex flex-wrap gap-1.5">{DEPARTMENT_SUBJECTS[department].map((subject) => <span key={subject} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500">{subject}</span>)}</div></div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 text-center text-[13px] text-slate-500">No email required. No payment. See real results instantly.</p>
      </div>
    </main>
  );
}