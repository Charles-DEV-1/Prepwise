"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { appNav } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-white/90 px-4 py-5 backdrop-blur-xl lg:block">
        <SidebarContent pathname={pathname} />
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
              <Link href="/dashboard" className="font-semibold text-navy">
                prepwise
              </Link>
            </div>
            <div className="hidden h-10 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm md:flex">
              <Search className="h-4 w-4" />
              Search subjects, topics, sessions
            </div>
            <div className="flex items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                12 day streak
              </Badge>
              <div className="h-9 w-9 rounded-full bg-softblue text-center text-sm font-semibold leading-9 text-primary">
                PO
              </div>
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
}: {
  pathname: string;
  compact?: boolean;
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

      <div
        className={cn(
          "rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-softblue p-4 text-navy shadow-soft",
          compact ? "mt-auto" : "absolute bottom-5 left-4 right-4",
        )}
      >
        <Badge className="border-blue-200 bg-white text-primary">AI plan</Badge>
        <p className="mt-3 text-sm font-semibold">
          Unlock study plans and deeper weak-topic analysis.
        </p>
        <Button asChild size="sm" className="mt-4 w-full">
          <Link href="/upgrade">Upgrade</Link>
        </Button>
      </div>
    </>
  );
}
