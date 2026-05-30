import { NextResponse } from "next/server";
import { verifyAndActivatePayment } from "@/services/payments/payment-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const transactionId =
    url.searchParams.get("transaction_id") ?? url.searchParams.get("id");

  if (!transactionId) {
    return NextResponse.json(
      { success: false, error: "Missing transaction_id." },
      { status: 400 },
    );
  }

  try {
    const result = await verifyAndActivatePayment(transactionId);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("payments_verify_route_failed", error);
    return NextResponse.json(
      { success: false, error: "Could not verify payment." },
      { status: 500 },
    );
  }
}
