/**
 * README screenshots (spec 003 AC-3.1 to AC-3.4, TR-6; plan 003 §5.9).
 *
 * Run with `npm run screenshots` (Docker running), never in CI: PO decision 2026-11-23, the
 * images are made on the Mac so they show the fonts the app really uses there.
 * Same harness as the tests: throwaway database, fake data only, owner@example.com.
 * Dues are relative to Toronto "today", so the list always shows red, amber and plain tasks.
 * Files keep stable names (the PO's website links to them).
 */
import { addDays } from "../src/domain/local-date";
import { usageDay } from "../src/server/db/schema";
import { testDb } from "./support/db";
import { expect, test } from "./support/fixtures";
import { taskRows } from "./support/tasks-page";

const DIR = "docs/screenshots";

/** Phone screenshots use an iPhone 15/16-sized viewport (PO decision), rendered by Chromium. */
const IPHONE = { viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false };

test.beforeEach(async ({ days, seedTasks }) => {
  await seedTasks([
    { title: "Submit lab report", dueDate: days.yesterday }, // red: overdue
    { title: "Call the bank", dueDate: days.today }, // amber (date only: same colour at any hour)
    { title: "Dentist", dueDate: days.tomorrow, dueTime: "09:00" }, // amber
    { title: "Renew passport", dueDate: days.inAWeek }, // no colour
    { title: "Buy groceries" },
    { title: "Water the plants" },
  ]);
  // "Used 5 of the last 7 days": a realistic week, not a perfect streak.
  await testDb()
    .insert(usageDay)
    .values([0, 1, 2, 4, 5].map((back) => ({ day: addDays(days.today, -back) })));
});

for (const [device, options] of [
  ["phone", IPHONE],
  ["desktop", DESKTOP],
] as const) {
  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(`${device} ${colorScheme}`, () => {
      test.use({ ...options, colorScheme });

      test(`tasks-${device}-${colorScheme}.png`, async ({ page }) => {
        await page.goto("/");
        await expect(taskRows(page)).toHaveCount(6);
        await page.screenshot({ path: `${DIR}/tasks-${device}-${colorScheme}.png`, animations: "disabled" });
      });
    });
  }
}

// sign-in.png (light) keeps its original name; sign-in-dark.png is for GitHub's dark theme (AC-3.3).
for (const [colorScheme, file] of [
  ["light", "sign-in.png"],
  ["dark", "sign-in-dark.png"],
] as const) {
  test.describe(`sign-in ${colorScheme}`, () => {
    test.use({ ...IPHONE, colorScheme, storageState: { cookies: [], origins: [] } });

    test(file, async ({ page }) => {
      await page.goto("/sign-in");
      await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
      await page.screenshot({ path: `${DIR}/${file}`, animations: "disabled" });
    });
  });
}
