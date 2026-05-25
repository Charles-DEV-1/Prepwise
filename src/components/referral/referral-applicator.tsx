"use client";

import { useEffect, useRef } from "react";
import { applyReferralFromCookie } from "@/services/api/referral";

export function ReferralApplicator() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void applyReferralFromCookie();
  }, []);

  return null;
}
