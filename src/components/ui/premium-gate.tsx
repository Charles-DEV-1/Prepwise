"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/hooks/use-user-plan";

type Props = {
  children: React.ReactNode;
  feature?: string;
};

export function PremiumGate({ children, feature = "this feature" }: Props) {
  const { isPro, isLoading } = useUserPlan();

  if (isLoading) return null;
  if (isPro) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-softblue">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-navy">Upgrade to Prepcore Pro</p>
          <p className="mt-1 text-sm text-slate-500">
            Unlock {feature} and all premium features
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/upgrade">
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </Button>
      </div>
    </div>
  );
}
