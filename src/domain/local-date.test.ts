import { describe, expect, it } from "vitest";
import { APP_TIME_ZONE, addDays, localDate, localNow, localTime } from "./local-date";

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

describe("localTime (spec 002, ADR-0013)", () => {
  it("returns the Toronto wall-clock time as HH:MM, 24-hour", () => {
    expect(localTime(new Date("2026-11-20T19:00:00Z"))).toBe("14:00");
  });

  it("shows midnight as 00:00, never 24:00", () => {
    expect(localTime(new Date("2026-11-21T05:00:00Z"))).toBe("00:00");
  });

  it("handles the spring daylight-saving switch (UTC-5 before, UTC-4 after)", () => {
    expect(localTime(new Date("2026-03-08T06:59:00Z"))).toBe("01:59");
    expect(localTime(new Date("2026-03-08T07:00:00Z"))).toBe("03:00");
  });

  it("handles the fall daylight-saving switch (1:00-2:00 a.m. happens twice)", () => {
    expect(localTime(new Date("2026-11-01T05:30:00Z"))).toBe("01:30");
    expect(localTime(new Date("2026-11-01T06:30:00Z"))).toBe("01:30");
    expect(localTime(new Date("2026-11-01T07:00:00Z"))).toBe("02:00");
  });

  it("rejects an invalid instant", () => {
    expect(() => localTime(new Date("not a date"))).toThrow(RangeError);
  });
});

describe("localNow (spec 002 BR-4, ADR-0013)", () => {
  it("23:59 in Toronto is 04:59 UTC the next day: the date stays Toronto's", () => {
    expect(localNow(new Date("2026-11-21T04:59:00Z"))).toEqual({ date: "2026-11-20", time: "23:59" });
  });

  it("agrees with localDate and localTime", () => {
    const instant = new Date("2026-07-01T16:05:00Z");
    expect(localNow(instant)).toEqual({ date: localDate(instant), time: localTime(instant) });
    expect(localNow(instant)).toEqual({ date: "2026-07-01", time: "12:05" });
  });
});
