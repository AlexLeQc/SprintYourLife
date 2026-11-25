/**
 * Accessibility scan (spec 003 AC-6.1, AC-6.2 · plan 003 §5.6).
 *
 * States: sign-in page; home with a mixed list (red, amber, none); home empty; edit view open;
 * undo bar showing. Each in light and dark, in the desktop and phone projects (all tagged @phone).
 * Spec 004 (plan D-4): the Sidequests page states are scanned in ONE walk-through test per colour
 * scheme and project, naming each state, to keep the e2e job under 5 minutes.
 * No rule is switched off (AC-6.2).
 */
import { expectNoAccessibilityViolations } from "./support/accessibility";
import { expect, test } from "./support/fixtures";
import { addSidequest, bankRegion, editForm, expectSaved, pickCategory } from "./support/sidequests-page";
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
    test(`spec 004 — Sidequests page walk-through has no violation (${colorScheme}) @phone`, async ({
      page,
      seedSidequests,
    }, testInfo) => {
      await page.goto("/sidequests");
      await expect(bankRegion(page).getByText("No sidequest yet.")).toHaveCount(6);
      await expectNoAccessibilityViolations(page, testInfo, "empty Bank");

      await addSidequest(page, "Play Catan online", "Play");
      await expect(bankRegion(page).getByRole("alert")).toHaveCount(0);
      await page.getByRole("textbox", { name: "New sidequest" }).fill("Draw every day");
      await page.getByRole("textbox", { name: "New sidequest" }).press("Enter");
      await expect(bankRegion(page).getByRole("alert")).toHaveText("Pick a category.");
      await expectNoAccessibilityViolations(page, testInfo, "no category message");

      await seedSidequests([
        { title: "Build a Lego set", category: "create" },
        { title: "Learn the Rubik's cube", category: "learn" },
        { title: "Call a friend", category: "connect" },
      ]);
      await page.reload();
      await expectSaved(page, "Play", "Play Catan online");
      await pickCategory(page, "Learn"); // a checked chip
      await expectNoAccessibilityViolations(page, testInfo, "filled Bank, a chip checked");

      // Slice 2: edit view open, then the undo bar after a delete.
      await editButton(bankRegion(page), "Call a friend").click();
      await expect(editForm(page)).toBeVisible();
      await expectNoAccessibilityViolations(page, testInfo, "edit view open");

      await editForm(page).getByRole("button", { name: "Delete" }).click();
      await expect(bankRegion(page).getByRole("status")).toContainText("Sidequest deleted");
      await expectNoAccessibilityViolations(page, testInfo, "undo bar showing");
    });
  });
}
