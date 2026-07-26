// Prepcore — Admin Dashboard
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/services/supabase/admin";

export default async function AdminUsersPage() {
  const admin = createServiceRoleClient();
  const { data: users, error } = await admin
    .from("users")
    .select("id, full_name, email, is_pro, exam_goals, exam_type, created_at, subscription_expires_at")
    .order("created_at", { ascending: false });

  return <div className="space-y-6">
    <div><h1 className="flex items-center gap-2 text-3xl font-bold text-navy"><Users className="h-7 w-7 text-primary" />User management</h1><p className="mt-2 text-sm text-slate-600">All registered Prepcore users and their current plan.</p></div>
    <Card className="rounded-2xl border-border bg-white shadow-sm"><CardHeader><CardTitle>{error ? "Users unavailable" : `${(users ?? []).length.toLocaleString("en-NG")} users total`}</CardTitle></CardHeader><CardContent className="overflow-x-auto">{error ? <p className="text-sm text-destructive">Unable to load users: {error.message}</p> : <table className="w-full text-sm"><thead className="border-b text-left text-slate-500"><tr><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Exam goals</th><th className="p-3">Joined</th><th className="p-3">Pro expires</th></tr></thead><tbody>{(users ?? []).map((user) => <tr key={user.id} className="border-b border-border/60 hover:bg-slate-50"><td className="p-3"><p className="font-medium text-navy">{user.full_name || "Unnamed user"}</p><p className="text-xs text-slate-500">{user.email || "No email"}</p></td><td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_pro ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{user.is_pro ? "Pro" : "Free"}</span></td><td className="p-3 uppercase text-slate-600">{user.exam_goals?.join(", ") || user.exam_type || "—"}</td><td className="p-3 text-slate-600">{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(user.created_at))}</td><td className="p-3 text-slate-600">{user.subscription_expires_at ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(user.subscription_expires_at)) : "—"}</td></tr>)}</tbody></table>}</CardContent></Card>
  </div>;
}
