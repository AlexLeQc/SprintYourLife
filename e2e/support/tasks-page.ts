/**
 * Finding things on the task page by role, label and visible text (plan 003 §5.3, spec TR-4).
 * No CSS selectors: if a test can't find an element this way, neither can a screen reader.
 */
import { expect, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";
import { task } from "../../src/server/db/schema";
import { testDb } from "./db";

/** The "Tasks" region: add form, list, undo bar. */
export function tasksRegion(page: Page) {
  return page.getByRole("region", { name: "Tasks" });
}

/** Every task row, in the order shown. */
export function taskRows(page: Page) {
  return tasksRegion(page).getByRole("listitem");
}

/** The row showing `title`. */
export function taskRow(page: Page, title: string) {
  return taskRows(page).filter({ has: page.getByRole("button", { name: `Edit "${title}"`, exact: true }) });
}

/**
 * Waits until the server has confirmed the task: a row shown before confirmation (optimistic)
 * has its buttons disabled.
 */
export async function expectSaved(page: Page, title: string) {
  await expect(tasksRegion(page).getByRole("button", { name: `Edit "${title}"`, exact: true })).toBeEnabled();
}

/** The task rows stored with this title (deleted and done ones included). */
export async function storedTasks(title: string) {
  return testDb().select().from(task).where(eq(task.title, title));
}

/** Every stored task row, whatever its state. */
export async function allStoredTasks() {
  return testDb().select().from(task);
}
