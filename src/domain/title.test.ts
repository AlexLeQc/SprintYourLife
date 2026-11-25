import { describe, expect, it } from "vitest";
import { normalizeTitle } from "./title";

// The rule's edge cases (empty, 200/201, emoji) are tested in task.test.ts (spec 002 BR-1).
// These cases cover what spec 004 adds for sidequests.
describe("spec 004 BR-1 — sidequest title", () => {
  it("trims the title, like a task title", () => {
    expect(normalizeTitle("  Learn the Rubik's cube ")).toEqual({ ok: true, value: "Learn the Rubik's cube" });
  });

  it("has no uniqueness rule: the same title is valid twice", () => {
    expect(normalizeTitle("Lego")).toEqual(normalizeTitle("Lego"));
    expect(normalizeTitle("Lego").ok).toBe(true);
  });
});
