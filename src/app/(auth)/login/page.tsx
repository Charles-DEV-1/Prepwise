import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthCard mode="login" />
    </Suspense>
  );
}
