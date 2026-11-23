/**
 * Test database client for end-to-end tests (plan 003 §3, §5.1).
 * Same Neon HTTP driver and schema as the app, pointed at the throwaway database only.
 */
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { localProxyFetchEndpoint } from "../../src/server/db/local-proxy";
import * as schema from "../../src/server/db/schema";
import { e2eDatabaseUrl } from "./env";

let client: ReturnType<typeof createClient> | undefined;

function createClient() {
  const url = e2eDatabaseUrl(); // throws unless it's the local test database (TR-1)
  neonConfig.fetchEndpoint = localProxyFetchEndpoint;
  return drizzle(neon(url), { schema });
}

/** The test database, created on first use. */
export function testDb() {
  client ??= createClient();
  return client;
}
