/**
 * Tabs, end to end (spec 004 US-3: AC-3.1 to AC-3.4). AC-3.5 (Tasks unchanged) is the whole
 * spec 002 suite staying green.
 */
import { eq } from "drizzle-orm";
import type { Page } from "@playwright/test";
import { usageDay } from "../src/server/db/schema";
import { testDb } from "./support/db";
import { expect, test } from "./support/fixtures";
import { bankRegion } from "./support/sidequests-page";
import { tasksRegion } from "./support/tasks-page";

const tabBar = (page: Page) => page.getByRole("navigation", { name: "Main" });
const tab = (page: Page, name: string) => tabBar(page).getByRole("link", { name, exact: true });

/** The tab bar is visible and its bottom edge is the bottom of the screen. */
async function expectTabBarAtBottom(page: Page) {
  await expect(tabBar(page)).toBeVisible();
  const box = await tabBar(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && Math.round(box.y + box.height)).toBe(viewport?.height);
}

test("spec 004 AC-3.1, AC-3.2 — the app opens on Tasks; both pages show the tab bar at the bottom, with the current tab marked @phone", async ({
  page,
}) => {
  await page.goto("/");
  await expect(tasksRegion(page)).toBeVisible();
  await expectTabBarAtBottom(page);
  await expect(tab(page, "Tasks")).toHaveAttribute("aria-current", "page");
  await expect(tab(page, "Sidequests")).not.toHaveAttribute("aria-current");

  await tab(page, "Sidequests").click();
  await expect(bankRegion(page)).toBeVisible();
  await expectTabBarAtBottom(page);
  await expect(tab(page, "Sidequests")).toHaveAttribute("aria-current", "page");
  await expect(tab(page, "Tasks")).not.toHaveAttribute("aria-current");
  // Not marked by colour alone (WCAG 1.4.1): the current tab is also bold.
  await expect(tab(page, "Sidequests")).toHaveCSS("font-weight", "600");
});

test("spec 004 AC-3.3 — each tab has its own address: Back, Forward and reload keep the right tab", async ({ page }) => {
  await page.goto("/");
  await tab(page, "Sidequests").click();
  await expect(page).toHaveURL("/sidequests");

  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(tasksRegion(page)).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL("/sidequests");
  await page.reload();
  await expect(page).toHaveURL("/sidequests");
  await expect(bankRegion(page)).toBeVisible();
});

test("spec 004 AC-3.4 — opening only the Sidequests page records today as a usage day", async ({ page, days }) => {
  expect(await testDb().select().from(usageDay)).toHaveLength(0); // emptied by resetDb

  await page.goto("/sidequests");
  await expect(bankRegion(page)).toBeVisible();

  expect(await testDb().select().from(usageDay).where(eq(usageDay.day, days.today))).toHaveLength(1);
  await expect(page.getByText(/Used 1 of the last 7 days/)).toBeVisible();
});
