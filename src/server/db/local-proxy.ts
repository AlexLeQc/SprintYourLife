/**
 * Plan 003 §3: the throwaway end-to-end test database (docker-compose.e2e.yml) is a plain
 * PostgreSQL behind a local Neon HTTP proxy. Only a connection string whose host is exactly
 * LOCAL_PROXY_HOST is routed to it; production and `dev` (`*.neon.tech`) can never match.
 *
 * No "server-only" import on purpose: the e2e setup uses the same rule (e2e/support/env.ts).
 */
export const LOCAL_PROXY_HOST = "db.localtest.me";
export const LOCAL_PROXY_PORT = 4444;

/** True only for the local end-to-end test database. */
export function isLocalProxyUrl(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname === LOCAL_PROXY_HOST;
  } catch {
    return false;
  }
}

/** Where the Neon HTTP driver sends queries for the local test database (plain HTTP, no TLS). */
export function localProxyFetchEndpoint(host: string): string {
  return `http://${host}:${LOCAL_PROXY_PORT}/sql`;
}
