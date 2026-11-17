import { describe, expect, it } from "vitest";
import { countUsedLastNDays } from "./usage";

const TODAY = "2026-11-21";

describe("countUsedLastNDays (BR-4)", () => {
  it("returns 0 when there are no usage days", () => {
    expect(countUsedLastNDays([], TODAY, 7)).toBe(0);
  });

  it("includes today", () => {
    expect(countUsedLastNDays(["2026-11-21"], TODAY, 7)).toBe(1);
  });

  it("includes the 7th day back (today - 6) and excludes the 8th (today - 7)", () => {
    expect(countUsedLastNDays(["2026-11-15"], TODAY, 7)).toBe(1);
    expect(countUsedLastNDays(["2026-11-14"], TODAY, 7)).toBe(0);
  });

  it("counts every day used in the window", () => {
    const days = ["2026-11-14", "2026-11-15", "2026-11-18", "2026-11-20", "2026-11-21"];
    expect(countUsedLastNDays(days, TODAY, 7)).toBe(4);
  });

  it("counts a day once even if it appears twice", () => {
    expect(countUsedLastNDays(["2026-11-20", "2026-11-20"], TODAY, 7)).toBe(1);
  });

  it("ignores days after today", () => {
    expect(countUsedLastNDays(["2026-11-22"], TODAY, 7)).toBe(0);
  });

  it("works across a month boundary", () => {
    expect(countUsedLastNDays(["2026-11-28", "2026-12-02"], "2026-12-02", 7)).toBe(2);
  });

  it("rejects a window that is not a positive integer", () => {
    expect(() => countUsedLastNDays([], TODAY, 0)).toThrow(RangeError);
    expect(() => countUsedLastNDays([], TODAY, 2.5)).toThrow(RangeError);
  });
});
