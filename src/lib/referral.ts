export const REFERRAL_COOKIE_NAME = "prepcore_ref";
export const REFERRAL_COOKIE_MAX_AGE_DAYS = 30;

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function setReferralCookie(code: string): void {
  if (typeof document === "undefined") return;
  const normalized = normalizeReferralCode(code);
  if (!normalized) return;
  const maxAge = REFERRAL_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(normalized)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getReferralCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REFERRAL_COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.slice(REFERRAL_COOKIE_NAME.length + 1);
  try {
    return normalizeReferralCode(decodeURIComponent(value));
  } catch {
    return normalizeReferralCode(value);
  }
}

export function clearReferralCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function captureReferralFromSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): void {
  const ref = searchParams.get("ref");
  if (ref) setReferralCookie(ref);
}

export function appendRefToUrl(path: string, ref: string | null): string {
  if (!ref) return path;
  const url = new URL(path, "http://local");
  url.searchParams.set("ref", ref);
  return `${url.pathname}${url.search}`;
}
