import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { UserReferralUrlCapture } from "@/components/referral/user-referral-url-capture";
import { AuthCard } from "@/features/auth/auth-card";

export default function SignupPage() {
  return (
    <Suspense>
      <ReferralUrlCapture />
      <UserReferralUrlCapture />
      <AuthCard mode="signup" />
    </Suspense>
  );
}
