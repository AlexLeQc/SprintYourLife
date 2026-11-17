/**
 * BR-2 — "Today" is computed in the app's time zone, whatever the server's time zone.
 * Dates are plain calendar strings in ISO format: "YYYY-MM-DD".
 */

/** The time zone every "day" in the app is based on (architecture §4). */
export const APP_TIME_ZONE = "America/Toronto";

/** A calendar date as "YYYY-MM-DD". */
export type LocalDate = string;

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Returns the calendar date of `instant` as seen in `timeZone`. */
export function localDate(instant: Date, timeZone: string = APP_TIME_ZONE): LocalDate {
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError("localDate: invalid instant");
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Adds `days` (may be negative) to a calendar date. Pure calendar math, no time zone involved. */
export function addDays(date: LocalDate, days: number): LocalDate {
  if (!LOCAL_DATE_PATTERN.test(date)) {
    throw new RangeError(`addDays: expected YYYY-MM-DD, got "${date}"`);
  }
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}
