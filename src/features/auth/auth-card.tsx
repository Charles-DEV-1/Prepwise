"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  appendRefToUrl,
  captureReferralFromSearchParams,
  getReferralCookie,
} from "@/lib/referral";
import { applyReferralFromCookie } from "@/services/api/referral";
import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  emailAuthSchema,
  emailOtpSchema,
  type EmailAuthValues,
  type EmailOtpValues,
} from "@/lib/validations";
import {
  signInWithGoogle,
  sendEmailOtp,
  verifyEmailOtp,
} from "@/services/auth";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next =
    searchParams.get("next") ??
    (mode === "signup" ? "/onboarding" : "/dashboard");
  const refParam = searchParams.get("ref") ?? getReferralCookie();
  const switchAuthHref =
    mode === "login"
      ? appendRefToUrl("/signup", refParam)
      : appendRefToUrl("/login", refParam);

  useEffect(() => {
    captureReferralFromSearchParams(searchParams);
  }, [searchParams]);

  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailForm = useForm<EmailAuthValues>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<EmailOtpValues>({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: { email: "", token: "" },
  });

  async function requestOtp(values: EmailAuthValues) {
    setError("");
    setIsLoading(true);
    const { error: requestError } = await sendEmailOtp(
      values.email,
      mode === "signup",
    );
    setIsLoading(false);
    if (!requestError) {
      setEmail(values.email);
      otpForm.setValue("email", values.email);
      setOtpSent(true);
    } else {
      setError(requestError.message);
    }
  }

  async function submitOtp(values: EmailOtpValues) {
    setError("");
    setIsLoading(true);
    const { data, error: verifyError } = await verifyEmailOtp(
      values.email,
      values.token,
    );
    setIsLoading(false);
    if (!verifyError && data.user) {
      await applyReferralFromCookie();
      router.push(next);
    } else {
      setError(verifyError?.message ?? "That code is invalid or has expired.");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-soft">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          Use an email verification code or Google to continue to Prepcore.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form
            className="space-y-4"
            onSubmit={emailForm.handleSubmit(requestOtp)}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send verification code
            </Button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={otpForm.handleSubmit(submitOtp)}
          >
            <div className="space-y-2">
              <Label htmlFor="token">Verification code sent to {email}</Label>
              <Input
                id="token"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                {...otpForm.register("token")}
              />
              {otpForm.formState.errors.token && (
                <p className="text-xs text-destructive">
                  {otpForm.formState.errors.token.message}
                </p>
              )}
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify and continue
            </Button>
            <button
              type="button"
              className="w-full text-sm font-medium text-primary"
              disabled={isLoading}
              onClick={() => void requestOtp({ email })}
            >
              Send a new code
            </button>
          </form>
        )}
        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => void signInWithGoogle()}
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>
        {mode === "login" && (
          <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
            Signed up with Google? Use <span className="font-medium">Continue with Google</span> to access your account.
          </p>
        )}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New to Prepcore?" : "Already have an account?"}{" "}
          <Link className="font-medium text-primary" href={switchAuthHref}>
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
