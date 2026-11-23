/**
 * Runs once before the end-to-end suite (plan 003 §4):
 * 1. migrate the throwaway database;
 * 2. start from no users and no sessions;
 * 3. create the owner (allowlisted) and the stranger (not allowlisted) with Better Auth's testUtils;
 * 4. save each one's signed session cookie as a Playwright storage state.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { testDb } from "./db";
import { AUTH_DIR, OWNER_EMAIL, OWNER_STATE, STRANGER_EMAIL, STRANGER_STATE } from "./env";
import { migrateTestDatabase } from "./migrate";
import { testAuth } from "./test-auth";

async function saveSignedInState(email: string, name: string, path: string) {
  const test = (await testAuth.$context).test;
  const user = await test.saveUser(test.createUser({ email, name, emailVerified: true }));
  const cookies = await test.getCookies({ userId: user.id, domain: "localhost" });
  const state = {
    cookies: cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires ?? -1,
      httpOnly: c.httpOnly ?? true,
      secure: c.secure ?? false,
      sameSite: c.sameSite ?? "Lax",
    })),
    origins: [],
  };
  await writeFile(path, JSON.stringify(state, null, 2));
}

export default async function globalSetup() {
  await migrateTestDatabase();
  // Sessions, accounts and tasks of earlier runs go too: every run starts from the same state.
  await testDb().execute(sql`TRUNCATE "user", session, account, verification, task, usage_day CASCADE`);
  await mkdir(AUTH_DIR, { recursive: true });
  await saveSignedInState(OWNER_EMAIL, "Test Owner", OWNER_STATE);
  await saveSignedInState(STRANGER_EMAIL, "Test Stranger", STRANGER_STATE);
}
