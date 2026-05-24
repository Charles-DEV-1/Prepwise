"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X, Crown, Sparkles, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { appNav } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUserPlan } from "@/hooks/use-user-plan";
import { createClient } from "@/services/supabase/client";
import { UserMenu } from "./user-menu";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isPro, isLoading } = useUserPlan();
  const [initials, setInitials] = useState("PW");
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Get real user initials and streak
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Initials from name or email
      const name = user.user_metadata?.full_name as string | undefined;
      if (name) {
        const parts = name.trim().split(" ");
        const i =
          parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`
            : parts[0].slice(0, 2);
        setInitials(i.toUpperCase());
      } else if (user.email) {
        setInitials(user.email.slice(0, 2).toUpperCase());
      }

      // Real streak
      const { data: streakData } = await supabase
        .from("streaks")
        .select("current_count")
        .eq("user_id", user.id)
        .maybeSingle();

      if (streakData)
        setStreak((streakData as { current_count: number }).current_count);
    }
    void loadUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-white/90 px-4 py-5 backdrop-blur-xl lg:block">
        <SidebarContent
          pathname={pathname}
          isPro={isPro}
          isLoading={isLoading}
        />
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm lg:hidden"
          aria-modal="true"
          role="dialog"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="flex h-full w-[min(19rem,86vw)] animate-in slide-in-from-left duration-300 flex-col border-r border-border bg-white px-4 py-5 shadow-2xl"
            aria-label="Mobile navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3 px-2">
                <Image
                  src="/brand/prepwise-logo-blue.png"
                  alt="Prepwise logo"
                  width={42}
                  height={42}
                  className="rounded-xl"
                />
                <div>
                  <p className="text-lg font-extrabold text-navy">prepwise</p>
                  <p className="text-xs font-medium text-slate-500">
                    Smart prep. Higher scores.
                  </p>
                </div>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-softblue hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              compact
              isPro={isPro}
              isLoading={isLoading}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-white/88 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-softblue hover:text-primary"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/dashboard" className="font-semibold text-navy">
                prepwise
              </Link>
            </div>

            <div className="hidden h-10 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm md:flex">
              <Search className="h-4 w-4" />
              Search subjects, topics, sessions
            </div>

            <div className="flex items-center gap-2">
              {/* Plan badge in header */}
              {!isLoading &&
                (isPro ? (
                  <Badge className="border-yellow-300 bg-yellow-50 text-yellow-700 gap-1">
                    <Crown className="h-3 w-3" />
                    Pro
                  </Badge>
                ) : (
                  <Link href="/upgrade">
                    <Badge className="border-primary/20 bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition gap-1">
                      <Sparkles className="h-3 w-3" />
                      Upgrade
                    </Badge>
                  </Link>
                ))}

              {/* Real streak */}
              {streak !== null && streak > 0 && (
                <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                  🔥 {streak} day streak
                </Badge>
              )}

              {/* User Menu with Avatar */}
              <UserMenu initials={initials} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  compact = false,
  isPro,
  isLoading,
}: {
  pathname: string;
  compact?: boolean;
  isPro: boolean;
  isLoading: boolean;
}) {
  return (
    <>
      {!compact && (
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <Image
            src="/brand/prepwise-logo-blue.png"
            alt="Prepwise logo"
            width={42}
            height={42}
            className="rounded-xl"
          />
          <div>
            <p className="text-lg font-extrabold text-navy">prepwise</p>
            <p className="text-xs font-medium text-slate-500">
              Smart prep. Higher scores.
            </p>
          </div>
        </Link>
      )}

      <nav className={cn("space-y-1", compact ? "mt-0" : "mt-8")}>
        {appNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-softblue hover:text-primary",
                active &&
                  "bg-softblue text-primary shadow-sm hover:bg-softblue hover:text-primary",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Plan card at bottom of sidebar */}
      {!isLoading && (
        <div
          className={cn(
            "rounded-2xl border p-4 text-navy shadow-soft",
            isPro
              ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50"
              : "border-blue-100 bg-gradient-to-br from-white to-softblue",
            compact ? "mt-auto mb-4" : "absolute bottom-20 left-4 right-4",
          )}
        >
          {isPro ? (
            <>
              <Badge className="border-yellow-300 bg-yellow-100 text-yellow-700 gap-1">
                <Crown className="h-3 w-3" />
                Prepwise Pro
              </Badge>
              <p className="mt-3 text-sm font-semibold text-navy">
                You have full access
              </p>
              <p className="mt-1 text-xs text-slate-500">
                All features unlocked until Dec 2026
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-4 w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <Link href="/upgrade">View plan details</Link>
              </Button>
            </>
          ) : (
            <>
              <Badge className="border-blue-200 bg-white text-primary">
                Free plan
              </Badge>
              <p className="mt-3 text-sm font-semibold">
                Unlock flashcards, unlimited exams & AI
              </p>
              <p className="mt-1 text-xs text-slate-500">
                One-time payment · ₦2,000 only
              </p>
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href="/upgrade">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Upgrade to Pro
                </Link>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Logout button */}
      {compact && (
        <div className="mt-6 border-t border-border pt-4">
          <LogoutButton />
        </div>
      )}

      {!compact && (
        <div className="absolute bottom-5 left-4 right-4">
          <LogoutButton />
        </div>
      )}
    </>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      const { signOut } = await import("@/services/auth");
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
