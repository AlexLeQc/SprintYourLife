# Spec 002 — Tasks

| | |
|---|---|
| **Status** | Delivered — 2026-11-22 |
| **Backlog items** | F01 Tasks |
| **Release** | R1 — Usable |
| **Depends on** | [001 Foundation](../001-foundation/spec.md) (Delivered) |
| **Related** | [vision](../../docs/vision.md) §5 principles 1 (v0.3), 3, 5 · §6 glossary "Task" · [architecture](../../docs/architecture.md) |
| **Last updated** | 2026-11-17 |

---

## 1. Goal

Put my **obligations** (homework, appointments, job applications) in the app, so that I open it every day for them — and, once later specs ship, see my sidequests at the same time (principle 5: *obligations are the hook*).

**Why second:** tasks are the simplest end-to-end feature (one table, one list, one form), and they make the app useful from day one, before the Bank exists.

**What "done" means for this spec:** I can stop using my "to-do" note and use the app instead.

## 2. User stories

| ID | Story |
|---|---|
| US-1 | As the owner, I want to **add a task in a few seconds** (title, optional due date, optional time), so that capturing an obligation is faster than opening my notes app. |
| US-2 | As the owner, I want to **see my open tasks, soonest due first, with a colour when one is due soon or late**, so that I notice what needs doing at a glance. |
| US-3 | As the owner, I want to **mark a task done in one tap**, so that it leaves my list. |
| US-4 | As the owner, I want to **edit a task's title, date and time**, so that I can fix a mistake or a changed plan. |
| US-5 | As the owner, I want to **delete a task**, so that a cancelled obligation doesn't stay on my list or count as done. |
| US-6 | As the owner, I want to **undo** a mis-tapped "done" or "delete", so that one-tap actions are safe. |

## 3. Acceptance criteria

*All dates and times are local `America/Toronto` wall-clock values (`src/domain/local-date.ts`). Every page and server action calls `requireAllowedSession()` first (CLAUDE.md).*

### US-1 — Add a task

- **AC-1.1** — **Given** I am on the home page, **When** I type a title and confirm (button or Return), **Then** the task appears in the list and the input is cleared and ready for the next one.
- **AC-1.2** — **Given** I am adding a task, **When** I pick a due date, **Then** the task is saved with that date. No date is the default.
- **AC-1.3** — **Given** I picked a due date, **When** I also pick a time, **Then** the task is saved with that date and time. The time is optional and can only be set once a date is set.
- **AC-1.4** — **Given** the title is empty or only spaces, **When** I confirm, **Then** nothing is saved and nothing else happens (no error dialog).
- **AC-1.5** — **Given** a title longer than 200 characters, **When** I confirm, **Then** it is refused with a short message.

### US-2 — See open tasks

- **AC-2.1** — **Given** I have open tasks, **When** I open the home page, **Then** they are listed below the "Used N of the last 7 days" line, sorted per BR-3.
- **AC-2.2** — **Given** a task with a due date, **Then** it shows its due label per BR-6 (e.g. "Today", "Tomorrow 9:00 a.m.", "Fri, Nov 20").
- **AC-2.3** — **Given** an overdue task (BR-5), **Then** it shows "Was due …" (e.g. "Was due Tue, Nov 17", "Was due today 2:00 p.m.") in **red**.
- **AC-2.4** — **Given** a task that is not overdue and is due today or tomorrow, **Then** its due label is shown in **amber**.
- **AC-2.5** — **Given** any other task (due later, or no date), **Then** it has no urgency colour.
- **AC-2.6** — Colour is never the only signal: every coloured task also shows its due label as text (WCAG 1.4.1).
- **AC-2.7** — **Given** I have no open tasks, **Then** I see a calm empty state ("Nothing to do."), not a celebration and not a nudge.
- **AC-2.8** — **Given** the phone layout, **Then** adding a task, marking one done and opening one for editing are reachable with the thumb, without zooming.

### US-3 — Mark done

- **AC-3.1** — **Given** an open task, **When** I tap its checkbox, **Then** it leaves the list right away and its completion date (today) is recorded (BR-4).
- **AC-3.2** — **Given** a done task, **Then** it is **archived**: kept in the database, not shown in the list. *(A page listing done tasks is backlog C08.)*

### US-4 — Edit

- **AC-4.1** — **Given** an open task, **When** I tap its title, **Then** I can change its title, due date and time, then save or cancel.
- **AC-4.2** — **Given** I am editing, **When** I clear the due date, **Then** the time is cleared too.
- **AC-4.3** — **Given** I save an edit, **Then** the same title rules as creation apply (BR-1) and the list re-sorts and re-colours immediately.

### US-5 — Delete

- **AC-5.1** — **Given** an open task, **When** I choose "Delete" (from the edit view), **Then** it leaves the list right away, without an "Are you sure?" dialog (the undo of US-6 is the safety net).
- **AC-5.2** — **Given** a deleted task, **Then** it is not shown anywhere and is not counted in any summary, including the future retro (BR-7).

### US-6 — Undo

- **AC-6.1** — **Given** I just marked a task done, **Then** a bar "Task done · Undo" shows for about 5 seconds; **When** I tap Undo, **Then** the task is back in the list, open, with no completion date.
- **AC-6.2** — **Given** I just deleted a task, **Then** a bar "Task deleted · Undo" shows for about 5 seconds; **When** I tap Undo, **Then** the task is back exactly as it was.
- **AC-6.3** — **Given** the bar has disappeared, **Then** the action is final for this spec (no other way back in the UI).

### Security

- **AC-S.1** — **Given** I am not signed in (or refused), **When** a request is sent directly to any task server action, **Then** it is refused and no task is read, created, changed or deleted.

## 4. Business rules (→ unit tests in `src/domain/`)

| ID | Rule |
|---|---|
| BR-1 | A title is trimmed; it must be 1–200 characters after trimming. |
| BR-2 | A due is: none; a **date**; or a **date + time**. A time without a date is invalid. Values are stored as local Toronto wall-clock (date, time), not as a UTC instant. A past due is allowed. |
| BR-3 | Open tasks sort: tasks **with** a due date first, by date; on the same date, **timed tasks first by time, then date-only tasks** (a date-only task means "by end of day"); then tasks **without** a date, oldest created first. Ties keep creation order. |
| BR-4 | Marking a task done records its **completion date** (local date), kept for the sprint retro (F06). Undo clears it. |
| BR-5 | A task is **overdue** when it is open and: date-only → its date is before today; timed → its date + time is before now. |
| BR-6 | Due label: "Today" / "Tomorrow" / short date ("Fri, Nov 20"), followed by the time when set ("2:00 p.m."). The year is added only when it differs from the current year ("Fri, Jan 8, 2027"). Overdue tasks prefix "Was due" ("Was due today 2:00 p.m.", "Was due Tue, Nov 17"). |
| BR-7 | Urgency level: **overdue** (red) per BR-5; else **soon** (amber) when the due date is today or tomorrow; else **none**. Tasks without a date are always none. |
| BR-8 | A deleted task is excluded from every list and every count. |

## 5. Out of scope

- A page listing done tasks — backlog **C08** (Done list).
- Restoring a task after the undo bar is gone.
- Recurring tasks — backlog C03, watch during UAT.
- Priorities, tags, categories, notes, sub-tasks on tasks.
- Time zones other than Toronto (travelling).
- Linking tasks to sprints — tasks are not tied to a sprint (glossary). The sprint planning view (F05) reads due dates.
- Notifications and reminders (Won't).
- The "What can I do now?" screen (F04) and its layout — PO ideas are recorded on F04 in the backlog.
- Urgency colours on sidequests — never (vision principle 1 v0.3); category colours are decided in F02.
- Drag-and-drop reordering — order is fixed by BR-3 (principle 4: the app shows facts).

## 6. Data the later specs need (design note)

| Field | Needed by |
|---|---|
| `due_date` (date, nullable), `due_time` (time, nullable) | F04 urgent tasks on top; F05 planning view "tasks due during the sprint" |
| `completed_on` (date, nullable) | F06 retro "tasks done during the sprint"; C08 Done list |
| `created_at` (timestamp) | BR-3 tie-break; F06 retro "not done" |

Storing local wall-clock values (BR-2) is an architecture choice; the plan records it as an ADR.

## 7. Open questions — resolved by the PO on 2026-11-17

| # | Question | Resolution |
|---|---|---|
| OQ-1 | Edit and delete in this spec? | **Yes, both** (US-4, US-5). Without delete, a cancelled task could only leave the list as a fake "done", which would distort the retro. |
| OQ-2 | How to recover a mis-tapped "done"? | **Undo bar** (US-6), also used for delete. A Done list ("trophy list") is wanted later → backlog **C08**. |
| OQ-3 | Where does the task list live? | **Home page** for now. F04 will rework it; PO layout ideas noted on F04. |
| OQ-4 | Overdue wording? | **"Was due Tue, Nov 17"** — in red (see OQ-5). |
| OQ-5 | Urgency colours on tasks (raised by the PO, against principle 1 v0.2)? | **Yes, two levels**: red = overdue, amber = due today or tomorrow, always with a text label. Vision principle 1 amended (v0.3). |
| OQ-6 | Due time (raised by the PO)? | **Optional time** on a dated task (BR-2, BR-3, BR-5). |

## 8. UAT checklist (for the PO)

To be run on production, with the real phone:

- [x] AC-1.1 to AC-1.5 — add tasks: title only, with a date, with a date + time; blank title ignored; 201 characters refused
- [x] AC-2.1, AC-2.2 — order and labels match BR-3 / BR-6 with a mix: no date, today, today 9 a.m., tomorrow, next week
- [x] AC-2.3 to AC-2.6 — a task due yesterday is red with "Was due …"; a task due today at a time already passed is red; today/tomorrow is amber; next week has no colour; every coloured one has text
- [x] AC-2.7 — empty list shows "Nothing to do."
- [x] AC-2.8 — everything reachable one-handed on the iPhone
- [x] AC-3.1, AC-3.2 — mark done → leaves the list; Claude checks `completed_on` in the database
- [x] AC-4.1 to AC-4.3 — edit title, date and time; clearing the date clears the time
- [x] AC-5.1, AC-5.2 — delete without a dialog; gone from the list
- [x] AC-6.1 to AC-6.3 — undo a done and a delete within 5 s; after the bar is gone, the action is final
- [x] AC-S.1 — Claude shows a direct server-action request without a session is refused
- [x] Use it instead of the to-do note for a few days; note any friction (input for C03, C08)

**UAT notes** — PO: Alexis · 2026-11-17 → 2026-11-22 · production (`sprintyourlife.vercel.app`) + iPhone

| AC | Result | Evidence |
|---|---|---|
| AC-1.1 to AC-1.5 | ✅ Pass | PO, iPhone. Production data: no task with a time but no date; longest stored title 23 characters (nothing over 200 got in) |
| AC-2.1 to AC-2.8 | ✅ Pass | PO, iPhone: order, labels, red/amber colours, empty state, one-handed use. T08: iOS pickers "nice", add field at the top is fine |
| AC-3.1, AC-3.2 | ✅ Pass | PO, iPhone. Production: 2 done tasks, both `completed_on` = 2026-11-17 (Toronto); not listed |
| AC-4.1 to AC-4.3 | ✅ Pass | PO, iPhone |
| AC-5.1, AC-5.2 | ✅ Pass | PO, iPhone. Production: 7 deleted rows, none listed (T12 query) |
| AC-6.1 to AC-6.3 | ✅ Pass | PO, iPhone. Fast undo (50 ms) also checked by Claude locally (T10) |
| AC-S.1 | ✅ Pass | Claude: all 6 task actions refuse a fake session ("Not allowed"), no row changed (T06, T09) |
| Warm-open timing (plan §5.7) | ✅ Pass | 2026-11-22, iPhone: warm **0.5 s** (spec 001: 1.08 s), cold **3.84 s** (spec 001: 3.66 s); varies from one try to the next. The second query didn't slow the open down. |
| Use instead of the to-do note for a few days | ✅ Pass | Used **7 of the last 7 days** (production: a usage day for every day 2026-11-16 → 22; 7 tasks done across 4 days). The app took the social-media app's place on the home screen. Little friction. One new need: a daily checklist of routine items (backlog idea inbox). |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-17 | First draft — 4 open questions for the PO |
| 1.0 | 2026-11-17 | PO decisions: edit + delete, undo bar, home page, "Was due …", urgency colours (2 levels), optional time; UAT checklist |
| 1.1 | 2026-11-17 | BR-6: year shown when it differs from the current year (plan 002 D-3) |
| 1.2 | 2026-11-17 | Examples only: weekdays corrected to the 2026 calendar (Fri, Nov 20; Tue, Nov 17), found by the BR-6 tests. No rule changed. |
| 1.3 | 2026-11-17 | UAT day 1: all ACs pass; status In UAT; daily-use check pending |
| 1.4 | 2026-11-22 | UAT complete; status Delivered |
