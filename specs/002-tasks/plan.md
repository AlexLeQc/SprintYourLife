# Plan 002 — Tasks

| | |
|---|---|
| **Status** | Validated — 2026-11-17 |
| **Spec** | [spec.md](spec.md) (Spec validated, v1.1) |
| **Decisions used** | ADR-0003, 0007, 0009, 0010, **0013** |
| **Last updated** | 2026-11-17 |

This plan describes **how** spec 002 will be built. It doesn't change **what** the spec asks for. If something here contradicts the spec, the spec wins and this plan gets fixed.

---

## 1. Approach in one paragraph

Write the task rules (BR-1 to BR-8) first, as pure functions with tests. Then add one `task` table and a repository, then server actions that check the session **before** anything else, then the home-page UI. Ship in **two deployable slices** so the phone gets something useful early: **slice 1** = add and see tasks (with dates, times, labels and colours); **slice 2** = done, edit, delete and undo. No new dependency: native date and time inputs, React's `useOptimistic` for instant feedback, and the `refresh()` pattern already used in spec 001.

## 2. What changes in the project

```
src/
├── domain/
│   ├── local-date.ts (+ .test.ts)   # + localTime(instant) → "HH:MM" in Toronto
│   └── task.ts (+ .test.ts)         # NEW — BR-1 to BR-7, pure
├── server/
│   ├── db/schema.ts                 # + task table
│   └── task-repository.ts           # NEW — reads/writes, BR-8 filter
└── app/(app)/
    ├── page.tsx                     # home: usage line + task list (placeholder text removed)
    ├── task-actions.ts              # NEW — server actions, session check first
    ├── task-list.tsx                # NEW — client: optimistic list, undo bar
    ├── task-row.tsx                 # NEW — client: checkbox, label, inline edit
    └── add-task-form.tsx            # NEW — client: title, optional date and time
drizzle/000N_task.sql                # generated migration (committed)
```

## 3. Business rules → domain functions and tests

All in `src/domain/task.ts`, tests named after the BR id. "Now" is passed in as `{ date: "YYYY-MM-DD", time: "HH:MM" }` (Toronto), so the tests never depend on the real clock.

| Rule | Function | Example tests |
|---|---|---|
| BR-1 Title | `normalizeTitle(raw)` → title or error | `"  Buy milk "` → `"Buy milk"`; `"   "` → empty; 200 chars ok; 201 → too long; emoji counted as characters the user sees |
| BR-2 Due | `parseDue(date?, time?)` → `{date, time}` or error | none ok; date ok; date + time ok; time without date → error; `"2026-02-30"` → error; `"24:00"` → error; past date ok |
| BR-3 Sort | `compareOpenTasks(a, b)` | dated before undated; earlier date first; same date: timed by time, then date-only; undated oldest created first; equal → creation order |
| BR-4 Completion | `completionDate(now)` → today | completed at 23:59 Toronto = 04:59 UTC next day → **Toronto date** |
| BR-5 Overdue | `isOverdue(due, now)` | date-only yesterday → true; date-only today → false; today 09:00 at 09:01 → true; today 09:00 at 09:00 → false; no date → false |
| BR-6 Label | `dueLabel(due, now)` | "Today"; "Fri, Jan 8, 2027" when the year differs; "Tomorrow 9:00 a.m."; "Thu, Nov 20"; "Thu, Nov 20 2:00 p.m."; "Was due today 2:00 p.m."; "Was due Mon, Nov 17"; 12:00 → "12:00 p.m."; 00:30 → "12:30 a.m." |
| BR-7 Urgency | `urgency(due, now)` → `"overdue" \| "soon" \| "none"` | overdue wins over today; today/tomorrow → soon; day after tomorrow → none; no date → none; month and year boundaries (Dec 31 → Jan 1) |
| BR-8 Deleted | enforced in the repository (§4) | checked on the `dev` database, like BR-3 of spec 001 |

Labels are built in the domain with fixed English names, not with `Intl` time formatting: browsers and servers disagree on "PM" vs "p.m.", and the spec asks for "p.m.".

## 4. Data model

| Column | Type | Rule |
|---|---|---|
| `id` | `uuid` PK, default `gen_random_uuid()` | |
| `title` | `text NOT NULL` | `CHECK (char_length(title) BETWEEN 1 AND 200)` — second line of defence for BR-1 |
| `due_date` | `date NULL` | ADR-0013: Toronto wall-clock |
| `due_time` | `time NULL` | `CHECK (due_time IS NULL OR due_date IS NOT NULL)` — BR-2 |
| `completed_on` | `date NULL` | set = done (archived), BR-4 |
| `deleted_at` | `timestamptz NULL` | set = deleted (D-2) |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | BR-3 tie-break |

- No `user_id`: single-user app, as for `usage_day`.
- **Open tasks** = `completed_on IS NULL AND deleted_at IS NULL`. Every repository query that lists or counts tasks includes `deleted_at IS NULL` (BR-8).
- Sorting is done in the domain (`compareOpenTasks`), not in SQL, so BR-3 has one tested source of truth. A personal list is small enough.
- The architecture's draft model (`done_at timestamp`) is replaced by `completed_on date`: the retro needs the **local date**, not the instant. Architecture §3 is updated to match.

## 5. Key design points

### 5.1 Access control (AC-S.1)

Every server action in `task-actions.ts` starts with `getAllowedSession()` and refuses (throws, no data) without an allowed session — server actions are public HTTP endpoints. The home page already calls `requireAllowedSession()` first. Each action **re-validates** its input with the domain functions (BR-1, BR-2) and checks the `id` is a UUID: the client is never trusted. Verified like spec 001: a direct POST to an action with no cookie and with a fake cookie → refused, database unchanged.

### 5.2 Instant feedback without waiting for the server (principle 2)

- **Add:** the form clears at once and the new task shows as pending (`useOptimistic`), then the server render replaces it (Next.js "optimistic comments" pattern).
- **Done / Delete:** the row disappears at once (optimistic), the action runs, then `refresh()` re-renders the list from the database.
- **Undo bar:** a client component shows "Task done · Undo" / "Task deleted · Undo" for 5 s. Undo calls `reopenTask` / `restoreTask`. A new action replaces the bar (only the last action can be undone). Undo waits for the first action to finish, so the two can't cross.
- If an action fails (network), the optimistic change rolls back automatically and a short message shows.

### 5.3 Delete with undo → soft delete (D-2)

"Undo" must bring the task back **exactly as it was** (AC-6.2). The simplest reliable way is a soft delete: `deleted_at` is set, the row stays, and every query ignores it (BR-8). Undo clears `deleted_at`. A "delete for real after 5 s" timer in the browser would be lost if the app is closed during those 5 s.

### 5.4 Date and time input on the iPhone

- Native `<input type="date">` and `<input type="time">`: iOS shows its own wheel pickers, which are thumb-friendly and cost no code (AC-2.8).
- The add form shows the title field and an **"Add date"** button; the date field appears only when tapped (principle 3: minimal input), then an **"Add time"** button. Time is impossible without a date (BR-2).
- An explicit **"Remove date"** button clears date and time (AC-4.2): clearing a native date picker on iOS is not obvious.
- **Edit** is inline: tapping a task's title expands the row into the same fields with Save, Cancel and Delete. No new page, no navigation.

### 5.5 Colours (AC-2.3 to AC-2.6)

- Overdue: red text on the due label + a thin red left border. Soon: amber, same pattern. None: grey label.
- Shades chosen for **≥ 4.5:1 contrast** in light and dark mode (e.g. Tailwind `red-700`/`red-400`, `amber-700`/`amber-400`).
- The text label is always present, so the meaning never relies on colour (WCAG 1.4.1).

### 5.6 Keeping "now" current

Labels and colours are computed on the server at render time. When the installed app comes back to the screen, spec 001's `visibilitychange` → `recordVisit()` → `refresh()` already re-renders the page, so a task that became overdue overnight turns red on resume. **Known limit:** if the app stays open on screen, a task due at 2:00 p.m. turns red at the next refresh, not at 2:00 p.m. exactly. Acceptable: no one watches the list for a minute to change.

### 5.7 Speed (NFR-03)

The home page now runs two small queries: usage count and open tasks. They run **in parallel** (`Promise.all`), so the warm open should stay close to spec 001's 1.08 s. Re-measured during UAT.

### 5.8 Migration

`npm run db:generate` creates the SQL file, reviewed in the PR. Applied to Neon `dev` locally, then automatically to `production` by `vercel-build` on merge (spec 001 §5.7). Adding a table is non-breaking.

## 6. Acceptance criteria → how each is verified

| AC | Verified by |
|---|---|
| AC-1.1, AC-1.2, AC-1.3 | UAT; BR-2 unit tests |
| AC-1.4, AC-1.5 | BR-1 unit tests + server re-validation + UAT |
| AC-2.1 | BR-3 unit tests + UAT with the mixed list from the checklist |
| AC-2.2 to AC-2.5 | BR-5, BR-6, BR-7 unit tests + UAT |
| AC-2.6 | Design (§5.5) + UAT |
| AC-2.7, AC-2.8 | UAT on iPhone |
| AC-3.1, AC-3.2 | BR-4 unit test + Claude checks `completed_on` on the database + UAT |
| AC-4.1 to AC-4.3 | UAT; BR-1/BR-2 on the server |
| AC-5.1, AC-5.2 | Repository check on `dev` (deleted row never listed) + UAT |
| AC-6.1 to AC-6.3 | UAT |
| AC-S.1 | Claude: direct POST without cookie / with fake cookie → refused, no row changed |

## 7. Order of work (preview of tasks.md)

**Slice 1 — add and see** (deployable, usable on the phone)
1. Domain: `localTime`, BR-1 to BR-7 with tests.
2. `task` table + migration on `dev`; repository (create, list open).
3. Server action `createTask` with session check; AC-S.1 check.
4. Home page: list, add form with optional date/time, labels, colours, empty state. → PR, merge, deploy. ⛳ **PO tries it on the iPhone** (early feedback on the input flow before building the rest).

**Slice 2 — done, edit, delete, undo**
5. Actions `completeTask`, `reopenTask`, `updateTask`, `deleteTask`, `restoreTask` (session check, re-validation, BR-8).
6. Checkbox + optimistic removal + undo bar; inline edit; delete. → PR, merge, deploy.
7. ⛳ **PO UAT** with the spec's checklist; warm-open timing re-measured.

## 8. PO setup

None. No new account, no new environment variable.

## 9. Decisions — resolved by the PO on 2026-11-17

All three recommendations accepted.

| # | Decision | Options | Recommendation → **Resolution** |
|---|---|---|---|
| D-1 | Accept **ADR-0013** (store due date/time as Toronto wall-clock)? | A. wall-clock · B. UTC instant | **A** — every rule becomes a string comparison, no daylight-saving code. Only downside: travelling, which is out of scope. → **Accepted**; travel would get its own ADR + migration. |
| D-2 | What does "delete" do in the database? | A. **Soft delete** (`deleted_at`; row kept, never shown or counted) · B. Hard delete after the 5 s undo window | **A** — undo is exact and survives closing the app. The row is invisible everywhere. → **Accepted**; PO asked to watch storage (risk in §10). |
| D-3 | A due date in **another year**: show the year? The spec's format ("Thu, Nov 20") doesn't say. | A. Add the year only when it differs from this year ("Fri, Jan 8, 2027") · B. Never show the year | **A** — a January deadline set in November would otherwise be ambiguous. → **Accepted**; spec BR-6 updated (v1.1). |

## 10. Risks

| Risk | Impact | Response |
|---|---|---|
| iOS date/time inputs behave oddly (clearing, empty display, styling) | AC-1.2, AC-4.2 | Explicit "Add date" / "Remove date" buttons (§5.4); PO tries slice 1 on the phone before slice 2 |
| Optimistic UI and undo race (undo before the first action finished) | Wrong final state | Undo waits for the pending action (§5.2); tested by tapping fast during UAT |
| A second query slows the home page | NFR-03 | Parallel queries (§5.7); re-measured in UAT |
| Soft-deleted and done tasks fill the free database (PO question) | NFR-08 ($0) | Measured 2026-11-17: the whole `dev` database is **7.9 MB**, mostly PostgreSQL's own catalog. A task row is ~200 bytes with its index entry: 20 tasks a day for a year ≈ **1.5 MB**. Far below the Neon Free storage limit (checked at each spec's setup, AR1). If it ever matters, a purge of soft-deleted rows older than N days is a one-line job — backlog idea, not now. |
| Slice 2 not ready by Sun 2026-11-22 | R1 target | Slice 1 alone already replaces adding to the note; "cut from the end" rule of the release plan |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-17 | First draft — 3 decisions for the PO, ADR-0013 proposed |
| 1.0 | 2026-11-17 | Validated by PO: ADR-0013 accepted, soft delete, year when different; storage risk measured |
