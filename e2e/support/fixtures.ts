/**
 * Playwright fixtures shared by every end-to-end test (spec 003 AC-1.5, AC-1.6; plan 003 §5.1, §5.2).
 *
 * Import `test` and `expect` from here, not from "@playwright/test":
 * - `resetDb` (automatic): midnight guard, then empties `task` and `usage_day` before each test.
 *   Users and sessions stay (global setup creates them once).
 * - `days`: Toronto yesterday / today / tomorrow / in a week, read after the guard.
 * - `seedTasks`: inserts exactly the tasks a test needs, directly in the database.
 *
 * The callback is named `provide` rather than Playwright's usual `use`, so the React Hooks lint rule
 * does not mistake it for a hook.
 */
import { test as base, expect } from "@playwright/test";
import { task, usageDay } from "../../src/server/db/schema";
import { midnightWaitMs, torontoDays, type TorontoDays } from "./dates";
import { testDb } from "./db";

export type SeedTask = typeof task.$inferInsert;
export type SeededTask = typeof task.$inferSelect;

interface Fixtures {
  resetDb: void;
  days: TorontoDays;
  seedTasks: (rows: SeedTask[]) => Promise<SeededTask[]>;
}

export const test = base.extend<Fixtures>({
  resetDb: [
    async ({}, provide, testInfo) => {
      const waitMs = midnightWaitMs();
      if (waitMs > 0) {
        testInfo.annotations.push({
          type: "midnight guard",
          description: `waited ${Math.ceil(waitMs / 1000)} s for 00:02 Toronto`,
        });
        testInfo.setTimeout(testInfo.timeout + waitMs);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      await testDb().delete(task);
      await testDb().delete(usageDay);
      await provide();
    },
    { auto: true },
  ],

  // Depends on resetDb so "today" is read after the midnight guard.
  days: async ({ resetDb }, provide) => {
    void resetDb;
    await provide(torontoDays());
  },

  seedTasks: async ({ resetDb }, provide) => {
    void resetDb;
    await provide(async (rows) => (rows.length ? testDb().insert(task).values(rows).returning() : []));
  },
});

export { expect };
