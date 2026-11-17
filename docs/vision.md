# Vision — SprintYourLife

| | |
|---|---|
| **Status** | Draft v0.1 — awaiting Product Owner validation |
| **Last updated** | 2026-11-16 |
| **Product Owner / BA** | Alexis |
| **Implementation** | AI-assisted (Claude Code), driven by specs in `specs/` |

---

## 1. Problem statement

> When I have free time and pick up my phone — usually during **transitions** (in bed, in the morning, between two activities) — I scroll by default, because my ideas for "sidequests" are scattered and not on my mind at that moment. As a result, I don't make progress on the things I actually want to try in life.

**Evidence from the current situation:**
- A "to-do" note works well, because obligations have **external pressure** (deadlines, school).
- A second note, "things to do instead of scrolling", **does not work**: nothing brings it to mind at the moment of choice.

**Root cause:** the ideas exist, but they are not **present at the moment of decision**, and learning goals have no deadline to create motivation.

## 2. Vision statement

> **For** someone who wants to explore many skills and hobbies ("live life through sidequests"),
> **who** ends up scrolling during idle transitions instead,
> **SprintYourLife** is a personal web app
> **that** answers "what could I do right now?" in seconds and organizes learning into short, measurable sprints.
> **Unlike** a notes app or a generic to-do list, it puts obligations and sidequests in the same place, so opening the app for a task also surfaces something worth doing.

## 3. User and contexts of use

**Primary user:** Alexis, the only user. Software engineering student finishing in December 2026, then job searching.

| Context | Device | Need | Time available |
|---|---|---|---|
| Transition moment (bed, morning, between activities) | Phone | Decide **what to do now** — not log, not plan | Seconds |
| After doing something | Phone or desktop | Mark it done, optionally with duration / a note | A few seconds |
| Sprint planning (every 2 weeks) | Desktop (mostly) | Pick a sprint goal, see upcoming deadlines | ~15 min |
| Sprint retro (every 2 weeks) | Desktop or phone | See what got done, reflect briefly | ~10 min |

**Secondary user (post-MVP):** a recruiter viewing a demo. Not served by the MVP — see Out of scope.

**Accepted limit:** scrolling before sleep will probably remain. The app targets **transitions**, not all screen time.

## 4. Goals and success metrics

Priority order: **useful to me first**, portfolio second. If a feature is useful but not impressive, usefulness wins.

| # | Metric | Target | How it is measured |
|---|---|---|---|
| M1 | Adoption | App opened ≥ 4 days out of 7 | The app records **one usage day** per calendar day it is opened. Shown as a neutral count (e.g. "9 / 14 days"), never as a streak. |
| M2 | The cycle holds | A retro is completed at the end of every sprint | Retro records in the app |
| M3 | Learning happens | The sprint goal's measurable criterion is met (e.g. Rubik's cube < 60 s) | "Goal reached?" answer in the retro |
| M4 | Motivation lasts | Still motivated after the first 2 sprints | Qualitative — answered in the 2nd retro |

## 5. Design principles

These principles guide every spec. A feature that breaks one of them must justify it.

1. **Help, don't add stress.** Deadlines exist only where I chose them: tasks with a due date, and the skill I chose to develop as a sprint goal (it gets a deadline *and* a measurable criterion). Free sidequests never have deadlines, goals, or penalties. No streaks that can be "broken", no red "you failed" states — usage is shown as a neutral count. A week with zero activity is a valid week.
2. **Decide in seconds.** The phone experience competes with TikTok. Opening the app and seeing what to do must be faster than deciding to scroll.
3. **Minimal input.** Every field slows down entry. A field must earn its place. Logging is one tap, with details optional.
4. **The human plans, the app informs.** The app shows the facts (deadlines, what's done); I make the trade-offs. No automatic capacity planning.
5. **Obligations are the hook.** Tasks are in the app because they make me open it every day — and then I see my sidequests.
6. **Scope grows from real use.** New features come from friction observed during UAT and daily use, not from speculation.

## 6. Core concepts (glossary)

| Term | Definition |
|---|---|
| **Task** | An obligation (homework, appointment, job application). Title, optional due date, done / not done. Not tied to a sprint. Archived when done. |
| **Sidequest** | Something I'd like to do or learn (Lego, Catan online, drawing, Rubik's cube). Has a title and a category. Lives in the **Bank** by default. |
| **Bank** | The list of all sidequests that are not the current sprint goal. Can be done freely, any time, with no deadline. |
| **Category** | Fixed list of 5: **Create** (drawing, video editing, Lego) · **Learn** (general knowledge, Rubik's cube, reading) · **Play** (Catan online, games) · **Connect** (calling a friend, seeing people) · **Move** (walk, outdoors — not workouts, which stay in Bevel). |
| **Sprint** | A 2-week period with exactly one sprint goal. Runs **Sunday to Saturday**; sprints are back-to-back. The retro of the ending sprint and the planning of the next one happen on the Sunday in between. |
| **Usage day** | A calendar day on which the app was opened at least once. Used to measure M1. |
| **Sprint goal** | A sidequest picked from the Bank for a sprint. **Must have a measurable success criterion** (e.g. "solve the cube in < 60 s, 3 times in a row"). |
| **Log** | A record that I did something: a sidequest session (optional duration + optional free-text note, e.g. "best time 1:42"). |
| **Retro** | End-of-sprint page: auto-generated summary (tasks done / not done, sessions logged, goal reached?) + 2 free-text reflection fields. |

**Lifecycle of a sidequest:** in the Bank → (optionally) picked as sprint goal, with a measurable criterion → at sprint end: *reached*, *carried over* to the next sprint, or *returned to the Bank*.

## 7. Scope

**In the MVP:** see [`specs/backlog.md`](../specs/backlog.md) — Must items only.

**Out of scope (MVP), and why:**

| Out of scope | Reason |
|---|---|
| Gym and nutrition tracking | Already covered by Bevel |
| Multi-user, sharing, social features | Single-user personal tool |
| Hour-by-hour calendar / scheduling | Too heavy; conflicts with "decide in seconds" |
| Native mobile app | A PWA is enough |
| Offline use | Mobile data is always available; offline sync is the most expensive requirement in architecture |
| Automatic capacity planning ("like Jira") | Principle 4: the human plans |
| Integrated AI coach | Done *outside* the app for now (Claude Project); see backlog |
| Notifications, demo mode | Not needed to validate the core loop |

"Out of scope" means **not now**, not never.

## 8. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | **Installable** on the phone home screen (PWA). |
| NFR-02 | **Stay signed in**: no re-login for normal daily use. |
| NFR-03 | **Fast**: the "what can I do now" screen is usable within ~2 s of tapping the icon on a mobile connection *(target to be confirmed during architecture)*. |
| NFR-04 | **Responsive**: desktop-first layouts for planning/retro, phone layout for the "now" screen and logging. |
| NFR-05 | **Private**: sign in with Google, **restricted to an allowlist** (my account only). Anyone else is refused, even with a valid Google account. |
| NFR-06 | **No personal data in the public repo**: no real data, secrets, or backups committed. |
| NFR-07 | **Durability**: rely on the hosted database provider. No custom backup system in the MVP — **accepted risk** (see R1 in §11). |
| NFR-08 | **Cost**: $0 / month for hosting and database. |
| NFR-09 | **Language**: UI and documentation in English. |
| NFR-10 | **Online only** for the MVP. |

## 9. Constraints

- Solo, part-time project, alongside the last semester and then the job search.
- Budget: $0 / month.
- Stack preference: **Node + React**, **SQL** database.
- Public GitHub repository (portfolio).
- Quality bar: automated tests on business rules + CI running them on every push.

## 10. How this project is built

| Role | Who | Responsibilities |
|---|---|---|
| Product Owner / Business Analyst | Alexis | Vision, backlog, specs, acceptance criteria, validating plans, **UAT**, declaring a spec "Delivered" |
| Implementation | Claude Code | Plans, tasks, code, tests — always from a validated spec |

**Spec-driven cycle (per feature):** describe → `spec.md` → PO validates → `plan.md` → PO validates → `tasks.md` → implementation → UAT by PO → spec status = **Delivered**.

The documentation is the source of truth. The repo is transparent about this split: the portfolio value is the **analysis, decisions, and validation**, with AI-assisted implementation.

## 11. Assumptions and open questions

| # | Item | Status |
|---|---|---|
| A1 | Available time is low (a few hours/week). Features are built one at a time, smallest first. | Assumption |
| Q1 | Target date for daily use? | **Resolved** — two releases, see the release plan in [`specs/backlog.md`](../specs/backlog.md). Release 1 target: Sunday 2026-11-22 (stretch). |
| Q2 | Final list of categories. | **Resolved** — 5 categories, see glossary. |
| Q3 | How to measure M1 (app opened 4/7 days)? | **Resolved** — the app records one usage day per day it is opened. No streaks (principle 1). |
| Q4 | Sprint start day and gaps between sprints. | **Resolved** — Sunday to Saturday, back-to-back. |
| Q5 | Backups. | **Resolved** — no custom backups in MVP; see R1. |
| R1 | **Accepted risk — data loss.** If the database provider loses data or I delete something by mistake, it may be unrecoverable. Mitigations: pick a provider with some built-in restore during architecture; data export (C07) is in the backlog as cheap insurance. | Accepted by PO, 2026-11-16 |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-16 | First draft from discovery blocks 1–6 |
| 0.2 | 2026-11-16 | PO feedback: M1 measured by usage days, categories, sprint calendar, backup risk accepted, open questions resolved |
