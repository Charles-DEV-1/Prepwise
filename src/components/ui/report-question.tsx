"use client";

import { useState } from "react";
import { Flag, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/services/supabase/client";

type Props = {
  questionId: string;
};

const REASONS = [
  "Wrong answer - the correct answer marked is incorrect",
  "Question is confusing or unclear",
  "Explanation is wrong or incomplete",
  "Question has a typo or grammatical error",
  "Question appears more than once",
  "Other issue",
];

export function ReportQuestion({ questionId }: Props) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedReason) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    await supabase.from("question_reports").insert({
      question_id: questionId,
      user_id: user.id,
      reason: selectedReason,
      details: details.trim() || null,
      status: "pending",
    } as never);

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setSelectedReason("");
      setDetails("");
    }, 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition mt-1"
      >
        <Flag className="h-3 w-3" />
        Report this question
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-[#F8FAFC] p-4 space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-navy flex items-center gap-2">
          <Flag className="h-4 w-4 text-amber-500" />
          Report a problem
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 text-green-600 py-2">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-medium">Report submitted. Thank you!</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-start gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="mt-0.5 accent-blue-600 flex-shrink-0"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-800 transition leading-5">
                  {reason}
                </span>
              </label>
            ))}
          </div>

          {selectedReason && (
            <textarea
              placeholder="Additional details (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
            />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs"
              disabled={!selectedReason || loading}
              onClick={() => void handleSubmit()}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Submit report"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
