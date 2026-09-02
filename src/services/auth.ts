"use client";

import { createClient } from "@/services/supabase/client";

export async function sendEmailSignInLink(email: string, shouldCreateUser: boolean, diagnosticToken?: string | null) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      // The confirmation link returns here to establish the session securely.
      emailRedirectTo: `${window.location.origin}/auth/callback${diagnosticToken ? `?diagnostic_token=${encodeURIComponent(diagnosticToken)}` : ""}`,
    },
  });
}

export async function checkSignupAvailability(email: string) {
  const response = await fetch("/api/auth/signup-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Unable to start signup. Please try again.");
}

export async function signInWithGoogle(diagnosticToken?: string | null) {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback${diagnosticToken ? `?diagnostic_token=${encodeURIComponent(diagnosticToken)}` : ""}` },
  });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
