import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { verifyFlutterwaveWebhookSignature } from "@/services/payments/flutterwave";

// Configure this URL as a Flutterwave transfer webhook. It finalises a payout
// only after Flutterwave has reported the bank-transfer outcome.
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyFlutterwaveWebhookSignature(raw, request.headers)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let payload: { data?: { id?: string | number; status?: string; complete_message?: string } };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const transferId = String(payload.data?.id ?? "");
  if (!transferId) return NextResponse.json({ received: true });
  const admin = createServiceRoleClient();
  const { data: withdrawal } = await admin.from("partner_withdrawals").select("id").eq("flutterwave_transfer_id", transferId).maybeSingle();
  if (!withdrawal) return NextResponse.json({ received: true });
  const status = String(payload.data?.status ?? "").toLowerCase();
  if (status === "successful") await admin.rpc("complete_partner_withdrawal", { p_withdrawal_id: withdrawal.id, p_transfer_id: transferId, p_response: payload } as never);
  else if (["failed", "cancelled"].includes(status)) await admin.rpc("fail_partner_withdrawal", { p_withdrawal_id: withdrawal.id, p_reason: payload.data?.complete_message ?? "Flutterwave transfer failed", p_response: payload } as never);
  return NextResponse.json({ received: true });
}
