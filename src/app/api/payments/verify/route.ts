import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/services/supabase/server";
import { verifyAndActivatePayment } from "@/services/payments/payment-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const transactionId =
    url.searchParams.get("transaction_id") ?? url.searchParams.get("id");
  const txRef = url.searchParams.get("tx_ref");

  if (!transactionId) {
    return NextResponse.json(
      { success: false, error: "Missing transaction_id." },
      { status: 400 },
    );
  }

  if (!txRef) {
    return NextResponse.json(
      { success: false, error: "Missing tx_ref." },
      { status: 400 },
    );
  }

  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit({
      key: `payments:verify:ip:${ip}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts." },
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

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userLimit = rateLimit({
      key: `payments:verify:user:${user.id}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!userLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts." },
        {
          status: 429,
          headers: { "Retry-After": String(userLimit.retryAfterSeconds) },
        },
      );
    }

    const result = await verifyAndActivatePayment(transactionId, {
      userId: user.id,
      txRef,
    });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("payments_verify_route_failed", error);
    return NextResponse.json(
      { success: false, error: "Could not verify payment." },
      { status: 500 },
    );
  }
}
