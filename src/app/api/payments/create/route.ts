import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";
import { createClient } from "@/services/supabase/server";
import { createPayment } from "@/services/payments/payment-service";
import {
  DEFAULT_PAYMENT_PLAN_KEY,
  PAYMENT_PLANS,
  type PaymentPlanKey,
} from "@/config/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!hasTrustedOrigin(request)) {
      return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
    }
    const ip = getClientIp(request);
    const ipLimit = rateLimit({
      key: `payments:create:ip:${ip}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });

    if (!ipLimit.allowed) {
      return noStoreJson(
        { error: "Too many payment attempts. Please wait and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return noStoreJson({ error: "Unauthorized" }, { status: 401 });
    }

    const userLimit = rateLimit({
      key: `payments:create:user:${user.id}`,
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!userLimit.allowed) {
      return noStoreJson(
        { error: "Too many payment attempts. Please wait and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(userLimit.retryAfterSeconds) },
        },
      );
    }

    const body = (await readSafeJson<{
      plan_key?: string;
    }>(request)) ?? {};
    const planKey =
      body.plan_key && body.plan_key in PAYMENT_PLANS
        ? (body.plan_key as PaymentPlanKey)
        : DEFAULT_PAYMENT_PLAN_KEY;

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    const payment = await createPayment({
      userId: user.id,
      email: user.email,
      name:
        profile?.full_name ??
        (user.user_metadata?.full_name as string | undefined),
      phone: profile?.phone ?? undefined,
      planKey,
    });

    return noStoreJson({
      tx_ref: payment.txRef,
      checkout_url: payment.checkoutUrl,
      plan: payment.plan,
    });
  } catch (error) {
    console.error("payments_create_route_failed", error);
    return noStoreJson(
      { error: "Unable to start payment. Please try again." },
      { status: 500 },
    );
  }
}
