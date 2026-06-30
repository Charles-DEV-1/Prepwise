import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
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
    const ip = getClientIp(request);
    const ipLimit = rateLimit({
      key: `payments:create:ip:${ip}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLimit = rateLimit({
      key: `payments:create:user:${user.id}`,
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(userLimit.retryAfterSeconds) },
        },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      plan_key?: string;
    };
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

    return NextResponse.json({
      tx_ref: payment.txRef,
      checkout_url: payment.checkoutUrl,
      plan: payment.plan,
    });
  } catch (error) {
    console.error("payments_create_route_failed", error);
    return NextResponse.json(
      { error: "Unable to start payment. Please try again." },
      { status: 500 },
    );
  }
}
