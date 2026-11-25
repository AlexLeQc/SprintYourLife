/**
 * Adding a sidequest, end to end (spec 004 US-1: AC-1.1 to AC-1.5).
 * The only place sidequests are added through the UI; other tests seed them.
 */
import { expect, test } from "./support/fixtures";
import {
  addSidequest,
  allStoredSidequests,
  bankRegion,
  categoryChoice,
  expectSaved,
  newSidequestInput,
  pickCategory,
  sidequestItems,
  storedSidequests,
} from "./support/sidequests-page";

const CATEGORY_NAMES = ["Create", "Learn", "Play", "Connect", "Move"];

test.beforeEach(async ({ page }) => {
  await page.goto("/sidequests");
});

test("spec 004 AC-1.1, AC-1.2 — title + category, confirmed with Return: listed in its category, saved, form cleared with no category @phone", async ({
  page,
}) => {
  await addSidequest(page, "Build a Lego set", "Create");

  await expect(newSidequestInput(page)).toHaveValue("");
  for (const name of CATEGORY_NAMES) await expect(categoryChoice(page, name)).not.toBeChecked();
  await expectSaved(page, "Create", "Build a Lego set");

  const [saved] = await storedSidequests("Build a Lego set");
  expect(saved).toMatchObject({ category: "create", deletedAt: null });

  // Still there after a reload: it came from the database, not only from the browser.
  await page.reload();
  await expect(sidequestItems(page, "Create")).toHaveText(["Build a Lego set"]);
});

test("spec 004 AC-1.1 — the Add button works too", async ({ page }) => {
  await newSidequestInput(page).fill("Learn the Rubik's cube");
  await pickCategory(page, "Learn");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expectSaved(page, "Learn", "Learn the Rubik's cube");
  await expect(newSidequestInput(page)).toHaveValue("");
});

test("spec 004 AC-1.2 — no category is selected when the page opens", async ({ page }) => {
  for (const name of CATEGORY_NAMES) await expect(categoryChoice(page, name)).not.toBeChecked();
});

test("spec 004 AC-1.3 — no category: nothing saved, a message asks for one, the title is kept", async ({ page }) => {
  await newSidequestInput(page).fill("Play Catan online");
  await newSidequestInput(page).press("Enter");

  await expect(bankRegion(page).getByRole("alert")).toHaveText("Pick a category.");
  await expect(newSidequestInput(page)).toHaveValue("Play Catan online");
  expect(await allStoredSidequests()).toHaveLength(0);

  // Picking one then confirming adds it, from the same kept title.
  await pickCategory(page, "Play");
  await newSidequestInput(page).press("Enter");
  await expectSaved(page, "Play", "Play Catan online");
  await expect(bankRegion(page).getByRole("alert")).toHaveCount(0);
});

test("spec 004 AC-1.4 — a blank title is ignored: nothing saved, no message", async ({ page }) => {
  await addSidequest(page, "   ", "Move");

  await expect(bankRegion(page).getByRole("alert")).toHaveCount(0);
  await expect(bankRegion(page).getByRole("listitem")).toHaveCount(0);
  expect(await allStoredSidequests()).toHaveLength(0);
});

test("spec 004 AC-1.5 — a 201-character title is refused with a short message, and the text is kept", async ({ page }) => {
  const tooLong = "x".repeat(201);
  await addSidequest(page, tooLong, "Connect");

  await expect(bankRegion(page).getByRole("alert")).toHaveText("Title is too long (200 characters max).");
  await expect(newSidequestInput(page)).toHaveValue(tooLong);
  expect(await allStoredSidequests()).toHaveLength(0);
});
