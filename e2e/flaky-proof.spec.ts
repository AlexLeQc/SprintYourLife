/**
 * THROWAWAY (spec 003 T11, AC-2.2, plan D-3) — never merged.
 * Fails on the first attempt, passes on the retry: Playwright must label it "flaky",
 * and failOnFlakyTests must still turn the run red.
 */
import { expect, test } from "./support/fixtures";

test("T11 throwaway — deliberately flaky: fails first, passes on retry", async ({ page }, testInfo) => {
  await page.goto("/");
  expect(testInfo.retry, "first attempt fails on purpose").toBeGreaterThan(0);
});
