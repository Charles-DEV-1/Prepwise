import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { UserReferralUrlCapture } from "@/components/referral/user-referral-url-capture";
import { AuthCard } from "@/features/auth/auth-card";

export default function LoginPage() {
  return (
    <Suspense>
      <ReferralUrlCapture />
      <UserReferralUrlCapture />
      <AuthCard mode="login" />
    </Suspense>
  );
}
