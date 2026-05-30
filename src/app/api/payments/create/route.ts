import { NextResponse } from "next/server";
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
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
