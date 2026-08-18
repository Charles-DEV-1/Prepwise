// Prepcore — User Referral System
"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Gift,
  Loader2,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  referralClaimSchema,
  type ReferralClaimValues,
} from "@/lib/user-referral-validations";
import {
  claimCashReward,
  getReferralStats,
  type UserReferralStats,
} from "@/services/api/user-referral";
import { createClient } from "@/services/supabase/client";
import type { UserReferralReward } from "@/types/app";
import { siteConfig } from "@/config/site";

const APP_ORIGIN = siteConfig.url;

function buildReferralLink(code: string) {
  return `${APP_ORIGIN}/signup?ref=${code}`;
}

function buildWhatsAppUrl(link: string) {
  const message = `I'm using Prepcore to prepare for JAMB/WAEC. Join with my link and start for free: ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function buildTwitterUrl(link: string) {
  const text = `I'm using Prepcore to prepare for JAMB/WAEC. Join with my link: ${link}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

function progressTowardNextReward(totalConverted: number) {
  const remainder = totalConverted % 5;
  return remainder === 0 && totalConverted > 0 ? 5 : remainder;
}

function RewardStatus({ reward }: { reward: UserReferralReward }) {
  let cashLabel = "Claim ₦5,000";
  if (reward.admin_paid) cashLabel = "Paid";
  else if (reward.cash_claimed) cashLabel = "Pending Admin";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-navy">Batch {reward.reward_batch}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge
            className={
              reward.pro_granted
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
          >
            {reward.pro_granted ? (
              <>
                <Check className="mr-1 h-3 w-3" /> Pro granted
              </>
            ) : (
              "Pro pending"
            )}
          </Badge>
          <Badge
            className={
              reward.admin_paid
                ? "border-green-200 bg-green-50 text-green-700"
                : reward.cash_claimed
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
            }
          >
            Cash: {cashLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function ReferralPage() {
  const [stats, setStats] = useState<UserReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [claimReward, setClaimReward] = useState<UserReferralReward | null>(
    null,
  );
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const claimForm = useForm<ReferralClaimValues>({
    resolver: zodResolver(referralClaimSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
    },
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in to view referrals.");
        setStats(await getReferralStats(user.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load referrals.");
      } finally {
        setLoading(false);
      }
    }
    void loadStats();
  }, [claimSuccess]);

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitClaim(values: ReferralClaimValues) {
    if (!claimReward) return;
    setClaimSubmitting(true);
    setClaimError(null);
    try {
      await claimCashReward(claimReward.id, values);
      setClaimSuccess(true);
      setClaimReward(null);
      claimForm.reset();
    } catch (err) {
      setClaimError(
        err instanceof Error ? err.message : "Could not submit claim.",
      );
    } finally {
      setClaimSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="p-8 text-center text-sm text-red-600">
          {error ?? "Could not load referral data."}
        </CardContent>
      </Card>
    );
  }

  const referralLink = buildReferralLink(stats.code);
  const progressCount = progressTowardNextReward(stats.totalConverted);
  const progressValue = (progressCount / 5) * 100;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <Badge className="border-primary/20 bg-primary/10 text-primary">
          <Gift className="mr-1 h-3 w-3" />
          Refer & earn
        </Badge>
        <h1 className="text-3xl font-bold text-navy">Invite friends, earn rewards</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Share your link. For every 5 friends who upgrade to Pro, you get one
          free Pro month and ₦5,000 cash.
        </p>
      </div>

      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Your referral link
          </CardTitle>
          <CardDescription>
            Share this link so signups are tracked to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-softblue px-4 py-3 text-sm font-medium text-navy break-all">
            {referralLink}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => copyLink(referralLink)}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button asChild variant="outline">
              <a href={buildWhatsAppUrl(referralLink)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Share on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={buildTwitterUrl(referralLink)} target="_blank" rel="noreferrer">
                <Share2 className="h-4 w-4" />
                Share on X
              </a>
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Your code: <strong>{stats.code}</strong>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total signups</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Users className="h-6 w-6 text-primary" />
              {stats.totalSignups}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            People who joined with your link
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Converted to Pro</CardDescription>
            <CardTitle className="text-3xl">{stats.totalConverted}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Friends who paid for premium
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress to next reward</CardTitle>
          <CardDescription>
            {progressCount}/5 paid referrals toward your next free Pro month + ₦5,000
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressValue} />
          <p className="text-sm text-slate-600">
            You need {stats.nextRewardAt} more paid referral
            {stats.nextRewardAt === 1 ? "" : "s"} to earn your next free Pro month + ₦5,000.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your rewards</CardTitle>
          <CardDescription>
            Each batch unlocks after 5 paid referrals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.rewards.length === 0 ? (
            <p className="text-sm text-slate-500">
              No rewards yet. Keep sharing your link.
            </p>
          ) : (
            stats.rewards.map((reward) => (
              <div key={reward.id} className="space-y-3">
                <RewardStatus reward={reward} />
                {!reward.cash_claimed && !reward.admin_paid && reward.pro_granted && (
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setClaimSuccess(false);
                      setClaimError(null);
                      setClaimReward(reward);
                    }}
                  >
                    Claim ₦5,000
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog
        open={claimReward !== null}
        onOpenChange={(open) => {
          if (!open) setClaimReward(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim ₦5,000</DialogTitle>
            <DialogDescription>
              Enter your bank details. We will review and send payment within 24–48 hours.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={claimForm.handleSubmit((values) => submitClaim(values))}
          >
            <div>
              <Label htmlFor="bankName">Bank name</Label>
              <Input id="bankName" {...claimForm.register("bankName")} />
              {claimForm.formState.errors.bankName && (
                <p className="mt-1 text-sm text-destructive">
                  {claimForm.formState.errors.bankName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                id="accountNumber"
                inputMode="numeric"
                maxLength={10}
                {...claimForm.register("accountNumber")}
              />
              {claimForm.formState.errors.accountNumber && (
                <p className="mt-1 text-sm text-destructive">
                  {claimForm.formState.errors.accountNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="accountName">Account name</Label>
              <Input id="accountName" {...claimForm.register("accountName")} />
              {claimForm.formState.errors.accountName && (
                <p className="mt-1 text-sm text-destructive">
                  {claimForm.formState.errors.accountName.message}
                </p>
              )}
            </div>
            {claimError && (
              <p className="text-sm text-destructive">{claimError}</p>
            )}
            <Button type="submit" disabled={claimSubmitting} className="w-full">
              {claimSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Claim
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {claimSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-sm text-green-700">
            We&apos;ll review and send your ₦5,000 within 24–48 hours.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
