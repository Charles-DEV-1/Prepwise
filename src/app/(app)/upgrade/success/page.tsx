"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VerifyState =
  | { status: "checking" }
  | { status: "success"; txRef?: string }
  | { status: "failed"; message: string };

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>({ status: "checking" });

  useEffect(() => {
    const transactionId =
      searchParams.get("transaction_id") ?? searchParams.get("id");

    if (!transactionId) {
      setState({
        status: "failed",
        message: "Flutterwave did not return a transaction ID.",
      });
      return;
    }
    const verifiedTransactionId = transactionId;

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/payments/verify?transaction_id=${encodeURIComponent(verifiedTransactionId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as {
          success?: boolean;
          txRef?: string;
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error ?? "Payment verification failed.");
        }

        setState({ status: "success", txRef: data.txRef });
      } catch (error) {
        setState({
          status: "failed",
          message:
            error instanceof Error
              ? error.message
              : "Payment verification failed.",
        });
      }
    }

    void verifyPayment();
  }, [searchParams]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center">
      <Card className="w-full border-border bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          {state.status === "checking" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <h1 className="mt-4 text-2xl font-bold text-navy">
                Verifying your payment
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Please wait while Prepcore confirms your Flutterwave
                transaction.
              </p>
            </>
          )}

          {state.status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h1 className="mt-4 text-2xl font-bold text-navy">
                Pro is active
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Your payment was verified and your Prepcore Pro access has been
                enabled.
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </>
          )}

          {state.status === "failed" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h1 className="mt-4 text-2xl font-bold text-navy">
                Verification failed
              </h1>
              <p className="mt-2 text-sm text-slate-500">{state.message}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/upgrade">Try again</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
