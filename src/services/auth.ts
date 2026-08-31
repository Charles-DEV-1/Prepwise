"use client";

import { createClient } from "@/services/supabase/client";

export async function sendEmailSignInLink(email: string, shouldCreateUser: boolean) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      // Supabase returns here after the user opens the emailed verification link.
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function verifyEmailOtp(email: string, token: string) {
  const supabase = createClient();
  const result = await supabase.auth.verifyOtp({ email, token, type: "email" });

  // The profile row is created only after Supabase has accepted the code.
  // This keeps referral, onboarding, and payment foreign keys consistent for
  // both email-code and Google sign-ins.
  if (result.data.user) {
    await supabase.from("users").upsert(
      {
        id: result.data.user.id,
        email: result.data.user.email ?? email,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  }

  return result;
}

export async function signInWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
