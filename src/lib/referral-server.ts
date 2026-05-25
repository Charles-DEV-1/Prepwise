import { REFERRAL_COOKIE_NAME, normalizeReferralCode } from "@/lib/referral";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function getReferralCodeFromCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): string | null {
  const raw = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return normalizeReferralCode(decodeURIComponent(raw));
  } catch {
    return normalizeReferralCode(raw);
  }
}

export async function applyReferralFromServerCookies(): Promise<void> {
  const cookieStore = await cookies();
  const code = getReferralCodeFromCookies(cookieStore);
  if (!code) return;

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
  if (!user) return;

  const { data: existing } = await supabase
    .from("user_referrals")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return;

  await supabase.rpc("apply_referral_code", { p_code: code });
}
