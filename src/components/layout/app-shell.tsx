"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { appNav } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-white/90 px-4 py-5 backdrop-blur-xl lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <Image src="/brand/prepwise-logo-blue.png" alt="Prepwise logo" width={42} height={42} className="rounded-xl" />
          <div>
            <p className="text-lg font-extrabold text-navy">prepwise</p>
            <p className="text-xs font-medium text-slate-500">Smart prep. Higher scores.</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {appNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-softblue hover:text-primary",
                  active && "bg-softblue text-primary shadow-sm hover:bg-softblue hover:text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-softblue p-4 text-navy shadow-soft">
          <Badge className="border-blue-200 bg-white text-primary">AI plan</Badge>
          <p className="mt-3 text-sm font-semibold">Unlock study plans and deeper weak-topic analysis.</p>
          <Button asChild size="sm" className="mt-4 w-full">
            <Link href="/upgrade">Upgrade</Link>
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-white/88 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/dashboard" className="font-semibold text-navy">
                prepwise
              </Link>
            </div>
            <div className="hidden h-10 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm md:flex">
              <Search className="h-4 w-4" />
              Search subjects, topics, sessions
            </div>
            <div className="flex items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">12 day streak</Badge>
              <div className="h-9 w-9 rounded-full bg-softblue text-center text-sm font-semibold leading-9 text-primary">PO</div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
