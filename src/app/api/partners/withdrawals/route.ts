import { getPartnerSession } from "@/lib/partner-auth";
import { createServiceRoleClient } from "@/services/supabase/admin";
import { createFlutterwaveTransfer, resolveFlutterwaveAccount } from "@/services/payments/flutterwave-transfers";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasTrustedOrigin, noStoreJson, readSafeJson } from "@/lib/api-security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
  const session = await getPartnerSession(); if (!session) return noStoreJson({error:"Unauthorized"},{status:401});
  const limit = rateLimit({ key: `partner:withdrawal:${session.partnerId}:${getClientIp(request)}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return noStoreJson({ error: "Too many withdrawal attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const body = await readSafeJson<Record<string, unknown>>(request); if (!body) return noStoreJson({ error: "Invalid request." }, { status: 400 }); const amount = Number(body.amount); const accountNumber = String(body.account_number ?? "").replace(/\s/g, ""); const bankCode = String(body.bank_code ?? ""); const bankName = String(body.bank_name ?? "").trim();
  if (!Number.isInteger(amount) || amount < 1 || !/^\d{10}$/.test(accountNumber) || !/^[A-Za-z0-9-]{2,20}$/.test(bankCode) || !bankName) return noStoreJson({error:"Enter a valid amount and Nigerian bank account."},{status:400});
  const admin = createServiceRoleClient();
  try {
    const resolved = await resolveFlutterwaveAccount(accountNumber, bankCode);
    const accountName = String((resolved.data as { account_name?: string } | undefined)?.account_name ?? "").trim();
    if (!accountName) return noStoreJson({error:"We could not verify that account."},{status:400});
    const { data: withdrawalId, error } = await admin.rpc("reserve_partner_withdrawal", { p_partner_id:session.partnerId,p_amount:amount,p_bank_name:bankName,p_account_number:accountNumber,p_account_name:accountName,p_bank_code:bankCode } as never);
    if (error || !withdrawalId) return noStoreJson({error:error?.message ?? "Withdrawal cannot be started."},{status:400});
    try {
      const transfer = await createFlutterwaveTransfer({amount, accountNumber, bankCode, accountName, withdrawalId: String(withdrawalId)});
      const transferId = String(transfer.data?.id ?? "");
      const transferStatus = transfer.data?.status ?? "processing";
      if (transferStatus.toLowerCase() === "successful") {
        await admin.rpc("complete_partner_withdrawal", { p_withdrawal_id: String(withdrawalId), p_transfer_id: transferId, p_response: transfer } as never);
      } else {
        await admin.from("partner_withdrawals").update({ flutterwave_transfer_id: transferId, flutterwave_reference: transfer.data?.reference ?? null, flutterwave_status: transferStatus, flutterwave_response: transfer } as never).eq("id", withdrawalId);
      }
      return noStoreJson({success:true, status:transfer.data?.status ?? "processing", account_name:accountName});
    } catch (transferError) {
      await admin.rpc("fail_partner_withdrawal", {p_withdrawal_id:withdrawalId,p_reason:transferError instanceof Error ? transferError.message : "Transfer could not be started"} as never);
      return noStoreJson({error:"The transfer could not be started; your balance was not charged."},{status:502});
    }
  } catch { return noStoreJson({error:"Could not start withdrawal."},{status:502}); }
}
