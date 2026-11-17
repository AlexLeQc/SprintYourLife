/**
 * BR-4 — "Used N of the last 7 days" counts usage days from today back to
 * (n - 1) days ago, inclusive.
 */
import { addDays, type LocalDate } from "./local-date";

export function countUsedLastNDays(
  usageDays: Iterable<LocalDate>,
  today: LocalDate,
  n: number,
): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`countUsedLastNDays: n must be a positive integer, got ${n}`);
  }
  const firstDay = addDays(today, -(n - 1));
  // A Set guards against duplicates even though BR-3 already prevents them.
  const inWindow = new Set(
    [...usageDays].filter((day) => day >= firstDay && day <= today),
  );
  return inWindow.size;
}
