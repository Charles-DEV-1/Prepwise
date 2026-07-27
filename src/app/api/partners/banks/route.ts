import { NextResponse } from "next/server";
import { getPartnerSession } from "@/lib/partner-auth";
import { listFlutterwaveBanks } from "@/services/payments/flutterwave-transfers";
export async function GET() {
  if (!(await getPartnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await listFlutterwaveBanks();
    return NextResponse.json({ banks: result.data ?? [] });
  } catch (error) {
    console.error("partner_banks_flutterwave_failed", error);
    return NextResponse.json(
      { error: "Could not load banks. Check the local server terminal for the Flutterwave error." },
      { status: 502 },
    );
  }
}
