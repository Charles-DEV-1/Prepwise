"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, Loader2 } from "lucide-react";
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
import { subjects } from "@/constants/mock-data";
import { getReferralCookie } from "@/lib/referral";
import { onboardingSchema, type OnboardingValues } from "@/lib/validations";
import { completeOnboarding } from "@/services/api/profile";
import {
  applyReferralCode,
  applyReferralFromCookie,
  getMyReferral,
  referralErrorMessage,
  type UserReferral,
} from "@/services/api/referral";
import { applyUserReferralFromStorage } from "@/services/api/user-referral";
import type { ExamGoal, ExamType } from "@/types/app";

const examGoalOptions: Array<{
  label: string;
  description: string;
  goals: ExamGoal;
  primary: ExamType;
}> = [
  {
    label: "JAMB only",
    description: "Practice and mocks for JAMB subjects.",
    goals: ["jamb"],
    primary: "jamb",
  },
  {
    label: "WAEC only",
    description: "Practice and mocks for WAEC subjects.",
    goals: ["waec"],
    primary: "waec",
  },
  {
    label: "Both",
    description: "Prepare across JAMB and WAEC.",
    goals: ["jamb", "waec"],
    primary: "jamb",
  },
];

export function OnboardingForm() {
  const router = useRouter();
  const [existingReferral, setExistingReferral] = useState<UserReferral | null>(
    null,
  );
  const [referralError, setReferralError] = useState<string | null>(null);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      examType: "jamb",
      examGoals: ["jamb"],
      subjects: ["English"],
      targetScore: 280,
      examDate: "2026-06-20",
      referralCode: "",
    },
  });

  useEffect(() => {
    void (async () => {
      await applyReferralFromCookie();
      const referral = await getMyReferral();
      if (referral) {
        setExistingReferral(referral);
        return;
      }
      const cookieCode = getReferralCookie();
      if (cookieCode) form.setValue("referralCode", cookieCode);
    })();
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (values: OnboardingValues) => {
      setReferralError(null);
      if (!existingReferral && values.referralCode.trim()) {
        const result = await applyReferralCode(values.referralCode);
        if (!result.success) {
          throw new Error(referralErrorMessage(result.error));
        }
      }
      await completeOnboarding(values);
      await applyUserReferralFromStorage();
    },
    onSuccess: () => router.push("/dashboard"),
    onError: (err: Error) => setReferralError(err.message),
  });

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-soft">
      <CardHeader>
        <CardTitle>Personalize your Prepcore plan</CardTitle>
        <CardDescription>
          Tell us what you are preparing for so the dashboard can recommend the
          right work.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div>
            <Label>Which exam are you preparing for?</Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {examGoalOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`rounded-xl border p-4 text-left transition ${
                    JSON.stringify(form.watch("examGoals")) ===
                    JSON.stringify(option.goals)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-white hover:border-primary/50"
                  }`}
                  onClick={() => {
                    form.setValue("examGoals", option.goals, {
                      shouldValidate: true,
                    });
                    form.setValue("examType", option.primary, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <span className="font-semibold text-navy">
                    {option.label}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-slate-500">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
            {form.formState.errors.examGoals && (
              <p className="mt-2 text-sm text-destructive">
                {form.formState.errors.examGoals.message}
              </p>
            )}
            <input type="hidden" {...form.register("examType")} />
          </div>
          <div>
            <Label>Subjects</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {subjects.map((subject) => (
                <label
                  key={subject}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    value={subject}
                    {...form.register("subjects")}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Target score</Label>
              <Input
                id="targetScore"
                type="number"
                {...form.register("targetScore")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam date</Label>
              <Input id="examDate" type="date" {...form.register("examDate")} />
            </div>
          </div>

          {existingReferral ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  Referred by {existingReferral.partner_name}
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Code: {existingReferral.code}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="referralCode"
                className="flex items-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Lesson center code (optional)
              </Label>
              <Input
                id="referralCode"
                placeholder="e.g. LAGOS-JAMB"
                {...form.register("referralCode")}
              />
              <p className="text-xs text-slate-500">
                Enter the code from your lesson center if you have one.
              </p>
              {form.formState.errors.referralCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.referralCode.message}
                </p>
              )}
            </div>
          )}

          {form.formState.errors.subjects && (
            <p className="text-sm text-destructive">
              {form.formState.errors.subjects.message}
            </p>
          )}
          {referralError && (
            <p className="text-sm text-destructive">{referralError}</p>
          )}
          <Button size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Finish setup
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
