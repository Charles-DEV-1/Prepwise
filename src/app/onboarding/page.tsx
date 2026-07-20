import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { UserReferralUrlCapture } from "@/components/referral/user-referral-url-capture";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-muted px-4 py-10">
      <Suspense fallback={null}>
        <ReferralUrlCapture />
        <UserReferralUrlCapture />
      </Suspense>
      <OnboardingForm />
    </main>
  );
}
