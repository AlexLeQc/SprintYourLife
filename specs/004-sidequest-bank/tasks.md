# Tasks 004 — Sidequest bank

| | |
|---|---|
| **Status** | Planned — 0 / 12 |
| **Spec** | [spec.md](spec.md) (v1.0) · **Plan** | [plan.md](plan.md) (v1.0) |
| **Branch** | `feat/004-bank-add` (slice 1), `feat/004-bank-manage` (slice 2) → pull requests into `main` |
| **Last updated** | 2026-11-25 |

**Legend:** 🤖 Claude · 👤 PO (Alexis: needs your phone) · ⛳ checkpoint (stop until the PO confirms)

Each task is small enough to review in one sitting. Tick the box when its "Done when" is true. **Reuse first** (PO rule, plan D-3): before writing a component, rule or test helper, check whether one already exists. No PO setup this time (plan §8).

---

## Slice 1 — Add, browse, tabs

- [ ] **T01** 🤖 **Shared title rule** (plan §2)
  Move `normalizeTitle` and `TITLE_MAX_LENGTH` to `domain/title.ts`; `task.ts` re-exports them. Add the two `spec 004 BR-1` cases.
  *Done when:* all existing task tests pass unchanged, plus the new BR-1 cases.

- [ ] **T02** 🤖 **BR-2, BR-3, BR-4, BR-6: categories, order, sort, emoji**
  `domain/sidequest.ts`: `CATEGORIES`, `parseCategory`, `groupByCategory`, `compareSidequests` + tests from plan §3 (wrong case refused, empty categories after filled ones, accents and case ignored, ties by creation).
  *Done when:* tests pass.

- [ ] **T03** 🤖 **`sidequest` table and migration**
  Schema per plan §4 (`text` + `CHECK` for the category, title length `CHECK`, `deleted_at`). `npm run db:generate`; review the SQL; apply to `dev`. Repository: `createSidequest`, `listSidequests` (always `deleted_at IS NULL`, BR-5).
  *Done when:* the migration is applied on `dev`, and a row with a bad category or a 201-character title is refused by the database.

- [ ] **T04** 🤖 **`createSidequest` action** (plan §5.1)
  `sidequests/sidequest-actions.ts`: `getAllowedSession()` first, then BR-1 and BR-2 on the server, with the user messages "Title is too long (200 characters max)." and "Pick a category.".
  *Done when:* Claude shows a direct POST without a session and with a fake cookie → refused, no row added (AC-S.1).

- [ ] **T05** 🤖 **Shared header and tab bar** (plan §5.2, §5.3)
  `app-header.tsx` (moved from `page.tsx`), `tab-bar.tsx` (server component, `current` prop, `aria-current`, bold + bar, fixed at the bottom with safe-area padding). Used on the Tasks page.
  *Done when:* the Tasks page looks the same apart from the tab bar, and every spec 002 end-to-end test passes locally (AC-3.5).

- [ ] **T06** 🤖 **Sidequests page** (plan §5.4, §5.5)
  `sidequests/page.tsx` (`requireAllowedSession()` first, `UsageTracker`, header, tab bar), `add-sidequest-form.tsx`, `category-picker.tsx` (5 chips, none checked, reset after add, emoji `aria-hidden`), `bank.tsx` (grouped, sorted, "No sidequest yet.", optimistic add, reusing the `task-list.tsx` patterns).
  *Done when:* on `dev`, adding sidequests in several categories shows them grouped and sorted, empty categories at the bottom.

- [ ] **T07** 🤖 **End-to-end tests for slice 1** (plan §5.8, D-4)
  Reset also empties `sidequest`; `seedSidequests` fixture; `e2e/support/sidequests-page.ts`. Flow tests: US-1 (AC-1.1 to AC-1.5), US-2 (AC-2.1 to AC-2.3, AC-2.5 `@phone`), US-3 (AC-3.1 `@phone`, AC-3.2 to AC-3.4), AC-S.1. Walk-through scan: empty Bank → add → filled, light and dark, `@phone`.
  *Done when:* the suite passes locally, and its names start with the spec 004 AC ids.

- [ ] **T08** 👤 **Slice 1 on the phone** ⛳
  Claude opens the PR (CI green, e2e job time written in the progress log). PO merges. On the iPhone: enter the real sidequest list; try the chips, the tabs, Back and the home-screen icon.
  *Done when:* the PO's list is in the Bank and any friction is written in the progress log. If the PR's CI runs after 8 p.m. Toronto, it also gives spec 003's AC-1.5 evidence.

## Slice 2 — Edit, delete, undo

- [ ] **T09** 🤖 **Edit, delete and restore actions**
  `updateSidequest`, `deleteSidequest` (soft), `restoreSidequest`: session first, UUID check, BR-1, BR-2. Repository functions to match.
  *Done when:* direct POSTs without a session are refused for all four actions (AC-S.1).

- [ ] **T10** 🤖 **Shared undo bar, inline edit, delete** (plan §5.6, D-3)
  Extract `undo-bar.tsx` from `task-list.tsx` and use it in both lists. `sidequest-row.tsx`: tap title → title, picker (current category checked), Save, Cancel, Delete. "Sidequest deleted · Undo" for ~5 s.
  *Done when:* edit, delete and undo work on `dev`, and every spec 002 end-to-end test still passes (AC-3.5).

- [ ] **T11** 🤖 **End-to-end tests for slice 2**
  Flow tests: AC-4.1, AC-4.2 (rename, move to another category), AC-5.1 to AC-5.3 (gone after the bar disappears and a reload). Walk-through scan extended: edit open → delete → undo bar.
  *Done when:* the suite passes locally. Claude opens the PR; CI green; job time under 5 min (written in the progress log); PO merges.

- [ ] **T12** 👤 **UAT** ⛳
  Run the [UAT checklist in the spec](spec.md#8-uat-checklist-for-the-po). Claude shows AC-2.3 on the test database, AC-3.4 on production (read-only) and AC-S.1 with direct requests. Then README status and backlog → Delivered.
  *Done when:* every line of the checklist is ticked or has a written decision.

---

## Progress log

| Date | Tasks | Note |
|---|---|---|
| 2026-11-24 | Spec ✅ | Spec 004 v1.0 validated (PR #29 merged): tabs with Tasks by default, one sidequest type, emoji + name per category, no pre-selected category, empty categories at the bottom, alphabetical. |
| 2026-11-25 | Plan ✅ | Plan 004 v1.0 validated: chips (D-1), tab bar at the bottom everywhere (D-2), shared undo bar (D-3; reuse first made a project rule), walk-through scans (D-4; sharding next). |
