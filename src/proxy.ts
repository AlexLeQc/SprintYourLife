import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Plan §5.1, layer 3 (UX only): send visitors without a session cookie to /sign-in (AC-2.1).
 * This only checks that a cookie exists. Real security is in the Better Auth hooks
 * and in getAllowedSession() on every server entry point.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except sign-in, the auth API, Next internals, and public files needed to install the app.
  matcher: [
    "/((?!sign-in|api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|apple-icon.png|icons/).*)",
  ],
};
