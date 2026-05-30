import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="brand-blue-surface blueprint-grid grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center px-4 py-10">
        {children}
      </section>
      <section className="hidden soft-blue-gradient border-l border-border p-10 text-navy lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/prepwise-logo-round.png"
            alt="Prepwise logo"
            width={46}
            height={46}
            className="rounded-full"
          />
          <span className="text-2xl font-bold">prepwise</span>
        </Link>
        <div>
          <p className="text-5xl font-bold leading-tight">
            Study smarter for JAMB, WAEC, and NECO.
          </p>
          <p className="mt-5 max-w-lg text-lg font-medium leading-8 text-slate-600">
            Past questions, timed mock exams, AI explanations, and score
            tracking for Nigerian students.
          </p>
        </div>
      </section>
    </main>
  );
}
