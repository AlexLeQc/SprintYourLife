import { describe, expect, it } from "vitest";
import { CATEGORIES, compareSidequests, groupByCategory, parseCategory, type Category } from "./sidequest";

let clock = 0;
/** A sidequest created one minute after the previous one, unless a date is given. */
function sq(title: string, category: Category = "learn", createdAt = new Date(Date.UTC(2026, 10, 25, 12, clock++))) {
  return { title, category, createdAt };
}

const titles = (list: { title: string }[]) => list.map((s) => s.title);

describe("spec 004 BR-2 — category", () => {
  it.each(["create", "learn", "play", "connect", "move"])("accepts %s", (id) => {
    expect(parseCategory(id)).toEqual({ ok: true, value: id });
  });

  it.each([["" as unknown], ["Learn"], ["LEARN"], ["sport"], [" learn"], [null], [undefined], [3]])(
    "refuses %j",
    (value) => {
      expect(parseCategory(value)).toEqual({ ok: false, error: "invalid_category" });
    },
  );
});

describe("spec 004 BR-6 — emoji per category", () => {
  it("has exactly the five categories of the glossary, in its order, with their names and emojis", () => {
    expect(CATEGORIES.map((c) => `${c.emoji} ${c.name}`)).toEqual([
      "🎨 Create",
      "📚 Learn",
      "🎲 Play",
      "🤝 Connect",
      "🚶 Move",
    ]);
  });

  it("gives every category its own emoji", () => {
    expect(new Set(CATEGORIES.map((c) => c.emoji)).size).toBe(5);
  });
});

describe("spec 004 BR-4 — order inside a category", () => {
  const sort = (list: ReturnType<typeof sq>[]) => titles([...list].sort(compareSidequests));

  it("is alphabetical, ignoring case", () => {
    expect(sort([sq("Banana"), sq("apple"), sq("cherry")])).toEqual(["apple", "Banana", "cherry"]);
  });

  it("ignores accents: Écrire sorts between Dessin and Faire", () => {
    expect(sort([sq("Faire du pain"), sq("Écrire un poème"), sq("Dessin")])).toEqual([
      "Dessin",
      "Écrire un poème",
      "Faire du pain",
    ]);
  });

  it("keeps creation order for equal titles (case and accents ignored)", () => {
    const older = sq("lego", "create", new Date("2026-11-01T00:00:00Z"));
    const newer = sq("Légo", "create", new Date("2026-11-02T00:00:00Z"));
    expect([newer, older].sort(compareSidequests)).toEqual([older, newer]);
  });
});

describe("spec 004 BR-3 — category order", () => {
  const order = (list: ReturnType<typeof sq>[]) => groupByCategory(list).map((g) => g.category.name);

  it("shows all five empty categories in the glossary order when the Bank is empty", () => {
    const groups = groupByCategory([]);
    expect(groups.map((g) => g.category.name)).toEqual(["Create", "Learn", "Play", "Connect", "Move"]);
    expect(groups.every((g) => g.sidequests.length === 0)).toBe(true);
  });

  it("puts a filled category first, then the empty ones in the glossary order", () => {
    expect(order([sq("Walk by the river", "move")])).toEqual(["Move", "Create", "Learn", "Play", "Connect"]);
  });

  it("keeps the glossary order among filled categories, then among empty ones", () => {
    expect(order([sq("Hike", "move"), sq("Rubik's cube", "learn")])).toEqual([
      "Learn",
      "Move",
      "Create",
      "Play",
      "Connect",
    ]);
  });

  it("puts each sidequest in its own category, sorted by BR-4", () => {
    const groups = groupByCategory([sq("Lego", "create"), sq("Rubik's cube"), sq("drawing", "create")]);
    expect(groups.map((g) => [g.category.id, titles(g.sidequests)])).toEqual([
      ["create", ["drawing", "Lego"]],
      ["learn", ["Rubik's cube"]],
      ["play", []],
      ["connect", []],
      ["move", []],
    ]);
  });

  it("does not change the list it was given", () => {
    const list = [sq("b", "play"), sq("a", "play")];
    groupByCategory(list);
    expect(titles(list)).toEqual(["b", "a"]);
  });
});
