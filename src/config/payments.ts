import { siteConfig } from "@/config/site";

export type PaymentPlanKey = "prepwise_pro_annual";

export type PaymentPlan = {
  key: PaymentPlanKey;
  name: string;
  description: string;
  amount: number;
  currency: "NGN";
  durationDays: number;
};

export const PAYMENT_PLANS: Record<PaymentPlanKey, PaymentPlan> = {
  prepwise_pro_annual: {
    key: "prepwise_pro_annual",
    name: "Prepwise Pro",
    description: "Full Prepwise Pro access for one year.",
    amount: 2000,
    currency: "NGN",
    durationDays: 365,
  },
};

export const DEFAULT_PAYMENT_PLAN_KEY: PaymentPlanKey = "prepwise_pro_annual";

export function getPaymentPlan(planKey = DEFAULT_PAYMENT_PLAN_KEY) {
  const plan = PAYMENT_PLANS[planKey as PaymentPlanKey];
  if (!plan) {
    throw new Error("Unsupported payment plan.");
  }
  return plan;
}

export function getPaymentRedirectUrl(txRef: string) {
  const url = new URL("/upgrade/success", siteConfig.url);
  url.searchParams.set("tx_ref", txRef);
  return url.toString();
}
