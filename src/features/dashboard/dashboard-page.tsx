import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarDays, Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardMetrics, recentSessions, weakTopics } from "@/constants/mock-data";
import { daysUntil, formatNumber } from "@/lib/utils";

export function DashboardPage() {
  const metrics = [
    { label: "Study streak", value: `${dashboardMetrics.streak} days`, icon: Flame, tone: "text-amber" },
    { label: "Average score", value: `${dashboardMetrics.averageScore}%`, icon: TrendingUp, tone: "text-success" },
    { label: "Questions answered", value: formatNumber(dashboardMetrics.questionsAnswered), icon: BookOpenCheck, tone: "text-primary" },
    { label: "Days until exam", value: daysUntil(dashboardMetrics.examDate), icon: CalendarDays, tone: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <section className="soft-blue-gradient relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-soft md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <Badge className="border-blue-200 bg-white text-primary">Today&apos;s AI plan</Badge>
        <div className="relative mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-navy md:text-4xl">Good afternoon, Precious.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              You are 72% through this week&apos;s target. Focus on Physics waves, then run a 20-question English drill.
            </p>
          </div>
          <Button asChild>
            <Link href="/practice">
              Start practice <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-navy">{metric.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softblue">
                <metric.icon className={`h-6 w-6 ${metric.tone}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended practice
            </CardTitle>
            <CardDescription>Prioritized from weak topics and recent score movement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakTopics.map((topic) => (
              <div key={topic.topic} className="rounded-2xl border border-border bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy">{topic.subject}</p>
                    <p className="text-sm text-slate-500">{topic.topic}</p>
                  </div>
                  <Badge className="border-amber/20 bg-amber/10 text-amber">{topic.accuracy}% accuracy</Badge>
                </div>
                <Progress value={topic.accuracy} className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Study rhythm</CardTitle>
            <CardDescription>Simple signals to keep the day focused.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-softblue p-5">
              <div className="mb-3 flex justify-between text-sm font-medium text-slate-600">
                <span>Weekly goal</span>
                <span>72%</span>
              </div>
              <Progress value={72} />
            </div>
            {recentSessions.map((session) => (
              <div key={`${session.subject}-${session.time}`} className="flex items-center justify-between rounded-2xl border border-border p-3">
                <div>
                  <p className="text-sm font-semibold text-navy">{session.subject}</p>
                  <p className="text-xs text-slate-500">{session.type} - {session.time}</p>
                </div>
                <p className="text-sm font-bold text-primary">{session.score}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Practice", "/practice", "Answer targeted questions with instant feedback."],
          ["Mock exam", "/exam", "Simulate exam day with timers and question maps."],
          ["Progress", "/progress", "Review trends, streaks, and weak topics."],
        ].map(([title, href, body]) => (
          <Card key={title} className="border-border bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-softblue">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
