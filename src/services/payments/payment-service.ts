import crypto from "node:crypto";
import { siteConfig } from "@/config/site";
import {
  getPaymentPlan,
  getPaymentRedirectUrl,
  type PaymentPlanKey,
} from "@/config/payments";
import { createServiceRoleClient } from "@/services/supabase/admin";
import {
  createFlutterwaveCheckout,
  createTxRef,
  verifyFlutterwaveTransaction,
  type FlutterwaveVerificationResponse,
} from "@/services/payments/flutterwave";

type CreatePaymentInput = {
  userId: string;
  email: string;
  name?: string;
  phone?: string;
  planKey?: PaymentPlanKey;
};

type VerificationResult = {
  success: boolean;
  txRef?: string;
  alreadyProcessed?: boolean;
  error?: string;
};

function createIdempotencyKey(userId: string, txRef: string) {
  return crypto.createHash("sha256").update(`${userId}:${txRef}`).digest("hex");
}

function isVerifiedSuccessfulPayment(
  verification: FlutterwaveVerificationResponse,
  expected: { txRef: string; amount: number; currency: string },
) {
  const data = verification.data;
  if (verification.status !== "success" || !data) return false;
  return (
    data.status === "successful" &&
    data.tx_ref === expected.txRef &&
    Number(data.amount) === expected.amount &&
    data.currency === expected.currency
  );
}

export async function createPayment(input: CreatePaymentInput) {
  const plan = getPaymentPlan(input.planKey);
  const txRef = createTxRef(input.userId);
  const idempotencyKey = createIdempotencyKey(input.userId, txRef);
  const supabase = createServiceRoleClient();

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: input.userId,
    tx_ref: txRef,
    plan_key: plan.key,
    amount: plan.amount,
    currency: plan.currency,
    customer_email: input.email,
    metadata: {
      plan_name: plan.name,
      duration_days: plan.durationDays,
    },
    idempotency_key: idempotencyKey,
  } as never);

  if (insertError) {
    console.error("payment_create_insert_failed", insertError);
    throw new Error("Could not create payment record.");
  }

  const checkout = await createFlutterwaveCheckout({
    txRef,
    amount: plan.amount,
    currency: plan.currency,
    redirectUrl: getPaymentRedirectUrl(txRef),
    customer: {
      email: input.email,
      name: input.name,
      phonenumber: input.phone,
    },
    customizations: {
      title: siteConfig.name,
      description: plan.description,
      logo: `${siteConfig.url}/brand/prepwise-logo-blue.png`,
    },
    meta: {
      user_id: input.userId,
      plan_key: plan.key,
      idempotency_key: idempotencyKey,
    },
  });

  const checkoutUrl = checkout.data?.link;
  if (checkout.status !== "success" || !checkoutUrl) {
    await supabase
      .from("payments")
      .update({
        status: "failed",
        failure_reason: checkout.message || "Flutterwave checkout failed.",
        provider_response: checkout,
      } as never)
      .eq("tx_ref", txRef);
    throw new Error("Could not start Flutterwave checkout.");
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ checkout_url: checkoutUrl, provider_response: checkout } as never)
    .eq("tx_ref", txRef);

  if (updateError) {
    console.error("payment_checkout_update_failed", updateError);
  }

  return { txRef, checkoutUrl, plan };
}

export async function verifyAndActivatePayment(
  transactionId: string,
): Promise<VerificationResult> {
  const supabase = createServiceRoleClient();
  const verification = await verifyFlutterwaveTransaction(transactionId);
  const data = verification.data;

  if (!data?.tx_ref) {
    console.warn("payment_verify_missing_tx_ref", { transactionId });
    return { success: false, error: "missing_tx_ref" };
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("tx_ref, amount, currency, status, processed_at")
    .eq("tx_ref", data.tx_ref)
    .maybeSingle();

  if (paymentError || !payment) {
    console.warn("payment_verify_unknown_tx_ref", {
      transactionId,
      txRef: data.tx_ref,
      paymentError,
    });
    return { success: false, txRef: data.tx_ref, error: "payment_not_found" };
  }

  if (
    !isVerifiedSuccessfulPayment(verification, {
      txRef: payment.tx_ref,
      amount: Number(payment.amount),
      currency: payment.currency,
    })
  ) {
    await supabase
      .from("payments")
      .update({
        status: data.status === "cancelled" ? "cancelled" : "failed",
        failure_reason: verification.message || "Verification failed.",
        flutterwave_transaction_id: data.id,
        provider_response: verification,
        verification_attempts: 1,
        verified_at: new Date().toISOString(),
      } as never)
      .eq("tx_ref", data.tx_ref);

    return { success: false, txRef: data.tx_ref, error: "verification_failed" };
  }

  const { data: processResult, error: processError } = await supabase.rpc(
    "process_successful_payment",
    {
      p_tx_ref: data.tx_ref,
      p_flutterwave_transaction_id: data.id,
      p_provider_response: verification,
      p_verified_at: new Date().toISOString(),
    } as never,
  );

  if (processError) {
    console.error("payment_process_failed", processError);
    return { success: false, txRef: data.tx_ref, error: "processing_failed" };
  }

  const result = processResult as {
    success?: boolean;
    already_processed?: boolean;
    error?: string;
  } | null;

  return {
    success: result?.success === true,
    txRef: data.tx_ref,
    alreadyProcessed: result?.already_processed === true,
    error: result?.error,
  };
}

export async function rememberWebhookEvent(
  eventKey: string,
  payload: unknown,
  txRef?: string,
  transactionId?: number,
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("payment_webhook_events").insert({
    event_key: eventKey,
    tx_ref: txRef,
    flutterwave_transaction_id: transactionId,
    payload,
  } as never);

  if (error?.code === "23505") return false;
  if (error) {
    console.error("payment_webhook_event_insert_failed", error);
  }
  return true;
}

export async function markWebhookEventProcessed(eventKey: string) {
  const supabase = createServiceRoleClient();
  await supabase
    .from("payment_webhook_events")
    .update({ processed_at: new Date().toISOString() } as never)
    .eq("event_key", eventKey);
}
