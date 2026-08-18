import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { ReferralApplicator } from "@/components/referral/referral-applicator";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type CookieToSet = { name: string; value: string; options: CookieOptions };

export default async function AuthenticatedLayout({
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

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <ReferralApplicator />
      {children}
    </AppShell>
  );
}
