"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, X, Crown, Sparkles, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { appNav } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserPlan } from "@/hooks/use-user-plan";
import { createClient } from "@/services/supabase/client";
import { getCurrentStreak } from "@/services/api/streak";
import { UserMenu } from "./user-menu";
import { PointsCelebration } from "@/components/ui/points-celebration";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isPro, isLoading } = useUserPlan();
  const [initials, setInitials] = useState("PW");
  const [streak, setStreak] = useState<number | null>(null);
  const freeAccessPaths = [
    "/dashboard",
    "/practice",
    "/exam",
    "/results",
    "/upgrade",
    "/profile",
    "/settings",
    "/referrals",
  ];
  const isFreeFeatureLocked =
    !isLoading &&
    !isPro &&
    !freeAccessPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

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
      setStreak(await getCurrentStreak(supabase, user.id));
    }
    void loadUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PointsCelebration />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-white/90 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex-1 overflow-y-auto">
          <SidebarContent pathname={pathname} />
        </div>
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
                  src="/favicons/android-chrome-512x512.png"
                  alt="Prepcore logo"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <p className="text-lg font-extrabold text-navy">prepcore</p>
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
            <SidebarContent pathname={pathname} compact />
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
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/favicons/android-chrome-512x512.png"
                  alt="Prepcore logo"
                  width={48}
                  height={48}
                  className="rounded-full"
                  priority
                />
                <span className="font-semibold text-navy">prepcore</span>
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
                <Badge className="hidden shrink-0 gap-1 border-amber-200 bg-amber-50 px-2 text-amber-700 min-[390px]:inline-flex sm:px-2.5">
                  <Flame className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>{streak}</span>
                  <span className="hidden sm:inline">day streak</span>
                </Badge>
              )}

              {/* User Menu with Avatar */}
              <UserMenu initials={initials} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          {isFreeFeatureLocked ? (
            <Card className="mx-auto mt-12 max-w-xl text-center">
              <CardContent className="space-y-4 p-8">
                <Crown className="mx-auto h-10 w-10 text-amber" />
                <h1 className="text-2xl font-bold text-navy">Pro feature</h1>
                <p className="text-sm leading-6 text-slate-600">
                  Practice and mock exams are available on the free plan. Upgrade
                  to Pro to unlock every other study feature.
                </p>
                <Button asChild>
                  <Link href="/upgrade">
                    <Sparkles className="h-4 w-4" /> Upgrade to Pro
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  compact = false,
}: {
  pathname: string;
  compact?: boolean;
}) {
  return (
    <>
      {!compact && (
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <Image
            src="/favicons/android-chrome-512x512.png"
            alt="Prepcore logo"
            width={60}
            height={60}
            className="rounded-full"
          />
          <div>
            <p className="text-lg font-extrabold text-navy">prepcore</p>
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
                active && "bg-softblue text-primary shadow-sm",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
