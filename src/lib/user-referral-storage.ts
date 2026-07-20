// Prepcore — User Referral System
export const USER_REFERRAL_STORAGE_KEY = "prepcore_ref_code";

export function normalizeUserReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function setUserReferralCode(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeUserReferralCode(code);
  if (!normalized) return;
  localStorage.setItem(USER_REFERRAL_STORAGE_KEY, normalized);
}

export function getUserReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(USER_REFERRAL_STORAGE_KEY);
  if (!value) return null;
  return normalizeUserReferralCode(value);
}

export function clearUserReferralCode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_REFERRAL_STORAGE_KEY);
}

export function captureUserReferralFromSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): void {
  const ref = searchParams.get("ref");
  if (ref) setUserReferralCode(ref);
}
