"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Crown,
  Sparkles,
  LogOut,
  User,
  Mail,
  Target,
  BookOpen,
  Building2,
  Check,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { getMyReferral, type UserReferral } from "@/services/api/referral";
import { createClient } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPlan } from "@/hooks/use-user-plan";
import {
  getProfileData,
  updateProfileData,
  type ProfileData,
} from "@/services/api/profile";

type RankInfo = {
  name: string;
  emoji: string;
  points: number;
  progress: number;
  nextRank?: { name: string; min: number };
};

export default function ProfilePage() {
  const router = useRouter();
  const {
    isPro,
    isLoading: planLoading,
    isPartnerBulkPro,
    partnerName: planPartnerName,
  } = useUserPlan();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [referral, setReferral] = useState<UserReferral | null>(null);
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const [data, ref] = await Promise.all([
          getProfileData(),
          getMyReferral(),
        ]);
        setEditData(data);
        setReferral(ref);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    void loadProfile();
  }, []);

  useEffect(() => {
    async function loadRank() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { getUserPoints } = await import("@/services/api/points");
      const info = await getUserPoints(supabase, user.id);
      setRankInfo(info);
    }

    void loadRank();
  }, []);

  async function handleSave() {
    if (!editData) return;
    try {
      setIsSaving(true);
      setError(null);
      await updateProfileData(editData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const { signOut } = await import("@/services/auth");
      await signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account and subscription
        </p>
      </div>

      {/* Plan card */}
      {!planLoading &&
        (isPro ? (
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Prepwise Pro</p>
                    <p className="text-xs text-slate-500">
                      {isPartnerBulkPro && planPartnerName
                        ? `Included via ${planPartnerName} lesson center plan`
                        : "Active · Full access until Dec 2026"}
                    </p>
                  </div>
                </div>
                <Badge className="border-yellow-300 bg-yellow-100 text-yellow-700">
                  Active
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  "Unlimited mock exams",
                  "All flashcards",
                  "AI explanations",
                  "Downloadable scorecard",
                ].map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-1.5 text-xs text-slate-600"
                  >
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-softblue shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Free plan</p>
                    <p className="text-xs text-slate-500">
                      3 mock exams/day · Basic features
                    </p>
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link href="/upgrade">Upgrade — ₦2,000</Link>
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Upgrade to unlock flashcards, unlimited mock exams, and AI
                explanations. One-time payment, valid until after JAMB 2026.
              </p>
            </CardContent>
          </Card>
        ))}

      {rankInfo && (
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-softblue text-xl">
                  {rankInfo.emoji}
                </div>
                <div>
                  <p className="font-semibold text-navy">{rankInfo.name}</p>
                  <p className="text-xs text-slate-500">
                    {rankInfo.points.toLocaleString()} total points
                  </p>
                </div>
              </div>
              <Badge className="border-primary/20 bg-primary/10 text-primary gap-1">
                <Trophy className="h-3 w-3" />
                Rank
              </Badge>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{rankInfo.name}</span>
                {rankInfo.nextRank ? (
                  <span>
                    {rankInfo.nextRank.name} in{" "}
                    {Math.max(
                      0,
                      rankInfo.nextRank.min - rankInfo.points,
                    ).toLocaleString()}{" "}
                    pts
                  </span>
                ) : (
                  <span>Top rank reached</span>
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${rankInfo.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile details */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Personal details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Changes saved successfully
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Full name
            </Label>
            <Input
              id="fullName"
              value={editData?.full_name ?? ""}
              onChange={(e) =>
                setEditData((prev) =>
                  prev ? { ...prev, full_name: e.target.value } : null,
                )
              }
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Email
            </Label>
            <Input
              id="email"
              value={editData?.email ?? ""}
              disabled
              className="bg-slate-50 text-slate-500"
            />
            <p className="text-xs text-slate-400">
              Email cannot be changed — linked to your Google account
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examType" className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                Exam type
              </Label>
              <Input
                id="examType"
                value={editData?.exam_type ?? ""}
                onChange={(e) =>
                  setEditData((prev) =>
                    prev ? { ...prev, exam_type: e.target.value } : null,
                  )
                }
                placeholder="e.g., JAMB"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="targetScore"
                className="flex items-center gap-1.5"
              >
                <Target className="h-3.5 w-3.5 text-slate-400" />
                Target score
              </Label>
              <Input
                id="targetScore"
                type="number"
                value={editData?.target_score ?? ""}
                onChange={(e) =>
                  setEditData((prev) =>
                    prev
                      ? { ...prev, target_score: parseInt(e.target.value) || 0 }
                      : null,
                  )
                }
                placeholder="e.g., 280"
              />
            </div>
          </div>

          <Button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {referral && (
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5 flex items-start gap-3">
            <Building2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-navy">Lesson center</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {referral.partner_name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Referral code: {referral.code}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Card className="border-border bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy">Sign out</p>
              <p className="text-xs text-slate-500 mt-0.5">
                You will be redirected to the login page
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
