// Prepcore — User Referral System
import { z } from "zod";

export const referralClaimSchema = z.object({
  bankName: z.string().trim().min(2, "Enter your bank name"),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
  accountName: z.string().trim().min(2, "Enter the account name"),
});

export type ReferralClaimValues = z.infer<typeof referralClaimSchema>;
