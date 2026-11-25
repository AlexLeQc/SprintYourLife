# Tasks 004 — Sidequest bank

| | |
|---|---|
| **Status** | In progress — 8 / 12 |
| **Spec** | [spec.md](spec.md) (v1.0) · **Plan** | [plan.md](plan.md) (v1.0) |
| **Branch** | `feat/004-bank-add` (slice 1), `feat/004-bank-manage` (slice 2) → pull requests into `main` |
| **Last updated** | 2026-11-25 |

**Legend:** 🤖 Claude · 👤 PO (Alexis: needs your phone) · ⛳ checkpoint (stop until the PO confirms)

Each task is small enough to review in one sitting. Tick the box when its "Done when" is true. **Reuse first** (PO rule, plan D-3): before writing a component, rule or test helper, check whether one already exists. No PO setup this time (plan §8).

---

## Slice 1 — Add, browse, tabs

- [x] **T01** 🤖 **Shared title rule** (plan §2)
  Move `normalizeTitle` and `TITLE_MAX_LENGTH` to `domain/title.ts`; `task.ts` re-exports them. Add the two `spec 004 BR-1` cases.
  *Done when:* all existing task tests pass unchanged, plus the new BR-1 cases.

- [x] **T02** 🤖 **BR-2, BR-3, BR-4, BR-6: categories, order, sort, emoji**
  `domain/sidequest.ts`: `CATEGORIES`, `parseCategory`, `groupByCategory`, `compareSidequests` + tests from plan §3 (wrong case refused, empty categories after filled ones, accents and case ignored, ties by creation).
  *Done when:* tests pass.

- [x] **T03** 🤖 **`sidequest` table and migration**
  Schema per plan §4 (`text` + `CHECK` for the category, title length `CHECK`, `deleted_at`). `npm run db:generate`; review the SQL; apply to `dev`. Repository: `createSidequest`, `listSidequests` (always `deleted_at IS NULL`, BR-5).
  *Done when:* the migration is applied on `dev`, and a row with a bad category or a 201-character title is refused by the database.

- [x] **T04** 🤖 **`createSidequest` action** (plan §5.1)
  `sidequests/sidequest-actions.ts`: `getAllowedSession()` first, then BR-1 and BR-2 on the server, with the user messages "Title is too long (200 characters max)." and "Pick a category.".
  *Done when:* Claude shows a direct POST without a session and with a fake cookie → refused, no row added (AC-S.1).

- [x] **T05** 🤖 **Shared header and tab bar** (plan §5.2, §5.3)
  `app-header.tsx` (moved from `page.tsx`), `tab-bar.tsx` (server component, `current` prop, `aria-current`, bold + bar, fixed at the bottom with safe-area padding). Used on the Tasks page.
  *Done when:* the Tasks page looks the same apart from the tab bar, and every spec 002 end-to-end test passes locally (AC-3.5).

- [x] **T06** 🤖 **Sidequests page** (plan §5.4, §5.5)
  `sidequests/page.tsx` (`requireAllowedSession()` first, `UsageTracker`, header, tab bar), `add-sidequest-form.tsx`, `category-picker.tsx` (5 chips, none checked, reset after add, emoji `aria-hidden`), `bank.tsx` (grouped, sorted, "No sidequest yet.", optimistic add, reusing the `task-list.tsx` patterns).
  *Done when:* on `dev`, adding sidequests in several categories shows them grouped and sorted, empty categories at the bottom; and Claude shows a direct POST to `createSidequest` without a session and with a fake cookie → refused, no row added (AC-S.1, moved from T04).

- [x] **T07** 🤖 **End-to-end tests for slice 1** (plan §5.8, D-4)
  Reset also empties `sidequest`; `seedSidequests` fixture; `e2e/support/sidequests-page.ts`. Flow tests: US-1 (AC-1.1 to AC-1.5), US-2 (AC-2.1 to AC-2.3, AC-2.5 `@phone`), US-3 (AC-3.1 `@phone`, AC-3.2 to AC-3.4), AC-S.1. Walk-through scan: empty Bank → add → filled, light and dark, `@phone`.
  *Done when:* the suite passes locally, and its names start with the spec 004 AC ids.

- [x] **T08** 👤 **Slice 1 on the phone** ⛳
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
| 2026-11-25 | T01 ✅ | `domain/title.ts` holds BR-1 (`normalizeTitle`, `TITLE_MAX_LENGTH`); `task.ts` re-exports it, so no task file changed its import. The `Result` type moved to `domain/result.ts` too (small deviation from plan §2: sidequest rules need it, and it shouldn't come from `task.ts`). 2 `spec 004 BR-1` tests added. Typecheck ✅, lint on `src` and `e2e` ✅, **85 unit tests passed**. Found: `npm run lint` also scans the local, git-ignored `playwright-report/` folder and fails on its bundled JS (not in CI, where the folder doesn't exist). Fix later as a chore: add it to the ESLint ignores. CLAUDE.md: "Reuse first" rule added (PO, plan D-3). |
| 2026-11-25 | T02 ✅ | `domain/sidequest.ts`: `CATEGORIES` (id, name, emoji, glossary order), `parseCategory`, `compareSidequests` (`Intl.Collator` "en", base sensitivity), `groupByCategory` (always 5 groups, filled first; doesn't change its input). Same `createdAt: Date` shape as `compareOpenTasks` (reuse first). **23 new tests** (`spec 004 BR-2/3/4/6`), 108 unit tests passed; typecheck and lint ✅. |
| 2026-11-25 | T03 ✅ | `sidequest` table in `schema.ts`; the category `CHECK` is built from the domain's `CATEGORY_IDS` (one source of truth). Migration `drizzle/0003_create_sidequest.sql` reviewed: one `CREATE TABLE`, nothing else touched; applied to Neon `dev`. Repository: `createSidequest`, `listSidequests` (`deleted_at IS NULL`, BR-5). **Database check on `dev`**, each insert in a rolled-back transaction: 200-character title in `learn` accepted; `'Learn'` and `'sport'` refused by `sidequest_category_valid`; 201 characters and empty refused by `sidequest_title_length`; 0 rows left. Typecheck, lint, 108 unit tests ✅. |
| 2026-11-25 | T04 ✅ (proof moved to T06) | Reuse first: `action-guards.ts` (not a `"use server"` file) now holds `assertAllowed`, `assertId` and BR-1's messages, shared by task and sidequest actions; `task-actions.ts` uses it with no behaviour change. `sidequests/sidequest-actions.ts`: `createSidequest` checks the session first, then BR-1 and BR-2 ("Pick a category."). Typecheck, lint, `next build` ✅. **Deviation:** the direct-POST proof needs the action's id, and Next.js only compiles an action once a page or component uses it (checked: not in the build's action manifest yet). The proof moves to T06's "Done when", where the page uses it. The spec 002 e2e tests in T05 cover the guard refactor for tasks. |
| 2026-11-25 | T05 ✅ | Reuse first: `app-shell.tsx` holds the header, usage line, footer, `UsageTracker` and tab bar for every signed-in page (not a layout: each page still checks the session first and passes what it read). `tab-bar.tsx` per plan §5.2. `--tab-bar-height` (3.5 rem) in `globals.css`; pages pad their bottom by it, and **the task undo bar moved up to sit above the tab bar** (otherwise the fixed bar would have covered Undo). Local e2e on a production build: **43 passed (51 s)**, all spec 002 and 003 tests unchanged (AC-3.5). The known `HANGING_PROMISE_REJECTION` log (backlog inbox) still shows; not new. |
| 2026-11-25 | T06 ✅ | `/sidequests`: `page.tsx` (session first, then usage count and list in parallel, `AppShell`), `bank.tsx` (`groupByCategory`, optimistic add), `add-sidequest-form.tsx`, `category-picker.tsx` (5 radio chips, none checked, accessible names "Create"… without the emoji). Reuse first: `ui.ts` now holds the field and button styles, the error text style and the save-error message, shared with the task screens. **Checked on `dev`** in the browser pane: no category → "Pick a category." with the title kept; added Probe sidequests in Create and Learn → after a reload, Create and Learn first, then Play, Connect, Move with "No sidequest yet."; "Probe: Banana" before "probe: écrire" (case and accent ignored); no category checked after the adds. **AC-S.1 (moved from T04):** direct POST to `createSidequest` on the dev server: no cookie → 307 to `/sign-in`; fake session cookie → 500 with "Not allowed" thrown by `assertAllowed`; 0 rows added. Probe rows deleted from `dev` afterwards. |
| 2026-11-25 | T07 ✅ | Reset also empties `sidequest`; `seedSidequests` fixture; `e2e/support/sidequests-page.ts` (roles and names only; tests tap a category's chip, like a user, because its radio is visually hidden). New: `sidequests-add` (AC-1.1 to AC-1.5), `sidequests-list` (AC-2.1 to AC-2.5), `tabs` (AC-3.1 to AC-3.4), 2 access tests (AC-S.1), and the D-4 walk-through scan (empty Bank → "Pick a category." → filled Bank with a chip checked), light and dark, desktop and phone. `expectNoAccessibilityViolations` takes an optional state name (attachment and failure message). Local run on a production build: **65 passed (1.4 min)**, of which 22 new; 108 unit tests ✅. |
| 2026-11-25 | T08 ⛳ ✅ | PR #31 merged; CI ✅, **End-to-end tests 4 min 00 s** (limit 5: sharding likely with slice 2). PO entered the real list: **26 sidequests** (production, read-only check). **Friction found:** (1) a blank screen while switching tabs, not smooth; (2) the tab bar's targets feel small, flush with the bottom edge (PO sent a floating-bar reference); (3) the categories don't fit: **18 of 26 in Move** (trying a sport and going somewhere were mixed), 0 in Create and Connect. **PO decisions:** fix (1) and (2) now in a small PR; (3) is a change request on the vision and spec 004 (6 categories: Sport, Explore, Learn, Create, Play, Connect), done with slice 2 so the PO can re-file items with Edit. |
| 2026-11-25 | T08 fixes | **(1) Cause:** each page's Suspense placeholder was an empty `<main>`; on a tab switch Next.js showed that prerendered empty shell first. **Fix:** `AppFrame` (column, usage tracker, tab bar: no private data) renders outside Suspense, with a `PageSkeleton` (header + grey rows) as the placeholder. Checked in the build: the prerendered HTML of `/` and `/sidequests` contains the tab bar and the skeleton, and no private data ("Signed in as" absent). Session checks unchanged: still first, in the streamed part. **(2)** Floating rounded tab bar, lifted 0.75 rem above the safe area, 64 px targets with an icon and a label, current tab = filled highlight + bold + `aria-current` (plan §5.2 v1.1). `--tab-bar-height` 5.625 rem. Tab test now checks "near the bottom, lifted" and targets ≥ 56 px. Local e2e: **65 passed (1.3 min)**. |
