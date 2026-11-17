# Spec 002 — Tasks

| | |
|---|---|
| **Status** | Spec draft — awaiting PO decisions on §7 |
| **Backlog items** | F01 Tasks |
| **Release** | R1 — Usable |
| **Depends on** | [001 Foundation](../001-foundation/spec.md) (Delivered) |
| **Related** | [vision](../../docs/vision.md) §5 principles 1, 3, 5 · §6 glossary "Task" · [architecture](../../docs/architecture.md) |
| **Last updated** | 2026-11-17 |

---

## 1. Goal

Put my **obligations** (homework, appointments, job applications) in the app, so that I open it every day for them — and, once later specs ship, see my sidequests at the same time (principle 5: *obligations are the hook*).

**Why second:** tasks are the simplest end-to-end feature (one table, one list, one form), and they make the app useful from day one, before the Bank exists.

**What "done" means for this spec:** I can stop using my "to-do" note and use the app instead.

## 2. User stories

| ID | Story |
|---|---|
| US-1 | As the owner, I want to **add a task in a few seconds** (title, optional due date), so that capturing an obligation is faster than opening my notes app. |
| US-2 | As the owner, I want to **see my open tasks, soonest due first**, so that I know what's pressing at a glance. |
| US-3 | As the owner, I want to **mark a task done in one tap**, so that it leaves my list. |
| US-4 | As the owner, I want to **fix a mistake** (wrong title or date, mis-tapped "done", task no longer relevant), so that the list stays true. *(Scope depends on OQ-1 and OQ-2.)* |

## 3. Acceptance criteria

*All dates are local dates in `America/Toronto` (`src/domain/local-date.ts`). Every page and server action calls `requireAllowedSession()` first (CLAUDE.md).*

### US-1 — Add a task

- **AC-1.1** — **Given** I am on the task list, **When** I type a title and confirm (button or Return), **Then** the task appears in the list and the input is cleared and ready for the next one.
- **AC-1.2** — **Given** I am adding a task, **When** I pick a due date, **Then** the task is saved with that date. The date is optional; no date is the default.
- **AC-1.3** — **Given** the title is empty or only spaces, **When** I confirm, **Then** nothing is saved and nothing else happens (no error dialog).
- **AC-1.4** — **Given** a title longer than 200 characters, **When** I confirm, **Then** it is refused with a short message.

### US-2 — See open tasks

- **AC-2.1** — **Given** I have open tasks, **When** I open the task list, **Then** they are sorted per BR-3.
- **AC-2.2** — **Given** a task is due today, **Then** it shows "Today"; due tomorrow, "Tomorrow"; otherwise a short date (e.g. "Thu, Nov 20").
- **AC-2.3** — **Given** a task's due date is in the past and it is not done, **Then** it shows a neutral label — wording per OQ-4 — **with no red and no warning icon** (principle 1).
- **AC-2.4** — **Given** I have no open tasks, **Then** I see a calm empty state (e.g. "Nothing to do."), not a celebration and not a nudge.
- **AC-2.5** — **Given** the phone layout, **Then** adding a task and marking one done are reachable with the thumb, without zooming.

### US-3 — Mark done

- **AC-3.1** — **Given** an open task, **When** I tap its checkbox, **Then** it leaves the open list right away and its completion date (today) is recorded (BR-4).
- **AC-3.2** — **Given** a done task, **Then** it is **archived**: kept in the database, not shown in the open list. *(Whether I can see it again depends on OQ-2.)*

### US-4 — Fix mistakes *(final wording after §7 decisions)*

- **AC-4.1** — Undo a mis-tapped "done" — see OQ-2.
- **AC-4.2** — Edit title and due date — see OQ-1.
- **AC-4.3** — Delete a task — see OQ-1.

### Security

- **AC-S.1** — **Given** I am not signed in (or refused), **When** a request is sent directly to any task server action, **Then** it is refused and no task is read, created or changed.

## 4. Business rules (→ unit tests in `src/domain/`)

| ID | Rule |
|---|---|
| BR-1 | A title is trimmed; it must be 1–200 characters after trimming. |
| BR-2 | A due date is a calendar date (no time), or none. A past date is allowed (I may log something already late). |
| BR-3 | Open tasks are sorted: tasks **with** a due date first, earliest date first; then tasks **without** a date, oldest created first. Ties keep creation order. |
| BR-4 | Marking a task done records its **completion date** (local date). It is kept for the sprint retro (F06: "tasks done during the sprint"). |
| BR-5 | A task is *overdue* when it is not done and its due date is before today. "Today" and "Tomorrow" follow BR-2 of spec 001 (Toronto time). |

## 5. Out of scope

- Due **times** (appointments at 2 p.m.) — date only; put the time in the title. *(Revisit if UAT shows it hurts.)*
- Recurring tasks — backlog C03, watch during UAT.
- Priorities, tags, categories, notes, sub-tasks on tasks.
- Linking tasks to sprints — tasks are not tied to a sprint (glossary). The sprint planning view (F05) reads due dates.
- Notifications and reminders (Won't).
- The "What can I do now?" screen (F04) and its definition of "urgent".
- Drag-and-drop reordering — order is fixed by BR-3 (principle 4: the app shows facts).

## 6. Data the later specs need (design note)

Recorded here so that 002 doesn't paint F04–F06 into a corner:

| Field | Needed by |
|---|---|
| `due_date` (date, nullable) | F04 urgent tasks on top; F05 planning view "tasks due during the sprint" |
| `completed_on` (date, nullable) | F06 retro "tasks done during the sprint" |
| `created_at` (timestamp) | BR-3 tie-break; F06 retro "not done" |

## 7. Open questions — PO decisions needed

### OQ-1 — Edit and delete: in this spec or not?

The backlog only says *create, mark done, archive*. But typos and cancelled appointments will happen on day 1.

| Option | Pros | Cons |
|---|---|---|
| **A. Edit + delete** | List stays true; a cancelled appointment isn't falsely counted as "done" in the retro (F06) | ~1 more screen/interaction to build and test |
| B. Delete only | Smaller; fix a typo by delete + re-add | Re-typing on the phone; losing the date by accident |
| C. Neither | Smallest | Workaround = mark a cancelled task "done" → **pollutes the retro's "tasks done" count** (M2/F06 data quality) |

**Recommendation: A.** The retro metric is the deciding factor: without delete, the only way out of a dead task is a fake "done".

### OQ-2 — Mis-tapped "done": how do I get it back?

One-tap done on a phone (principle 3) means mis-taps.

| Option | Pros | Cons |
|---|---|---|
| **A. "Undo" for a few seconds** after marking done (small bar at the bottom) | Fixes the 95 % case instantly; no extra screen | Doesn't help if I notice later |
| B. A "Done" list where I can reopen a task | Also covers "noticed later"; lets me see what I finished | Extra screen; risk of becoming a trophy list |
| C. A + B | Covers everything | Most work |

**Recommendation: A** now; B only if UAT shows I need it (principle 6). The retro (F06) will show completed tasks anyway.

### OQ-3 — Where does the task list live?

The home page is a placeholder today. F04 ("What can I do now?") will become the default mobile screen later.

| Option | Pros | Cons |
|---|---|---|
| **A. Home page = task list** for now (keep the "Used N of the last 7 days" line) | Zero navigation; opening the app = seeing tasks | F04 will rework the home page |
| B. A separate `/tasks` page + a link from home | Home stays free for F04 | One extra tap every time, in the "seconds" context |

**Recommendation: A.** F04 will need to show tasks anyway; reworking the home then is cheap, an extra tap every day until then is not.

### OQ-4 — Wording for an overdue task

Principle 1 forbids red "you failed" states, but an overdue obligation is a real fact I should see.

| Option | Example |
|---|---|
| **A. Factual date** | "Was due Mon, Nov 17" |
| B. Neutral word | "Overdue" (grey) |
| C. Nothing special | Just the date, at the top because of the sort |

**Recommendation: A.** It's a fact, not a judgment, and it tells me *how* late without colour. It also sorts to the top (BR-3), which is enough emphasis.

## 8. UAT checklist (for the PO)

*Filled in once §7 is decided.*

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-17 | First draft — 4 open questions for the PO |
