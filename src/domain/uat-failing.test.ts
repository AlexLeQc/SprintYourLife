import { describe, expect, it } from "vitest";
import { isAllowed } from "./allowlist";

// UAT for AC-6.2 — DELIBERATELY FAILING. This PR must show a red CI check,
// must not be mergeable, and must be closed without merging.
describe("UAT AC-6.2 (deliberately failing)", () => {
  it("would let a stranger in — this must fail", () => {
    expect(isAllowed("stranger@example.com", ["owner@example.com"])).toBe(true);
  });
});
