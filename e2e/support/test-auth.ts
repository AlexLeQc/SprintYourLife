/**
 * Test-only Better Auth instance (spec 003 OQ-1 option A, TR-3; plan 003 §4).
 *
 * It uses Better Auth's official `testUtils` plugin to create users and sessions directly in the
 * throwaway test database, and returns the signed session cookie for the browser.
 *
 * - Lives in e2e/, outside src/ and outside the Next.js build: the app never imports it
 *   (enforced by ESLint), so this way of getting a session does not exist in production.
 * - Same secret, base URL and tables as the app under test, so the app reads these sessions
 *   exactly as it reads real ones, then applies its own allowlist check.
 * - No allowlist hook here on purpose: the stranger's session must exist, so that the test
 *   proves the *app* refuses it.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import * as schema from "../../src/server/db/schema";
import { testDb } from "./db";
import { e2eAppEnv } from "./env";

const appEnv = e2eAppEnv();

export const testAuth = betterAuth({
  database: drizzleAdapter(testDb(), { provider: "pg", schema }),
  secret: appEnv.BETTER_AUTH_SECRET,
  baseURL: appEnv.BETTER_AUTH_URL,
  plugins: [testUtils()],
});
