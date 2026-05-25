import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/services/supabase/middleware";

const protectedRoutes = [
  "/dashboard",
  "/practice",
  "/exam",
  "/results",
  "/progress",
  "/leaderboard",
  "/weekly-quiz",
  "/upgrade",
  "/profile",
  "/settings",
  "/onboarding",
  "/admin",
];

export async function middleware(request: NextRequest) {
  // Always let auth callback through untouched
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && ["/login", "/signup"].includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
