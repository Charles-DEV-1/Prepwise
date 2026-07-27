import crypto from "node:crypto";
import { siteConfig } from "@/config/site";

const BASE = "https://api.flutterwave.com/v3";
function key() { const value = process.env.FLUTTERWAVE_SECRET_KEY; if (!value) throw new Error("Missing FLUTTERWAVE_SECRET_KEY."); return value; }
async function request(path: string, init: RequestInit) {
  const response = await fetch(`${BASE}${path}`, { ...init, headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json", ...init.headers }, cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.status === "error") {
    throw new Error(
      body.message ?? `Flutterwave request failed with HTTP ${response.status}.`,
    );
  }
  return body as { status: string; message?: string; data?: { id?: number|string; status?: string; reference?: string } };
}
export async function listFlutterwaveBanks() { return request("/banks/NG", { method: "GET" }); }
export async function resolveFlutterwaveAccount(accountNumber: string, bankCode: string) {
  return request("/accounts/resolve", { method: "POST", body: JSON.stringify({ account_number: accountNumber, account_bank: bankCode }) });
}
export async function createFlutterwaveTransfer(input: { amount: number; accountNumber: string; bankCode: string; accountName: string; withdrawalId: string }) {
  const reference = `prepcore_partner_${input.withdrawalId}_${crypto.randomBytes(5).toString("hex")}`;
  return request("/transfers", {
    method: "POST",
    body: JSON.stringify({
      account_bank: input.bankCode,
      account_number: input.accountNumber,
      amount: input.amount,
      currency: "NGN",
      narration: "Prepcore partner commission",
      beneficiary_name: input.accountName,
      reference,
      // This takes precedence over the account-wide webhook URL, so transfer
      // events cannot accidentally be handled as student payment events.
      callback_url: `${siteConfig.url}/api/partners/transfers/webhook`,
    }),
  });
}
