// Prepcore — Revenue Dashboard
import { forbiddenResponse, getAdminSessionUser } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";

const escapeCsv = (value: string | null) => `"${(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await getAdminSessionUser())) return forbiddenResponse();
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("payments").select("id, user_id, created_at").eq("status", "successful").order("created_at", { ascending: false });
  if (error) return new Response("Could not export revenue data.", { status: 500 });
  const payments = data ?? [];
  const userIds = [...new Set(payments.map((payment) => payment.user_id))];
  const { data: users } = userIds.length ? await admin.from("users").select("id, full_name, email").in("id", userIds) : { data: [] };
  const userMap = new Map((users ?? []).map((user) => [user.id, user]));
  const rows = payments.map((payment) => { const user = userMap.get(payment.user_id); return [user?.full_name ?? null, user?.email ?? null, payment.created_at, null, "Paid", "3000"].map(escapeCsv).join(","); });
  const csv = ["Name,Email,Payment Date,Expiry,Status,Revenue", ...rows].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="prepcore-revenue-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
