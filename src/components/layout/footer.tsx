import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col gap-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/prepwise-logo-round.png"
            alt="Prepwise logo"
            width={34}
            height={34}
            className="rounded-full"
          />
          <p>
            © {new Date().getFullYear()} Prepwise. Built for Nigerian students.
          </p>
        </div>
        <div className="flex gap-5">
          <Link href="/login">Login</Link>
          <Link href="/pricing">Pricing</Link>
          <a href="mailto:hello@prepwise.ng">Contact</a>
        </div>
      </div>
    </footer>
  );
}
