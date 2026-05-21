import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DashboardData = {
  averageScore: number;
  totalQuestionsAnswered: number;
  streak: number;
  daysUntilExam: number | null;
  examType: string;
  targetScore: number;
  recentSessions: {
    id: string;
    type: string;
    score: number;
    totalQuestions: number;
    date: string;
  }[];
  weakTopics: {
    topic: string;
    subject: string;
    accuracy: number;
  }[];
  hasSessions: boolean;
} | null;

export function DashboardPage({
  userName = "Student",
  data,
}: {
  userName?: string;
  data?: DashboardData;
}) {
  const metrics = [
    {
      label: "Study streak",
      value: `${data?.streak ?? 0} days`,
      icon: Flame,
      tone: "text-amber",
    },
    {
      label: "Average score",
      value: data?.hasSessions ? `${data.averageScore}%` : "—",
      icon: TrendingUp,
      tone: "text-success",
    },
    {
      label: "Questions answered",
      value: data?.totalQuestionsAnswered
        ? data.totalQuestionsAnswered.toLocaleString()
        : "0",
      icon: BookOpenCheck,
      tone: "text-primary",
    },
    {
      label: "Days until exam",
      value:
        data?.daysUntilExam != null ? `${data.daysUntilExam} days` : "Not set",
      icon: CalendarDays,
      tone: "text-primary",
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="soft-blue-gradient relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-soft md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <Badge className="border-blue-200 bg-white text-primary">
          {data?.examType ?? "JAMB"} preparation
        </Badge>
        <div className="relative mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-navy md:text-4xl">
              {greeting}, {userName}.
            </h1>
            {!data?.hasSessions ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Welcome to Prepwise! Start your first practice session to see
                your personalised stats here.
              </p>
            ) : data.weakTopics.length > 0 ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Your average score is{" "}
                <span className="font-semibold text-navy">
                  {data.averageScore}%
                </span>
                . Focus on{" "}
                <span className="font-semibold text-navy">
                  {data.weakTopics[0]?.subject}
                </span>{" "}
                — your weakest area right now.
              </p>
            ) : (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                You are doing great! Average score:{" "}
                <span className="font-semibold text-navy">
                  {data.averageScore}%
                </span>
                . Keep up the momentum.
              </p>
            )}
          </div>
          <Button asChild>
            <Link href="/practice">
              Start practice <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-border bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-navy">
                  {metric.value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softblue">
                <metric.icon className={`h-6 w-6 ${metric.tone}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Weak topics + Recent sessions */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Weak topics */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {data?.hasSessions ? "Recommended practice" : "Start practising"}
            </CardTitle>
            <CardDescription>
              {data?.hasSessions
                ? "Based on your weak topics and recent scores."
                : "Complete a practice session to see personalised recommendations."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!data?.hasSessions || data.weakTopics.length === 0 ? (
              <div className="rounded-2xl border border-border bg-[#F8FAFC] p-6 text-center">
                <p className="text-sm text-slate-500">
                  {data?.hasSessions
                    ? "Great job — no weak topics detected yet!"
                    : "Your weak topics will appear here after your first session."}
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/practice">Start practice</Link>
                </Button>
              </div>
            ) : (
              data.weakTopics.map((topic) => (
                <div
                  key={topic.topic}
                  className="rounded-2xl border border-border bg-[#F8FAFC] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-navy">{topic.subject}</p>
                      <p className="text-sm text-slate-500">{topic.topic}</p>
                    </div>
                    <Badge className="border-amber/20 bg-amber/10 text-amber">
                      {topic.accuracy}% accuracy
                    </Badge>
                  </div>
                  <Progress value={topic.accuracy} className="mt-4" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent sessions</CardTitle>
            <CardDescription>
              Your last practice and exam activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!data?.hasSessions || data.recentSessions.length === 0 ? (
              <div className="rounded-2xl bg-softblue p-5 text-center">
                <p className="text-sm text-slate-600">
                  No sessions yet. Take your first practice or mock exam.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-softblue p-5">
                  <div className="mb-3 flex justify-between text-sm font-medium text-slate-600">
                    <span>Average score</span>
                    <span>{data.averageScore}%</span>
                  </div>
                  <Progress value={data.averageScore} />
                </div>
                {data.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-2xl border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {session.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {session.totalQuestions} questions · {session.date}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      {session.score}%
                    </p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          [
            "Practice",
            "/practice",
            "Answer targeted questions with instant feedback.",
          ],
          ["Mock exam", "/exam", "Simulate exam day with a full timed exam."],
          [
            "Progress",
            "/progress",
            "Review your score trends and weak topics.",
          ],
        ].map(([title, href, body]) => (
          <Card key={title} className="border-border bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-softblue">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href={href as string}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
