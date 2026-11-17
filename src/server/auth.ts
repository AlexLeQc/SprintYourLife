import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { isAllowed, parseAllowlist } from "@/domain/allowlist";
import { db } from "./db/client";
import * as schema from "./db/schema";

/** Error code sent back to /sign-in?error=… when an account is refused (AC-3.1). */
export const NOT_ALLOWED = "NOT_ALLOWED";

/** BR-1, read at call time so a change to ALLOWED_EMAILS applies on the next request. */
export function isEmailAllowed(email: string | null | undefined): boolean {
  return isAllowed(email, parseAllowlist(process.env.ALLOWED_EMAILS));
}

function refuse(): never {
  throw new APIError("FORBIDDEN", { code: NOT_ALLOWED, message: "This app is private." });
}

const DAY_IN_SECONDS = 60 * 60 * 24;

// Secret and base URL come from BETTER_AUTH_SECRET and BETTER_AUTH_URL.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  // US-4: 90-day session, extended at most once a day while the app is used (plan §5.2).
  session: {
    expiresIn: 90 * DAY_IN_SECONDS,
    updateAge: DAY_IN_SECONDS,
  },
  // Google tokens are not used by the app, but if stored they are encrypted at rest.
  account: { encryptOAuthTokens: true },
  // Plan §5.1, layer 1: no account and no session for an email outside the allowlist.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowed(user.email)) refuse();
        },
      },
    },
    session: {
      create: {
        // Covers an account created earlier whose email was removed from the allowlist since.
        before: async (session) => {
          const [owner] = await db
            .select({ email: schema.user.email })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId));
          if (!isEmailAllowed(owner?.email)) refuse();
        },
      },
    },
  },
  plugins: [nextCookies()], // must stay last
});
