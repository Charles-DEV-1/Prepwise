import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin-auth";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/revenue", label: "Revenue" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/referral-rewards", label: "Referral rewards" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/partner-program", label: "Affiliate program" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/question-upload", label: "Questions" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <nav
        className="flex gap-2 overflow-x-auto border-b border-border pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
        aria-label="Admin navigation"
      >
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-softblue hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
