import { Suspense } from "react";
import { ReferralUrlCapture } from "@/components/referral/referral-url-capture";
import { AuthCard } from "@/features/auth/auth-card";

export default function LoginPage() {
  return (
    <Suspense>
      <ReferralUrlCapture />
      <AuthCard mode="login" />
    </Suspense>
  );
}
