/**
 * Spec 002 — Tasks. Business rules BR-1 to BR-7, pure TypeScript.
 * Dates and times are Toronto wall-clock values (ADR-0013): "YYYY-MM-DD" and "HH:MM".
 * BR-8 (deleted tasks excluded) is enforced by the repository.
 */
import { addDays, type LocalDate, type LocalNow, type LocalTime } from "./local-date";
import type { Result } from "./result";

// BR-1 is shared with sidequests (plan 004 §2); re-exported so task code keeps one import.
export type { Result } from "./result";
export { normalizeTitle, TITLE_MAX_LENGTH, type TitleError } from "./title";

/** A task's due: no date, a date, or a date + time. A time never exists without a date (BR-2). */
export interface Due {
  date: LocalDate | null;
  time: LocalTime | null;
}

export const NO_DUE: Due = { date: null, time: null };

// ── BR-2 ─────────────────────────────────────────────────────────────────────

export type DueError = "invalid_date" | "invalid_time" | "time_without_date";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRealDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * BR-2: a due is none, a date, or a date + time. Empty strings (blank form fields) mean "none".
 * A past date is allowed.
 */
export function parseDue(date?: string | null, time?: string | null): Result<Due, DueError> {
  const d = date?.trim() || null;
  const t = time?.trim() || null;
  if (d !== null && !isRealDate(d)) return { ok: false, error: "invalid_date" };
  if (t !== null && !TIME_PATTERN.test(t)) return { ok: false, error: "invalid_time" };
  if (t !== null && d === null) return { ok: false, error: "time_without_date" };
  return { ok: true, value: { date: d, time: t } };
}

// ── BR-3 ─────────────────────────────────────────────────────────────────────

export interface SortableTask {
  due: Due;
  createdAt: Date;
}

/**
 * BR-3: dated tasks first, by date; on the same date, timed tasks by time, then date-only
 * ("by end of day"); then undated tasks. Ties (and undated tasks) go oldest created first.
 */
export function compareOpenTasks(a: SortableTask, b: SortableTask): number {
  const byDue = compareDue(a.due, b.due);
  if (byDue !== 0) return byDue;
  return a.createdAt.getTime() - b.createdAt.getTime();
}

function compareDue(a: Due, b: Due): number {
  if (a.date === null || b.date === null) {
    if (a.date === b.date) return 0;
    return a.date === null ? 1 : -1;
  }
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.time === null || b.time === null) {
    if (a.time === b.time) return 0;
    return a.time === null ? 1 : -1;
  }
  return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
}

// ── BR-4 ─────────────────────────────────────────────────────────────────────

/** BR-4: a task marked done records today's local (Toronto) date. */
export function completionDate(now: LocalNow): LocalDate {
  return now.date;
}

// ── BR-5 ─────────────────────────────────────────────────────────────────────

/**
 * BR-5: an open task is overdue when its date is before today (date-only),
 * or its date + time is before now (timed). Due exactly now is not overdue yet.
 */
export function isOverdue(due: Due, now: LocalNow): boolean {
  if (due.date === null) return false;
  if (due.date !== now.date) return due.date < now.date;
  return due.time !== null && due.time < now.time;
}

// ── BR-7 ─────────────────────────────────────────────────────────────────────

export type Urgency = "overdue" | "soon" | "none";

/** BR-7: overdue (red), else soon (amber) when due today or tomorrow, else none. */
export function urgency(due: Due, now: LocalNow): Urgency {
  if (due.date === null) return "none";
  if (isOverdue(due, now)) return "overdue";
  if (due.date === now.date || due.date === addDays(now.date, 1)) return "soon";
  return "none";
}

// ── BR-6 ─────────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Thu, Nov 20", plus ", 2027" only when the year differs from `currentYear`. */
function shortDate(date: LocalDate, currentYear: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  const label = `${weekday}, ${MONTHS[month - 1]} ${day}`;
  return year === currentYear ? label : `${label}, ${year}`;
}

/** "14:00" → "2:00 p.m.", "00:30" → "12:30 a.m.", "12:00" → "12:00 p.m." */
export function formatTime(time: LocalTime): string {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour < 12 ? "a.m." : "p.m.";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/**
 * BR-6: "Today" / "Tomorrow" / "Thu, Nov 20" (year added only when it differs),
 * then the time when set. Overdue: "Was due today 2:00 p.m." / "Was due Mon, Nov 17".
 * Returns null for a task without a date.
 */
export function dueLabel(due: Due, now: LocalNow): string | null {
  if (due.date === null) return null;
  const currentYear = Number(now.date.slice(0, 4));
  const time = due.time === null ? "" : ` ${formatTime(due.time)}`;

  if (isOverdue(due, now)) {
    const day = due.date === now.date ? "today" : shortDate(due.date, currentYear);
    return `Was due ${day}${time}`;
  }
  const day =
    due.date === now.date
      ? "Today"
      : due.date === addDays(now.date, 1)
        ? "Tomorrow"
        : shortDate(due.date, currentYear);
  return `${day}${time}`;
}
