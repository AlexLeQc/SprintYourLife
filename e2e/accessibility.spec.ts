/**
 * Accessibility scan (spec 003 AC-6.1, AC-6.2 · plan 003 §5.6).
 *
 * States: sign-in page; home with a mixed list (red, amber, none); home empty; edit view open;
 * undo bar showing. Each in light and dark, in the desktop and phone projects (all tagged @phone).
 * No rule is switched off (AC-6.2).
 */
import { expectNoAccessibilityViolations } from "./support/accessibility";
import { expect, test } from "./support/fixtures";
import { editButton, taskRow, tasksRegion } from "./support/tasks-page";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test.describe("signed out", () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      test(`spec 003 AC-6.1 — sign-in page has no violation (${colorScheme}) @phone`, async ({ page }, testInfo) => {
        await page.goto("/sign-in");
        await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();

        await expectNoAccessibilityViolations(page, testInfo);
      });
    });

    test(`spec 003 AC-6.1 — home with a mixed list (red, amber, none) has no violation (${colorScheme}) @phone`, async ({
      page,
      days,
      seedTasks,
    }, testInfo) => {
      await seedTasks([
        { title: "Pay rent", dueDate: days.yesterday }, // red
        { title: "Buy groceries", dueDate: days.today }, // amber
        { title: "Dentist", dueDate: days.tomorrow, dueTime: "09:00" }, // amber
        { title: "Renew passport", dueDate: days.inAWeek }, // none
        { title: "Water the plants" }, // no date
      ]);
      await page.goto("/");
      await expect(taskRow(page, "Water the plants")).toBeVisible();

      await expectNoAccessibilityViolations(page, testInfo);
    });

    test(`spec 003 AC-6.1 — empty home has no violation (${colorScheme}) @phone`, async ({ page }, testInfo) => {
      await page.goto("/");
      await expect(page.getByText("Nothing to do.")).toBeVisible();

      await expectNoAccessibilityViolations(page, testInfo);
    });

    test(`spec 003 AC-6.1 — edit view open has no violation (${colorScheme}) @phone`, async ({
      page,
      days,
      seedTasks,
    }, testInfo) => {
      await seedTasks([{ title: "Dentist", dueDate: days.tomorrow, dueTime: "09:00" }, { title: "Call the bank" }]);
      await page.goto("/");
      await editButton(page, "Dentist").click();
      await expect(tasksRegion(page).getByRole("button", { name: "Save" })).toBeVisible();

      await expectNoAccessibilityViolations(page, testInfo);
    });

    test(`spec 003 AC-6.1 — undo bar showing has no violation (${colorScheme}) @phone`, async ({
      page,
      seedTasks,
    }, testInfo) => {
      await seedTasks([{ title: "Call the bank" }, { title: "Buy groceries" }]);
      await page.goto("/");
      await page.getByRole("checkbox", { name: 'Mark "Call the bank" done' }).click();
      await expect(tasksRegion(page).getByRole("status")).toContainText("Task done");

      await expectNoAccessibilityViolations(page, testInfo);
    });
  });
}
