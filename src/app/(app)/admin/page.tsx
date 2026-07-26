import { Activity, BookOpen, Crown, Flag, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/services/supabase/admin";

type RecentReport = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

function formatCount(value: number | null) {
  return value === null ? "Unavailable" : value.toLocaleString("en-NG");
}

function startOfDay(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export default async function AdminPage() {
  const admin = createServiceRoleClient();
  const [users, proUsers, newUsers, previousWeekUsers, sessions, todaySessions, pendingReports, recentReports] =
    await Promise.all([
      admin.from("users").select("*", { count: "exact", head: true }),
      admin.from("users").select("*", { count: "exact", head: true }).eq("is_pro", true),
      admin.from("users").select("*", { count: "exact", head: true }).gte("created_at", startOfDay(7)),
      admin.from("users").select("*", { count: "exact", head: true }).gte("created_at", startOfDay(14)).lt("created_at", startOfDay(7)),
      admin.from("sessions").select("*", { count: "exact", head: true }),
      admin.from("sessions").select("*", { count: "exact", head: true }).gte("created_at", startOfDay(0)),
      admin
        .from("question_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("question_reports")
        .select("id, reason, details, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const totalUsers = users.error ? null : users.count;
  const proCount = proUsers.error ? null : proUsers.count;
  const thisWeekCount = newUsers.error ? null : newUsers.count;
  const priorWeekCount = previousWeekUsers.error ? null : previousWeekUsers.count;
  const userTrend = thisWeekCount === null || priorWeekCount === null || priorWeekCount === 0 ? null : Math.round(((thisWeekCount - priorWeekCount) / priorWeekCount) * 100);
  const adminMetrics = [
    {
      label: "Total users",
      value: totalUsers,
      icon: Users,
      note: null,
    },
    {
      label: "Pro users",
      value: proCount,
      icon: Crown,
      note: totalUsers && proCount !== null ? `${Math.round((proCount / totalUsers) * 100)}% of total` : null,
    },
    {
      label: "New users this week",
      value: thisWeekCount,
      icon: UserPlus,
      note: userTrend === null ? null : `${userTrend >= 0 ? "↑" : "↓"} ${Math.abs(userTrend)}% vs previous week`,
    },
    {
      label: "Total sessions",
      value: sessions.error ? null : sessions.count,
      icon: BookOpen,
      note: null,
    },
    {
      label: "Sessions today",
      value: todaySessions.error ? null : todaySessions.count,
      icon: Activity,
      note: null,
    },
    {
      label: "Pending reports",
      value: pendingReports.error ? null : pendingReports.count,
      icon: Flag,
      note: null,
    },
  ];

  const reports = (recentReports.data ?? []) as RecentReport[];
  const reportCount = pendingReports.error ? null : pendingReports.count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-navy">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Live operational overview for content, users, sessions, and
          subscriptions.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {adminMetrics.map(({ label, value, icon: Icon, note }) => (
          <Card key={label} className="border-border bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-navy">
                  {formatCount(value)}
                </p>
                {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
              </div>
              <Icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-navy">Lesson center partners</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage partners, referral codes, and signup links for
              partnerships.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/admin/partners">Manage partners</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/referrals">View referrals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy">Question reports</h2>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                {reportCount === null
                  ? "Unavailable"
                  : `${reportCount} pending`}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review questions flagged by students as wrong, confusing, or
              having errors.
            </p>
            <Button asChild className="mt-5">
              <Link href="/admin/reports">View reports</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-navy">Question operations</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload, review, and publish new exam question sets.
            </p>
            <Button asChild className="mt-5">
              <Link href="/admin/question-upload">Open uploader</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-navy">Analytics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review student activity, subject performance, and platform growth.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/admin/analytics">View analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent question reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentReports.error ? (
            <p className="text-sm text-destructive">
              Recent reports are currently unavailable.
            </p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-600">No question reports yet.</p>
          ) : (
            reports.map((report) => (
              <Link
                key={report.id}
                href="/admin/reports"
                className="block rounded-2xl border border-border bg-[#F8FAFC] p-3 text-sm text-slate-600 transition hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-navy">{report.reason}</p>
                  <span className="capitalize text-xs text-slate-500">
                    {report.status}
                  </span>
                </div>
                {report.details && (
                  <p className="mt-1 line-clamp-1 text-xs">{report.details}</p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {new Intl.DateTimeFormat("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(report.created_at))}
                </p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
