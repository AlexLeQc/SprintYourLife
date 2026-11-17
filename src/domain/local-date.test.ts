import { describe, expect, it } from "vitest";
import { APP_TIME_ZONE, addDays, localDate } from "./local-date";

describe("localDate (BR-2)", () => {
  it("uses America/Toronto by default", () => {
    expect(APP_TIME_ZONE).toBe("America/Toronto");
  });

  it("AC-5.3: Saturday 11:30 p.m. in Sherbrooke (Sunday 04:30 UTC) is Saturday", () => {
    const sundayUtc = new Date("2026-11-22T04:30:00Z");
    expect(localDate(sundayUtc)).toBe("2026-11-21");
  });

  it("switches to the next day at local midnight, not UTC midnight", () => {
    expect(localDate(new Date("2026-11-22T04:59:59Z"))).toBe("2026-11-21");
    expect(localDate(new Date("2026-11-22T05:00:00Z"))).toBe("2026-11-22");
  });

  it("handles the spring daylight-saving switch (2026-03-08, UTC-4 afterwards)", () => {
    expect(localDate(new Date("2026-03-09T03:59:00Z"))).toBe("2026-03-08");
    expect(localDate(new Date("2026-03-09T04:00:00Z"))).toBe("2026-03-09");
  });

  it("handles the fall daylight-saving switch (2026-11-01, UTC-5 afterwards)", () => {
    expect(localDate(new Date("2026-11-02T04:59:00Z"))).toBe("2026-11-01");
    expect(localDate(new Date("2026-11-02T05:00:00Z"))).toBe("2026-11-02");
  });

  it("accepts another time zone", () => {
    expect(localDate(new Date("2026-11-22T04:30:00Z"), "UTC")).toBe("2026-11-22");
  });

  it("rejects an invalid instant", () => {
    expect(() => localDate(new Date("not a date"))).toThrow(RangeError);
  });
});

describe("addDays", () => {
  it("adds and subtracts days", () => {
    expect(addDays("2026-11-21", 1)).toBe("2026-11-22");
    expect(addDays("2026-11-21", -6)).toBe("2026-11-15");
  });

  it("crosses month and year boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("is not affected by daylight-saving switches", () => {
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
  });

  it("rejects a malformed date", () => {
    expect(() => addDays("21/11/2026", 1)).toThrow(RangeError);
  });
});
