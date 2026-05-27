"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/hooks/use-user-plan";
import { getAIExplanation } from "@/services/api/ai-explanation";
import { cn } from "@/lib/utils";

type Props = {
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation: string;
  subject?: string;
};

const FREE_DAILY_LIMIT = 5;

function getTodayUsage(): number {
  if (typeof window === "undefined") return 0;
  const key = `ai_usage_${new Date().toISOString().split("T")[0]}`;
  return parseInt(localStorage.getItem(key) ?? "0", 10);
}

function incrementTodayUsage() {
  if (typeof window === "undefined") return;
  const key = `ai_usage_${new Date().toISOString().split("T")[0]}`;
  const current = getTodayUsage();
  localStorage.setItem(key, String(current + 1));
}

export function AIExplanation({
  question,
  options,
  correctAnswer,
  explanation,
  subject = "General",
}: Props) {
  const { isPro } = useUserPlan();
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [used, setUsed] = useState(false);

  const todayUsage = getTodayUsage();
  const limitReached = !isPro && todayUsage >= FREE_DAILY_LIMIT;

  async function handleExplain() {
    if (limitReached) return;
    setLoading(true);
    setError(null);

    try {
      const text = await getAIExplanation(
        question,
        options,
        correctAnswer,
        explanation,
        subject,
      );
      setAiText(text);
      setUsed(true);
      if (!isPro) incrementTodayUsage();
    } catch {
      setError("Could not load AI explanation. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Already generated — show it
  if (aiText) {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 space-y-2">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              AI Explanation
            </span>
            {!isPro && (
              <span className="text-xs text-purple-400">
                ({FREE_DAILY_LIMIT - getTodayUsage()} free left today)
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-purple-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-purple-400" />
          )}
        </div>
        {expanded && (
          <p className="text-sm text-slate-700 leading-6">{aiText}</p>
        )}
      </div>
    );
  }

  // Limit reached for free users
  if (limitReached) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            You've used your 5 free AI explanations today. Upgrade to Pro for
            unlimited.
          </p>
        </div>
        <Button asChild size="sm" className="flex-shrink-0 text-xs h-7">
          <a href="/upgrade">Upgrade</a>
        </Button>
      </div>
    );
  }

  // Show explain button
  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
        onClick={() => void handleExplain()}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {loading ? "Getting AI explanation..." : "Explain this answer with AI"}
        {!isPro && !loading && (
          <span className="text-xs text-purple-400 ml-1">
            ({FREE_DAILY_LIMIT - todayUsage} left today)
          </span>
        )}
      </Button>
    </div>
  );
}
