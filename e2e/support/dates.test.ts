/**
 * Unit tests for the end-to-end date helpers (spec 003 AC-1.5, plan 003 §5.2).
 * Run by Vitest (npm test), not by Playwright.
 */
import { describe, expect, it } from "vitest";
import { midnightWaitMs, torontoDays } from "./dates";

const MINUTE = 60_000;

// Toronto is UTC-5 in winter (EST) and UTC-4 in summer (EDT).
describe("torontoDays — AC-1.5: test data uses the Toronto date, not the machine's", () => {
  it("at 23:30 Toronto (04:30 UTC the next day), today is still the Toronto date", () => {
    const days = torontoDays(new Date("2026-11-24T04:30:00Z"));
    expect(days).toEqual({
      yesterday: "2026-11-22",
      today: "2026-11-23",
      tomorrow: "2026-11-24",
      inAWeek: "2026-11-30",
    });
  });

  it("crosses month and year ends", () => {
    expect(torontoDays(new Date("2026-12-31T17:00:00Z"))).toEqual({
      yesterday: "2026-12-30",
      today: "2026-12-31",
      tomorrow: "2027-01-01",
      inAWeek: "2027-01-07",
    });
  });
});

describe("midnightWaitMs — AC-1.5: midnight guard", () => {
  it("does not wait during the day", () => {
    expect(midnightWaitMs(new Date("2026-11-23T17:00:00Z"))).toBe(0); // 12:00 Toronto
  });

  it("does not wait at 23:57:59.999 Toronto", () => {
    expect(midnightWaitMs(new Date("2026-11-24T04:57:59.999Z"))).toBe(0);
  });

  it("waits until 00:02 from 23:58 Toronto", () => {
    expect(midnightWaitMs(new Date("2026-11-24T04:58:00Z"))).toBe(4 * MINUTE);
  });

  it("waits until 00:02 from 23:59:30 Toronto", () => {
    expect(midnightWaitMs(new Date("2026-11-24T04:59:30Z"))).toBe(2.5 * MINUTE);
  });

  it("waits until 00:02 from 00:01:15 Toronto", () => {
    expect(midnightWaitMs(new Date("2026-11-24T05:01:15Z"))).toBe(45_000);
  });

  it("does not wait from 00:02 Toronto", () => {
    expect(midnightWaitMs(new Date("2026-11-24T05:02:00Z"))).toBe(0);
  });

  it("uses Toronto midnight in summer time too (UTC-4)", () => {
    expect(midnightWaitMs(new Date("2026-07-01T03:59:00Z"))).toBe(3 * MINUTE); // 23:59 EDT
    expect(midnightWaitMs(new Date("2026-07-01T04:59:00Z"))).toBe(0); // 00:59 EDT
  });

  it("ignores midnight UTC (19:00 or 20:00 Toronto)", () => {
    expect(midnightWaitMs(new Date("2026-11-24T00:00:30Z"))).toBe(0);
  });
});
