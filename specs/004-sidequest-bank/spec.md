# Spec 004 — Sidequest bank

| | |
|---|---|
| **Status** | Spec draft v0.1 — awaiting PO validation (open questions in §7) |
| **Backlog items** | F02 Sidequest bank |
| **Release** | R1 — Usable |
| **Depends on** | [001 Foundation](../001-foundation/spec.md), [002 Tasks](../002-tasks/spec.md) (Delivered) · [003 Portfolio-ready](../003-portfolio-ready/spec.md) (In UAT — its end-to-end suite must stay green) |
| **Related** | [vision](../../docs/vision.md) §1 root cause, §5 principles 1, 3, 5, 6 · §6 glossary "Sidequest", "Bank", "Category" · [architecture](../../docs/architecture.md) §3 · ADR-0015 |
| **Last updated** | 2026-11-24 |

---

## 1. Goal

Put my **sidequests** (things I want to do or learn this year) in the app, sorted into the five categories, so that they stop living in a note I never open.

**Why now:** F02 is next in the backlog (R1). Every later feature needs it: the log (F03), the "What can I do now?" screen (F04) and the sprint goal (F05) all pick from the Bank.

**What "done" means for this spec:** all my sidequest ideas are in the Bank, and I can browse them by category on the phone.

**Scope decisions made before the draft (PO, 2026-11-24):**

| Decision | Choice | Why |
|---|---|---|
| Quick entry of many sidequests | **Out** | Entering the list is a one-time job, not repeated friction (principle 6). It can be done on desktop. |
| Navigation | **Two tabs, "Tasks" and "Sidequests"; Tasks opens by default** (option C) | Simple, one-thumb pattern. The "sidequests are visible without asking" problem is left to F04, decided from real use (see §6). |
| Kinds of sidequest | **One type.** No "achievement / activity" field | Principle 3 (minimal input). The category already groups them. A measurable criterion is added only when a sidequest becomes a sprint goal (F05). |
| Sprint goal on the Sidequests page | **Not in this spec** | It belongs to F05. This spec is only the Bank. |

## 2. User stories

| ID | Story |
|---|---|
| US-1 | As the owner, I want to **add a sidequest with a title and a category**, so that an idea is captured before I forget it. |
| US-2 | As the owner, I want to **browse my sidequests grouped by category**, so that I can see what I could do in each area of my life. |
| US-3 | As the owner, I want to **switch between my tasks and my sidequests with one tap**, so that both are one thumb away. |
| US-4 | As the owner, I want to **edit a sidequest's title and category**, so that I can fix a typo or a wrong category in a list I keep for a year. |
| US-5 | As the owner, I want to **delete a sidequest, with an undo**, so that an idea I no longer want leaves the Bank safely. |

## 3. Acceptance criteria

*Every page and server action calls `requireAllowedSession()` first (CLAUDE.md).*

### US-1 — Add a sidequest

- **AC-1.1** — **Given** I am on the Sidequests page, **When** I type a title, pick a category and confirm (button or Return), **Then** the sidequest appears in its category and the title input is cleared and ready for the next one.
- **AC-1.2** — **Given** I just added a sidequest, **Then** the category I picked stays selected, so I can add several ideas of the same category in a row.
- **AC-1.3** — **Given** no category is picked, **When** I confirm, **Then** nothing is saved and I am asked to pick a category (see OQ-2 for the default).
- **AC-1.4** — **Given** the title is empty or only spaces, **When** I confirm, **Then** nothing is saved and nothing else happens (same as tasks, spec 002 AC-1.4).
- **AC-1.5** — **Given** a title longer than 200 characters, **When** I confirm, **Then** it is refused with a short message.

### US-2 — Browse the Bank

- **AC-2.1** — **Given** I have sidequests, **When** I open the Sidequests page, **Then** they are listed under a heading per category, in the category order of BR-3, and sorted inside each category per BR-4.
- **AC-2.2** — **Given** a category with no sidequest, **Then** it is handled per OQ-3 (recommended: its heading is not shown).
- **AC-2.3** — **Given** I have no sidequests at all, **Then** I see a calm empty state (e.g. "No sidequests yet."), not a nudge.
- **AC-2.4** — Sidequests never show urgency colours or due labels (vision principle 1). Category colours follow OQ-1.
- **AC-2.5** — **Given** the phone layout, **Then** adding a sidequest, picking its category and opening one for editing are reachable with the thumb, without zooming.

### US-3 — Tabs

- **AC-3.1** — **Given** I am signed in, **Then** a tab bar with "Tasks" and "Sidequests" is shown on both pages, at the bottom of the screen on the phone. The current tab is marked by more than colour alone (WCAG 1.4.1).
- **AC-3.2** — **Given** I open the app (home screen icon or its address), **Then** the Tasks page opens, as today.
- **AC-3.3** — **Given** I tap a tab, **Then** its page opens. Each page has its own address, so the browser's Back button and a reload keep me on the same tab.
- **AC-3.4** — **Given** I open only the Sidequests page on a day, **Then** that day still counts as a usage day (E03, metric M1).
- **AC-3.5** — The Tasks page keeps all its spec 002 behaviour. The existing end-to-end task tests stay green.

### US-4 — Edit

- **AC-4.1** — **Given** a sidequest, **When** I tap its title, **Then** I can change its title and category, then save or cancel.
- **AC-4.2** — **Given** I save an edit, **Then** the title rules of BR-1 apply, and the sidequest moves to its new category and position right away.

### US-5 — Delete

- **AC-5.1** — **Given** a sidequest, **When** I choose "Delete" (from the edit view), **Then** it leaves the Bank right away, without an "Are you sure?" dialog.
- **AC-5.2** — **Given** I just deleted a sidequest, **Then** a bar "Sidequest deleted · Undo" shows for about 5 seconds; **When** I tap Undo, **Then** it is back exactly as it was.
- **AC-5.3** — **Given** the bar has disappeared, **Then** the deletion is final for this spec, and the sidequest is not shown or counted anywhere (BR-5).

### Security

- **AC-S.1** — **Given** I am not signed in (or refused), **When** the Sidequests page is opened, **Then** no sidequest is shown; **When** a request is sent directly to any sidequest server action, **Then** it is refused and no sidequest is read, created, changed or deleted.

## 4. Business rules (→ unit tests in `src/domain/`)

| ID | Rule |
|---|---|
| BR-1 | A title is trimmed; it must be 1–200 characters after trimming (same rule as tasks). Two sidequests may have the same title. |
| BR-2 | A category is exactly one of: **Create**, **Learn**, **Play**, **Connect**, **Move** (vision §6). It is required. |
| BR-3 | Categories are shown in this fixed order: Create, Learn, Play, Connect, Move (the glossary order). |
| BR-4 | Inside a category, sidequests are sorted per OQ-4 (recommended: alphabetically by title, ignoring case and accents; ties keep creation order). |
| BR-5 | A deleted sidequest is excluded from every list and every count, including later features (F03 log, F04, F05, F06). |

## 5. Out of scope

- Quick entry of many sidequests at once (PO decision, §1).
- Logging that I did a sidequest — **F03**.
- The sprint goal and its measurable criterion, and showing it on the Sidequests page — **F05**.
- The "What can I do now?" screen, and showing sidequests on the Tasks page — **F04** (see §6).
- A "done" or "achieved" state for one-time sidequests — decided in F03 or F06, from real use.
- A kind field (achievement vs activity), duration, notes, tags or priority on sidequests. Duration and the "I have 15 min" filter are backlog **C04**.
- Search and filters — the list is about 30 items.
- Reordering by drag-and-drop.
- Restoring a sidequest after the undo bar is gone.

## 6. Notes for later specs

**F04 must make sidequests visible from the default screen.** With option C, the app opens on Tasks and sidequests sit one tap away. That is close to the vision's root cause (§1): ideas that are not *present at the moment of decision* don't get done, and principle 5 says obligations are the hook that shows sidequests. This spec accepts that gap on purpose, for a thin F02. F04 closes it, decided from how the tabs feel in daily use (principle 6). A likely shape is a small "Try one" strip of 1–2 sidequests on the Tasks page instead of a third screen.

**Data (design note).** The architecture draft (§3) already has `SIDEQUEST(id, title, category, created_at)` with no status column. This spec adds one need:

| Field | Why |
|---|---|
| `deleted_at` (timestamp, nullable) — soft delete, like tasks | Undo (AC-5.2), and F03 logs will point to sidequests: a hard delete would break past logs and the retro (F06). |

Final columns are decided in `plan.md`.

**Tests (ADR-0015).** The plan maps each AC to a layer. Expected: BR-1 to BR-4 as Vitest unit tests; each user story as a flow test in desktop and phone viewports; an axe scan of the Sidequests page empty and filled, and of the tab bar on both pages; AC-S.1 as an access test. The end-to-end job must stay under 5 minutes (spec 003 AC-1.7).

## 7. Open questions for the PO

| # | Question | Options | Recommendation |
|---|---|---|---|
| OQ-1 | Do categories get a **colour**? (Spec 002 §5 left this to F02.) | (a) No colour, text heading only · (b) a soft colour or icon per category, always with its name | **(a)** for now. Colour on the phone already means urgency for tasks (red, amber); a second colour code on the next tab blurs that. Add an icon later if headings feel bland in use. |
| OQ-2 | Is a **category pre-selected** when the page opens? | (a) None: I must pick one · (b) a default (e.g. Learn) | **(a)**. A default silently files ideas in the wrong category. After the first add, AC-1.2 keeps my choice, so a series costs one tap. |
| OQ-3 | **Empty categories**: show the heading? | (a) Hide it · (b) show it with "Nothing yet" | **(a)**. Five empty headings look like a form to fill, which is pressure (principle 1). |
| OQ-4 | **Order inside a category**? | (a) Alphabetical · (b) newest first · (c) oldest first | **(a)**. With ~30 items kept for a year, I look for an idea by name; the date I added it means nothing. |

## 8. UAT checklist (for the PO)

To be run on production, with the real phone. Filled in once the spec is validated.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-24 | First draft — scope decisions of 2026-11-24; 4 open questions for the PO |
