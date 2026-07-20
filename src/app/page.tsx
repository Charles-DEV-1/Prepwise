import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { UserReferralUrlCapture } from "@/components/referral/user-referral-url-capture";
import { LandingPage } from "@/features/landing/landing-page";

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
