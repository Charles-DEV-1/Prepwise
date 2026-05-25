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
import { Chrome, Loader2, Smartphone } from "lucide-react";
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
  phoneAuthSchema,
  otpSchema,
  type PhoneAuthValues,
  type OtpValues,
} from "@/lib/validations";
import {
  signInWithGoogle,
  signInWithPhone,
  verifyPhoneOtp,
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
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const phoneForm = useForm<PhoneAuthValues>({
    resolver: zodResolver(phoneAuthSchema),
    defaultValues: { phone: "" },
  });
  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: "", token: "" },
  });

  async function requestOtp(values: PhoneAuthValues) {
    setIsLoading(true);
    const { error } = await signInWithPhone(values.phone);
    setIsLoading(false);
    if (!error) {
      setPhone(values.phone);
      otpForm.setValue("phone", values.phone);
      setOtpSent(true);
    }
  }

  async function submitOtp(values: OtpValues) {
    setIsLoading(true);
    const { error } = await verifyPhoneOtp(values.phone, values.token);
    setIsLoading(false);
    if (!error) {
      await applyReferralFromCookie();
      router.push(next);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-soft">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          Use phone OTP or Google to continue to Prepwise.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form
            className="space-y-4"
            onSubmit={phoneForm.handleSubmit(requestOtp)}
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                placeholder="+2348012345678"
                {...phoneForm.register("phone")}
              />
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              Send OTP
            </Button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={otpForm.handleSubmit(submitOtp)}
          >
            <div className="space-y-2">
              <Label htmlFor="token">OTP code sent to {phone}</Label>
              <Input
                id="token"
                inputMode="numeric"
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
          </form>
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
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New to Prepwise?" : "Already have an account?"}{" "}
          <Link className="font-medium text-primary" href={switchAuthHref}>
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
