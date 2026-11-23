/** npm run e2e:migrate — run with Node directly (no test runner), hence the .ts extensions. */
import { migrateTestDatabase } from "./migrate.ts";

try {
  await migrateTestDatabase();
  console.log("Test database migrated.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
