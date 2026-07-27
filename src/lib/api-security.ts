import { NextResponse } from "next/server";

const MAX_JSON_BYTES = 24 * 1024;

export function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

// Browsers attach Origin to cross-site unsafe requests. Reject them before a
// cookie-authenticated action can run; non-browser server callbacks are still
// allowed and must use their own signatures (e.g. Flutterwave webhooks).
export function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function readSafeJson<T>(request: Request): Promise<T | null> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_JSON_BYTES) return null;
  const text = await request.text();
  if (text.length > MAX_JSON_BYTES) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
