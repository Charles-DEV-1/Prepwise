import { z } from "zod";

export const phoneAuthSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
});

export const otpSchema = z.object({
  phone: z.string().min(10),
  token: z.string().min(6, "Enter the 6-digit code"),
});

export const onboardingSchema = z.object({
  examType: z.enum(["JAMB", "WAEC", "NECO"]),
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

export type PhoneAuthValues = z.infer<typeof phoneAuthSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
