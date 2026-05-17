"use client";

import { createClient } from "@/services/supabase/client";

export async function signInWithPhone(phone: string) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = createClient();
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
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
