import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col gap-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/favicons/android-chrome-512x512.png"
            alt="Prepcore logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <p>
            © {new Date().getFullYear()} Prepcore. Built for Nigerian students.
          </p>
        </div>
        <div className="flex gap-5">
          <Link href="/login">Login</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <a href="mailto:hello@prepcore.ng">Contact</a>
        </div>
      </div>
    </footer>
  );
}
