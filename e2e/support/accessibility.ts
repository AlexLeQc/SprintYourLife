/**
 * Accessibility scan with axe (spec 003 US-6, plan 003 §5.6).
 * WCAG 2.0 and 2.1, levels A and AA. Any violation fails the test, whatever its impact (AC-6.2),
 * with the full axe report attached and a one-line summary per finding in the error.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * `state` names the screen state when one test scans several (spec 004 plan D-4, walk-through):
 * it goes into the attachment's name and the failure message, so the failing state is obvious.
 */
export async function expectNoAccessibilityViolations(page: Page, testInfo: TestInfo, state?: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  await testInfo.attach(state ? `axe-violations-${state}.json` : "axe-violations.json", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });

  // "color-contrast (serious) ×2: Elements must meet minimum color contrast ratio thresholds — p, span"
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.help} — ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  const where = state ? ` in state "${state}"` : "";
  expect(summary, `accessibility violations${where} (axe, WCAG 2.1 A + AA)`).toEqual([]);
}
