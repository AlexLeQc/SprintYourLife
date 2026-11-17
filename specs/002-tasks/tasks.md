# Tasks 002 — Tasks

| | |
|---|---|
| **Status** | In progress — 3 / 13 |
| **Spec** | [spec.md](spec.md) (v1.2) · **Plan** | [plan.md](plan.md) (v1.0) |
| **Branch** | `feat/002-tasks-add` (slice 1), `feat/002-tasks-manage` (slice 2) → pull requests into `main` |
| **Last updated** | 2026-11-17 |

**Legend:** 🤖 Claude · 👤 PO (Alexis: needs your phone) · ⛳ checkpoint (stop until the PO confirms)

Each task is small enough to review in one sitting. Tick the box when its "Done when" is true. No PO setup this time: no new account or environment variable (plan §8).

---

## Slice 1 — Add and see tasks

- [x] **T01** 🤖 **Local time in Toronto**
  `domain/local-date.ts`: add `localTime(instant)` → `"HH:MM"` in `America/Toronto`, and a `localNow(instant)` → `{ date, time }` helper. Tests: 23:59 Toronto = 04:59 UTC next day → same Toronto date; both daylight-saving switch days.
  *Done when:* tests pass.

- [x] **T02** 🤖 **BR-1, BR-2: title and due**
  `domain/task.ts`: `normalizeTitle`, `parseDue` + tests from plan §3 (trim, 1–200, time needs a date, invalid dates and times refused, past allowed).
  *Done when:* tests pass.

- [x] **T03** 🤖 **BR-3, BR-5, BR-6, BR-7: sort, overdue, label, urgency**
  `compareOpenTasks`, `isOverdue`, `dueLabel`, `urgency` + tests from plan §3, incl. "p.m." formatting, the year only when it differs (D-3), and Dec 31 → Jan 1.
  *Done when:* tests pass.

- [ ] **T04** 🤖 **`task` table and migration**
  Drizzle schema from plan §4 (incl. the two `CHECK` constraints), `npm run db:generate`, apply to Neon `dev`.
  *Done when:* the migration file is committed; on `dev`, inserting a time without a date and a 201-character title are both refused by the database.

- [ ] **T05** 🤖 **Repository: create and list open**
  `server/task-repository.ts`: `createTask`, `listOpenTasks` (excludes done and deleted, BR-8), sorted with `compareOpenTasks`.
  *Done when:* checked on `dev`: a created task is listed; a row with `deleted_at` or `completed_on` set is not.

- [ ] **T06** 🤖 **Server action `createTask`** (AC-1.x, AC-S.1)
  `app/(app)/task-actions.ts`: `getAllowedSession()` first, re-validate with BR-1/BR-2, create, `refresh()`.
  *Done when:* a direct POST to the action without a cookie and with a fake cookie is refused and creates no row.

- [ ] **T07** 🤖 **Home page: list and add form** (AC-1.1 to AC-2.8)
  Remove the placeholder text. Usage line, then the add form (title + "Add date" → date + "Add time" → time, "Remove date"), then the list with labels and colours (plan §5.4, §5.5), empty state "Nothing to do.". Queries in parallel (§5.7). Optimistic add (§5.2).
  *Done when:* works locally on desktop and in a phone-sized viewport; colours checked in light and dark mode; typecheck, lint, tests pass; PR merged and deployed.

- [ ] **T08** 👤 **Try slice 1 on the iPhone** ⛳
  In the installed app: add a task with only a title, one with a date, one with a date + time; check the order and the colours. Tell Claude anything awkward about the date/time input.
  *Done when:* the PO says the input flow is OK (or Claude has adjusted it).

## Slice 2 — Done, edit, delete, undo

- [ ] **T09** 🤖 **Repository + actions: complete, reopen, update, delete, restore**
  Repository functions and server actions, each with `getAllowedSession()` first, UUID check and BR-1/BR-2 re-validation (update). `completeTask` stores the Toronto date (BR-4); `deleteTask` sets `deleted_at` (D-2).
  *Done when:* checked on `dev` (complete → `completed_on` = today, reopen clears it; delete → not listed, restore → listed again unchanged); direct POSTs without a session are refused.

- [ ] **T10** 🤖 **Mark done + undo bar** (AC-3.1, AC-6.1, AC-6.3)
  Checkbox (thumb-sized, labelled for screen readers), optimistic removal, "Task done · Undo" for 5 s; undo waits for the pending action (plan §5.2).
  *Done when:* works locally, including tapping Undo immediately.

- [ ] **T11** 🤖 **Inline edit + delete with undo** (AC-4.1 to AC-5.2, AC-6.2)
  Tap a title → fields, Save / Cancel / Delete; clearing the date clears the time; "Task deleted · Undo" restores the task exactly.
  *Done when:* works locally; typecheck, lint, tests pass; PR merged and deployed.

- [ ] **T12** 🤖 **Production check**
  On production: a task done in the app has `completed_on` = today (Toronto) in Neon `production`; a deleted task has `deleted_at` set and is not shown.
  *Done when:* checked and noted in the progress log.

- [ ] **T13** 👤 **UAT** ⛳
  Run the [UAT checklist in the spec](spec.md#8-uat-checklist-for-the-po) on production with the iPhone; re-time a warm open (plan §5.7).
  *Done when:* every box is ticked → spec 002 status becomes **Delivered**, backlog F01 becomes **Delivered**.

---

## Progress log

| Date | Tasks | Note |
|---|---|---|
| 2026-11-17 | T01–T03 ✅ | `localTime` / `localNow` (one clock reading, `h23` so midnight is never "24:00"; both daylight-saving days tested). `domain/task.ts`: BR-1 to BR-7 (BR-4 as `completionDate`), 47 new tests, 65 in total. Title length counted in code points to match PostgreSQL `char_length`. Tests showed the spec's example weekdays were wrong for 2026 → spec v1.2 (examples only). |
