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
