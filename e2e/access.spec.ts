/**
 * Access control, end to end (spec 003 AC-1.3, last two rows).
 * Covers spec 001 AC-2.1 and AC-3.2, spec 002 AC-S.1, with the real session and allowlist check
 * (plan 003 §4). The Google round-trip itself stays in UAT (spec 003 OQ-1).
 */
import { STRANGER_STATE } from "./support/env";
import { expect, test } from "./support/fixtures";

const PRIVATE_TITLE = "Submit lab report";

// One private task in the database, so "sees no task" means something.
// (The database is emptied before each test by the resetDb fixture.)
test.beforeEach(async ({ seedTasks }) => {
  await seedTasks([{ title: PRIVATE_TITLE }]);
});

test.describe("signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("spec 001 AC-2.1 — / sends a signed-out visitor to /sign-in, with a single Google button @phone", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByRole("button")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    await expect(page.getByText(PRIVATE_TITLE)).toHaveCount(0);
  });
});

test.describe("signed in as the owner", () => {
  test("allowlisted session — sees the usage line and the task list @phone", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByText(/Used \d+ of the last 7 days/)).toBeVisible();
    await expect(page.getByRole("region", { name: "Tasks" }).getByText(PRIVATE_TITLE)).toBeVisible();
  });
});

test.describe("signed in as a stranger (valid session, email not in the allowlist)", () => {
  test.use({ storageState: STRANGER_STATE });

  test("spec 001 AC-3.2, spec 002 AC-S.1 — is sent to /sign-in and sees no task @phone", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    await expect(page.getByText(PRIVATE_TITLE)).toHaveCount(0);
  });

  test("spec 002 AC-S.1 — the server sends no private data, not even inside the streamed page", async ({ request }) => {
    // The home page streams (CLAUDE.md: never rely on a layout check). Read the raw response,
    // without following the redirect, to prove the task never left the server.
    const response = await request.get("/", { maxRedirects: 0 });
    const body = await response.text();

    expect(body).toContain("/sign-in");
    expect(body).not.toContain(PRIVATE_TITLE);
    expect(body).not.toMatch(/Used .* of the last 7 days/);
  });
});
