/**
 * Spec 004 — Sidequest bank. Business rules BR-2, BR-3, BR-4 and BR-6, pure TypeScript.
 * BR-1 (title) is shared with tasks: see ./title.ts. BR-5 (deleted sidequests excluded)
 * is enforced by the repository.
 */
import type { Result } from "./result";

export { normalizeTitle, TITLE_MAX_LENGTH, type TitleError } from "./title";

// ── BR-2, BR-6 ───────────────────────────────────────────────────────────────

/**
 * BR-2 + BR-6: the five categories, in the glossary order (vision §6), each with its emoji.
 * The id is what the database stores (plan 004 §4); the name and emoji are display only,
 * so changing an emoji never needs a migration. The emoji is always shown next to the name.
 */
export const CATEGORIES = [
  { id: "create", name: "Create", emoji: "🎨" },
  { id: "learn", name: "Learn", emoji: "📚" },
  { id: "play", name: "Play", emoji: "🎲" },
  { id: "connect", name: "Connect", emoji: "🤝" },
  { id: "move", name: "Move", emoji: "🚶" },
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];
export type CategoryInfo = (typeof CATEGORIES)[number];

export const CATEGORY_IDS: readonly Category[] = CATEGORIES.map((c) => c.id);

export type CategoryError = "invalid_category";

/** BR-2: a category is exactly one of the five ids. Anything else (wrong case, empty, null) is refused. */
export function parseCategory(value: unknown): Result<Category, CategoryError> {
  const match = CATEGORIES.find((c) => c.id === value);
  return match ? { ok: true, value: match.id } : { ok: false, error: "invalid_category" };
}

// ── BR-4 ─────────────────────────────────────────────────────────────────────

/** What BR-4 needs to compare two sidequests. */
export interface SortableSidequest {
  title: string;
  createdAt: Date;
}

// Case and accents ignored: "apple" < "Banana", "Écrire" between "Dessin" and "Faire" (plan 004 §3).
const titleCollator = new Intl.Collator("en", { sensitivity: "base" });

/** BR-4: alphabetical by title, ignoring case and accents; equal titles keep creation order. */
export function compareSidequests(a: SortableSidequest, b: SortableSidequest): number {
  const byTitle = titleCollator.compare(a.title, b.title);
  if (byTitle !== 0) return byTitle;
  return a.createdAt.getTime() - b.createdAt.getTime();
}

// ── BR-3 ─────────────────────────────────────────────────────────────────────

export interface CategoryGroup<T> {
  category: CategoryInfo;
  sidequests: T[];
}

/**
 * BR-3: one group per category, always all five. Categories with sidequests come first, then the
 * empty ones; inside each part, the glossary order. Each group is sorted by BR-4.
 */
export function groupByCategory<T extends SortableSidequest & { category: Category }>(
  sidequests: readonly T[],
): CategoryGroup<T>[] {
  const groups = CATEGORIES.map((category) => ({
    category,
    sidequests: sidequests.filter((s) => s.category === category.id).sort(compareSidequests),
  }));
  return [...groups.filter((g) => g.sidequests.length > 0), ...groups.filter((g) => g.sidequests.length === 0)];
}
