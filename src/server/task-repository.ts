import "server-only";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { LocalDate } from "@/domain/local-date";
import { compareOpenTasks, type Due } from "@/domain/task";
import { db } from "./db/client";
import { task } from "./db/schema";

/** A task as the UI needs it. Due date/time are Toronto wall-clock values (ADR-0013). */
export interface OpenTask {
  id: string;
  title: string;
  due: Due;
  createdAt: Date;
}

/** PostgreSQL returns TIME as "HH:MM:SS"; the domain works with "HH:MM". */
function toLocalTime(value: string | null): string | null {
  return value === null ? null : value.slice(0, 5);
}

/**
 * Inserts a task. The caller has already checked the session and validated
 * the title (BR-1) and the due (BR-2); the database CHECKs are a second line of defence.
 */
export async function createTask(title: string, due: Due): Promise<void> {
  await db.insert(task).values({ title, dueDate: due.date, dueTime: due.time });
}

/** Open tasks: not done and not deleted (BR-8), sorted by BR-3. */
export async function listOpenTasks(): Promise<OpenTask[]> {
  const rows = await db
    .select({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      createdAt: task.createdAt,
    })
    .from(task)
    .where(and(isNull(task.completedOn), isNull(task.deletedAt)));

  return rows
    .map((row) => ({
      id: row.id,
      title: row.title,
      due: { date: row.dueDate, time: toLocalTime(row.dueTime) },
      createdAt: row.createdAt,
    }))
    .sort(compareOpenTasks);
}

/** Matches an open task: not done, not deleted. */
const isOpen = (id: string) => and(eq(task.id, id), isNull(task.completedOn), isNull(task.deletedAt));

/** AC-3.1, BR-4: mark an open task done on `completedOn` (Toronto date). */
export async function completeTask(id: string, completedOn: LocalDate): Promise<void> {
  await db.update(task).set({ completedOn }).where(isOpen(id));
}

/** AC-6.1: undo "done" — back to open, completion date cleared. Deleted tasks stay deleted. */
export async function reopenTask(id: string): Promise<void> {
  await db
    .update(task)
    .set({ completedOn: null })
    .where(and(eq(task.id, id), isNotNull(task.completedOn), isNull(task.deletedAt)));
}

/** AC-4.1 to AC-4.3: change title and due of an open task. */
export async function updateTask(id: string, title: string, due: Due): Promise<void> {
  await db.update(task).set({ title, dueDate: due.date, dueTime: due.time }).where(isOpen(id));
}

/** AC-5.1, D-2: soft delete. The row stays but is never listed or counted again (BR-8). */
export async function deleteTask(id: string): Promise<void> {
  await db.update(task).set({ deletedAt: new Date() }).where(isOpen(id));
}

/** AC-6.2: undo "delete" — the task comes back exactly as it was. */
export async function restoreTask(id: string): Promise<void> {
  await db.update(task).set({ deletedAt: null }).where(and(eq(task.id, id), isNotNull(task.deletedAt)));
}
