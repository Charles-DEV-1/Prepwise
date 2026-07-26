// Prepcore — Admin Dashboard
import { BookOpenCheck, Bot, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/services/supabase/admin";

const startOfDay = (daysAgo: number) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - daysAgo); return date.toISOString(); };
const count = (value: number | null) => value === null ? "Unavailable" : value.toLocaleString("en-NG");

type AnswerRow = { is_correct: boolean; question: { subject: { name: string } | null } | null };

export default async function AdminAnalyticsPage() {
  const admin = createServiceRoleClient();
  const weekStart = startOfDay(6);
  const [weeklySessions, allAnswers, scoredSessions, examSessions, answerRows, aiUsage] = await Promise.all([
    admin.from("sessions").select("user_id, created_at").gte("created_at", weekStart),
    admin.from("answers").select("*", { count: "exact", head: true }),
    admin.from("sessions").select("score").not("score", "is", null),
    admin.from("sessions").select("exam_type"),
    admin.from("answers").select("is_correct, question:questions(subject:subjects(name))"),
    admin.from("ai_explanation_usage").select("usage_count").eq("date", new Date().toISOString().slice(0, 10)),
  ]);
  const sessionsByDay = new Map<string, number>();
  for (const session of weeklySessions.data ?? []) { const day = session.created_at.slice(0, 10); sessionsByDay.set(day, (sessionsByDay.get(day) ?? 0) + 1); }
  const dayRows = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - 6 + index); const key = date.toISOString().slice(0, 10); return { label: new Intl.DateTimeFormat("en-NG", { weekday: "short" }).format(date), value: sessionsByDay.get(key) ?? 0 }; });
  const maxSessions = Math.max(1, ...dayRows.map((day) => day.value));
  const activeStudents = weeklySessions.error ? null : new Set((weeklySessions.data ?? []).map((session) => session.user_id)).size;
  const scores = (scoredSessions.data ?? []).map((session) => Number(session.score)).filter(Number.isFinite);
  const averageScore = scoredSessions.error ? null : scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  const aiExplanationUsage = aiUsage.error ? null : (aiUsage.data ?? []).reduce((sum, row) => sum + Number(row.usage_count ?? 0), 0);
  const subjectRows = (answerRows.data ?? []) as unknown as AnswerRow[];
  const subjectStats = new Map<string, { total: number; correct: number }>();
  for (const answer of subjectRows) { const name = answer.question?.subject?.name; if (!name) continue; const current = subjectStats.get(name) ?? { total: 0, correct: 0 }; current.total += 1; current.correct += answer.is_correct ? 1 : 0; subjectStats.set(name, current); }
  const subjects = [...subjectStats.entries()].map(([name, stat]) => ({ name, accuracy: stat.total ? (stat.correct / stat.total) * 100 : 0, total: stat.total })).sort((a, b) => b.accuracy - a.accuracy);
  const jambSessions = (examSessions.data ?? []).filter((session) => session.exam_type === "jamb").length;
  const waecSessions = (examSessions.data ?? []).filter((session) => session.exam_type === "waec").length;
  const metrics = [
    { label: "Active students", value: count(activeStudents), icon: Users, note: "Studied in the last 7 days" },
    { label: "Answers submitted", value: count(allAnswers.error ? null : allAnswers.count), icon: BookOpenCheck, note: "All time" },
    { label: "Average score", value: averageScore === null ? "Unavailable" : `${averageScore.toFixed(1)}%`, icon: TrendingUp, note: "Across scored sessions" },
    { label: "AI explanations today", value: count(aiExplanationUsage), icon: Bot, note: "Used today" },
  ];
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold tracking-normal text-navy">Admin analytics</h1><p className="mt-2 text-sm text-slate-600">Live student activity and content performance from the database.</p></div>
    <div className="grid gap-4 md:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} className="border-border bg-white shadow-sm"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">{metric.label}</p><p className="mt-2 text-2xl font-bold text-navy">{metric.value}</p><p className="mt-1 text-xs text-slate-400">{metric.note}</p></div><metric.icon className="h-5 w-5 text-primary" /></CardContent></Card>)}</div>
    <Card className="border-border bg-white shadow-sm"><CardHeader><CardTitle>Weekly study activity</CardTitle></CardHeader><CardContent><div className="flex h-64 items-end gap-3">{dayRows.map((day) => <div key={day.label} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-medium text-slate-500">{day.value}</span><div className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-blue-300" style={{ height: `${Math.max(day.value ? 8 : 2, (day.value / maxSessions) * 210)}px` }} /><span className="text-xs text-slate-500">{day.label}</span></div>)}</div></CardContent></Card>
    <div className="grid gap-4 lg:grid-cols-2"><Card className="border-border bg-white shadow-sm"><CardHeader><CardTitle>Subject performance</CardTitle></CardHeader><CardContent className="space-y-4">{subjects.length === 0 ? <p className="text-sm text-slate-500">No answers submitted yet.</p> : subjects.map((subject) => <div key={subject.name} className="flex items-center gap-3"><span className="w-32 truncate text-sm text-navy">{subject.name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={subject.accuracy > 75 ? "h-full bg-green-500" : subject.accuracy >= 50 ? "h-full bg-amber-500" : "h-full bg-red-500"} style={{ width: `${subject.accuracy}%` }} /></div><span className="w-12 text-right text-sm font-semibold text-slate-600">{subject.accuracy.toFixed(1)}%</span></div>)}</CardContent></Card><Card className="border-border bg-white shadow-sm"><CardHeader><CardTitle>Exam activity</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div className="rounded-xl bg-blue-50 p-5"><p className="text-sm text-primary">JAMB sessions</p><p className="mt-2 text-3xl font-bold text-navy">{jambSessions.toLocaleString("en-NG")}</p></div><div className="rounded-xl bg-green-50 p-5"><p className="text-sm text-green-700">WAEC sessions</p><p className="mt-2 text-3xl font-bold text-navy">{waecSessions.toLocaleString("en-NG")}</p></div></CardContent></Card></div>
  </div>;
}
