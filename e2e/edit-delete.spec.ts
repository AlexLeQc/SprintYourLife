/**
 * Editing and deleting a task (spec 003 AC-1.3, rows 6 and 7 · spec 002 AC-4.1 to AC-4.3,
 * AC-5.1, AC-6.2).
 */
import { expect, test } from "./support/fixtures";
import { editButton, expectSaved, storedTasks, taskRow, taskRows, tasksRegion } from "./support/tasks-page";

test("spec 002 AC-4.1, AC-4.3 — edit title, date and time; the list re-sorts and re-colours", async ({
  page,
  days,
  seedTasks,
}) => {
  await seedTasks([
    { title: "Buy groceries", dueDate: days.today },
    { title: "Renew pasport", dueDate: days.inAWeek, dueTime: "10:00" },
  ]);
  await page.goto("/");
  await expect(taskRows(page).first()).toContainText("Buy groceries");

  await editButton(page, "Renew pasport").click();
  const row = taskRows(page).filter({ has: page.getByRole("button", { name: "Save" }) });
  await row.getByLabel("Title").fill("Renew passport");
  await row.getByLabel("Due date").fill(days.yesterday);
  await row.getByLabel("Due time").fill("09:00");
  await row.getByRole("button", { name: "Save" }).click();

  // AC-4.3: re-sorted (now first) and re-coloured (now overdue) right away.
  await expect(taskRows(page).first()).toContainText("Renew passport");
  const dueText = taskRow(page, "Renew passport").getByText(/^Was due .* 9:00 a\.m\.$/);
  await expect(dueText).toHaveAttribute("data-urgency", "overdue");
  await expectSaved(page, "Renew passport");

  const [saved] = await storedTasks("Renew passport");
  expect(saved.dueDate).toBe(days.yesterday);
  expect(saved.dueTime).toMatch(/^09:00(:00)?$/);
  expect(await storedTasks("Renew pasport")).toHaveLength(0);
});

test("spec 002 AC-4.1, AC-4.3 — Cancel keeps the task; a blank title is refused like on creation", async ({
  page,
  seedTasks,
}) => {
  await seedTasks([{ title: "Call the bank" }]);
  await page.goto("/");

  // Cancel: nothing changes.
  await editButton(page, "Call the bank").click();
  await tasksRegion(page).getByLabel("Title").fill("Something else");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(taskRow(page, "Call the bank")).toBeVisible();

  // BR-1: blank title → message, still editing, nothing saved.
  await editButton(page, "Call the bank").click();
  await tasksRegion(page).getByLabel("Title").fill("   ");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(tasksRegion(page).getByRole("alert")).toHaveText("Title is empty.");
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  expect(await storedTasks("Call the bank")).toHaveLength(1);
});

test("spec 002 AC-4.2 — clearing the date clears the time", async ({ page, days, seedTasks }) => {
  await seedTasks([{ title: "Dentist", dueDate: days.tomorrow, dueTime: "09:00" }]);
  await page.goto("/");

  await editButton(page, "Dentist").click();
  await expect(tasksRegion(page).getByLabel("Due time")).toHaveValue("09:00");
  await page.getByRole("button", { name: "Remove date" }).click();
  await expect(tasksRegion(page).getByLabel("Due date")).toHaveCount(0);
  await expect(tasksRegion(page).getByLabel("Due time")).toHaveCount(0);
  await page.getByRole("button", { name: "Save" }).click();

  // No label any more, and nothing stored.
  await expect(editButton(page, "Dentist")).toHaveAccessibleName("Edit Dentist");
  await expectSaved(page, "Dentist");
  await expect
    .poll(async () => {
      const [saved] = await storedTasks("Dentist");
      return [saved.dueDate, saved.dueTime];
    })
    .toEqual([null, null]);

  // Adding a date back doesn't bring the old time back.
  await editButton(page, "Dentist").click();
  const editing = taskRows(page).filter({ has: page.getByRole("button", { name: "Save" }) });
  await editing.getByRole("button", { name: "Add date" }).click();
  await expect(editing.getByRole("button", { name: "Add time" })).toBeVisible();
  await expect(editing.getByLabel("Due time")).toHaveCount(0);
});

test("spec 002 AC-5.1, AC-6.2 — delete without a dialog; Undo brings it back exactly as it was", async ({
  page,
  days,
  seedTasks,
}) => {
  const [before] = await seedTasks([{ title: "Submit lab report", dueDate: days.tomorrow, dueTime: "09:00" }]);
  // AC-5.1: no "Are you sure?" — any dialog fails the test.
  page.on("dialog", (dialog) => {
    throw new Error(`Unexpected dialog: ${dialog.message()}`);
  });
  await page.goto("/");

  await editButton(page, "Submit lab report").click();
  await page.getByRole("button", { name: "Delete" }).click();

  await expect(taskRow(page, "Submit lab report")).toHaveCount(0);
  await expect(page.getByText("Nothing to do.")).toBeVisible();
  await expect.poll(async () => (await storedTasks("Submit lab report"))[0].deletedAt).not.toBeNull();

  // AC-6.2: "Task deleted · Undo" → back exactly as it was.
  const undoBar = tasksRegion(page).getByRole("status");
  await expect(undoBar).toContainText("Task deleted");
  await undoBar.getByRole("button", { name: "Undo" }).click();

  await expect(taskRow(page, "Submit lab report").getByText("Tomorrow 9:00 a.m.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await storedTasks("Submit lab report"))[0].deletedAt).toBeNull();
  const [after] = await storedTasks("Submit lab report");
  expect(after).toEqual(before);
});
