"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/services/supabase/client";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
  user_id: string;
  user_name: string;
  score: number;
  total_questions: number;
  percent: number;
  rank: number;
};

export function LeaderboardPage() {
  const supabase = createClient();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [weekLabel, setWeekLabel] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setCurrentUserId(user.id);

        // Get current active quiz
        const today = new Date().toISOString().split("T")[0];
        const { data: quiz } = (await supabase
          .from("weekly_quizzes")
          .select("id, week_start, week_end")
          .eq("is_active", true)
          .lte("week_start", today)
          .gte("week_end", today)
          .single()) as unknown as {
          data: {
            id: string;
            week_start: string;
            week_end: string;
          } | null;
        };

        if (!quiz) {
          setLeaderboard([]);
          setWeekLabel("No active quiz this week");
          setLoading(false);
          return;
        }

        // Format week label
        const start = new Date(quiz.week_start);
        const end = new Date(quiz.week_end);
        setWeekLabel(
          `${start.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`,
        );

        // Get all entries for this week's quiz
        const { data: entries } = (await supabase
          .from("weekly_quiz_entries")
          .select("user_id, score, total_questions")
          .eq("quiz_id", quiz.id)
          .order("score", { ascending: false })) as unknown as {
          data: Array<{
            user_id: string;
            score: number;
            total_questions: number;
          }> | null;
        };

        if (!entries || entries.length === 0) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Get unique user IDs
        const userIds = entries.map((e) => e.user_id);

        // Get user details
        const { data: users } = (await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds)) as unknown as {
          data: Array<{
            id: string;
            full_name: string | null;
            email: string | null;
          }> | null;
        };

        const userMap: Record<string, string> = {};
        (users ?? []).forEach((u) => {
          const name =
            u.full_name?.split(" ")[0] ?? u.email?.split("@")[0] ?? "Student";
          userMap[u.id] = name;
        });

        // Map entries to leaderboard format and sort
        const allEntries: LeaderboardEntry[] = entries
          .map((entry) => ({
            user_id: entry.user_id,
            user_name: userMap[entry.user_id] ?? "Student",
            score: entry.score,
            total_questions: entry.total_questions,
            percent:
              entry.total_questions > 0
                ? Math.round((entry.score / entry.total_questions) * 100)
                : 0,
            rank: 0,
          }))
          .sort((a, b) => {
            if (b.percent !== a.percent) return b.percent - a.percent;
            return b.score - a.score;
          })
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        // Show top 20 + current user if below top 20
        const displayBoard: LeaderboardEntry[] = allEntries.slice(0, 20);

        const currentUserEntry = allEntries.find((e) => e.user_id === user.id);
        if (currentUserEntry && currentUserEntry.rank > 20) {
          // Add current user at the end if they're below top 20
          displayBoard.push(currentUserEntry);
        }

        setLeaderboard(displayBoard);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadLeaderboard();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 py-8">
        <Skeleton className="mx-auto h-7 w-48" />
        <Skeleton className="mx-auto h-4 w-36" />
        <Card className="mt-8 p-5 space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</Card>
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="border-amber-200 bg-amber-50 text-amber-700 gap-1">
          <Trophy className="h-3 w-3" />
          Weekly Quiz Leaderboard
        </Badge>
        <h1 className="text-3xl font-bold text-navy">
          This Week&apos;s Rankings
        </h1>
        <p className="text-slate-500">{weekLabel}</p>
      </div>

      {/* Leaderboard */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-slate-500">No scores yet this week</p>
              <Button asChild>
                <Link href="/weekly-quiz">Take weekly quiz</Link>
              </Button>
            </div>
          ) : (
            <Stagger className="space-y-2" delay={0.08}>
              {leaderboard.map((entry, index) => {
                const isMe = entry.user_id === currentUserId;
                const isBelowTop20 = entry.rank > 20;

                return (
                  <StaggerItem key={entry.user_id}>
                    {/* Divider before current user if below top 20 */}
                    {isBelowTop20 && index > 0 && (
                      <div className="my-3 flex items-center gap-3">
                        <div className="flex-1 h-px bg-border"></div>
                        <p className="text-xs text-slate-400 font-medium">
                          Your Rank
                        </p>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 transition",
                        isMe
                          ? "border-primary bg-softblue"
                          : "border-border bg-white hover:bg-[#F8FAFC]",
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-lg w-8 text-center flex-shrink-0">
                          {entry.rank < 4 ? (
                            medals[entry.rank - 1]
                          ) : (
                            <span className="text-sm font-bold text-slate-400">
                              #{entry.rank}
                            </span>
                          )}
                        </span>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              isMe ? "text-primary" : "text-navy",
                            )}
                          >
                            {entry.user_name}
                            {isMe && (
                              <span className="ml-2 text-xs font-normal text-primary/70">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {entry.score} / {entry.total_questions} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-bold text-lg",
                            entry.percent >= 60
                              ? "text-green-600"
                              : entry.percent >= 40
                                ? "text-amber-500"
                                : "text-red-500",
                          )}
                        >
                          {entry.percent}%
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/weekly-quiz">
            <RotateCcw className="h-4 w-4" />
            Take weekly quiz
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/exam">Practice mock exam</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
