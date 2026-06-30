import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  markWebhookEventProcessed,
  rememberWebhookEvent,
  verifyAndActivatePayment,
} from "@/services/payments/payment-service";
import { verifyFlutterwaveWebhookSignature } from "@/services/payments/flutterwave";

export const runtime = "nodejs";

type FlutterwaveWebhookPayload = {
  id?: string | number;
  event?: string;
  event_id?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    status?: string;
  };
};

function getEventKey(rawBody: string, payload: FlutterwaveWebhookPayload) {
  return (
    payload.event_id ??
    (payload.id ? String(payload.id) : undefined) ??
    (payload.data?.id ? `transaction:${payload.data.id}` : undefined) ??
    crypto.createHash("sha256").update(rawBody).digest("hex")
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipLimit = rateLimit({
    key: `payments:webhook:ip:${ip}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many webhook attempts." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      },
    );
  }

  const rawBody = await request.text();

  if (!verifyFlutterwaveWebhookSignature(rawBody, request.headers)) {
    console.warn("payments_webhook_invalid_signature");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: FlutterwaveWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as FlutterwaveWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventKey = getEventKey(rawBody, payload);
  const transactionId = payload.data?.id;
  const txRef = payload.data?.tx_ref;

  const isNewEvent = await rememberWebhookEvent(
    eventKey,
    payload,
    txRef,
    transactionId,
  );

  if (!isNewEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!transactionId) {
    console.warn("payments_webhook_missing_transaction_id", {
      eventKey,
      txRef,
    });
    return NextResponse.json({ received: true });
  }

  const result = await verifyAndActivatePayment(String(transactionId));
  if (result.success) {
    await markWebhookEventProcessed(eventKey);
  }

  return NextResponse.json({ received: true, verified: result.success });
}
