# Product Backlog — SprintYourLife

| | |
|---|---|
| **Status** | Draft v0.1 — awaiting Product Owner validation |
| **Last updated** | 2026-11-17 |
| **Source** | [`docs/vision.md`](../docs/vision.md) |

Prioritization: **MoSCoW**, rated by **value to the user**, not by effort. Rule: at most 6 Musts in the MVP.

Spec status values: `Idea` → `Spec draft` → `Spec validated` → `Planned` → `In progress` → `In UAT` → `Delivered`.

---

## MVP

### Enablers (technical foundations, required by every feature)

| ID | Item | Why | Status |
|---|---|---|---|
| E01 | **Walking skeleton**: React app + Node API + SQL database, deployed at $0, installable PWA | NFR-01, NFR-08 — every feature builds on it | Planned — [001](001-foundation/spec.md) |
| E02 | **Private access**: Google sign-in restricted to an allowlist, long-lived session | NFR-02, NFR-05 | Planned — [001](001-foundation/spec.md) |
| E03 | **Usage days**: record one usage day per calendar day the app is opened | Measures M1 (displayed in the retro, F06) | Planned — [001](001-foundation/spec.md) |
| E04 | **CI**: tests on business rules run on every push | Quality bar (option b) | Baseline in [001](001-foundation/spec.md), grows with each feature |

### Must (6)

| ID | Feature | Summary | Depends on | Status |
|---|---|---|---|---|
| F01 | **Tasks** | Create a task (title, optional due date and time), edit, delete, mark done with undo; urgency colours; done tasks are archived. | E01, E02 | Planned — [002](002-tasks/spec.md) |
| F02 | **Sidequest bank** | Create sidequests (title + category from a fixed list), browse them. | E01, E02 | Idea |
| F03 | **One-tap log** | Mark that I did a sidequest. Optional duration and free-text note (e.g. "best time 1:42"). | F02 | Idea |
| F04 | **"What can I do now?" screen** | Phone-first screen: urgent tasks on top, a few sidequests below, nothing else. Default screen on mobile. *PO layout ideas (spec 002 OQ-3): Now content on top with tasks below on scroll, or bottom tabs "Tasks / Sidequests".* | F01, F02 | Idea |
| F05 | **Sprint + measurable goal** | Start a 2-week sprint, pick one sidequest as its goal, which **requires** a measurable criterion. Planning view shows tasks due during the sprint. | F01, F02 | Idea |
| F06 | **Sprint retro** | At sprint end: auto summary (tasks done / not done, sessions logged, usage days), "goal reached?", 2 free-text fields. Goal is then reached, carried over, or returned to the Bank. | F03, F05, E03 | Idea |

### Release plan

| Release | Content | Target | Why this date |
|---|---|---|---|
| **R1 — Usable** | E01, E02, E03, F01 → F02 → F03 → F04 → F05 (in that order) | **Sun 2026-11-22** (stretch) | Start Sprint 1 on its first Sunday |
| **R2 — Full loop** | F06 (retro), S01 if time allows | **Before Sun 2026-12-06** | The retro is only needed at the end of Sprint 1 — build it *during* the sprint |

E04 (CI) starts with the first business rule and grows with each feature.

**If R1 is late:** cut from the end, never from the middle. If F05 isn't ready on the 22nd, write the Sprint 1 goal down and enter it when F05 ships — the sprint still starts on time.

*Rationale: thin vertical slices. Tasks (F01) are the simplest end-to-end feature, and they are the "hook" that makes the app useful from day one. Sprint 1 (Nov 22 – Dec 5) overlaps end-of-semester exams: choose a light goal.*

### Should

| ID | Feature | Summary |
|---|---|---|
| S01 | **Learning plan on a sprint goal** | A free-text field on the goal to paste a plan (steps, resources, estimated session length) prepared with the external Claude Project coach. |

---

## Later

### Could

| ID | Feature | Note |
|---|---|---|
| C01 | Weekly check-in | Short form, ~15 min. |
| C02 | Sprint history | List of past sprints and retros. |
| C03 | Recurring tasks (weekly) | E.g. "call a friend" every week. **Watch during UAT**: if recreating weekly tasks by hand is painful, promote this. |
| C04 | Duration on sidequests + "I have 15 min" filter | |
| C05 | Stats and progress charts | Use the free-text log notes to learn which data is worth structuring. |
| C06 | Integrated AI coach | Starts from the Claude Project's instructions as system prompt. Needs its own ADR (model, cost, privacy). |
| C07 | Data export (JSON/CSV) | Cheap insurance for accepted risk R1 (no custom backups). |
| C08 | Done list | Page of done tasks, newest completion first ("trophy list"). Serves M4 (motivation). Data already stored by spec 002 (`completed_on`). |

### Won't (for the MVP)

| Item | Reason |
|---|---|
| Notifications / reminders | Not needed to validate the core loop |
| Recruiter demo mode with fake data | Portfolio comes after usefulness |
| Offline mode | Always have mobile data (NFR-10) |
| Automatic capacity planning | Design principle 4: the human plans |
| Custom backup system | Risk accepted by PO (vision §11, R1) — rely on the provider |
| Streaks | Design principle 1: no streak that can be broken |
| Multi-user, gym/nutrition, hour-by-hour calendar | Out of scope — see vision §7 |

---

## Idea inbox

New ideas land here first, unprioritized. They are reviewed at each retro and either moved into the backlog or dropped.

- Purge soft-deleted tasks older than N days, if database storage ever becomes a concern (plan 002 §10: ~1.5 MB/year expected).

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-16 | First draft from discovery |
| 0.2 | 2026-11-16 | E03 backups → usage days; release plan R1/R2; streaks and custom backups moved to Won't |
| 0.3 | 2026-11-17 | F01 scope from spec 002 (edit, delete, undo, time, urgency colours); C08 Done list; F04 layout ideas |
