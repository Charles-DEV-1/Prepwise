"use client";

import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { UserReferralUrlCapture } from "@/components/referral/user-referral-url-capture";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { motion, useReducedMotion } from "framer-motion";

export default function OnboardingPage() {
  const reducedMotion = useReducedMotion();
  return (
    <main className="min-h-screen bg-muted px-4 py-10">
      <Suspense fallback={null}>
        <ReferralUrlCapture />
        <UserReferralUrlCapture />
      </Suspense>
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <motion.div aria-hidden className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary text-3xl shadow-[0_18px_45px_rgba(37,99,235,.26)]" animate={reducedMotion ? {} : { y: [0, -5, 0], rotate: [0, 2, 0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>✦</motion.div>
        <motion.h1 initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }} className="mt-5 text-3xl font-bold text-navy">Let&apos;s make your study plan yours.</motion.h1>
        <motion.p initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="mt-2 text-sm text-slate-600">A few details help Prepcore focus every session.</motion.p>
      </div>
      <OnboardingForm />
    </main>
  );
}
