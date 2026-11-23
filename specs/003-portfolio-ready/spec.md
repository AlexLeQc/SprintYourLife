# Spec 003 — Portfolio-ready: end-to-end tests in CI and a README that shows the work

| | |
|---|---|
| **Status** | Spec validated — 2026-11-22 (PO decisions in §7) |
| **Backlog items** | E05 End-to-end tests in CI · E06 Portfolio README |
| **Goal** | G2 — Portfolio-ready (vision v0.4 §4), under the exception rule: dated need (A2), time-boxed, protects G1 |
| **Depends on** | [001 Foundation](../001-foundation/spec.md), [002 Tasks](../002-tasks/spec.md) (both Delivered) |
| **Related** | [vision](../../docs/vision.md) v0.4 §3, §4 (M5), §9 · ADR-0006, 0010, 0012 · [architecture](../../docs/architecture.md) §4, §5 |
| **Time box** | ~5 working sessions, done before **Sun 2026-12-06** (interviews possible from early December) |
| **Last updated** | 2026-11-22 |

---

## 1. Goal

Make the repository **convincing evidence of QA and analysis skills** for a reviewer who has 5 minutes, and at the same time give the owner a **safety net**: every future feature (F02 → F06) is built on top of the task flows, and today only manual UAT would notice if one broke.

**Why now, before F02:** an interview may happen within 1–2 weeks (vision A2). The end-to-end suite is cheaper to set up while there is one feature than after five.

**What "done" means for this spec:** M5 is met — a reviewer, from the repository page alone, sees what the app does, how it was specified, how one acceptance criterion is traced to a passing automated test, and a green CI run that includes end-to-end tests.

**This spec changes a decision.** ADR-0010 chose testing level (b) and said *"UI behavior is verified by my UAT, not by end-to-end tests (for now)"*. The plan for this spec writes a new ADR that supersedes ADR-0010 (ADR-0001: never edit an accepted ADR).

## 2. User stories

| ID | Story |
|---|---|
| US-1 | As the **owner**, I want the main task flows **tested automatically in a real browser on every pull request**, so that a change for F02 cannot silently break the tasks I use every day. |
| US-2 | As the **owner**, I want a failing end-to-end test to **show me what happened** (screenshot, trace), so that I can tell a real bug from a broken test without re-running it locally. |
| US-3 | As a **reviewer**, I want the README to **show the app** (phone and desktop screenshots), so that I understand the product without signing in. |
| US-4 | As a **reviewer**, I want the README to **explain the spec-driven workflow and who did what** (PO vs AI implementation), so that I can judge the analysis and QA work honestly. |
| US-5 | As a **reviewer**, I want to **follow one requirement to its tests**, so that I can see that acceptance criteria are actually verified, not just written. |
| US-6 | As the **owner**, I want **accessibility problems found automatically and fixed**, so that the app is clean from the start and stays that way as features are added. |

## 3. Acceptance criteria

### US-1 — End-to-end tests in CI

- **AC-1.1** — **Given** a pull request, or a push to `main`, that changes anything other than documentation, **When** CI runs, **Then** an end-to-end job builds the app, starts it, and runs the Playwright suite in a headless browser, in addition to the existing typecheck, lint and unit-test job.
- **AC-1.1b** — **Given** a pull request that changes **only documentation** (`docs/`, `specs/`, Markdown files), **Then** the end-to-end job is skipped and reported as skipped, the pull request can still be merged, and the typecheck, lint and unit-test job still runs. *(PO request, plan 003 D-4: planning work shouldn't wait for browser tests.)*
- **AC-1.2** — **Given** any end-to-end test fails, **Then** the CI run is red and merging to `main` is blocked (same rule as ADR-0010 for unit tests).
- **AC-1.3** — The suite covers at least these flows from spec 002, each test named after the AC ids it checks (same convention as the unit tests):

  | Flow | Spec 002 ACs |
  |---|---|
  | Add a task with a title only, with a date, with a date + time; the input clears | AC-1.1 to AC-1.3 |
  | A blank title is ignored; a 201-character title is refused with a message | AC-1.4, AC-1.5 |
  | Order, due labels and urgency colours with a mix of dues (overdue, today, tomorrow, later, none), each coloured task also showing its text label | AC-2.1 to AC-2.6 |
  | Empty state "Nothing to do." | AC-2.7 |
  | Mark done → leaves the list → undo brings it back | AC-3.1, AC-6.1 |
  | Edit title, date and time; clearing the date clears the time | AC-4.1 to AC-4.3 |
  | Delete → leaves the list → undo brings it back unchanged | AC-5.1, AC-6.2 |
  | Signed-out visitor opening `/` is sent to `/sign-in`, which shows the "Sign in with Google" button | Spec 001 AC-2.1 |
  | A session whose email is **not** (or no longer) in the allowlist sees no task | Spec 001 AC-3.2, spec 002 AC-S.1 |

- **AC-1.4** — **Given** the phone layout matters (spec 002 AC-2.8), **Then** the add / done / undo flows also run in a phone-sized viewport.
- **AC-1.5** — **Given** the tests check "today", "tomorrow" and "overdue", **Then** test data is built from the current date in `America/Toronto` (architecture §4), so the suite passes on any day and at any hour, including a CI run at 11 p.m. Toronto time (04:00 UTC).
- **AC-1.6** — Each test starts from a known state and does not depend on another test or on the order they run in.
- **AC-1.7** — The end-to-end job finishes in **under 5 minutes** on GitHub Actions (including the accessibility scans of US-6).

### US-2 — Diagnosable failures

- **AC-2.1** — **Given** a test fails in CI, **Then** its screenshot and Playwright trace are attached to the run as a downloadable artifact.
- **AC-2.2** — **Given** a test passed only after a retry, **Then** it is reported as **flaky** in the run summary, not silently counted as passed. *(A flaky test is treated as a bug to fix, not a fact of life.)*

### US-3 — Show the app

- **AC-3.1** — The README shows at least: the task list on a **phone** with a mix of urgency colours, and the sign-in page. *(v1.2: the desktop view was dropped from the README: the app is a phone-width column, so on desktop it looked like the same picture twice. The desktop images are still generated by AC-3.4 for the PO's website.)*
- **AC-3.2** — Every screenshot contains **fake data only** (NFR-06): no real task, email, or name.
- **AC-3.3** — Screenshots are readable in GitHub's light and dark themes.
- **AC-3.4** — Screenshots are produced by **one command** from the seeded fake data (no hand editing) and saved in `docs/screenshots/` under stable, descriptive file names, so they can be regenerated after a UI change and reused outside this repository (e.g. the PO's website).

### US-4 — Explain the workflow

- **AC-4.1** — The README states its status truthfully (today it still says *"Spec 001 (foundation) is being implemented"*).
- **AC-4.2** — The README shows the spec-driven cycle as a diagram (describe → spec → plan → tasks → implementation → UAT → Delivered), with who owns each step.
- **AC-4.3** — The README has a short **"How quality is ensured"** section: the layers (domain unit tests, end-to-end tests, CI gate, PO UAT on production), what each one catches, and **what is deliberately not tested automatically and why** (see OQ-1).
- **AC-4.4** — The README is honest about AI-assisted implementation (vision §10): the PO's work is the analysis, decisions and validation.
- **AC-4.5** — A reviewer reaches the README's main points without scrolling past setup instructions: setup ("Run locally") comes last.

### US-5 — Traceability

- **AC-5.1** — The README walks through **one worked example**: a business rule or AC in a spec → its unit test and/or end-to-end test → the CI run where it passes. Links go to the actual files.
- **AC-5.2** — CI status is visible at the top of the README (badge).

### US-6 — Accessibility

- **AC-6.1** — **Given** the end-to-end suite runs, **Then** an automated accessibility scan (axe, WCAG 2.1 A and AA rules) checks the **sign-in page** and the **home page with a mix of tasks** (including red and amber ones), in the desktop and phone viewports, and also with the edit view and the undo bar open.
- **AC-6.2** — **Given** the scan finds **any** violation, whatever its severity, **Then** the test fails and CI is red. No rule is switched off without a written reason in the test and a line in the idea inbox.
- **AC-6.3** — **Given** the first scan finds existing issues, **Then** they are all listed in `tasks.md` and fixed in this spec. If one fix turns out larger than the time box allows, Claude stops and the PO decides for that issue (fix now, or log it with a dated exception).
- **AC-6.4** — Fixes change markup and styles only, not behaviour: every spec 002 AC still passes (checked by the suite itself).

## 4. Rules for the test suite (→ checked in code review of the plan and PRs)

| ID | Rule |
|---|---|
| TR-1 | End-to-end tests **never** run against the production database or the PO's `dev` branch. They use a database that exists only for the test run and holds only fake data (`@example.com`). |
| TR-2 | No real secret is needed to run the suite: any key it uses is a throwaway test value, generated or stored as a CI secret that grants nothing in production. |
| TR-3 | Whatever replaces the Google step in tests (OQ-1) **must not exist in production**: it cannot be enabled on Vercel by mistake, and the allowlist (ADR-0006) still applies. |
| TR-4 | Tests find elements the way a user does (role, label, visible text), not by CSS classes, so a styling change doesn't break them. |
| TR-5 | Unit tests stay the place for business-rule detail (all BR-3 sort cases, BR-6 label formats). End-to-end tests check that the flows work end to end, one or two cases per rule, not every case again (test pyramid). |
| TR-6 | The screenshot command (AC-3.4) uses the same seeded fake data as the tests and never connects to `dev` or production. |

## 5. Out of scope

- A public demo of the app, a demo mode, or a demo account — still **Won't** (backlog). The repository is the demo.
- A case-study page — built in the **PO's website project**, from this repository's docs and the screenshots of AC-3.4 (OQ-3). This repository only has to be readable enough to feed it.
- Automating the real Google sign-in — not possible reliably (bot protection, 2-factor) and against the point of a test; see OQ-1.
- Visual regression testing (pixel comparison of screenshots).
- Load or performance testing. NFR-03 stays a timed UAT.
- Tests on Safari / WebKit or a real iPhone — the PO's UAT on the iPhone covers that. *(Candidate later: a WebKit project in Playwright.)*
- Raising unit-test coverage or a coverage target.
- Any change to app behaviour. If a test finds a bug, it is fixed in this spec only if it breaks a spec 002 AC; anything else goes to the idea inbox. *Exception:* accessibility fixes (US-6), which change markup and styles only.
- F02 and every other feature.

## 6. Constraints for the plan

- The app talks to Neon through its **HTTP driver** (`drizzle-orm/neon-http`). A plain PostgreSQL service in GitHub Actions does not speak that protocol as-is, so the plan must choose how CI gets a disposable database (e.g. a Neon branch per run, or local PostgreSQL behind a Neon-compatible HTTP proxy) and record it, probably in the new ADR.
- The plan writes the ADR superseding ADR-0010 (new level: unit + end-to-end + UAT).
- $0 / month (NFR-08): GitHub Actions minutes on a public repo are free; whatever database option is chosen must stay on a free tier.
- `requireAllowedSession()` stays the only access gate; tests must exercise it, not bypass it.

## 7. Open questions — resolved by the PO on 2026-11-22

| # | Question | Resolution |
|---|---|---|
| OQ-1 | How do tests sign in? | **A — seed a session** in the test database. No sign-in code in the app; the real session and allowlist check runs. The Google step stays covered by UAT and by a test that the sign-in page shows the button; the README says so. |
| OQ-2 | Where do screenshots come from? | **A — generated by Playwright** from fake data (AC-3.4). The PO will also reuse them on the PO's website. |
| OQ-3 | Case-study page? | **Not in this repository.** It is built in the PO's website project, which reads this project's docs. |
| OQ-4 | Accessibility check? | **In, and strict** (US-6): any violation fails CI, and existing issues are fixed in this spec — "we want to see the existing issues, since we want this clean". |
| OQ-5 | Slice order? | **A** — 1. README text · 2. E2E harness + sign-in + smoke test · 3. task flows + accessibility · 4. screenshots, traceability example, quality section. The README is written twice, accepted. |

The analysis below is kept as the record of the options considered.

### OQ-1 — How do tests get signed in, given Google can't be automated?

What every option keeps: the **real** session check (`getAllowedSession()`, allowlist) runs on every request in the tests. What changes is only how the test browser obtains a session.

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. Seed a session** *(recommended)* | Before the tests, a setup step writes a fake user (`owner@example.com`, in the test allowlist) and a session row into the test database, signs the session cookie with the test secret, and gives the cookie to the browser (Playwright "storage state"). | **Zero sign-in code added to the app** → nothing that could be switched on in production (TR-3 holds by construction). Tests the real cookie → session → allowlist path. Fast. A second seeded session with a non-allowlisted email tests the refusal. | Depends on Better Auth's cookie format: a library upgrade could break the setup (the test fails loudly, not silently). The Google round-trip itself is not tested. |
| B. Test-only password sign-in | Enable Better Auth's email + password sign-in only when an `E2E` flag is set; tests sign in through a form. | Tests a full sign-in through the UI. Uses only public Better Auth APIs. | **Adds a second way into a private app.** A wrong environment variable on Vercel would open a password login on production. Needs a guard (refuse to start if the flag is set on Vercel) and a test for that guard. Hard to defend in an interview as "secure by design". |
| C. Fake Google (mock OAuth server) | Run a small fake OpenID provider in CI and point the Google provider at it in tests. | Exercises the whole OAuth redirect flow, closest to reality. | Most work by far; Better Auth's Google provider expects Google's URLs, so this may need a generic OAuth provider in tests → the tested code differs from production anyway. Doesn't fit the time box. |
| D. Real Google test account | Sign in to a real Google account in the test. | "Real". | Google blocks automated sign-ins (bot detection, 2FA); flaky by design; a real credential in CI. **Rejected.** |

**Recommendation: A**, and say clearly what it leaves out. The Google redirect is covered by the existing UAT and by one end-to-end test that only checks the sign-in page shows the Google button. In the README, this becomes the "deliberately not automated" example of AC-4.3.

*BA / QA lesson:* testing is risk-based. The risk of the Google step breaking is low (it's Google's code and Better Auth's, and it's used every 90 days); the risk of *our* allowlist and session check breaking is high-impact (private data). Option A puts the automated tests where the risk is. Being able to explain where you **didn't** test and why is exactly what a QA interview probes.

### OQ-2 — Where do the README screenshots come from?

| Option | Pros | Cons |
|---|---|---|
| **A. Generated by Playwright** from the seeded test data *(recommended)* — a dedicated script, run on demand, saves PNGs into `docs/screenshots/` | Fake data guaranteed (AC-3.2); regenerated in one command when the UI changes; itself a small showcase of the test harness | A bit of setup; images must still be committed by hand (not on every CI run, to keep the repo small) |
| B. Taken by hand on the phone with fake tasks on `dev` | Real iPhone look (status bar, installed PWA) | Must remember to remove real tasks first; goes stale; manual each time |

*Recommendation:* A for the README; optionally one hand-taken iPhone photo of the installed app later.

### OQ-3 — A case-study page: in this spec or not?

The idea inbox lists "a case-study page". *Recommendation:* **not in 003.** A well-structured README already is the case study for a 5-minute reviewer. A longer write-up (discovery → decisions → what UAT found) can be a separate document later, once F02 adds more story. Decide: in / out.

### OQ-4 — Add an automated accessibility check?

`@axe-core/playwright` can scan the home and sign-in pages in the same suite for WCAG problems (contrast, labels). Small cost (one test), strong QA signal, and it backs spec 002 AC-2.6 (colour is not the only signal). Risk: it may find existing issues, which would then need fixing or logging. *Recommendation:* **in**, scoped to those 2 pages, with any finding fixed only if it's serious; the rest goes to the idea inbox.

### OQ-5 — Slice order inside the time box

| Option | Order | Pros | Cons |
|---|---|---|---|
| **A** *(recommended)* | **1.** README text fix (status, workflow, roles — no screenshots) · **2.** E2E harness + sign-in (OQ-1) + one smoke test green in CI · **3.** the rest of the task flows · **4.** screenshots + traceability example + quality section | The stale README is fixed on day 1 (a reviewer may look any day). The hardest risk (CI database + sign-in) is proven early. Each slice is a mergeable PR. | README is touched twice |
| B | E2E first, README at the end | README written once, with everything in it | If the time box runs out, the most visible part (README) is the one missing |

## 8. UAT checklist (for the PO)

- [x] AC-1.1, AC-1.2 — open a PR that deliberately breaks one flow (e.g. undo does nothing): CI is red and the PR can't be merged; revert: green
- [ ] AC-1.3, AC-1.4 — read the list of test names in a CI run: every flow of the table is there, with its AC ids, including phone viewport
- [ ] AC-1.5 — Claude shows a CI run triggered after 8 p.m. Toronto time (after midnight UTC) that passes
- [ ] AC-1.7 — the end-to-end job duration in the run is under 5 minutes
- [x] AC-2.1, AC-2.2 — on the deliberately broken PR, download the artifact and open the trace
- [ ] AC-3.1 to AC-3.3 — README on GitHub, light and dark theme, on the phone and on desktop; no real data visible
- [ ] AC-4.1 to AC-4.5, AC-5.1, AC-5.2 — read the README as a reviewer; follow the worked example's links
- [ ] AC-6.1 to AC-6.4 — read the accessibility tests in a CI run; read the list of issues found and fixed in `tasks.md`; on the iPhone, the task flows still feel the same
- [ ] AC-3.4 — Claude regenerates the screenshots with one command; the files in `docs/screenshots/` are the ones in the README
- [ ] TR-1 to TR-3, TR-6 — Claude shows the test database is not `dev` or production, and that the test sign-in method cannot run on Vercel
- [ ] **M5** — someone who doesn't know the project opens the repository; within 5 minutes, without running anything, they can say what the app does, how it was built, and point to one AC and its test

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-22 | First draft — 5 open questions for the PO |
| 1.0 | 2026-11-22 | PO decisions: seeded session, Playwright screenshots (reusable, AC-3.4), case study in the PO's website project, strict accessibility check (US-6), slice order A. Status: Spec validated |
| 1.1 | 2026-11-22 | AC-1.1 narrowed and AC-1.1b added: end-to-end tests skipped on documentation-only pull requests (plan 003 D-4). Validated by the PO |
| 1.2 | 2026-11-23 | AC-3.1: no desktop screenshot in the README (it repeated the phone view); desktop images still generated (AC-3.4). PO decision during UAT |
