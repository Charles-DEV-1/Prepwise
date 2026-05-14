"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subjects } from "@/constants/mock-data";
import { onboardingSchema, type OnboardingValues } from "@/lib/validations";
import { completeOnboarding } from "@/services/api/profile";

export function OnboardingForm() {
  const router = useRouter();
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { examType: "JAMB", subjects: ["English"], targetScore: 280, examDate: "2026-06-20" },
  });
  const mutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => router.push("/dashboard"),
  });

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-soft">
      <CardHeader>
        <CardTitle>Personalize your Prepwise plan</CardTitle>
        <CardDescription>Tell us what you are preparing for so the dashboard can recommend the right work.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["JAMB", "WAEC", "NECO"] as const).map((exam) => (
              <label key={exam} className="rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                <input type="radio" value={exam} className="sr-only" {...form.register("examType")} />
                <span className="font-semibold text-navy">{exam}</span>
              </label>
            ))}
          </div>
          <div>
            <Label>Subjects</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {subjects.map((subject) => (
                <label key={subject} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <input type="checkbox" value={subject} {...form.register("subjects")} />
                  {subject}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Target score</Label>
              <Input id="targetScore" type="number" {...form.register("targetScore")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam date</Label>
              <Input id="examDate" type="date" {...form.register("examDate")} />
            </div>
          </div>
          {form.formState.errors.subjects && <p className="text-sm text-destructive">{form.formState.errors.subjects.message}</p>}
          <Button size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Finish setup
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
