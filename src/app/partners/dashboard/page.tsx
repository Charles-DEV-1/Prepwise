"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type Partner = {
  full_name: string;
  referral_code: string;
  status: string;
  commission_per_sale: number;
  total_earned: number;
  total_withdrawn: number;
  pending_balance: number;
  reserved_balance: number;
  minimum_withdrawal: number;
};
type Conversion = {
  id: string;
  user_name: string;
  user_email: string;
  signed_up_at: string;
  converted_to_pro: boolean;
  commission_amount: number;
};
type Data = {
  partner: Partner;
  conversions: Conversion[];
  withdrawals: unknown[];
};
type Bank = { code: string; name: string };
function normalizeBanks(banks: Bank[]) {
  const unique = new Map<string, Bank>();
  for (const bank of banks) {
    const code = String(bank.code).trim();
    if (code && !unique.has(code))
      unique.set(code, { code, name: String(bank.name).trim() });
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export default function PartnerDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch("/api/partners/dashboard");
    if (r.status === 401) {
      location.href = "/partners/login";
      return;
    }
    setData((await r.json()) as Data);
  }, []);
  useEffect(() => {
    void load();
    void fetch("/api/partners/banks")
      .then((r) => r.json())
      .then((j: { banks?: Bank[] }) => setBanks(normalizeBanks(j.banks ?? [])));
  }, [load]);
  if (!data)
    return (
      <main className="p-8 text-center text-slate-500">
        Loading partner dashboard…
      </main>
    );
  const p = data.partner,
    available = Number(p.pending_balance) - Number(p.reserved_balance),
    link = `${location.origin}/signup?ref=${p.referral_code}`;
  async function withdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const bank = banks.find((x) => String(x.code) === String(f.bank_code));
    const r = await fetch("/api/partners/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, bank_name: bank?.name ?? "" }),
    });
    const j = (await r.json()) as { account_name?: string; error?: string };
    setMessage(
      r.ok
        ? `Transfer submitted to ${j.account_name}. It will show as completed when Flutterwave confirms it.`
        : (j.error ?? "Withdrawal failed."),
    );
    setBusy(false);
    if (r.ok) void load();
  }
  async function logout() {
    await fetch("/api/partners/auth/logout", { method: "POST" });
    location.href = "/partners/login";
  }
  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-sm text-primary font-semibold">
              PREPCORE PARTNERS
            </p>
            <h1 className="text-2xl font-bold text-navy">
              Hello, {p.full_name}
            </h1>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </header>
        {p.status !== "active" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Your application is awaiting approval. Your referral code will work
            once your account is activated.
          </div>
        )}
        <section className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Available to withdraw"
            value={`₦${available.toLocaleString()}`}
          />
          <Stat
            label="Total earned"
            value={`₦${Number(p.total_earned).toLocaleString()}`}
          />
          <Stat
            label="Paid out"
            value={`₦${Number(p.total_withdrawn).toLocaleString()}`}
          />
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-navy">Your referral link</h2>
          <p className="mt-1 text-sm text-slate-500">
            Share this link. You earn ₦
            {Number(p.commission_per_sale).toLocaleString()} when a referred
            student pays for Pro.
          </p>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={link} />
            <Button
              onClick={() =>
                navigator.clipboard
                  .writeText(link)
                  .then(() => setMessage("Referral link copied."))
              }
            >
              Copy
            </Button>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy">Withdraw earnings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Minimum withdrawal: ₦
              {Number(p.minimum_withdrawal).toLocaleString()}
            </p>
            <form onSubmit={withdraw} className="mt-4 space-y-3">
              <Input
                required
                name="amount"
                type="number"
                min={p.minimum_withdrawal}
                max={available}
                placeholder="Amount (₦)"
                disabled={
                  p.status !== "active" || available < p.minimum_withdrawal
                }
              />
              <select
                required
                name="bank_code"
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                disabled={
                  p.status !== "active" || available < p.minimum_withdrawal
                }
              >
                <option value="">Select your bank</option>
                  {banks.map((b) => (
                    <option key={`${b.code}-${b.name}`} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Input
                required
                name="account_number"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit account number"
                disabled={
                  p.status !== "active" || available < p.minimum_withdrawal
                }
              />
              <Button
                disabled={
                  busy ||
                  p.status !== "active" ||
                  available < p.minimum_withdrawal
                }
                className="w-full"
              >
                {busy ? "Verifying and sending…" : "Withdraw automatically"}
              </Button>
            </form>
            {message && (
              <p className="mt-3 text-sm text-slate-600">{message}</p>
            )}
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy">Performance</h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm">
                Student signups{" "}
                <b className="float-right">{data.conversions.length}</b>
              </p>
              <p className="text-sm">
                Paid conversions{" "}
                <b className="float-right">
                  {data.conversions.filter((x) => x.converted_to_pro).length}
                </b>
              </p>
              <p className="text-sm">
                Conversion rate{" "}
                <b className="float-right">
                  {data.conversions.length
                    ? Math.round(
                        (data.conversions.filter((x) => x.converted_to_pro)
                          .length /
                          data.conversions.length) *
                          100,
                      )
                    : 0}
                  %
                </b>
              </p>
            </div>
          </section>
        </div>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-navy">Recent referrals</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="p-2">Student</th>
                  <th className="p-2">Signed up</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Earning</th>
                </tr>
              </thead>
              <tbody>
                {data.conversions.map((x) => (
                  <tr key={x.id} className="border-t">
                    <td className="p-2">{x.user_name || x.user_email}</td>
                    <td className="p-2">
                      {new Date(x.signed_up_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {x.converted_to_pro ? "Paid Pro" : "Signed up"}
                    </td>
                    <td className="p-2">
                      {x.converted_to_pro
                        ? `₦${Number(x.commission_amount).toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.conversions.length && (
              <p className="p-3 text-sm text-slate-500">No referrals yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}
