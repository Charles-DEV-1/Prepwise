"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReferralRow = {
  user_id: string;
  code: string;
  applied_at: string;
  partner_name: string;
  email: string | null;
  full_name: string | null;
  is_pro: boolean;
  pro_status: "free" | "individual" | "partner_bulk";
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/referrals");
      if (!res.ok) throw new Error("Failed to load referrals");
      const json = await res.json();
      setReferrals(json.referrals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Referral attributions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Students linked to lesson centers via referral codes.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : referrals.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No referrals recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Student</th>
                    <th className="pb-3 pr-4 font-medium">Partner</th>
                    <th className="pb-3 pr-4 font-medium">Code</th>
                    <th className="pb-3 pr-4 font-medium">Applied</th>
                    <th className="pb-3 font-medium">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((row) => (
                    <tr key={row.user_id} className="border-b border-border/60">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-navy">
                          {row.full_name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.email || "—"}
                        </p>
                      </td>
                      <td className="py-3 pr-4">{row.partner_name}</td>
                      <td className="py-3 pr-4 font-mono text-xs">
                        {row.code}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {new Date(row.applied_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {row.pro_status === "partner_bulk" ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            Pro (center)
                          </Badge>
                        ) : row.pro_status === "individual" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Pro (direct)
                          </Badge>
                        ) : (
                          <Badge className="border-slate-200 bg-slate-100 text-slate-600">
                            Free
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
