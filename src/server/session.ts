import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, isEmailAllowed } from "./auth";
import { recordUsageDay } from "./usage-repository";

/**
 * Plan §5.1, layer 2: returns the session only if it exists AND its email is still allowed.
 * Every server entry point (page, server action, route) must call this or requireAllowedSession().
 */
export async function getAllowedSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isEmailAllowed(session.user.email)) return null;
  return session;
}

/**
 * For pages: call it FIRST, before rendering anything private.
 * Not in a layout: Next.js renders layouts and pages in parallel, so a layout check
 * does not stop the page's content from being rendered and sent.
 */
export async function requireAllowedSession() {
  const session = await getAllowedSession();
  if (!session) redirect("/sign-in");
  // T15: opening any page counts as a usage day. Only reached with an allowed session (AC-5.4).
  await recordUsageDay();
  return session;
}
