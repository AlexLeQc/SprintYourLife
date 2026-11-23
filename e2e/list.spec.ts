/**
 * The open-task list, end to end (spec 003 AC-1.3, rows 3 and 4 · spec 002 AC-2.1 to AC-2.7).
 *
 * Colours are checked through `data-urgency` on the due label, set from the same value that
 * picks the colour (plan 003 §5.4); the accessibility scan checks the contrast itself (T09).
 */
import { dueLabel } from "../src/domain/task";
import { localNow } from "../src/domain/local-date";
import { expect, test } from "./support/fixtures";
import { editButton, taskRow, taskRows } from "./support/tasks-page";

test("spec 002 AC-2.1 to AC-2.6 — order, due labels and urgency with a mix of dues", async ({ page, days, seedTasks }) => {
  // Seeded in a shuffled order, so the order shown can only come from BR-3.
  await seedTasks([
    { title: "Water the plants" }, // no date
    { title: "Renew passport", dueDate: days.inAWeek },
    { title: "Dentist", dueDate: days.tomorrow, dueTime: "09:00" },
    { title: "Pay rent", dueDate: days.yesterday },
    { title: "Buy groceries", dueDate: days.today },
    // Midnight guard: never earlier than 00:02, so 00:00 today has always passed (BR-5).
    { title: "Submit lab report", dueDate: days.today, dueTime: "00:00" }, // today, time passed
  ]);
  // Plain dates use BR-6's own format (e.g. "Mon, Nov 30"); the label rules have unit tests.
  const now = localNow(new Date());
  const yesterdayLabel = dueLabel({ date: days.yesterday, time: null }, now)!;
  const laterLabel = dueLabel({ date: days.inAWeek, time: null }, now)!;
  expect(yesterdayLabel).toMatch(/^Was due \w{3}, \w{3} \d{1,2}(, \d{4})?$/);

  await page.goto("/");

  // AC-2.1: listed below the usage line, sorted per BR-3
  // (by date; on the same date, timed before date-only; no date last).
  await expect(page.getByText(/Used \d+ of the last 7 days/)).toBeVisible();
  const order = ["Pay rent", "Submit lab report", "Buy groceries", "Dentist", "Renew passport", "Water the plants"];
  await expect(taskRows(page)).toHaveCount(order.length);
  for (const [index, title] of order.entries()) {
    await expect(editButton(taskRows(page).nth(index), title)).toBeVisible();
  }

  // AC-2.2 to AC-2.6: each due label as text, and its urgency.
  const expected: [title: string, label: string, urgency: "overdue" | "soon" | "none"][] = [
    // AC-2.3: overdue → "Was due …", red.
    ["Pay rent", yesterdayLabel, "overdue"],
    ["Submit lab report", "Was due today 12:00 a.m.", "overdue"],
    // AC-2.4: due today or tomorrow, not overdue → amber.
    ["Buy groceries", "Today", "soon"],
    ["Dentist", "Tomorrow 9:00 a.m.", "soon"],
    // AC-2.5: later → no colour.
    ["Renew passport", laterLabel, "none"],
  ];
  for (const [title, label, urgency] of expected) {
    // AC-2.6: the label is visible text, so colour is never the only signal.
    const dueText = taskRow(page, title).getByText(label, { exact: true });
    await expect(dueText, `${title} shows "${label}"`).toBeVisible();
    await expect(dueText, `${title} is "${urgency}"`).toHaveAttribute("data-urgency", urgency);
  }

  // AC-2.5: no date → no label at all, so no colour.
  await expect(editButton(page, "Water the plants")).toHaveAccessibleName("Edit Water the plants");

  // WCAG 2.5.3 (spec 003 A1): the button's name holds everything it shows, due label included.
  await expect(editButton(page, "Dentist")).toHaveAccessibleName("Edit Dentist Tomorrow 9:00 a.m.");
});

test("spec 002 AC-2.7 — no open task: a calm empty state", async ({ page, days, seedTasks }) => {
  // Done and deleted tasks are not open: the list is still empty.
  await seedTasks([
    { title: "Already done", completedOn: days.yesterday },
    { title: "Already deleted", deletedAt: new Date() },
  ]);

  await page.goto("/");

  await expect(page.getByText("Nothing to do.", { exact: true })).toBeVisible();
  await expect(taskRows(page)).toHaveCount(0);
});
