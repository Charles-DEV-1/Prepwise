"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/services/supabase/client";
import { cn } from "@/lib/utils";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  question_id: string;
  question_prompt: string;
  question_correct_answer: string;
  question_explanation: string;
  subject_name: string;
  reporter_email: string | null;
};

const STATUS_COLORS = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-green-200 bg-green-50 text-green-700",
  dismissed: "border-slate-200 bg-slate-50 text-slate-600",
};

const STATUS_ICONS = {
  pending: Clock,
  resolved: CheckCircle2,
  dismissed: XCircle,
};

export default function ReportsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "resolved" | "dismissed"
  >("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("question_reports")
      .select(
        `
        id, reason, details, status, created_at, question_id,
        question:questions (
          prompt, correct_answer, explanation,
          subject:subjects ( name )
        ),
        reporter:users ( email )
      `,
      )
      .order("created_at", { ascending: false });

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = data.map((r: any) => ({
        id: r.id,
        reason: r.reason,
        details: r.details,
        status: r.status,
        created_at: r.created_at,
        question_id: r.question_id,
        question_prompt: r.question?.prompt ?? "Unknown question",
        question_correct_answer: r.question?.correct_answer ?? "",
        question_explanation: r.question?.explanation ?? "",
        subject_name: r.question?.subject?.name ?? "Unknown",
        reporter_email: r.reporter?.email ?? null,
      }));
      setReports(mapped);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function updateStatus(reportId: string, newStatus: string) {
    setUpdating(reportId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("question_reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
    );
    setUpdating(null);
  }

  const filtered =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Flag className="h-6 w-6 text-amber-500" />
            Question Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Questions flagged by students as having errors or issues
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadReports()}>
          Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "all", "resolved", "dismissed"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition border",
                filter === status
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-border hover:border-primary hover:text-primary",
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-xs opacity-70">
                ({counts[status]})
              </span>
            </button>
          ),
        )}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500">Loading reports...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="py-16 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <p className="font-semibold text-navy">
              No {filter === "all" ? "" : filter} reports
            </p>
            <p className="text-sm text-slate-500">
              {filter === "pending"
                ? "All reports have been reviewed."
                : "Nothing here yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const StatusIcon =
              STATUS_ICONS[report.status as keyof typeof STATUS_ICONS] ?? Clock;
            return (
              <Card
                key={report.id}
                className="border-border bg-white shadow-sm"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Report header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Flag className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm">
                          {report.reason}
                        </p>
                        {report.details && (
                          <p className="text-xs text-slate-500 mt-1 leading-5">
                            &quot;{report.details}&quot;
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-slate-400">
                            {new Date(report.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          {report.reporter_email && (
                            <span className="text-xs text-slate-400">
                              by {report.reporter_email}
                            </span>
                          )}
                          <Badge
                            className={cn(
                              "text-xs gap-1",
                              STATUS_COLORS[
                                report.status as keyof typeof STATUS_COLORS
                              ],
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {report.status}
                          </Badge>
                          <Badge className="text-xs">
                            {report.subject_name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question preview */}
                  <div className="rounded-xl border border-border bg-[#F8FAFC] p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Reported question
                    </p>
                    <p className="text-sm text-navy leading-6">
                      {report.question_prompt}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Correct answer:</span>
                      <span className="font-semibold text-green-600">
                        {report.question_correct_answer}
                      </span>
                    </div>
                    {report.question_explanation && (
                      <p className="text-xs text-slate-500 leading-5 border-t border-border pt-2">
                        {report.question_explanation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {report.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5 bg-green-600 hover:bg-green-700 text-xs"
                          disabled={updating === report.id}
                          onClick={() =>
                            void updateStatus(report.id, "resolved")
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          disabled={updating === report.id}
                          onClick={() =>
                            void updateStatus(report.id, "dismissed")
                          }
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Dismiss
                        </Button>
                      </>
                    )}
                    {report.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        disabled={updating === report.id}
                        onClick={() => void updateStatus(report.id, "pending")}
                      >
                        Reopen
                      </Button>
                    )}

                    <a
                      href={`https://supabase.com/dashboard/project/ioakyesaeondeqvbcaua/editor?query=SELECT%20*%20FROM%20questions%20WHERE%20id%20%3D%20%27${report.question_id}%27`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Edit in Supabase
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
