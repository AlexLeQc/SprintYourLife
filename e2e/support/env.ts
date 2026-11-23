/**
 * Environment for end-to-end tests (spec 003 TR-1, TR-2; plan §3, §4).
 *
 * Never reads `.env`: that file holds the `dev` and production connection strings.
 * Every value here is a throwaway test value, safe to print.
 */
import { isLocalProxyUrl, LOCAL_PROXY_HOST } from "../../src/server/db/local-proxy.ts";

/** The throwaway database started by docker-compose.e2e.yml. */
export const DEFAULT_E2E_DATABASE_URL = `postgres://postgres:postgres@${LOCAL_PROXY_HOST}:5432/main`;

/**
 * Returns the test database URL, or throws if it points anywhere else.
 * This is the guard that keeps test code (and the test sign-in of T03) away from `dev` and production.
 */
export function e2eDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = env.E2E_DATABASE_URL ?? DEFAULT_E2E_DATABASE_URL;
  if (!isLocalProxyUrl(url)) {
    throw new Error(
      `Refusing to run end-to-end setup: the database host must be ${LOCAL_PROXY_HOST} ` +
        "(the throwaway database from docker-compose.e2e.yml), never dev or production (spec 003 TR-1).",
    );
  }
  return url;
}

/** Port of the app under test: not 3000, so a running `npm run dev` doesn't get in the way. */
export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

/** Fake accounts (@example.com only). The owner is in the test allowlist; the stranger is not. */
export const OWNER_EMAIL = "owner@example.com";
export const STRANGER_EMAIL = "stranger@example.com";

/** Where global setup saves each account's cookies (git-ignored). */
export const AUTH_DIR = "e2e/.auth";
export const OWNER_STATE = `${AUTH_DIR}/owner.json`;
export const STRANGER_STATE = `${AUTH_DIR}/stranger.json`;

/**
 * Local fallback secret. It only signs cookies for the throwaway database, which holds fake data.
 * CI generates a fresh one for each run instead (E2E_BETTER_AUTH_SECRET, plan §3).
 */
const LOCAL_THROWAWAY_SECRET = "e2e-local-throwaway-secret-signs-nothing-real";

/**
 * Environment of the app under test (`next build` and `next start`) and of the test sign-in.
 * Variables set here take precedence over `.env`, which Next.js would otherwise load (TR-2).
 */
export function e2eAppEnv(env: NodeJS.ProcessEnv = process.env) {
  return {
    DATABASE_URL: e2eDatabaseUrl(env),
    BETTER_AUTH_SECRET: env.E2E_BETTER_AUTH_SECRET ?? LOCAL_THROWAWAY_SECRET,
    BETTER_AUTH_URL: E2E_BASE_URL,
    ALLOWED_EMAILS: OWNER_EMAIL,
    // Google is never called in tests (spec 003 OQ-1); these are placeholders, not credentials.
    GOOGLE_CLIENT_ID: "e2e-placeholder",
    GOOGLE_CLIENT_SECRET: "e2e-placeholder",
    // Must not leak into the app under test, even though Next.js loads `.env` (ADR-0014).
    PROD_READONLY_DATABASE_URL: "",
  };
}
