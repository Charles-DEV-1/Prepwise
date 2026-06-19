"use client";

import { Check, Crown, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserPlan } from "@/hooks/use-user-plan";
import { getMyReferral, type UserReferral } from "@/services/api/referral";

const FREE_FEATURES = [
  { text: "Unlimited practice mode", included: true },
  { text: "3 mock exams per day", included: true },
  { text: "Score tracking and progress", included: true },
  { text: "Weekly quiz", included: true },
  { text: "Flashcards", included: false },
  { text: "Unlimited mock exams", included: false },
  { text: "AI explanations", included: false },
  { text: "Advanced weak-topic analysis", included: false },
];

const PRO_FEATURES = [
  "Everything in Free",
  "Flashcards for all subjects",
  "Unlimited mock exams",
  "AI explanations",
  "Advanced weak-topic analysis",
  "Downloadable result cards",
  "Priority support",
  "One year of Pro access",
];

export default function UpgradePage() {
  const { isPro, isLoading, isPartnerBulkPro, partnerName } = useUserPlan();
  const [referral, setReferral] = useState<UserReferral | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getMyReferral().then(setReferral);
  }, []);

  async function startCheckout() {
    setCheckoutLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_key: "prepcore_pro_annual" }),
      });
      const data = (await response.json()) as {
        checkout_url?: string;
        error?: string;
      };

      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error ?? "Could not start payment.");
      }

      window.location.href = data.checkout_url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start payment.",
      );
      setCheckoutLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl bg-primary p-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Crown className="h-8 w-8 text-yellow-300" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">You are on Prepcore Pro</h1>
          <p className="mt-2 text-sm text-blue-100">
            {isPartnerBulkPro && partnerName
              ? `Pro included through ${partnerName}.`
              : "Your individual Pro subscription is active."}
          </p>
          <Badge className="mt-4 border-white/30 bg-white/20 text-white">
            Active subscription
          </Badge>
        </div>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Pro features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline">
            <Link href="/flashcards">Open Flashcards</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exam">Take Mock Exam</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/practice">Practice Mode</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/progress">View Progress</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-3 text-center">
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          <Sparkles className="mr-1 h-3 w-3" />
          Secure Flutterwave checkout
        </Badge>
        <h1 className="text-3xl font-bold text-navy">
          Upgrade to Prepcore Pro
        </h1>
        <p className="mx-auto max-w-lg text-slate-500">
          Pay online and get automatic Pro access after server-side transaction
          verification.
        </p>
        {referral && (
          <p className="mx-auto max-w-md rounded-xl border border-blue-100 bg-softblue px-4 py-3 text-sm text-navy">
            Referred via <strong>{referral.partner_name}</strong> (
            {referral.code})
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Free</CardTitle>
            <p className="text-4xl font-bold text-navy">NGN 0</p>
            <p className="text-sm text-slate-500">Forever free</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FREE_FEATURES.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 text-sm"
                >
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-slate-300" />
                  )}
                  <span
                    className={
                      feature.included ? "text-slate-700" : "text-slate-400"
                    }
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full" disabled>
              Current plan
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary bg-softblue shadow-soft">
          <div className="absolute right-4 top-4">
            <Badge className="bg-primary text-white">Most popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Pro
            </CardTitle>
            <p className="text-4xl font-bold text-navy">NGN 2,000</p>
            <p className="text-sm text-slate-500">One-time yearly access</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PRO_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-white p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-navy">
                    Verified before activation
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Prepcore verifies the transaction with Flutterwave before
                    upgrading your account.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              className="mt-6 w-full"
              onClick={startCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay with Flutterwave
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
