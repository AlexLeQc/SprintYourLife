/**
 * Browsing the Bank, end to end (spec 004 US-2: AC-2.1 to AC-2.5).
 * The order rules themselves are unit-tested (BR-3, BR-4); these tests check the page shows them.
 */
import { expect, test } from "./support/fixtures";
import {
  bankRegion,
  categoryChip,
  categoryHeadings,
  categorySection,
  headingTexts,
  newSidequestInput,
  sidequestItems,
  itemTexts,
} from "./support/sidequests-page";

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);

test("spec 004 AC-2.1, AC-2.2, AC-2.4 — grouped by category, filled first, alphabetical (case and accents ignored), empty ones at the bottom, no colours", async ({
  page,
  seedSidequests,
}) => {
  await seedSidequests([
    { title: "Igloo festival", category: "explore", createdAt: minutesAgo(5) },
    { title: "Faire du pain", category: "learn", createdAt: minutesAgo(4) },
    { title: "Écrire un poème", category: "learn", createdAt: minutesAgo(3) },
    { title: "drawing", category: "learn", createdAt: minutesAgo(2) },
    { title: "Banana bread", category: "learn", createdAt: minutesAgo(1) },
  ]);
  await page.goto("/sidequests");

  // BR-3: Explore and Learn have sidequests, so they come first, in glossary order; then the empty ones.
  await expect(categoryHeadings(page)).toHaveText(headingTexts(["Explore", "Learn", "Sport", "Create", "Play", "Connect"]));
  // BR-6: the emoji is shown next to the name.
  await expect(categoryHeadings(page).first()).toContainText("🧭");
  // BR-4: alphabetical, ignoring case and accents.
  await expect(sidequestItems(page, "Learn")).toHaveText(itemTexts(["Banana bread", "drawing", "Écrire un poème", "Faire du pain"]));
  await expect(sidequestItems(page, "Explore")).toHaveText(itemTexts(["Igloo festival"]));
  // AC-2.2: empty categories keep their heading, with a calm line.
  for (const name of ["Sport", "Create", "Play", "Connect"]) {
    await expect(categorySection(page, name)).toContainText("No sidequest yet.");
    await expect(sidequestItems(page, name)).toHaveCount(0);
  }
  // AC-2.4: no urgency colour or due label on sidequests.
  await expect(bankRegion(page).locator("[data-urgency]")).toHaveCount(0);
});

test("spec 004 AC-2.3 — an empty Bank shows the six categories in glossary order, each with \"No sidequest yet.\"", async ({
  page,
}) => {
  await page.goto("/sidequests");

  await expect(categoryHeadings(page)).toHaveText(headingTexts(["Sport", "Explore", "Learn", "Create", "Play", "Connect"]));
  await expect(bankRegion(page).getByText("No sidequest yet.")).toHaveCount(6);
  await expect(bankRegion(page).getByRole("listitem")).toHaveCount(0);
});

test("spec 004 AC-2.5 — on a phone, the add form and every category chip fit the screen without zooming or scrolling sideways @phone", async ({
  page,
}) => {
  await page.goto("/sidequests");

  await expect(newSidequestInput(page)).toBeInViewport();
  await expect(page.getByRole("button", { name: "Add", exact: true })).toBeInViewport();
  for (const name of ["Sport", "Explore", "Learn", "Create", "Play", "Connect"]) {
    const chip = categoryChip(page, name);
    await expect(chip).toBeInViewport();
    const box = await chip.boundingBox();
    expect(box?.height, `${name} chip is a 44 px thumb target`).toBeGreaterThanOrEqual(44);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no sideways scrolling").toBeLessThanOrEqual(0);
});
