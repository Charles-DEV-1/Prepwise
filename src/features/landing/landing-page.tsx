import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Medal,
  PlayCircle,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/constants/mock-data";

const features = [
  {
    title: "Past Questions",
    body: "JAMB, WAEC, and NECO questions organized by subject, year, and topic.",
    icon: BookOpenCheck,
  },
  {
    title: "Timed Mock Exams",
    body: "Practice under real exam pressure with timers, question maps, and auto-submit.",
    icon: Clock3,
  },
  {
    title: "AI Explanations",
    body: "Get short, clear explanations that help students understand the why.",
    icon: Brain,
  },
  {
    title: "Smart Analytics",
    body: "See score trends, weak topics, accuracy, speed, and study consistency.",
    icon: BarChart3,
  },
  {
    title: "Personalized Learning",
    body: "Daily recommendations that adapt to each student's exam goal.",
    icon: Sparkles,
  },
  {
    title: "Leaderboards",
    body: "Motivating rankings, streaks, and milestones that keep students moving.",
    icon: Trophy,
  },
];

const stats = [
  ["10k+", "practice questions"],
  ["3", "exam tracks"],
  ["24/7", "web access"],
  ["100%", "mobile-first"],
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-navy">
      <PublicNavbar />

      <section className="brand-blue-surface relative border-b border-border">
        <div className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div className="relative z-10">
            <Badge className="border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              AI-powered prep for Nigerian students
            </Badge>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.03] tracking-normal text-navy sm:text-6xl lg:text-7xl">
              The modern learning platform to ace JAMB, WAEC, and NECO.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Prepcore helps students practise smarter, understand mistakes
              faster, and walk into exam day with real confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">
                  Start free <PlayCircle className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-slate-500">
              {["Free to start", "Built for mobile", "JAMB, WAEC, NECO"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 shadow-sm"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-navy shadow-soft">
              <Image
                src="/Prepcore_app_logo_design_202606131935.jpeg"
                alt="Prepcore app branding showcase"
                width={1376}
                height={768}
                className="aspect-[16/7] w-full object-cover"
                priority
              />
            </div>

            <div className="soft-card rounded-[2rem] p-4 md:p-5">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/favicons/android-chrome-512x512.png"
                      alt="Prepcore logo"
                      width={52}
                      height={52}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-bold text-navy">
                        Prepcore Dashboard
                      </p>
                      <p className="text-xs text-slate-500">
                        Today&apos;s study plan
                      </p>
                    </div>
                  </div>
                  <Badge className="border-blue-200 bg-white text-primary">
                    72% ready
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Questions", "1,250", BookOpenCheck],
                    ["Mock exams", "18", CalendarDays],
                    ["Avg score", "76%", Medal],
                  ].map(([label, value, Icon]) => (
                    <div
                      key={label as string}
                      className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <p className="mt-4 text-xs font-medium text-slate-500">
                        {label as string}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-navy">
                        {value as string}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-navy">
                        Subject performance
                      </p>
                      <span className="text-xs text-slate-500">This week</span>
                    </div>
                    <div className="mt-5 flex h-40 items-end gap-3">
                      {[68, 72, 52, 65, 80].map((value, index) => (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-primary to-blue-300"
                            style={{ height: `${value * 1.45}px` }}
                          />
                          <span className="text-[10px] font-medium text-slate-500">
                            S{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="font-semibold text-navy">AI recommendation</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Focus on Physics waves for 18 minutes, then answer 20
                      English questions.
                    </p>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                        <span>Weekly target</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-[#F8FAFC] py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="border-blue-200 bg-white text-primary">
              Feature showcase
            </Badge>
            <h2 className="mt-4 text-4xl font-bold tracking-normal text-navy">
              Everything students need to improve.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A clean study system that combines practice, feedback, analytics,
              and motivation.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.04}>
                <Card className="h-full border-border bg-white shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softblue text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-navy">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.body}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="results" className="bg-white py-16">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge className="border-blue-200 bg-softblue text-primary">
              Social proof
            </Badge>
            <h2 className="mt-4 text-4xl font-bold tracking-normal text-navy">
              Built to make progress feel possible.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Prepcore motivates students with streaks, milestones, score
              movement, and clear next steps.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Adaeze O.",
                quote: "I finally knew which topics to fix before exam week.",
              },
              {
                name: "Emmanuel M.",
                quote: "The mock timer made the real exam feel familiar.",
              },
              {
                name: "Fatima K.",
                quote: "The explanations are short and actually make sense.",
              },
            ].map(({ name, quote }) => (
              <Card key={name} className="border-border bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex gap-1 text-[#D97706]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium leading-6 text-navy">
                    &quot;{quote}&quot;
                  </p>
                  <p className="mt-5 text-xs font-semibold text-slate-500">
                    {name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#F8FAFC] py-16">
        <div className="container grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-4xl font-bold tracking-normal text-navy">
              Questions students ask first.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Simple answers for students and parents checking the platform.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <summary className="cursor-pointer font-semibold text-navy">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <div className="soft-blue-gradient grid items-center gap-8 rounded-[2rem] border border-border p-6 shadow-soft md:grid-cols-[1fr_18rem_auto] md:p-10">
            <div>
              <CheckCircle2 className="h-8 w-8 text-success" />
              <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-normal text-navy">
                Join the students getting early access to Prepcore.
              </h2>
              <p className="mt-3 text-slate-600">
                Past questions, mock exams, AI explanations, and score tracking
                in one modern workspace.
              </p>
            </div>
            <div className="hidden overflow-hidden rounded-2xl border border-white bg-white shadow-sm md:block md:w-72">
              <Image
                src="/Prepcore_app_logo_design_202606131935 (1).jpeg"
                alt="Prepcore alternate brand design"
                width={1376}
                height={768}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
