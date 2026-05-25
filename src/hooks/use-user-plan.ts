"use client";

import { useEffect, useState } from "react";
import {
  getEffectivePlan,
  type EffectivePlan,
  type Plan,
  type PlanSource,
} from "@/services/api/plan";

export function useUserPlan() {
  const [state, setState] = useState<EffectivePlan & { loading: boolean }>({
    plan: "free",
    source: "free",
    loading: true,
  });

  useEffect(() => {
    void getEffectivePlan().then((result) => {
      setState({ ...result, loading: false });
    });
  }, []);

  const plan: Plan | "loading" = state.loading ? "loading" : state.plan;

  return {
    plan,
    source: state.source as PlanSource | "loading",
    partnerName: state.partnerName,
    isPro: plan === "pro",
    isFree: plan === "free",
    isLoading: state.loading,
    isPartnerBulkPro: state.source === "partner_bulk",
    isIndividualPro: state.source === "individual",
  };
}
