"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/services/supabase/client";
import { cn } from "@/lib/utils";

type LeaderboardEntry = {
  user_id: string;
  user_name: string;
  highest_score: number;
  total_tests: number;
  avg_score: number;
  rank: number;
};

export function LeaderboardPage() {
  const supabase = createClient();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      try {
        // Get user scores from sessions table
        const { data: sessions } = (await supabase
          .from("sessions")
          .select("user_id, score, total_questions, completed_at")
          .eq("mode", "mock")
          .not("score", "is", null)
          .not("completed_at", "is", null)) as unknown as {
          data: Array<{
            user_id: string;
            score: number;
            total_questions: number;
            completed_at: string;
          }> | null;
        };

        if (!sessions || sessions.length === 0) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Get unique user IDs
        const userIds = [...new Set(sessions.map((s: any) => s.user_id))];

        // Get user details
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds);

        const userMap: Record<string, string> = {};
        (users ?? []).forEach((u: any) => {
          const name =
            u.full_name?.split(" ")[0] ?? u.email?.split("@")[0] ?? "Student";
          userMap[u.id] = name;
        });

        // Calculate rankings
        const userStats: Record<
          string,
          { highest: number; total: number; sum: number }
        > = {};

        (sessions as any[]).forEach((session) => {
          if (!userStats[session.user_id]) {
            userStats[session.user_id] = {
              highest: 0,
              total: 0,
              sum: 0,
            };
          }
          const score =
            session.total_questions > 0
              ? Math.round((session.score / session.total_questions) * 100)
              : 0;
          userStats[session.user_id].highest = Math.max(
            userStats[session.user_id].highest,
            score,
          );
          userStats[session.user_id].total += 1;
          userStats[session.user_id].sum += score;
        });

        const entries: LeaderboardEntry[] = Object.entries(userStats)
          .map(([userId, stats]) => ({
            user_id: userId,
            user_name: userMap[userId] ?? "Student",
            highest_score: stats.highest,
            total_tests: stats.total,
            avg_score: Math.round(stats.sum / stats.total),
            rank: 0,
          }))
          .sort((a, b) => {
            if (b.highest_score !== a.highest_score) {
              return b.highest_score - a.highest_score;
            }
            return b.avg_score - a.avg_score;
          })
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setLeaderboard(entries);
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading leaderboard...</p>
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
          Global Leaderboard
        </Badge>
        <h1 className="text-3xl font-bold text-navy">Rankings</h1>
        <p className="text-slate-500">Top performers across all mock exams</p>
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
              <p className="text-slate-500">No scores yet</p>
              <Button asChild>
                <Link href="/exam">Take a mock exam</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isMe = entry.user_id === currentUserId;
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 transition",
                      isMe
                        ? "border-primary bg-softblue"
                        : "border-border bg-white hover:bg-[#F8FAFC]",
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-lg w-8 text-center flex-shrink-0">
                        {index < 3 ? (
                          medals[index]
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
                          {entry.total_tests} test
                          {entry.total_tests !== 1 ? "s" : ""} • Avg:{" "}
                          {entry.avg_score}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {entry.highest_score}%
                      </p>
                      <p className="text-xs text-slate-400">Highest</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/exam">
            <RotateCcw className="h-4 w-4" />
            Take mock exam
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/practice">Practice questions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
