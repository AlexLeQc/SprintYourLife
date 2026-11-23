/**
 * Adding a task, end to end (spec 003 AC-1.3, row 1 and 2 · spec 002 AC-1.1 to AC-1.5).
 * The only place tasks are added through the UI; other tests seed them (plan 003 §5.1).
 */
import { expect, test } from "./support/fixtures";
import { allStoredTasks, expectSaved, storedTasks, taskRow, taskRows, tasksRegion } from "./support/tasks-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("spec 002 AC-1.1 — a title only, confirmed with Return: listed, saved, input cleared and ready @phone", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "New task" });

  await input.fill("Buy milk");
  await input.press("Enter");

  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(taskRow(page, "Buy milk")).toBeVisible();
  await expectSaved(page, "Buy milk");

  const [saved] = await storedTasks("Buy milk");
  expect(saved).toMatchObject({ dueDate: null, dueTime: null, completedOn: null, deletedAt: null });

  // Still there after a reload: it came from the database, not only from the browser.
  await page.reload();
  await expect(taskRow(page, "Buy milk")).toBeVisible();
});

test("spec 002 AC-1.1 — the Add button works too", async ({ page }) => {
  await page.getByRole("textbox", { name: "New task" }).fill("Call the bank");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(taskRow(page, "Call the bank")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "New task" })).toHaveValue("");
  await expectSaved(page, "Call the bank");
});

test("spec 002 AC-1.2 — with a due date: saved with that date, no date by default", async ({ page, days }) => {
  await expect(page.getByRole("textbox", { name: "Due date" })).toHaveCount(0); // no date by default

  await page.getByRole("textbox", { name: "New task" }).fill("Dentist");
  await page.getByRole("button", { name: "Add date" }).click();
  await page.getByLabel("Due date").fill(days.tomorrow);
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(taskRow(page, "Dentist").getByText("Tomorrow", { exact: true })).toBeVisible();
  await expectSaved(page, "Dentist");
  const [saved] = await storedTasks("Dentist");
  expect(saved).toMatchObject({ dueDate: days.tomorrow, dueTime: null });

  // The date fields collapse after an add, ready for the next task.
  await expect(page.getByLabel("Due date")).toHaveCount(0);
});

test("spec 002 AC-1.3 — with a date and a time; the time is offered only once a date is set @phone", async ({ page, days }) => {
  await expect(page.getByRole("button", { name: "Add time" })).toHaveCount(0);

  await page.getByRole("textbox", { name: "New task" }).fill("Submit lab report");
  await page.getByRole("button", { name: "Add date" }).click();
  await page.getByLabel("Due date").fill(days.tomorrow);
  await page.getByRole("button", { name: "Add time" }).click();
  await page.getByLabel("Due time").fill("09:00");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(taskRow(page, "Submit lab report").getByText("Tomorrow 9:00 a.m.", { exact: true })).toBeVisible();
  await expectSaved(page, "Submit lab report");
  const [saved] = await storedTasks("Submit lab report");
  expect(saved.dueDate).toBe(days.tomorrow);
  expect(saved.dueTime).toMatch(/^09:00(:00)?$/);
});

test("spec 002 AC-1.4 — a blank title is ignored: nothing saved, no message", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "New task" });

  await input.fill("   ");
  await input.press("Enter");

  await expect(tasksRegion(page).getByRole("alert")).toHaveCount(0);
  await expect(taskRows(page)).toHaveCount(0);
  await expect(page.getByText("Nothing to do.")).toBeVisible();
  expect(await allStoredTasks()).toHaveLength(0);
});

test("spec 002 AC-1.5 — a 201-character title is refused with a short message, and the text is kept", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "New task" });
  const tooLong = "x".repeat(201);

  await input.fill(tooLong);
  await input.press("Enter");

  await expect(tasksRegion(page).getByRole("alert")).toHaveText("Title is too long (200 characters max).");
  await expect(input).toHaveValue(tooLong);
  await expect(taskRows(page)).toHaveCount(0);
  expect(await allStoredTasks()).toHaveLength(0);
});
