/**
 * Applies the committed migrations (drizzle/) to the throwaway test database, with the same
 * Neon HTTP driver the app uses in production (plan 003 §3).
 *
 * Run: npm run e2e:migrate   (after npm run e2e:db)
 */
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { localProxyFetchEndpoint } from "../../src/server/db/local-proxy.ts";
import { e2eDatabaseUrl } from "./env.ts";

export async function migrateTestDatabase(): Promise<void> {
  const url = e2eDatabaseUrl(); // throws unless it's the local test database (TR-1)
  neonConfig.fetchEndpoint = localProxyFetchEndpoint;
  await migrate(drizzle(neon(url)), { migrationsFolder: "drizzle" });
}

if (import.meta.main) {
  try {
    await migrateTestDatabase();
    console.log("Test database migrated.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
