import "server-only";
import { and, isNull } from "drizzle-orm";
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
