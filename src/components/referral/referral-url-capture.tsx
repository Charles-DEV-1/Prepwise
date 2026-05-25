"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureReferralFromSearchParams } from "@/lib/referral";

export function ReferralUrlCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureReferralFromSearchParams(searchParams);
  }, [searchParams]);

  return null;
}
