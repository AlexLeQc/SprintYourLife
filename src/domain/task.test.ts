import { describe, expect, it } from "vitest";
import { localNow } from "./local-date";
import {
  compareOpenTasks,
  completionDate,
  dueLabel,
  formatTime,
  isOverdue,
  NO_DUE,
  normalizeTitle,
  parseDue,
  urgency,
  type Due,
  type SortableTask,
} from "./task";

/** Wednesday 2026-11-18, 2:30 p.m. in Toronto. */
const NOW = { date: "2026-11-18", time: "14:30" };
const due = (date: string | null, time: string | null = null): Due => ({ date, time });

describe("normalizeTitle (BR-1)", () => {
  it("trims surrounding spaces", () => {
    expect(normalizeTitle("  Buy milk ")).toEqual({ ok: true, value: "Buy milk" });
  });

  it("AC-1.4: refuses an empty or blank title", () => {
    expect(normalizeTitle("")).toEqual({ ok: false, error: "empty" });
    expect(normalizeTitle("   \n\t ")).toEqual({ ok: false, error: "empty" });
  });

  it("AC-1.5: accepts 200 characters, refuses 201", () => {
    expect(normalizeTitle("a".repeat(200)).ok).toBe(true);
    expect(normalizeTitle("a".repeat(201))).toEqual({ ok: false, error: "too_long" });
  });

  it("counts length after trimming", () => {
    expect(normalizeTitle(`  ${"a".repeat(200)}  `).ok).toBe(true);
  });

  it("counts an emoji as one character, like PostgreSQL char_length", () => {
    expect(normalizeTitle("🎉".repeat(200)).ok).toBe(true);
    expect(normalizeTitle("🎉".repeat(201)).ok).toBe(false);
  });
});

describe("parseDue (BR-2)", () => {
  it("accepts no due, including blank form fields", () => {
    expect(parseDue()).toEqual({ ok: true, value: NO_DUE });
    expect(parseDue("", "")).toEqual({ ok: true, value: NO_DUE });
  });

  it("AC-1.2: accepts a date only", () => {
    expect(parseDue("2026-11-20")).toEqual({ ok: true, value: due("2026-11-20") });
  });

  it("AC-1.3: accepts a date and a time", () => {
    expect(parseDue("2026-11-20", "14:00")).toEqual({ ok: true, value: due("2026-11-20", "14:00") });
  });

  it("AC-1.3: refuses a time without a date", () => {
    expect(parseDue("", "14:00")).toEqual({ ok: false, error: "time_without_date" });
  });

  it("refuses dates that don't exist or are malformed", () => {
    expect(parseDue("2026-02-30")).toEqual({ ok: false, error: "invalid_date" });
    expect(parseDue("2026-13-01")).toEqual({ ok: false, error: "invalid_date" });
    expect(parseDue("20/11/2026")).toEqual({ ok: false, error: "invalid_date" });
  });

  it("accepts Feb 29 in a leap year only", () => {
    expect(parseDue("2028-02-29").ok).toBe(true);
    expect(parseDue("2027-02-29").ok).toBe(false);
  });

  it("refuses invalid times", () => {
    expect(parseDue("2026-11-20", "24:00")).toEqual({ ok: false, error: "invalid_time" });
    expect(parseDue("2026-11-20", "9:00")).toEqual({ ok: false, error: "invalid_time" });
    expect(parseDue("2026-11-20", "12:60")).toEqual({ ok: false, error: "invalid_time" });
  });

  it("accepts a past date", () => {
    expect(parseDue("2020-01-01").ok).toBe(true);
  });
});

describe("compareOpenTasks (BR-3)", () => {
  const task = (name: string, d: Due, createdMinute: number) => ({
    name,
    due: d,
    createdAt: new Date(Date.UTC(2026, 10, 1, 12, createdMinute)),
  });
  const sorted = (tasks: (SortableTask & { name: string })[]) =>
    [...tasks].sort(compareOpenTasks).map((t) => t.name);

  it("AC-2.1: dated first by date, timed before date-only on the same day, undated last", () => {
    expect(
      sorted([
        task("no date (old)", NO_DUE, 0),
        task("next week", due("2026-11-25"), 1),
        task("today", due("2026-11-18"), 2),
        task("no date (new)", NO_DUE, 3),
        task("today 9 a.m.", due("2026-11-18", "09:00"), 4),
        task("today 8 a.m.", due("2026-11-18", "08:00"), 5),
        task("tomorrow", due("2026-11-19"), 6),
      ]),
    ).toEqual(["today 8 a.m.", "today 9 a.m.", "today", "tomorrow", "next week", "no date (old)", "no date (new)"]);
  });

  it("puts an overdue date first", () => {
    expect(sorted([task("today", due("2026-11-18"), 0), task("last week", due("2026-11-11"), 1)])).toEqual([
      "last week",
      "today",
    ]);
  });

  it("keeps creation order on a tie", () => {
    expect(sorted([task("second", due("2026-11-20", "10:00"), 5), task("first", due("2026-11-20", "10:00"), 1)])).toEqual([
      "first",
      "second",
    ]);
  });
});

describe("completionDate (BR-4)", () => {
  it("AC-3.1: done at 23:59 in Toronto (04:59 UTC next day) records the Toronto date", () => {
    expect(completionDate(localNow(new Date("2026-11-19T04:59:00Z")))).toBe("2026-11-18");
  });
});

describe("isOverdue (BR-5)", () => {
  it("date-only: overdue only once the day is over", () => {
    expect(isOverdue(due("2026-11-17"), NOW)).toBe(true);
    expect(isOverdue(due("2026-11-18"), NOW)).toBe(false);
    expect(isOverdue(due("2026-11-19"), NOW)).toBe(false);
  });

  it("timed: overdue once the time has passed, not at the exact minute", () => {
    expect(isOverdue(due("2026-11-18", "14:29"), NOW)).toBe(true);
    expect(isOverdue(due("2026-11-18", "14:30"), NOW)).toBe(false);
    expect(isOverdue(due("2026-11-18", "15:00"), NOW)).toBe(false);
  });

  it("timed on a past day is overdue whatever the time", () => {
    expect(isOverdue(due("2026-11-17", "23:59"), NOW)).toBe(true);
  });

  it("no date is never overdue", () => {
    expect(isOverdue(NO_DUE, NOW)).toBe(false);
  });
});

describe("urgency (BR-7)", () => {
  it("AC-2.3: overdue is red", () => {
    expect(urgency(due("2026-11-17"), NOW)).toBe("overdue");
    expect(urgency(due("2026-11-18", "09:00"), NOW)).toBe("overdue");
  });

  it("AC-2.4: due today (not yet passed) or tomorrow is amber", () => {
    expect(urgency(due("2026-11-18"), NOW)).toBe("soon");
    expect(urgency(due("2026-11-18", "18:00"), NOW)).toBe("soon");
    expect(urgency(due("2026-11-19", "08:00"), NOW)).toBe("soon");
  });

  it("AC-2.5: later or undated has no colour", () => {
    expect(urgency(due("2026-11-20"), NOW)).toBe("none");
    expect(urgency(NO_DUE, NOW)).toBe("none");
  });

  it("crosses month and year boundaries", () => {
    const newYearsEve = { date: "2026-12-31", time: "12:00" };
    expect(urgency(due("2027-01-01"), newYearsEve)).toBe("soon");
    expect(urgency(due("2027-01-02"), newYearsEve)).toBe("none");
    expect(urgency(due("2026-12-01"), { date: "2026-11-30", time: "12:00" })).toBe("soon");
  });
});

describe("formatTime (BR-6)", () => {
  it("uses a 12-hour clock with a.m. / p.m.", () => {
    expect(formatTime("14:00")).toBe("2:00 p.m.");
    expect(formatTime("09:05")).toBe("9:05 a.m.");
    expect(formatTime("12:00")).toBe("12:00 p.m.");
    expect(formatTime("00:30")).toBe("12:30 a.m.");
    expect(formatTime("23:59")).toBe("11:59 p.m.");
  });
});

describe("dueLabel (BR-6)", () => {
  it("AC-2.2: Today / Tomorrow / short date, with the time when set", () => {
    expect(dueLabel(due("2026-11-18"), NOW)).toBe("Today");
    expect(dueLabel(due("2026-11-18", "18:00"), NOW)).toBe("Today 6:00 p.m.");
    expect(dueLabel(due("2026-11-19", "09:00"), NOW)).toBe("Tomorrow 9:00 a.m.");
    expect(dueLabel(due("2026-11-20"), NOW)).toBe("Fri, Nov 20");
    expect(dueLabel(due("2026-11-26", "14:00"), NOW)).toBe("Thu, Nov 26 2:00 p.m.");
  });

  it("AC-2.3: overdue says 'Was due'", () => {
    expect(dueLabel(due("2026-11-16"), NOW)).toBe("Was due Mon, Nov 16");
    expect(dueLabel(due("2026-11-18", "14:00"), NOW)).toBe("Was due today 2:00 p.m.");
    expect(dueLabel(due("2026-11-17", "09:00"), NOW)).toBe("Was due Tue, Nov 17 9:00 a.m.");
  });

  it("adds the year only when it differs from the current year (plan D-3)", () => {
    expect(dueLabel(due("2027-01-08"), NOW)).toBe("Fri, Jan 8, 2027");
    expect(dueLabel(due("2025-12-01"), NOW)).toBe("Was due Mon, Dec 1, 2025");
  });

  it("says Tomorrow across a year boundary", () => {
    expect(dueLabel(due("2027-01-01"), { date: "2026-12-31", time: "12:00" })).toBe("Tomorrow");
  });

  it("no date → no label", () => {
    expect(dueLabel(NO_DUE, NOW)).toBeNull();
  });
});
