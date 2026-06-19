import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { getDashboardData } from "@/services/api/dashboard";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export default async function DashboardRoute() {
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

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "Student";

  const dashboardData = user
    ? await getDashboardData(supabase, user.id, "jamb")
    : null;
  const waecDashboardData = user
    ? await getDashboardData(supabase, user.id, "waec")
    : null;

  return (
    <DashboardPage
      userName={firstName}
      data={dashboardData}
      dataByExam={{ jamb: dashboardData, waec: waecDashboardData }}
    />
  );
}
