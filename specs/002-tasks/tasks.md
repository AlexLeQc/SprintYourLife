# Tasks 002 — Tasks

| | |
|---|---|
| **Status** | Done — 13 / 13 — spec 002 Delivered |
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

- [x] **T04** 🤖 **`task` table and migration**
  Drizzle schema from plan §4 (incl. the two `CHECK` constraints), `npm run db:generate`, apply to Neon `dev`.
  *Done when:* the migration file is committed; on `dev`, inserting a time without a date and a 201-character title are both refused by the database.

- [x] **T05** 🤖 **Repository: create and list open**
  `server/task-repository.ts`: `createTask`, `listOpenTasks` (excludes done and deleted, BR-8), sorted with `compareOpenTasks`.
  *Done when:* checked on `dev`: a created task is listed; a row with `deleted_at` or `completed_on` set is not.

- [x] **T06** 🤖 **Server action `createTask`** (AC-1.x, AC-S.1)
  `app/(app)/task-actions.ts`: `getAllowedSession()` first, re-validate with BR-1/BR-2, create, `refresh()`.
  *Done when:* a direct POST to the action without a cookie and with a fake cookie is refused and creates no row.

- [x] **T07** 🤖 **Home page: list and add form** (AC-1.1 to AC-2.8)
  Remove the placeholder text. Usage line, then the add form (title + "Add date" → date + "Add time" → time, "Remove date"), then the list with labels and colours (plan §5.4, §5.5), empty state "Nothing to do.". Queries in parallel (§5.7). Optimistic add (§5.2).
  *Done when:* works locally on desktop and in a phone-sized viewport; colours checked in light and dark mode; typecheck, lint, tests pass; PR merged and deployed.

- [x] **T08** 👤 **Try slice 1 on the iPhone** ⛳
  In the installed app: add a task with only a title, one with a date, one with a date + time; check the order and the colours. Tell Claude anything awkward about the date/time input.
  *Done when:* the PO says the input flow is OK (or Claude has adjusted it).

## Slice 2 — Done, edit, delete, undo

- [x] **T09** 🤖 **Repository + actions: complete, reopen, update, delete, restore**
  Repository functions and server actions, each with `getAllowedSession()` first, UUID check and BR-1/BR-2 re-validation (update). `completeTask` stores the Toronto date (BR-4); `deleteTask` sets `deleted_at` (D-2).
  *Done when:* checked on `dev` (complete → `completed_on` = today, reopen clears it; delete → not listed, restore → listed again unchanged); direct POSTs without a session are refused.

- [x] **T10** 🤖 **Mark done + undo bar** (AC-3.1, AC-6.1, AC-6.3)
  Checkbox (thumb-sized, labelled for screen readers), optimistic removal, "Task done · Undo" for 5 s; undo waits for the pending action (plan §5.2).
  *Done when:* works locally, including tapping Undo immediately.

- [x] **T11** 🤖 **Inline edit + delete with undo** (AC-4.1 to AC-5.2, AC-6.2)
  Tap a title → fields, Save / Cancel / Delete; clearing the date clears the time; "Task deleted · Undo" restores the task exactly.
  *Done when:* works locally; typecheck, lint, tests pass; PR merged and deployed.

- [x] **T12** 🤖 **Production check**
  On production: a task done in the app has `completed_on` = today (Toronto) in Neon `production`; a deleted task has `deleted_at` set and is not shown.
  *Done when:* checked and noted in the progress log.

- [x] **T13** 👤 **UAT** ⛳
  Run the [UAT checklist in the spec](spec.md#8-uat-checklist-for-the-po) on production with the iPhone; re-time a warm open (plan §5.7).
  *Done when:* every box is ticked → spec 002 status becomes **Delivered**, backlog F01 becomes **Delivered**.

---

## Progress log

| Date | Tasks | Note |
|---|---|---|
| 2026-11-17 | T01–T03 ✅ | `localTime` / `localNow` (one clock reading, `h23` so midnight is never "24:00"; both daylight-saving days tested). `domain/task.ts`: BR-1 to BR-7 (BR-4 as `completionDate`), 47 new tests, 65 in total. Title length counted in code points to match PostgreSQL `char_length`. Tests showed the spec's example weekdays were wrong for 2026 → spec v1.2 (examples only). |
| 2026-11-17 | T04–T06 ✅ | Migration `0002_create_task` applied to `dev`. Database refuses a time without a date, a 201-character title and an empty title; a valid row is accepted (`due_time` comes back as `HH:MM:SS`, the repository trims it). Repository on `dev`: open tasks in BR-3 order, done and deleted rows excluded (BR-8). AC-S.1: `createTask` without a cookie → 307 to `/sign-in`; with a fake cookie → the action throws "Not allowed" before any query, 0 rows created; same request from the signed-in browser → 200 (control). |
| 2026-11-17 | T07 (code) | Home page: usage line, add form, colour-coded list, empty state. Checked in the browser on desktop and at 375 px, dark and light: order and labels match BR-3/BR-6 for 8 cases (incl. "Was due today 12:05 a.m." and "Fri, Jan 8, 2027 2:00 p.m."), no horizontal scroll, inputs 16 px, no console errors. **Bug found and fixed:** React resets a form after its `action` runs, so a refused 202-character title was wiped; now a submit handler resets only on success. Test rows deleted from `dev`. Waiting: PR merge + deploy. |
| 2026-11-17 | T07 ✅, T08 ⛳ **GO** | PR #10 merged; Vercel production deployment and CI green (migration applied by `vercel-build`). PO on iPhone: slice 1 looks good; iOS date and time pickers are nice; add field stays at the top (simpler with the keyboard). |
| 2026-11-17 | T09 ✅ | Repository on `dev`: complete → `completed_on` = 2026-11-17, not listed; reopen → cleared, listed; update with date removed → date and time null; delete → `deleted_at` set, not listed; a deleted task can't be completed or edited; restore → listed again, row identical to before. AC-S.1: `completeTask`, `deleteTask`, `updateTask`, `restoreTask`, `reopenTask` with a fake cookie → all "Not allowed", rows unchanged. |
| 2026-11-17 | T10 ✅, T11 (code) | Browser (desktop + 375 px, dark + light): done → row leaves at once, "Task done · Undo" for 5 s, then final; **Undo tapped 50 ms after done** → task back, database open (undo waited for the done request). Edit: fields prefilled, title changed + date removed → saved, re-sorted into the undated group. Delete → "Task deleted · Undo" → undo restores it with its date; delete again → gone after 5 s, `deleted_at` set. No console errors, no horizontal scroll. Test rows removed; PO's own `dev` tasks left as they were. Waiting: PR merge + deploy. |
| 2026-11-17 | T11 ✅ | PR #11 merged; CI and Vercel production deployment green. |
| 2026-11-17 | T12 ✅ | PO created "T12 Done" and "T12 Delete" in the installed app, marked one done and deleted the other. PO ran the query in the Neon SQL Editor on `production` (Claude was refused production credentials by Claude Code's safety check): "T12 Done" → `completed_on` = 2026-11-17, not deleted; "T12 Delete" → `completed_on` empty, deleted = true. Matches BR-4 and D-2. |
| 2026-11-17 | — | ADR-0014: PO created a read-only `claude_readonly` role on `production` (all tables except `session`, `account`, `verification`). Claude verified it: reads allowed, sign-in secrets and every write refused. Future production checks no longer need the PO. |
| 2026-11-17 | T13 ⛳ (day 1) | PO ran the UAT checklist on production with the iPhone: everything works. Claude cross-checked production with the read-only role (ADR-0014): 3 open, 2 done (`completed_on` 2026-11-17), 7 deleted, 4 timed, 0 time-without-date, longest title 23. Pending: a few days of real use instead of the to-do note, with friction noted; warm-open time not reported. |
| 2026-11-22 | T13 ⛳ ✅ | Daily use: 7 of the last 7 days (checked on production with the read-only role), little friction; warm open 0.5 s, cold 3.84 s. Spec 002 **Delivered**, backlog F01 Delivered. New need (daily checklist) logged in the backlog idea inbox. |
