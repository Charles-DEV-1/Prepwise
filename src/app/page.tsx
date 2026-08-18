import { Suspense } from "react";
import type { Metadata } from "next";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { UserReferralUrlCapture } from "@/components/referral/user-referral-url-capture";
import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: "JAMB, WAEC & NECO CBT Practice",
  description:
    "Prepare for JAMB, WAEC, and NECO with past questions, timed CBT mock exams, AI explanations, and progress tracking.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <ReferralUrlCapture />
        <UserReferralUrlCapture />
      </Suspense>
      <LandingPage />
    </>
  );
}
