// Prepcore — User Referral System
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUserReferralFromSearchParams } from "@/lib/user-referral-storage";

export function UserReferralUrlCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUserReferralFromSearchParams(searchParams);
  }, [searchParams]);

  return null;
}
