"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";

type Plan = "free" | "pro" | "loading";

export function useUserPlan() {
  const [plan, setPlan] = useState<Plan>("loading");

  useEffect(() => {
    const supabase = createClient();

    async function fetchPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPlan("free");
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (
        data &&
        (
          data as {
            plan: string;
            status: string;
            current_period_end: string | null;
          }
        ).plan === "pro" &&
        (
          data as {
            plan: string;
            status: string;
            current_period_end: string | null;
          }
        ).status === "active"
      ) {
        const end = (data as { current_period_end: string | null })
          .current_period_end;
        if (!end || new Date(end) > new Date()) {
          setPlan("pro");
          return;
        }
      }
      setPlan("free");
    }

    void fetchPlan();
  }, []);

  return {
    plan,
    isPro: plan === "pro",
    isFree: plan === "free",
    isLoading: plan === "loading",
  };
}
