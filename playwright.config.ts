/**
 * End-to-end tests (spec 003, plan 003, ADR-0015).
 *
 * Locally:  npm run e2e:db   then   npm run e2e
 * The app under test is a production build (`next build` + `next start`) on port 3100,
 * pointed at the throwaway database with fake data only.
 */
import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL, E2E_PORT, OWNER_STATE, e2eAppEnv } from "./e2e/support/env";

const CI = !!process.env.CI;
const SCREENSHOTS = process.env.SCREENSHOTS === "1";
const SCREENSHOTS_SPEC = /screenshots\.spec\.ts$/;

export default defineConfig({
  testDir: "e2e",
  // Only *.spec.ts: e2e/support/*.test.ts are Vitest unit tests.
  testMatch: "**/*.spec.ts",
  globalSetup: "./e2e/support/global-setup.ts",

  // Plan §5.1: tasks have no owner column, so tests share one table → one test at a time.
  fullyParallel: false,
  workers: 1,

  forbidOnly: CI,
  // Plan §5.7, D-3: one retry only to *label* a flaky test; the run still fails.
  retries: CI ? 1 : 0,
  failOnFlakyTests: CI,

  reporter: CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: E2E_BASE_URL,
    // Plan §5.2: the browser lives in Toronto, whatever the machine's time zone (CI runs in UTC).
    timezoneId: "America/Toronto",
    locale: "en-US",
    // Signed in as the owner by default; access tests override this.
    storageState: OWNER_STATE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: SCREENSHOTS_SPEC },
    // Plan §5.5: Chromium with a phone viewport and touch; only tests tagged @phone.
    { name: "phone", use: { ...devices["Pixel 7"] }, grep: /@phone/, testIgnore: SCREENSHOTS_SPEC },
    // Plan §5.9: README screenshots, only with `npm run screenshots` (never in CI or `npm run e2e`).
    ...(SCREENSHOTS ? [{ name: "screenshots", use: { ...devices["Desktop Chrome"] }, testMatch: SCREENSHOTS_SPEC }] : []),
  ],

  webServer: {
    // Built here, not in a separate CI step, so the build and the server get the same test
    // environment from one place (e2eAppEnv), locally and in CI.
    command: `npx next build && npx next start -p ${E2E_PORT}`,
    url: `${E2E_BASE_URL}/sign-in`,
    reuseExistingServer: !CI,
    timeout: 180_000,
    env: e2eAppEnv(),
  },
});
