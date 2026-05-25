import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { AuthCard } from "@/features/auth/auth-card";

export default function SignupPage() {
  return (
    <Suspense>
      <ReferralUrlCapture />
      <AuthCard mode="signup" />
    </Suspense>
  );
}
