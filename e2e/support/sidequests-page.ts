/**
 * Finding things on the Sidequests page by role, label and visible text (spec 004, plan §5.8),
 * the same way as tasks-page.ts: if a test can't find it this way, neither can a screen reader.
 */
import { expect, type Locator, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";
import { sidequest } from "../../src/server/db/schema";
import { testDb } from "./db";

/** The "Sidequests" region: add form, category picker and the Bank. */
export function bankRegion(page: Page) {
  return page.getByRole("region", { name: "Sidequests" });
}

/** The title field of the add form. */
export function newSidequestInput(page: Page) {
  return page.getByRole("textbox", { name: "New sidequest" });
}

/**
 * The "Category" chips of a form: the add form by default (first in the page), or the edit form
 * given as `form`.
 */
function categoryGroup(page: Page, form?: Locator) {
  return (form ?? bankRegion(page)).getByRole("group", { name: "Category" }).first();
}

/** A category's radio button ("Create", "Learn"…: the emoji isn't part of the name). */
export function categoryChoice(page: Page, name: string, form?: Locator) {
  return categoryGroup(page, form).getByRole("radio", { name, exact: true });
}

/**
 * A category's chip: the label the thumb taps. The radio inside is visually hidden (only its
 * label shows), so tests tap the chip, like a user, instead of the radio.
 */
export function categoryChip(page: Page, name: string, form?: Locator) {
  return categoryGroup(page, form)
    .locator("label")
    .filter({ hasText: new RegExp(`${name}$`) });
}

/** Picks a category by tapping its chip. */
export async function pickCategory(page: Page, name: string, form?: Locator) {
  await categoryChip(page, name, form).click();
  await expect(categoryChoice(page, name, form)).toBeChecked();
}

/** The open edit form: the list item that holds a "Title" field. */
export function editForm(page: Page) {
  return bankRegion(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("textbox", { name: "Title", exact: true }) });
}

/** The category headings, in the order shown (BR-3). Names exclude the emoji (BR-6). */
export function categoryHeadings(page: Page) {
  return bankRegion(page).getByRole("heading", { level: 2 });
}

/**
 * Expected heading texts for `toHaveText`: the visible text is "📚Learn" (emoji + name), so match
 * on the name at the end. The accessible name is the name alone (BR-6).
 */
export function headingTexts(names: string[]) {
  return names.map((name) => new RegExp(`${name}$`));
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Expected item texts for `toHaveText`: each row is a button whose text is a hidden "Edit " then the
 * title (WCAG 2.5.3, like task rows), so match the whole text on "Edit <title>".
 */
export function itemTexts(titles: string[]) {
  return titles.map((title) => new RegExp(`^Edit ${escapeRegExp(title)}$`));
}

/** A category's section: its heading and its sidequests. */
export function categorySection(page: Page, name: string) {
  return bankRegion(page).getByRole("region", { name, exact: true });
}

/** The sidequest titles in one category, in the order shown (BR-4). */
export function sidequestItems(page: Page, category: string) {
  return categorySection(page, category).getByRole("listitem");
}

/** Adds a sidequest through the form: title, category, then Return. */
export async function addSidequest(page: Page, title: string, category: string) {
  await newSidequestInput(page).fill(title);
  await pickCategory(page, category);
  await newSidequestInput(page).press("Enter");
}

/** Waits until the server has confirmed it: an optimistic item is marked busy until then. */
export async function expectSaved(page: Page, category: string, title: string) {
  const item = sidequestItems(page, category).filter({ hasText: title });
  await expect(item).toBeVisible();
  await expect(item).not.toHaveAttribute("aria-busy");
}

/** The stored sidequest rows with this title (deleted ones included). */
export async function storedSidequests(title: string) {
  return testDb().select().from(sidequest).where(eq(sidequest.title, title));
}

/** Every stored sidequest row. */
export async function allStoredSidequests() {
  return testDb().select().from(sidequest);
}
