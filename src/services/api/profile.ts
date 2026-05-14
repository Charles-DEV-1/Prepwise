"use client";

import type { OnboardingValues } from "@/lib/validations";
import { createClient } from "@/services/supabase/client";

export async function completeOnboarding(values: OnboardingValues) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError ?? new Error("Missing authenticated user");

  const payload = {
    id: user.id,
    phone: user.phone,
    email: user.email,
    exam_type: values.examType,
    selected_subjects: values.subjects,
    target_score: values.targetScore,
    exam_date: values.examDate,
    onboarding_completed: true,
  };

  const { error } = await supabase.from("users").upsert([payload] as never[]);

  if (error) throw error;
}
