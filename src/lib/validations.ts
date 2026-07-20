import { z } from "zod";

export const emailAuthSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const emailOtpSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const onboardingSchema = z.object({
  examType: z.enum(["jamb", "waec"]),
  examGoals: z
    .array(z.enum(["jamb", "waec"]))
    .min(1, "Choose at least one exam"),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  targetScore: z.coerce.number().min(1).max(400),
  examDate: z.string().min(1, "Choose your exam date"),
  referralCode: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^[A-Za-z0-9-]+$/.test(v),
      "Use letters, numbers, and hyphens only",
    ),
});

export type EmailAuthValues = z.infer<typeof emailAuthSchema>;
export type EmailOtpValues = z.infer<typeof emailOtpSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
