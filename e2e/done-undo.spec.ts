/**
 * Marking a task done, and undoing it (spec 003 AC-1.3, row 5 · spec 002 AC-3.1, AC-6.1).
 */
import { expect, test } from "./support/fixtures";
import { storedTasks, taskRow, tasksRegion } from "./support/tasks-page";

test("spec 002 AC-3.1, AC-6.1 — done leaves the list with today's date recorded; Undo brings it back open @phone", async ({
  page,
  days,
  seedTasks,
}) => {
  await seedTasks([{ title: "Submit lab report", dueDate: days.tomorrow }, { title: "Call the bank" }]);
  await page.goto("/");

  // AC-3.1: one tap, it leaves the list right away.
  await page.getByRole("checkbox", { name: 'Mark "Submit lab report" done' }).click();
  await expect(taskRow(page, "Submit lab report")).toHaveCount(0);
  await expect(taskRow(page, "Call the bank")).toBeVisible();

  // AC-3.1: completion date = today in Toronto (BR-4).
  await expect.poll(async () => (await storedTasks("Submit lab report"))[0].completedOn).toBe(days.today);

  // AC-6.1: "Task done · Undo".
  const undoBar = tasksRegion(page).getByRole("status");
  await expect(undoBar).toContainText("Task done");
  await undoBar.getByRole("button", { name: "Undo" }).click();

  // Back in the list, open, with no completion date.
  await expect(undoBar).toHaveCount(0);
  await expect(taskRow(page, "Submit lab report").getByText("Tomorrow", { exact: true })).toBeVisible();
  await expect.poll(async () => (await storedTasks("Submit lab report"))[0].completedOn).toBeNull();

  await page.reload();
  await expect(taskRow(page, "Submit lab report")).toBeVisible();
});
