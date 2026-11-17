import { describe, expect, it } from "vitest";
import { isAllowed, parseAllowlist } from "./allowlist";

// Fake addresses only: no real data in the repo (NFR-06).
const ALLOWLIST = ["owner@example.com"];

describe("isAllowed (BR-1)", () => {
  it("allows an email that is in the allowlist", () => {
    expect(isAllowed("owner@example.com", ALLOWLIST)).toBe(true);
  });

  it("ignores case and surrounding spaces", () => {
    expect(isAllowed("  Owner@Example.COM ", ALLOWLIST)).toBe(true);
  });

  it("AC-3.1: refuses an email that is not in the allowlist", () => {
    expect(isAllowed("stranger@example.com", ALLOWLIST)).toBe(false);
  });

  it("refuses look-alike emails", () => {
    expect(isAllowed("owner@example.com.evil.test", ALLOWLIST)).toBe(false);
    expect(isAllowed("xowner@example.com", ALLOWLIST)).toBe(false);
  });

  it("refuses a missing or blank email", () => {
    expect(isAllowed(undefined, ALLOWLIST)).toBe(false);
    expect(isAllowed(null, ALLOWLIST)).toBe(false);
    expect(isAllowed("   ", ALLOWLIST)).toBe(false);
  });

  it("refuses everyone when the allowlist is empty", () => {
    expect(isAllowed("owner@example.com", [])).toBe(false);
  });
});

describe("parseAllowlist", () => {
  it("splits on commas, trims, lowercases, drops blanks", () => {
    expect(parseAllowlist(" A@example.com, ,b@example.com ,")).toEqual([
      "a@example.com",
      "b@example.com",
    ]);
  });

  it("returns an empty list when the variable is missing or empty", () => {
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(parseAllowlist("")).toEqual([]);
  });
});
