"use client";

import type { OnboardingValues } from "@/lib/validations";
import { createClient } from "@/services/supabase/client";

export type ProfileData = {
  full_name: string | null;
  exam_type: string | null;
  exam_goals?: ("jamb" | "waec")[] | null;
  target_score: number | null;
  email: string | null;
};

export async function completeOnboarding(values: OnboardingValues) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
    throw userError ?? new Error("Missing authenticated user");

  const fullName = values.fullName.trim();
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (metadataError) throw metadataError;

  const payload = {
    id: user.id,
    full_name: fullName,
    phone: user.phone,
    email: user.email,
    exam_type: values.examType,
    exam_goals: values.examGoals,
    selected_subjects: values.subjects,
    target_score: values.targetScore,
    exam_date: values.examDate,
    onboarding_completed: true,
  };

  const { error } = await supabase.from("users").upsert([payload] as never);

  if (error) throw error;
}

export async function getProfileData(): Promise<ProfileData> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
    throw userError ?? new Error("Missing authenticated user");

  const { data: profileRow, error } = await supabase
    .from("users")
    .select("full_name, exam_type, exam_goals, target_score, email")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  const data = profileRow as ProfileData | null;

  return {
    full_name: data?.full_name || user.user_metadata?.full_name || "",
    exam_type: data?.exam_type || null,
    exam_goals: data?.exam_goals || null,
    target_score: data?.target_score || null,
    email: data?.email || user.email || null,
  };
}

export async function updateProfileData(profile: Partial<ProfileData>) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
    throw userError ?? new Error("Missing authenticated user");

  const { error } = await supabase
    .from("users")
    .update({
      full_name: profile.full_name,
      exam_type: profile.exam_type,
      target_score: profile.target_score,
    } as never)
    .eq("id", user.id);

  if (error) throw error;
}
