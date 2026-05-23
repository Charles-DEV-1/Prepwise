"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";

type Plan = "free" | "pro" | "loading";

export function useUserPlan() {
  const [plan, setPlan] = useState<Plan>("loading");

  useEffect(() => {
    async function fetchPlan() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPlan("free");
          return;
        }

        const { data, error } = await supabase
          .from("subscriptions")
          .select("plan, status, current_period_end")
          .eq("user_id", user.id)
          .maybeSingle();
        console.log("USER:", user?.id);
        console.log("SUB DATA:", data);
        console.log("SUB ERROR:", error);

        if (error) {
          console.error("Subscription fetch error:", error.message);
          setPlan("free");
          return;
        }

        if (!data) {
          setPlan("free");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = data as any;

        const isPro =
          sub.plan === "pro" &&
          sub.status === "active" &&
          (!sub.current_period_end ||
            new Date(sub.current_period_end) > new Date());

        setPlan(isPro ? "pro" : "free");
      } catch (err) {
        console.error("useUserPlan error:", err);
        setPlan("free");
      }
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
