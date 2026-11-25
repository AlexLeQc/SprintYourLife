# Plan 004 — Sidequest bank

| | |
|---|---|
| **Status** | Draft v0.1 — awaiting PO validation (decisions in §9) |
| **Spec** | [spec.md](spec.md) (Spec validated, v1.0) |
| **Decisions used** | ADR-0003, 0007, 0009, 0014, **0015** |
| **Last updated** | 2026-11-25 |

This plan describes **how** spec 004 will be built. It doesn't change **what** the spec asks for. If something here contradicts the spec, the spec wins and this plan gets fixed.

---

## 1. Approach in one paragraph

Same recipe as spec 002, which worked: the rules first, as pure functions with tests (BR-1 to BR-4, BR-6); then one `sidequest` table and a repository; then server actions that check the session **before** anything else; then the UI. The new page lives at **`/sidequests`**; the Tasks page stays at `/`, unchanged. A shared header and a **tab bar** are added to both pages. Two deployable slices: **slice 1** = add and browse, plus the tabs, so you can **enter your real list on the phone** as early as possible; **slice 2** = edit, delete and undo. Each slice ships with its end-to-end tests (ADR-0015). No new dependency.

## 2. What changes in the project

```
src/
├── domain/
│   ├── title.ts (+ .test.ts)          # NEW — normalizeTitle moved out of task.ts (BR-1 is shared)
│   ├── task.ts                        # re-exports normalizeTitle: no behaviour change
│   └── sidequest.ts (+ .test.ts)      # NEW — categories + emoji, parse, sort, grouping (BR-2 to BR-4, BR-6)
├── server/
│   ├── db/schema.ts                   # + sidequest table
│   └── sidequest-repository.ts        # NEW — reads/writes, BR-5 filter
└── app/(app)/
    ├── page.tsx                       # Tasks: uses the shared header and tab bar
    ├── app-header.tsx                 # NEW — title + "Used N of the last 7 days" (moved from page.tsx)
    ├── tab-bar.tsx                    # NEW — "Tasks | Sidequests" (US-3)
    ├── undo-bar.tsx                   # NEW — extracted from task-list.tsx (D-3), used by both lists
    ├── task-list.tsx                  # uses undo-bar.tsx
    └── sidequests/
        ├── page.tsx                   # NEW — session check first, header, Bank, tab bar
        ├── sidequest-actions.ts       # NEW — server actions, session check first
        ├── bank.tsx                   # NEW — client: optimistic grouped list, undo bar
        ├── sidequest-row.tsx          # NEW — client: title, inline edit
        ├── add-sidequest-form.tsx     # NEW — client: title + category picker
        └── category-picker.tsx        # NEW — 5 choices, none pre-selected (D-1)
drizzle/000N_sidequest.sql             # generated migration (committed)
e2e/
├── support/sidequests-page.ts         # NEW — locators, seedSidequests fixture; reset also empties sidequest
├── sidequests-add.spec.ts             # NEW — US-1
├── sidequests-list.spec.ts            # NEW — US-2
├── tabs.spec.ts                       # NEW — US-3
├── sidequests-edit-delete.spec.ts     # NEW — US-4, US-5
├── access.spec.ts                     # + AC-S.1 for sidequests
└── accessibility.spec.ts              # + Sidequests page states (D-4)
```

**Why move `normalizeTitle`:** BR-1 is the same rule for tasks and sidequests. Importing it from `task.ts` would make the sidequest rules depend on the task rules. A small `title.ts` keeps one source of truth with no coupling. The existing task tests stay where they are and keep passing.

## 3. Business rules → domain functions and tests

All in `src/domain/sidequest.ts`, tests named after the BR id (`spec 004 BR-x — …`).

| Rule | Function | Example tests |
|---|---|---|
| BR-1 Title | `normalizeTitle(raw)` (shared, `title.ts`) | Already covered by spec 002's tests; two `spec 004 BR-1` cases added: trimmed title ok; two sidequests may share a title (no uniqueness check anywhere) |
| BR-2 Category | `parseCategory(value)` → `Category` or error | each of the 5 ids ok; `""`, `"Learn"` (wrong case), `"sport"`, `null` → error. The 5 ids are `create`, `learn`, `play`, `connect`, `move` |
| BR-3 Category order | `groupByCategory(sidequests)` → ordered groups, empty ones included | all empty → 5 groups in glossary order; only Move filled → Move first, then Create, Learn, Play, Connect; Learn and Move filled → Learn, Move, then the 3 empty ones |
| BR-4 Sort | `compareSidequests(a, b)` | "apple" before "Banana" (case ignored); "Écrire" between "Dessin" and "Faire" (accents ignored); same title → older first |
| BR-5 Deleted | enforced in the repository (§4) | end-to-end: a deleted sidequest never comes back after a reload |
| BR-6 Emoji | `CATEGORIES` constant: `{ id, name, emoji }` in glossary order | exactly 5 entries; names and emojis as in the spec; order matches BR-3 |

**Sorting with accents (BR-4):** `Intl.Collator("en", { sensitivity: "base" })`. It is pure (no I/O), so it is allowed in `src/domain/`. The server sorts what is rendered; the browser re-sorts with the same function only for the optimistic update, then the server render takes over. The rare characters where Node and Safari could disagree don't matter for ~30 titles.

## 4. Data model

| Column | Type | Rule |
|---|---|---|
| `id` | `uuid` PK, default `gen_random_uuid()` | |
| `title` | `text NOT NULL` | `CHECK (char_length(title) BETWEEN 1 AND 200)`: second line of defence for BR-1 |
| `category` | `text NOT NULL` | `CHECK (category IN ('create','learn','play','connect','move'))`: BR-2 |
| `deleted_at` | `timestamptz NULL` | soft delete (spec §6), like tasks |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | BR-4 tie-break |

- **`text` + `CHECK`, not a PostgreSQL `enum`.** Same guarantee. Renaming or removing a category later is one `CHECK` change; with an `enum`, removing a value needs a type rebuild. Display names and emojis live in the domain (BR-6), not in the database, so changing an emoji is a code change only.
- No `user_id`: single-user app, like `task` and `usage_day`.
- No status column (architecture §3): "sprint goal" will be derived from the sprint in F05.
- **Every list query includes `deleted_at IS NULL`** (BR-5). Sorting and grouping are done in the domain, not in SQL, so BR-3 and BR-4 have one tested source of truth.
- **Production read access (ADR-0014):** the default privileges already make the new table readable by `claude_readonly`. It holds no secret, so nothing to revoke.

## 5. Key design points

### 5.1 Access control (AC-S.1)

- `sidequests/page.tsx` calls `requireAllowedSession()` **first**, like the Tasks page. No check in a layout (CLAUDE.md).
- Every action in `sidequest-actions.ts` starts with `getAllowedSession()` and throws without an allowed session. Then it **re-validates** everything: title (BR-1), category (BR-2), and that the `id` is a UUID.
- Verified by an end-to-end access test (signed out → `/sidequests` sends to `/sign-in`, no sidequest shown) and by Claude with a direct POST to each action without a session and with a fake cookie → refused, no row changed (same check as spec 002).

### 5.2 Tabs (US-3)

- Two routes: `/` (Tasks, unchanged address) and `/sidequests`. The installed app's `start_url` stays `/`, so it opens on Tasks (AC-3.2).
- `tab-bar.tsx` is a **server component that receives the current tab as a prop** from each page: `<TabBar current="tasks" />`. That's simpler than reading the URL with `usePathname` in a client component, and it needs no extra `Suspense` boundary under `cacheComponents`.
- Markup: `<nav aria-label="Main">` with two `<Link>`s. The current one has `aria-current="page"`, **bold text and a bar above it**, so it isn't marked by colour alone (AC-3.1, WCAG 1.4.1).
- Fixed at the bottom, with `env(safe-area-inset-bottom)` padding for the iPhone home indicator. Each page gets enough bottom padding that the last row is never hidden behind the bar.
- `<Link>` navigation keeps the browser history, so Back works and a reload keeps the tab (AC-3.3).

### 5.3 Shared header and usage days (AC-3.4)

- `app-header.tsx` holds "SprintYourLife" and "Used N of the last 7 days", moved out of `page.tsx`. Both pages render it, each with its own `countUsageDays` query, in parallel with its list query (`Promise.all`, plan 002 §5.7).
- **AC-3.4 is already true at the server level:** `requireAllowedSession()` records today's usage day on **any** page (spec 001 T15). The only gap is the installed app resuming in the background on the Sidequests tab, so `sidequests/page.tsx` also renders `<UsageTracker />`.
- The "Signed in as … · Sign out" footer stays on both pages, above the tab bar.

### 5.4 Category picker (AC-1.2, AC-1.3, D-1)

- A `<fieldset>` with `<legend>Category</legend>` and **5 radio buttons styled as chips**: "🎨 Create", "📚 Learn", "🎲 Play", "🤝 Connect", "🚶 Move". Native radio buttons give keyboard and screen-reader behaviour for free.
- **None is checked** when the page opens, and the form resets to none after each add (AC-1.2). On the edit view, the current category is checked.
- No category chosen → the add is refused with "Pick a category." next to the picker; the title stays in its field (AC-1.3). The server refuses it too (BR-2).
- Chips wrap to two lines on a narrow phone. Each one is at least 44 × 44 px (thumb target, AC-2.5).
- The emoji is in `<span aria-hidden="true">`, so a screen reader reads "Create", not "artist palette Create" (BR-6). Same in the category headings.

### 5.5 The Bank list (US-2)

- `bank.tsx` gets the sidequests from the server, groups them with `groupByCategory` (BR-3) and sorts each group with `compareSidequests` (BR-4).
- Each group: `<h2>` with emoji + name, then a list. An empty group shows "No sidequest yet." in grey (AC-2.2, AC-2.3). No colour anywhere else (AC-2.4).
- The add form sits **at the top**, like the task form, so the thumb reaches it first.
- **Instant feedback (principle 2):** add, edit and delete use `useOptimistic`, exactly like `task-list.tsx`. A sidequest added to an empty category moves that category up at once (BR-3); that's the small "jump" noted in the spec's UAT.

### 5.6 Edit, delete, undo (US-4, US-5, D-3)

- Tapping a title opens an **inline edit** in the row: title, the category picker (current one checked), Save, Cancel, Delete. Same pattern as tasks; no new page.
- Delete = **soft delete** (`deleted_at` set). Undo clears it, so the sidequest comes back exactly as it was (AC-5.2).
- The undo bar ("Sidequest deleted · Undo", ~5 s, only the last action, undo waits for the pending action) is **extracted** from `task-list.tsx` into `undo-bar.tsx` and used by both lists (D-3). The spec 002 end-to-end tests (done + undo, delete + undo) prove the extraction changed nothing for tasks (AC-3.5).

### 5.7 Migration

`npm run db:generate` creates the SQL; it is reviewed in the PR, applied to Neon `dev` locally, then to production by `vercel-build` on merge (spec 001 §5.7). Adding a table is non-breaking: the Tasks page doesn't read it.

### 5.8 End-to-end tests and the 5-minute budget (D-4)

- New flow tests, named after the AC ids, run in the **desktop** project. Only the tests where the phone layout matters are tagged `@phone`: AC-2.5 (thumb reach) and AC-3.1 (tab bar at the bottom).
- The e2e reset also empties `sidequest`; a `seedSidequests` fixture inserts rows directly in the test database, like `seedTasks`.
- **Budget:** today's job takes ~3.5–3.7 min for 43 tests, with a 5 min limit (spec 003 AC-1.7). Spec 003's per-state scan pattern (each state × light/dark × desktop/phone) would add **16 scan tests** for 4 Sidequests states, plus ~12 flow tests: an estimated +1.5–2 min, which goes over the limit. See D-4.

## 6. Acceptance criteria → how each is verified

| AC | Unit | End-to-end | UAT / Claude |
|---|---|---|---|
| AC-1.1 add | | add → appears in its category, input cleared | iPhone |
| AC-1.2 no pre-selected category | | none checked on open and after an add | iPhone |
| AC-1.3 no category | BR-2 | refused, message shown, title kept | |
| AC-1.4, AC-1.5 title | BR-1 | blank ignored; 201 characters refused | |
| AC-2.1 grouped and sorted | BR-3, BR-4, BR-6 | seeded mix → headings and order | iPhone, real list |
| AC-2.2, AC-2.3 empty categories | BR-3 | empty ones at the bottom; empty Bank → 5 headings | Claude (test database), not the real Bank |
| AC-2.4 no colours | | axe scan (contrast); review | iPhone |
| AC-2.5 thumb reach | | `@phone`: add form, picker and edit visible without zoom | iPhone, one hand |
| AC-3.1 tab bar | | `@phone`: both pages, bottom, `aria-current` | iPhone |
| AC-3.2 opens on Tasks | | `/` shows Tasks | iPhone, home-screen icon |
| AC-3.3 Back and reload | | tab → Back → reload | |
| AC-3.4 usage day | | open only `/sidequests` → today in `usage_day` | Claude on production (read-only) |
| AC-3.5 Tasks unchanged | | all spec 002 tests stay green | |
| AC-4.1, AC-4.2 edit | BR-1, BR-2 | rename; move to another category | iPhone |
| AC-5.1 to AC-5.3 delete, undo | | delete → gone; Undo → back; after 5 s → gone after reload (BR-5) | iPhone |
| AC-S.1 access | | signed out → `/sign-in`, no sidequest | Claude: direct POST, no session and fake cookie |
| Accessibility (ADR-0015) | | axe on the Sidequests page states (D-4) | |

## 7. Order of work (preview of tasks.md)

**Slice 1 — add, browse, tabs** (deployable: you can enter your real list)
1. Domain: `title.ts` extracted; `sidequest.ts` with BR-2 to BR-4, BR-6 and tests.
2. `sidequest` table, migration on `dev`, repository (create, list).
3. `createSidequest` action with session check.
4. Shared header, tab bar, `/sidequests` page with add form, category picker and grouped list.
5. End-to-end: US-1, US-2, US-3, AC-S.1, scans; reset and fixture. → PR, CI green, merge, deploy.
6. ⛳ **PO enters the real sidequest list on the phone.** Early feedback on the picker and the tabs before slice 2.

**Slice 2 — edit, delete, undo**
7. `updateSidequest`, `deleteSidequest`, `restoreSidequest` actions.
8. `undo-bar.tsx` extracted from the task list; inline edit; delete with undo.
9. End-to-end: US-4, US-5, scans of the edit view and undo bar. → PR, CI green, merge, deploy.
10. ⛳ **PO UAT** with the spec's checklist; Claude's checks (AC-3.4 on production, AC-S.1 direct POST).

## 8. PO setup

None. No new account, environment variable or service.

## 9. Decisions for the PO

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D-1 | **Category picker**: what does it look like? | A. **5 chips** (radio buttons) always visible: one tap · B. A native dropdown (`<select>`): iOS opens a wheel, two taps and you don't see the choices | **A.** One tap, all 5 visible with their emoji, so you see the choice you're making (your OQ-2 reason). A dropdown hides the options, and on iOS it can't show "nothing selected" cleanly. Cost: two lines of chips on a narrow phone. |
| D-2 | **Tab bar on desktop**: where? | A. **At the bottom everywhere** · B. At the top on wide screens | **A.** The app is already a phone-width column on desktop, so a bottom bar looks natural, and one layout means one set of tests. Desktop is for planning (vision §3), which comes later with F05. |
| D-3 | **Undo bar**: share it or copy it? | A. **Extract** one `UndoBar` used by tasks and sidequests (touches spec 002 code) · B. Copy it into the sidequest list (spec 002 code untouched) | **A.** One behaviour, fixed once. The risk of touching delivered code is covered by spec 002's end-to-end tests, which must stay green (AC-3.5). That's what those tests are for: *BA lesson: a regression suite is what makes refactoring safe; without it, B would be the prudent choice.* |
| D-4 | **Accessibility scans and the 5-minute budget** | A. Spec 003's pattern (one test per state × light/dark × desktop/phone = 16 new tests), then **shard** the e2e job into 2 parallel jobs if it goes over 5 min · B. **One walk-through scan test per colour scheme and viewport** (4 new tests): empty Bank → add → filled → edit open → delete → undo bar, with an axe scan at each state · C. Fewer states scanned | **B.** Same states, same rules, a quarter of the browser start-ups and seeds. The axe report names the state that failed. Downside: if one state fails, the later ones in that test aren't scanned until it's fixed. Sharding (A) stays the next step when the suite grows again with F03. C lowers the quality bar: no. |

## 10. Risks

| Risk | Impact | Response |
|---|---|---|
| Extracting the undo bar breaks a task flow | Regression in delivered spec 002 | Spec 002's e2e tests on the PR (AC-3.5); D-3 |
| E2E job goes over 5 minutes | Spec 003 AC-1.7 broken | D-4; the job time is reported on each PR in the progress log |
| Emoji look different outside the iPhone (Windows desktop shows flatter emoji) | Looks only | The name is always next to it (BR-6), so the meaning never depends on the emoji |
| Chips wrap badly on a narrow phone | AC-2.5 | `@phone` test at Pixel 7 width + PO check on the iPhone in slice 1 |
| The fixed tab bar hides the last row or the undo bar | AC-2.5, AC-5.2 | Bottom padding on pages; the undo bar sits above the tab bar; checked in the `@phone` tests and the scans |
| Spec 003 still in UAT (AC-1.5) while 004 starts | Two specs open at once | 003's last check is a CI run after 8 p.m. Toronto: slice 1's PR can provide it, since it changes code and runs the e2e job |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-25 | First draft — 4 decisions for the PO |
