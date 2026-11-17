/**
 * BR-2 — "Today" is computed in the app's time zone, whatever the server's time zone.
 * Dates are plain calendar strings in ISO format: "YYYY-MM-DD".
 */

/** The time zone every "day" in the app is based on (architecture §4). */
export const APP_TIME_ZONE = "America/Toronto";

/** A calendar date as "YYYY-MM-DD". */
export type LocalDate = string;

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** A wall-clock time as "HH:MM" (24-hour). */
export type LocalTime = string;

/** "Now" as seen on a wall clock in the app's time zone (ADR-0013). */
export interface LocalNow {
  date: LocalDate;
  time: LocalTime;
}

function wallClockParts(instant: Date, timeZone: string, caller: string) {
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError(`${caller}: invalid instant`);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23", // "00".."23": never "24:00" at midnight
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

/** Returns the calendar date of `instant` as seen in `timeZone`. */
export function localDate(instant: Date, timeZone: string = APP_TIME_ZONE): LocalDate {
  return wallClockParts(instant, timeZone, "localDate").date;
}

/** Returns the wall-clock time ("HH:MM", 24-hour) of `instant` as seen in `timeZone`. */
export function localTime(instant: Date, timeZone: string = APP_TIME_ZONE): LocalTime {
  return wallClockParts(instant, timeZone, "localTime").time;
}

/** Date and time of `instant` in `timeZone`, read from one clock reading so they always agree. */
export function localNow(instant: Date, timeZone: string = APP_TIME_ZONE): LocalNow {
  return wallClockParts(instant, timeZone, "localNow");
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
