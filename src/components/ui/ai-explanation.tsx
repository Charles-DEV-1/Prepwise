"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/hooks/use-user-plan";
import { getAIExplanation } from "@/services/api/ai-explanation";

type Props = {
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation: string;
  subject?: string;
};

const FREE_DAILY_LIMIT = 5;
const PRO_DAILY_LIMIT = 10;

function getTodayUsage(): number {
  if (typeof window === "undefined") return 0;
  const key = `ai_usage_${new Date().toISOString().split("T")[0]}`;

  try {
    return parseInt(localStorage.getItem(key) ?? "0", 10);
  } catch {
    return 0;
  }
}

function incrementTodayUsage() {
  if (typeof window === "undefined") return;
  const key = `ai_usage_${new Date().toISOString().split("T")[0]}`;
  const current = getTodayUsage();

  try {
    localStorage.setItem(key, String(current + 1));
  } catch {}
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
  const [, setRefreshTrigger] = useState(0);

  // Re-read usage on every refresh trigger
  const todayUsage = getTodayUsage();
  const dailyLimit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const limitReached = todayUsage >= dailyLimit;

  async function handleExplain() {
    if (limitReached || loading) return;
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
      incrementTodayUsage();
      // Trigger re-render to update the usage count
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load AI explanation. Try again.",
      );
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
            <span className="text-xs text-purple-400">
              ({Math.max(0, dailyLimit - todayUsage)} left today)
            </span>
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

  // Limit reached for users
  if (limitReached) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            {isPro
              ? `You've used your ${PRO_DAILY_LIMIT} AI explanations today. Come back tomorrow!`
              : `You've used your ${FREE_DAILY_LIMIT} free AI explanations today. Upgrade to Pro for ${PRO_DAILY_LIMIT} per day.`}
          </p>
        </div>
        {!isPro && (
          <Button asChild size="sm" className="flex-shrink-0 text-xs h-7">
            <a href="/upgrade">Upgrade</a>
          </Button>
        )}
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
        {!loading && (
          <span className="text-xs text-purple-400 ml-1">
            ({Math.max(0, dailyLimit - todayUsage)} left today)
          </span>
        )}
      </Button>
    </div>
  );
}
