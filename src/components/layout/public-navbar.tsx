import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { publicNav } from "@/config/routes";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/88 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/favicons/android-chrome-512x512.png"
            alt="Prepcore logo"
            width={52}
            height={52}
            className="rounded-full"
            priority
          />
          <span className="text-xl font-extrabold tracking-normal text-navy">
            prepcore
          </span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/partners/register"
            className="border-b-2 border-dotted border-primary pb-0.5 text-sm font-semibold text-primary transition hover:border-solid hover:text-navy"
          >
            Partner with us
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-xl px-5">
            <Link href="/signup">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
