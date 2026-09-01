import Link from "next/link";
import { MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/services/supabase/admin";

type SearchParams = Promise<{ view?: string; rating?: string; type?: string; q?: string; from?: string; to?: string }>;
type FeedbackRow = { id: string; user_id: string; rating: number; comment: string | null; feedback_type: string; user_plan: string; created_at: string };

const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);
const formatDate = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default async function AdminFeedbackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const view = params.view === "comments" ? "comments" : "ratings";
  const rating = Number(params.rating);
  const query = (params.q ?? "").trim().toLowerCase();
  const admin = createServiceRoleClient();
  const feedbackQuery = admin.from("feedback").select("id,user_id,rating,comment,feedback_type,user_plan,created_at").order("created_at", { ascending: false }).limit(500);
  if (rating >= 1 && rating <= 5) feedbackQuery.eq("rating", rating);
  if (params.type && params.type !== "all") feedbackQuery.eq("feedback_type", params.type as never);
  if (params.from) feedbackQuery.gte("created_at", `${params.from}T00:00:00.000Z`);
  if (params.to) feedbackQuery.lte("created_at", `${params.to}T23:59:59.999Z`);
  const [feedbackResult, totalResult, commentsResult, fiveResult, lowResult] = await Promise.all([
    feedbackQuery,
    admin.from("feedback").select("id", { count: "exact", head: true }),
    admin.from("feedback").select("id", { count: "exact", head: true }).not("comment", "is", null),
    admin.from("feedback").select("id", { count: "exact", head: true }).eq("rating", 5),
    admin.from("feedback").select("id", { count: "exact", head: true }).lte("rating", 2),
  ]);
  const feedback = (feedbackResult.data ?? []) as FeedbackRow[];
  const userIds = [...new Set(feedback.map((row) => row.user_id))];
  const { data: users } = userIds.length ? await admin.from("users").select("id,full_name,email").in("id", userIds) : { data: [] };
  const userMap = new Map((users ?? []).map((user) => [user.id, user]));
  const visible = feedback.filter((row) => {
    if (view === "comments" && !row.comment) return false;
    if (!query) return true;
    const user = userMap.get(row.user_id);
    return [user?.full_name, user?.email, row.comment].some((value) => value?.toLowerCase().includes(query));
  });
  const average = feedback.length ? feedback.reduce((sum, row) => sum + row.rating, 0) / feedback.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((value) => ({ value, count: feedback.filter((row) => row.rating === value).length }));
  const cards = [
    { label: "Average rating", value: feedback.length ? `${average.toFixed(1)} / 5` : "—" },
    { label: "Total responses", value: (totalResult.count ?? 0).toLocaleString("en-NG") },
    { label: "5-star responses", value: (fiveResult.count ?? 0).toLocaleString("en-NG") },
    { label: "Low ratings", value: (lowResult.count ?? 0).toLocaleString("en-NG") },
    { label: "Comments received", value: (commentsResult.count ?? 0).toLocaleString("en-NG") },
  ];
  return <div className="space-y-6">
    <div><h1 className="flex items-center gap-2 text-3xl font-bold text-navy"><MessageSquare className="h-7 w-7 text-primary" />Feedback</h1><p className="mt-2 text-sm text-slate-600">Ratings and improvement ideas submitted by Prepcore students.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <Card key={card.label} className="border-border bg-white shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-bold text-navy">{card.value}</p></CardContent></Card>)}</div>
    <Card className="border-border bg-white shadow-sm"><CardHeader><CardTitle>Rating distribution</CardTitle></CardHeader><CardContent className="space-y-3">{distribution.map(({ value, count }) => <div key={value} className="flex items-center gap-3 text-sm"><span className="w-20 font-medium text-amber">{stars(value)}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber" style={{ width: `${feedback.length ? (count / feedback.length) * 100 : 0}%` }} /></div><span className="w-10 text-right text-slate-600">{count}</span></div>)}</CardContent></Card>
    <div className="flex gap-2 border-b border-border"><Link href="/admin/feedback" className={`rounded-t-xl px-4 py-2 text-sm font-semibold ${view === "ratings" ? "bg-softblue text-primary" : "text-slate-500"}`}>Ratings overview</Link><Link href="/admin/feedback?view=comments" className={`rounded-t-xl px-4 py-2 text-sm font-semibold ${view === "comments" ? "bg-softblue text-primary" : "text-slate-500"}`}>Suggestions & comments</Link></div>
    <Card className="border-border bg-white shadow-sm"><CardContent className="p-5"><form className="grid gap-3 md:grid-cols-5"><input type="hidden" name="view" value={view} /><input name="q" defaultValue={params.q} placeholder="Search name, email, comment" className="h-11 rounded-xl border border-border px-3 text-sm md:col-span-2" /><select name="rating" defaultValue={params.rating ?? ""} className="h-11 rounded-xl border border-border bg-white px-3 text-sm"><option value="">All ratings</option>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}</select><select name="type" defaultValue={params.type ?? "all"} className="h-11 rounded-xl border border-border bg-white px-3 text-sm"><option value="all">All types</option><option value="general">General</option><option value="practice">Practice</option><option value="exam">Exam</option></select><button className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white">Apply filters</button></form></CardContent></Card>
    {visible.length === 0 ? <Card className="border-border bg-white shadow-sm"><CardContent className="p-10 text-center"><MessageSquare className="mx-auto h-9 w-9 text-primary" /><h2 className="mt-4 font-bold text-navy">No feedback yet.</h2><p className="mt-2 text-sm text-slate-500">User feedback will appear here once students begin submitting responses.</p></CardContent></Card> : view === "comments" ? <div className="grid gap-4 lg:grid-cols-2">{visible.map((row) => { const user = userMap.get(row.user_id); return <Card key={row.id} className="border-border bg-white shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-navy">{user?.full_name || "Unnamed user"}</p><p className="text-xs text-slate-500">{user?.email || "No email"}</p></div><span className="text-sm text-amber">{stars(row.rating)}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{row.comment}</p><p className="mt-4 text-xs text-slate-500">{row.feedback_type} · {row.user_plan} · {formatDate(row.created_at)}</p></CardContent></Card>; })}</div> : <Card className="border-border bg-white shadow-sm"><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[700px] text-sm"><thead className="border-b text-left text-slate-500"><tr><th className="p-4">User</th><th className="p-4">Rating</th><th className="p-4">Type</th><th className="p-4">Plan</th><th className="p-4">Date submitted</th></tr></thead><tbody>{visible.map((row) => { const user = userMap.get(row.user_id); return <tr key={row.id} className="border-b border-border/60 hover:bg-slate-50"><td className="p-4"><p className="font-medium text-navy">{user?.full_name || "Unnamed user"}</p><p className="text-xs text-slate-500">{user?.email || "No email"}</p></td><td className="p-4"><span className="inline-flex items-center gap-1 font-medium text-amber"><Star className="h-4 w-4 fill-current" />{row.rating} / 5</span></td><td className="p-4 capitalize text-slate-600">{row.feedback_type.replace("_", " ")}</td><td className="p-4 capitalize text-slate-600">{row.user_plan}</td><td className="p-4 text-slate-600">{formatDate(row.created_at)}</td></tr>; })}</tbody></table></CardContent></Card>}
  </div>;
}
