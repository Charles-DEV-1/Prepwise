import Link from "next/link";
import { Download, RotateCcw, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { sampleQuestions } from "@/constants/mock-data";

export function ResultsPage({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <section className="soft-blue-gradient rounded-[2rem] border border-border p-6 shadow-soft md:p-8">
        <Badge className="border-blue-200 bg-white text-primary">Session {id}</Badge>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Mock exam score</p>
            <h1 className="mt-1 text-6xl font-bold tracking-normal text-primary">284</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Strong English performance. Physics remains the biggest upside.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Save card</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["English", 86],
          ["Physics", 64],
          ["Chemistry", 72],
          ["Biology", 78],
        ].map(([subject, score]) => (
          <Card key={subject} className="border-border bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="font-semibold text-navy">{subject}</p>
              <p className="mt-2 text-2xl font-bold text-primary">{score}%</p>
              <Progress value={Number(score)} className="mt-4" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber" />
              Performance breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Speed: above average", "Accuracy: stable", "Flagged questions: 4", "Weak topic: Waves and Optics"].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-[#F8FAFC] p-3 text-sm text-slate-600">{item}</div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Wrong answers review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleQuestions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-border bg-[#F8FAFC] p-4">
                <p className="font-semibold text-navy">{question.prompt}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{question.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <Button asChild size="lg">
        <Link href="/exam"><RotateCcw className="h-4 w-4" /> Retake exam</Link>
      </Button>
    </div>
  );
}
