"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  appendRefToUrl,
  captureReferralFromSearchParams,
  getReferralCookie,
} from "@/lib/referral";
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
import { emailAuthSchema, type EmailAuthValues } from "@/lib/validations";
import { checkSignupAvailability, signInWithGoogle, sendEmailSignInLink } from "@/services/auth";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") ?? getReferralCookie();
  const switchAuthHref =
    mode === "login"
      ? appendRefToUrl("/signup", refParam)
      : appendRefToUrl("/login", refParam);

  useEffect(() => {
    captureReferralFromSearchParams(searchParams);
  }, [searchParams]);

  const [linkSent, setLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const emailForm = useForm<EmailAuthValues>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  async function requestSignInLink(values: EmailAuthValues) {
    setError("");
    setIsLoading(true);
    const normalizedEmail = values.email.trim().toLowerCase();
    try {
      if (mode === "signup") await checkSignupAvailability(normalizedEmail);
    } catch (requestError) {
      setIsLoading(false);
      setError(requestError instanceof Error ? requestError.message : "Unable to start signup. Please try again.");
      return;
    }
    const { error: requestError } = await sendEmailSignInLink(
      normalizedEmail,
      mode === "signup",
    );
    setIsLoading(false);
    if (!requestError) {
      setEmail(normalizedEmail);
      setLinkSent(true);
      setResendSeconds(30);
    } else {
      setError(
        requestError.message.includes("rate limit")
          ? "Please wait before requesting another verification email."
          : requestError.message,
      );
    }
  }

  return (
    <Card className="w-full max-w-md shadow-soft">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          Continue with a secure email link or Google.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!linkSent ? (
          <form
            className="space-y-4"
            onSubmit={emailForm.handleSubmit(requestSignInLink)}
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
              Send verification link
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              <p className="font-medium">Check your email</p>
              <p className="mt-1 text-muted-foreground">
                We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Open it in this browser to continue.
              </p>
            </div>
            <button
              type="button"
              className="w-full text-sm font-medium text-primary"
              disabled={isLoading || resendSeconds > 0}
              onClick={() => void requestSignInLink({ email })}
            >
              {resendSeconds > 0
                ? `Send another link in ${resendSeconds}s`
                : "Send another link"}
            </button>
            <button type="button" className="w-full text-sm text-muted-foreground" disabled={isLoading} onClick={() => { setLinkSent(false); setError(""); }}>
              Use a different email address
            </button>
          </div>
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
