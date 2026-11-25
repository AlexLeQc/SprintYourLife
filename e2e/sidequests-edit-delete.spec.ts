/**
 * Editing and deleting a sidequest, end to end (spec 004 US-4: AC-4.1, AC-4.2 · US-5: AC-5.1 to
 * AC-5.3). The undo behaviour is shared with tasks (plan D-3); these tests check it for sidequests.
 */
import { expect, test } from "./support/fixtures";
import {
  bankRegion,
  categoryChoice,
  editForm,
  expectSaved,
  pickCategory,
  sidequestItems,
  storedSidequests,
  itemTexts,
} from "./support/sidequests-page";
import { editButton } from "./support/tasks-page";

const undoBar = (page: import("@playwright/test").Page) => bankRegion(page).getByRole("status");

test("spec 004 AC-4.1 — tap a title, change it, Save: the new title is shown and stored @phone", async ({
  page,
  seedSidequests,
}) => {
  const [lego] = await seedSidequests([{ title: "Lego", category: "create" }]);
  await page.goto("/sidequests");

  await editButton(bankRegion(page), "Lego").click();
  await expect(categoryChoice(page, "Create", editForm(page))).toBeChecked(); // current category shown
  await editForm(page).getByRole("textbox", { name: "Title", exact: true }).fill("Build a Lego set");
  await editForm(page).getByRole("button", { name: "Save" }).click();

  await expectSaved(page, "Create", "Build a Lego set");
  const [saved] = await storedSidequests("Build a Lego set");
  expect(saved).toMatchObject({ id: lego.id, category: "create" });
});

test("spec 004 AC-4.1 — Cancel keeps the sidequest as it was", async ({ page, seedSidequests }) => {
  await seedSidequests([{ title: "Kayak", category: "sport" }]);
  await page.goto("/sidequests");

  await editButton(bankRegion(page), "Kayak").click();
  await editForm(page).getByRole("textbox", { name: "Title", exact: true }).fill("Canoe");
  await editForm(page).getByRole("button", { name: "Cancel" }).click();

  await expect(sidequestItems(page, "Sport")).toHaveText(itemTexts(["Kayak"]));
  expect(await storedSidequests("Canoe")).toHaveLength(0);
});

test("spec 004 AC-4.2, CR-1 — moving a sidequest to another category re-files it at once and in the database", async ({
  page,
  seedSidequests,
}) => {
  await seedSidequests([
    { title: "Aquarium", category: "sport" },
    { title: "Hot yoga", category: "sport" },
  ]);
  await page.goto("/sidequests");

  await editButton(bankRegion(page), "Aquarium").click();
  await pickCategory(page, "Explore", editForm(page));
  await editForm(page).getByRole("button", { name: "Save" }).click();

  await expectSaved(page, "Explore", "Aquarium");
  await expect(sidequestItems(page, "Sport")).toHaveText(itemTexts(["Hot yoga"]));
  const [saved] = await storedSidequests("Aquarium");
  expect(saved.category).toBe("explore");
});

test("spec 004 AC-4.2 — an edit follows the title rules: a 201-character title is refused and the edit stays open", async ({
  page,
  seedSidequests,
}) => {
  await seedSidequests([{ title: "Juggling", category: "learn" }]);
  await page.goto("/sidequests");

  await editButton(bankRegion(page), "Juggling").click();
  await editForm(page).getByRole("textbox", { name: "Title", exact: true }).fill("x".repeat(201));
  await editForm(page).getByRole("button", { name: "Save" }).click();

  await expect(editForm(page).getByRole("alert")).toHaveText("Title is too long (200 characters max).");
  expect(await storedSidequests("Juggling")).toHaveLength(1);
});

test("spec 004 AC-5.1, AC-5.2 — Delete removes it at once, no dialog; Undo brings it back exactly as it was @phone", async ({
  page,
  seedSidequests,
}) => {
  const [pottery] = await seedSidequests([{ title: "Pottery", category: "create" }]);
  page.on("dialog", () => {
    throw new Error("AC-5.1: no confirmation dialog expected");
  });
  await page.goto("/sidequests");

  await editButton(bankRegion(page), "Pottery").click();
  await editForm(page).getByRole("button", { name: "Delete" }).click();

  await expect(sidequestItems(page, "Create")).toHaveCount(0);
  await expect(undoBar(page)).toContainText("Sidequest deleted");
  await expect.poll(async () => (await storedSidequests("Pottery"))[0].deletedAt).not.toBeNull();

  await undoBar(page).getByRole("button", { name: "Undo" }).click();

  await expectSaved(page, "Create", "Pottery");
  await expect.poll(async () => (await storedSidequests("Pottery"))[0]).toEqual({ ...pottery, deletedAt: null });
});

test("spec 004 AC-5.3 — once the undo bar is gone, the deletion is final, even after a reload", async ({
  page,
  seedSidequests,
}) => {
  await seedSidequests([{ title: "Bingo", category: "play" }]);
  await page.goto("/sidequests");

  await editButton(bankRegion(page), "Bingo").click();
  await editForm(page).getByRole("button", { name: "Delete" }).click();
  await expect(undoBar(page)).toBeVisible();
  await expect(undoBar(page)).toBeHidden({ timeout: 8_000 }); // about 5 seconds

  await page.reload();
  await expect(bankRegion(page).getByText("Bingo")).toHaveCount(0);
  const [stored] = await storedSidequests("Bingo");
  expect(stored.deletedAt).not.toBeNull(); // soft delete: kept for future logs, never shown (BR-5)
});
