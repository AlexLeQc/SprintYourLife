/**
 * Playwright fixtures shared by every end-to-end test (spec 003 AC-1.5, AC-1.6; plan 003 §5.1, §5.2).
 *
 * Import `test` and `expect` from here, not from "@playwright/test":
 * - `resetDb` (automatic): midnight guard, then empties `task`, `sidequest` and `usage_day` before each test.
 *   Users and sessions stay (global setup creates them once).
 * - `days`: Toronto yesterday / today / tomorrow / in a week, read after the guard.
 * - `seedTasks`, `seedSidequests`: insert exactly the rows a test needs, directly in the database.
 * - `settleRequests` (automatic): a test ends only once the browser's requests have finished, so a
 *   save still in flight can't land in the next test's database (AC-1.6; found by `--shuffle 2026`).
 *
 * The callback is named `provide` rather than Playwright's usual `use`, so the React Hooks lint rule
 * does not mistake it for a hook.
 */
import { test as base, expect } from "@playwright/test";
import { sidequest, task, usageDay } from "../../src/server/db/schema";
import { midnightWaitMs, torontoDays, type TorontoDays } from "./dates";
import { testDb } from "./db";

export type SeedTask = typeof task.$inferInsert;
export type SeededTask = typeof task.$inferSelect;
export type SeedSidequest = typeof sidequest.$inferInsert;
export type SeededSidequest = typeof sidequest.$inferSelect;

interface Fixtures {
  resetDb: void;
  settleRequests: void;
  days: TorontoDays;
  seedTasks: (rows: SeedTask[]) => Promise<SeededTask[]>;
  seedSidequests: (rows: SeedSidequest[]) => Promise<SeededSidequest[]>;
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
      await testDb().delete(sidequest);
      await testDb().delete(usageDay);
      await provide();
    },
    { auto: true },
  ],

  settleRequests: [
    async ({ page }, provide) => {
      let inFlight = 0;
      page.on("request", () => inFlight++);
      page.on("requestfinished", () => inFlight--);
      page.on("requestfailed", () => inFlight--);
      await provide();
      await expect
        .poll(() => inFlight, { message: "browser requests still running when the test ended", timeout: 10_000 })
        .toBe(0);
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

  seedSidequests: async ({ resetDb }, provide) => {
    void resetDb;
    await provide(async (rows) => (rows.length ? testDb().insert(sidequest).values(rows).returning() : []));
  },
});

export { expect };
