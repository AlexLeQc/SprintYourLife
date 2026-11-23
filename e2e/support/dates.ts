/**
 * Toronto dates for end-to-end test data (spec 003 AC-1.5, plan 003 §5.2).
 *
 * Built from the app's own pure date rules (src/domain/local-date.ts), so the tests and the
 * server agree on "today" whatever the machine's time zone (CI runs in UTC).
 */
import { addDays, localNow, type LocalDate } from "../../src/domain/local-date.ts";

/** The calendar days test data is built from (plan §5.2). */
export interface TorontoDays {
  /** "Overdue" (date only). */
  yesterday: LocalDate;
  /** "Soon"; at 00:00 it is also "overdue timed". */
  today: LocalDate;
  /** "Soon". */
  tomorrow: LocalDate;
  /** "Later": far enough to be neither overdue nor soon. */
  inAWeek: LocalDate;
}

export function torontoDays(instant: Date = new Date()): TorontoDays {
  const today = localNow(instant).date;
  return {
    yesterday: addDays(today, -1),
    today,
    tomorrow: addDays(today, 1),
    inAWeek: addDays(today, 7),
  };
}

/** How close to midnight (Toronto) a test may start, in minutes, before the guard makes it wait. */
export const MIDNIGHT_MARGIN_MINUTES = 2;

const MINUTE_MS = 60_000;
const DAY_MINUTES = 24 * 60;

/**
 * Midnight guard (plan §5.2): how long a test must wait before seeding so that "today" can't
 * change between the moment the test builds its data and the moment the server renders it.
 *
 * - From 23:58 to midnight: wait until 00:02.
 * - From midnight to 00:02: wait until 00:02.
 * - Otherwise: 0.
 *
 * Toronto's daylight-saving changes happen at 02:00, never near midnight.
 */
export function midnightWaitMs(instant: Date = new Date()): number {
  const [hours, minutes] = localNow(instant).time.split(":").map(Number);
  // Toronto's UTC offset is a whole number of hours, so seconds and milliseconds match UTC.
  const withinMinuteMs = instant.getUTCSeconds() * 1000 + instant.getUTCMilliseconds();
  const sinceMidnightMs = (hours * 60 + minutes) * MINUTE_MS + withinMinuteMs;

  const marginMs = MIDNIGHT_MARGIN_MINUTES * MINUTE_MS;
  const dayMs = DAY_MINUTES * MINUTE_MS;

  if (sinceMidnightMs < marginMs) return marginMs - sinceMidnightMs;
  if (sinceMidnightMs >= dayMs - marginMs) return dayMs + marginMs - sinceMidnightMs;
  return 0;
}
