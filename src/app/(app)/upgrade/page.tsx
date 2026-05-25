"use client";

import {
  Check,
  X,
  Sparkles,
  MessageCircle,
  Copy,
  Crown,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/services/supabase/client";
import { useUserPlan } from "@/hooks/use-user-plan";
import { getMyReferral, type UserReferral } from "@/services/api/referral";
import Link from "next/link";

const FREE_FEATURES = [
  { text: "Unlimited practice mode", included: true },
  { text: "3 mock exams per day", included: true },
  { text: "Score tracking & progress", included: true },
  { text: "Weekly quiz", included: true },
  { text: "Dashboard & analytics", included: true },
  { text: "Flashcards", included: false },
  { text: "Unlimited mock exams", included: false },
  { text: "AI explanations (coming soon)", included: false },
  { text: "Advanced weak-topic analysis", included: false },
  { text: "Downloadable result card", included: false },
];

const PRO_FEATURES = [
  { text: "Everything in Free", included: true },
  { text: "Flashcards — all subjects", included: true },
  { text: "Unlimited mock exams", included: true },
  { text: "AI explanations (coming soon)", included: true },
  { text: "Advanced weak-topic analysis", included: true },
  { text: "Downloadable result card", included: true },
  { text: "Priority support", included: true },
  { text: "Access until after your JAMB exam", included: true },
];

const BANK_DETAILS = {
  bank: "Opay",
  accountNumber: "9012345678",
  accountName: "Prepwise",
};

export default function UpgradePage() {
  const { isPro, isLoading, isPartnerBulkPro, partnerName } = useUserPlan();
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [referral, setReferral] = useState<UserReferral | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
    void getMyReferral().then(setReferral);
  }, []);

  function copyAccount() {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openWhatsApp() {
    const referralLines = referral
      ? `\nLesson center: ${referral.partner_name}\nReferral code: ${referral.code}`
      : "";
    const message = encodeURIComponent(
      `Hi, I just paid for Prepwise Pro.\n\nMy account email: ${userEmail || "my email"}${referralLines}\n\nPlease activate my Pro access. Thank you!`,
    );
    window.open(`https://wa.me/2348164328697?text=${message}`, "_blank");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // ── PRO USER VIEW ─────────────────────────────────────────
  if (isPro) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Pro hero */}
        <div className="rounded-3xl bg-primary p-8 text-center text-white space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Crown className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">You are on Prepwise Pro</h1>
            <p className="mt-2 text-blue-100 text-sm">
              {isPartnerBulkPro && partnerName
                ? `Pro included through ${partnerName}. All features unlocked.`
                : "Full access until December 2026. All features unlocked."}
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 mx-auto">
            {isPartnerBulkPro
              ? "✓ Lesson center plan"
              : "✓ Active subscription"}
          </Badge>
        </div>

        {/* What you have */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Pro features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span className="text-slate-700">{f.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
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

        <p className="text-center text-xs text-slate-400">
          Questions? Message us on WhatsApp anytime.
        </p>
      </div>
    );
  }

  // ── FREE USER VIEW ────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center space-y-3">
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          <Sparkles className="mr-1 h-3 w-3" />
          Limited time — JAMB 2026 season
        </Badge>
        <h1 className="text-3xl font-bold text-navy">
          Upgrade to Prepwise Pro
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          One payment. Full access until after your JAMB exam. No monthly fees.
          No surprises.
        </p>
        {referral && (
          <div className="mx-auto max-w-md rounded-xl border border-blue-100 bg-softblue px-4 py-3 text-sm text-navy flex items-center justify-center gap-2">
            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>
              Referred via <strong>{referral.partner_name}</strong> (
              {referral.code})
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free card */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Free</CardTitle>
            <p className="text-4xl font-bold text-navy">₦0</p>
            <p className="text-sm text-slate-500">Forever free</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm">
                  {f.included ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 flex-shrink-0 text-slate-300" />
                  )}
                  <span
                    className={f.included ? "text-slate-700" : "text-slate-400"}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full" disabled>
              Current plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro card */}
        <Card className="border-primary bg-softblue shadow-soft relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-white">Most popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pro
            </CardTitle>
            <p className="text-4xl font-bold text-navy">₦2,000</p>
            <p className="text-sm text-slate-500">
              One-time · Valid until after JAMB 2026
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span className="text-slate-700">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                How to pay
              </p>
              <div className="rounded-xl border border-border bg-white p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bank</span>
                  <span className="font-semibold text-navy">
                    {BANK_DETAILS.bank}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Account name</span>
                  <span className="font-semibold text-navy">
                    {BANK_DETAILS.accountName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Account number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy text-base">
                      {BANK_DETAILS.accountNumber}
                    </span>
                    <button onClick={copyAccount}>
                      <Copy className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 text-right">Copied!</p>
                )}
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-sm font-semibold text-green-700">
                  Send exactly ₦2,000
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Use your email as the transfer description
                </p>
              </div>

              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={openWhatsApp}
              >
                <MessageCircle className="h-4 w-4" />I have paid — activate my
                Pro
              </Button>

              <p className="text-xs text-center text-slate-400">
                Activated within 30 minutes of your WhatsApp message
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-navy">Common questions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              q: "How long does activation take?",
              a: "Within 30 minutes of sending your WhatsApp message. Usually faster.",
            },
            {
              q: "What if my exam is coming soon?",
              a: "Send your payment now and message us immediately. We activate urgent requests within minutes.",
            },
            {
              q: "Can I get a refund?",
              a: "Yes — within 24 hours if you have not used Pro features. Message us on WhatsApp.",
            },
            {
              q: "When does Pro access expire?",
              a: "Your access lasts until after JAMB 2026 results are released. Plenty of time.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl border border-border bg-white p-4 space-y-1"
            >
              <p className="text-sm font-semibold text-navy">{q}</p>
              <p className="text-sm text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
