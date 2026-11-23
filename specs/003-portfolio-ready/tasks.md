# Tasks 003 — Portfolio-ready

| | |
|---|---|
| **Status** | In progress — 11 / 14 (+ T00) — slice 3 done |
| **Spec** | [spec.md](spec.md) (v1.1) · **Plan** | [plan.md](plan.md) (v1.0) |
| **Branch** | one per slice → pull requests into `main` |
| **Time box** | done before **Sun 2026-12-06** |
| **Last updated** | 2026-11-23 |

**Legend:** 🤖 Claude · 👤 PO (Alexis) · ⛳ checkpoint (stop until the PO confirms)

Each task is small enough to review in one sitting. Tick the box when its "Done when" is true. If the time box runs short: cut from the end (plan §10).

---

- [x] **T00** 🤖 **CI triggers** (plan §5.8, D-4)
  `ci.yml` runs on pull requests and on pushes to `main` only, so a PR branch no longer runs CI twice per push.
  *Done when:* this plan's PR shows one CI run per push. *(Shipped with the plan's PR.)*

## Slice 1 — README text (spec AC-4.1, AC-4.2, AC-4.4, AC-4.5)

- [x] **T01** 🤖 **README rewrite, text only**
  True status; pitch; "Why" in 3 lines; spec-driven cycle as a Mermaid diagram with owners; roles and AI transparency; documentation map; stack; "Run locally" last. Placeholders where screenshots and the quality section will go are **not** shown (no "coming soon").
  *Done when:* PR merged; README reads correctly on GitHub in light and dark.

## Slice 2 — Harness, sign-in, smoke test (plan §3, §4)

- [x] **T02** 🤖 **Test database, locally**
  `docker-compose.e2e.yml` (PostgreSQL 17 + Neon HTTP proxy **pinned by digest**); `client.ts` rule for `db.localtest.me` only; `e2e/support/env.ts` guard (refuses any other host); migration with the `neon-http` migrator.
  *Done when:* `npm run e2e:db` + migration creates every table locally; the guard refuses a `*.neon.tech` URL (shown in the log).

- [x] **T03** 🤖 **Test sign-in** (OQ-1, TR-3)
  `e2e/support/test-auth.ts` with Better Auth `testUtils`; global setup creates `owner@example.com` and `stranger@example.com` and saves their cookies; ESLint rule: nothing in `src/` imports `e2e/` or `testUtils`.
  *Done when:* the owner's cookie opens `/` locally on a production build; the ESLint rule fails on a deliberate bad import (shown, then reverted).

- [x] **T04** 🤖 **`access.spec.ts`** (spec 001 AC-2.1, AC-3.2 · spec 002 AC-S.1)
  Signed out → `/sign-in` with the Google button; owner → task list; stranger → no task shown.
  *Done when:* green locally, desktop and phone projects.

- [x] **T05** 🤖 **CI job "End-to-end tests"** (AC-1.1, AC-1.1b, AC-2.1)
  `changes` job (plain `git diff`); `e2e` job with services, `/etc/hosts`, generated secret, Playwright browser cache, report uploaded on failure.
  *Done when:* green on the PR; a docs-only commit on a test branch shows the job **skipped** and the PR mergeable; job time noted.

- [x] **T06** 👤 **Required check** ⛳
  GitHub → Settings → Rules → `protect-main` → add **"End-to-end tests"** to the required status checks.
  *Done when:* the PO confirms; Claude checks the ruleset with `gh`.

## Slice 3 — Task flows and accessibility (plan §5)

- [x] **T07** 🤖 **Fixtures** (AC-1.5, AC-1.6)
  Reset before each test; seed helpers; Toronto dates from `local-date.ts`; midnight guard; browser time zone `America/Toronto`.
  *Done when:* fixtures used by T04's tests; suite passes when run in shuffled order (`npm run e2e:shuffle`, 3 seeds; PO decision 2026-11-23, replaces "reversed").

- [x] **T08** 🤖 **Flow tests** (spec 002 AC-1.x to AC-6.2)
  `add-task`, `list` (with `data-urgency` on the due label), `done-undo`, `edit-delete`. Names start with the AC ids. `@phone` on add and done + undo.
  *Done when:* green locally and in CI; every row of spec AC-1.3's table has a test.

- [x] **T09** 🤖 **Accessibility scan — first run** (AC-6.1)
  `accessibility.spec.ts` on the states of plan §5.6, both projects, light and dark.
  *Done when:* every finding is listed below in "Accessibility findings" with page, rule and impact. If the list looks larger than the time box allows: ⛳ stop and ask (AC-6.3).

- [x] **T10** 🤖 **Accessibility fixes** (AC-6.2 to AC-6.4)
  Markup and style fixes only.
  *Done when:* the scan has zero violations; every flow test still green; PR merged and deployed.

- [x] **T11** 🤖 **Flaky detection** (AC-2.2, D-3)
  `retries: 1` + `failOnFlakyTests` (or the JSON report check); proof on a throwaway branch with a deliberately flaky test.
  *Done when:* that run is red and labels the test "flaky"; the throwaway branch is deleted.

## Slice 4 — Screenshots and README proof

- [ ] **T12** 🤖 **Screenshots** (AC-3.1 to AC-3.4, TR-6)
  `screenshots.spec.ts` + `npm run screenshots` + manual CI job; generic fake tasks; files in `docs/screenshots/` with stable names.
  *Done when:* images committed; nothing in them comes from real data.

- [ ] **T13** 🤖 **README: screenshots, quality, traceability** (AC-3.x, AC-4.3, AC-5.1, AC-5.2)
  Screenshots; "How quality is ensured" (the 4 layers + "not automated on purpose"); worked example BR-5 → unit test → e2e test → CI run; CI badge.
  *Done when:* PR merged; every link works.

- [ ] **T14** 👤 **UAT** ⛳
  Run the [UAT checklist in the spec](spec.md#8-uat-checklist-for-the-po), including the deliberately broken PR (Claude prepares it), a run after 8 p.m. Toronto, and the M5 check with someone who doesn't know the project.
  *Done when:* every box is ticked → spec 003 **Delivered**, backlog E05 and E06 **Delivered**.

---

## Accessibility findings

*Filled in at T09.*

| # | Page / state | Rule | Impact | Fix | Status |
|---|---|---|---|---|---|
| A1 | Home, every task with a due label (light + dark, desktop + phone) | `label-content-name-mismatch` — WCAG 2.5.3 Label in Name: the Edit button is named `Edit "Pay rent"` but shows "Pay rent" **and** "Was due Sun, Nov 22" | serious | PO decision 2026-11-23: no `aria-label`; the button is named by what it shows, with a screen-reader-only "Edit" in front ("Edit Pay rent Was due Sun, Nov 22") | ✅ Fixed |
| A2 | Home, every signed-in state, **dark** (footer "Signed in as …") | `color-contrast` — WCAG 1.4.3: 4.1:1 (`#71717b` on `#0a0a0a`), 4.5:1 needed | serious | Footer `text-zinc-500` → add `dark:text-zinc-400` (the shade used everywhere else) | ✅ Fixed |
| A3 | Home, every signed-in state, **dark** ("Sign out" button) | `color-contrast` — WCAG 1.4.3: 4.1:1, same cause as A2 | serious | Same fix as A2 (the button inherits the footer's colour) | ✅ Fixed |

## Progress log

| Date | Tasks | Note |
|---|---|---|
| 2026-11-22 | Plan ✅, T00 ✅ | Spec 003 v1.1 and plan 003 v1.0 validated; ADR-0015 accepted (supersedes ADR-0010). CI triggers changed to PRs + `main` (PO request). |
| 2026-11-23 | T01 (text) | README rewritten: true status table, pitch, "Why" in 3 points, Mermaid cycle with owners, roles and AI transparency, rules every change follows, documentation map, setup last. CI badge added now (cheap, already true) rather than in T13. No screenshot placeholders. PR #17 merged. |
| 2026-11-23 | T01 ✅ | PR #17 merged; CI green (26 s). |
| 2026-11-23 | T02 ✅ | `docker-compose.e2e.yml`: `postgres:17` + `local-neon-http-proxy`, both pinned by digest (proxy image is multi-arch: amd64 for CI, arm64 for the Mac); data in memory only; only the proxy port is exposed, on 127.0.0.1. `src/server/db/local-proxy.ts` + 8 unit tests: only the exact host `db.localtest.me` is routed (a Neon URL, `localhost`, `evil-db.localtest.me` and `db.localtest.me.example.com` are refused). `client.ts` sets the proxy endpoint for that host only. `npm run e2e:migrate` (Drizzle `neon-http` migrator, same driver as production) → 6 tables, 3 migrations recorded; re-run is a no-op; the database refuses a time without a date. Guard: with a Neon-style URL → "Refusing to run end-to-end setup…", exit 1. Typecheck, lint, 73 unit tests, `next build` pass. |
| 2026-11-23 | T03 ✅ | `@playwright/test` **1.65.0** pinned (1.65.1 was 10 days old; kept to releases ≥ 2 weeks old). `e2e/support/test-auth.ts`: separate Better Auth instance with `testUtils`, same secret, base URL and tables as the app under test, no allowlist hook (so the stranger's session exists and the *app* has to refuse it). Global setup: migrate, truncate users/sessions/tasks, create `owner@example.com` and `stranger@example.com`, save `better-auth.session_token` cookies to `e2e/.auth/` (git-ignored). `playwright.config.ts`: 1 worker, Toronto time zone, owner signed in by default, `desktop` + `phone` (@phone) projects, retries 1 + `failOnFlakyTests` in CI, app on port 3100 with env from `e2eAppEnv()` (overrides `.env`; `PROD_READONLY_DATABASE_URL` forced empty). **Production build on the test database:** no cookie → 307 to `/sign-in`; owner → 200, "Nothing to do.", usage day written to the *test* database; stranger → streamed `NEXT_REDIRECT` to `/sign-in` with no list or usage line in the response (same partial-prerender behaviour as production; T04 checks it in a browser). **ESLint:** `testUtils` and `e2e/` imports from `src/server/` and `src/domain/` → 3 errors (demo files removed). Typecheck, lint, 73 unit tests pass. |
| 2026-11-23 | T04 ✅ | Chromium headless shell for Playwright 1.65.0 installed locally. `e2e/access.spec.ts`, 4 tests (3 also on `phone`) → **7 passed in 8.7 s** on a production build: signed out → `/sign-in` with exactly one button, "Sign in with Google" (spec 001 AC-2.1); owner → usage line + seeded task in the "Tasks" region; stranger → `/sign-in`, task not shown; stranger's raw response (no redirect followed) contains the redirect and neither the task title nor the usage line (spec 002 AC-S.1, the CLAUDE.md streaming rule). **Finding (not a spec 002 AC failure → idea inbox, spec 003 §5):** every page load *with* a session cookie logs one Better Auth `INTERNAL_SERVER_ERROR` — the session query is started during Next.js's prerender pass and rejected when it ends (`HANGING_PROMISE_REJECTION`); the real render then works. Signed-out loads log nothing. Probably also in production logs; costs one abandoned database round trip per open. |
| 2026-11-23 | T05 (job green) | PR #18, first CI run green. **End-to-end tests job: 1 min 44 s** (containers 15 s, `npm ci` 9 s, Chromium install 31 s on a cold cache, build + start + 7 tests 32 s). Tests: 7 passed, 0 flaky. CI log shows the same `INTERNAL_SERVER_ERROR` as locally → the T04 finding is confirmed on a second machine. Change from plan §5.8: no separate `next build` step; Playwright builds the app itself so the build and the server get the same test environment from one place. Still to show: a docs-only PR with the job **skipped** and mergeable — possible only once this workflow is on `main` and the check is required (after T06). |
| 2026-11-23 | T06 ⛳ ✅ | PR #18 merged. PO added "End-to-end tests" to `protect-main`; checked with `gh api`: required checks are "Typecheck, lint, test" and "End-to-end tests". This docs-only PR is the AC-1.1b check for T05. |
| 2026-11-23 | T05 ✅ | AC-1.1b shown on PR #19 (only `specs/…/tasks.md` changed): Detect code changes ✅ 5 s, Typecheck, lint, test ✅ 31 s, **End-to-end tests skipped**, PR **CLEAN / MERGEABLE** with both checks required. **Slice 2 done.** |
| 2026-11-23 | T07 ✅ | `e2e/support/fixtures.ts`: `test` with an automatic `resetDb` fixture (midnight guard, then empties `task` and `usage_day`; users and sessions stay), `days` (Toronto yesterday / today / tomorrow / +7, read after the guard) and `seedTasks` (direct insert). `e2e/support/dates.ts` builds on `localNow` / `addDays`; midnight guard waits until 00:02 Toronto from 23:58 and extends that test's timeout. 10 Vitest tests (EST and EDT, midnight UTC ignored, month and year ends); Vitest now also runs `e2e/support/**/*.test.ts`; Playwright limited to `*.spec.ts`. Browser time zone was already `America/Toronto` (T03). `access.spec.ts` moved onto the fixtures. **AC-1.6 — PO decision:** prove order independence with Playwright's built-in `--shuffle` (one-off, CI order stays fixed so D-3's flaky signal stays clean) instead of a reversed run, which Playwright has no option for. `npm run e2e:shuffle` (`--shuffle --fully-parallel`, still 1 worker: tests inside a file are shuffled too). Seeds 1, 42, 2026 → **7 passed** each (seed 1 runs the desktop tests in exactly reversed order). Fixture callback named `provide` instead of `use`: the React Hooks lint rule flagged `use`. Typecheck, lint, 83 unit tests pass. |
| 2026-11-23 | T08 ✅ | PR #21 merged. CI: **End-to-end tests 2 min 04 s**, 23 passed (1.2 min), 0 flaky. |
| 2026-11-23 | T08 (PR open) | 4 spec files, **16 new tests** (names start with the spec 002 AC ids), every row of spec AC-1.3's table covered: `add-task` (AC-1.1 ×2, 1.2, 1.3, 1.4, 1.5), `list` (AC-2.1 to 2.6 with 6 dues: yesterday, today 00:00, today, tomorrow 9:00, +7, none; AC-2.7 with a done and a deleted task still showing "Nothing to do."), `done-undo` (AC-3.1 + 6.1, `completed_on` = Toronto today, then null), `edit-delete` (AC-4.1 + 4.3 re-sort and re-colour, Cancel and blank title, AC-4.2, AC-5.1 + 6.2 with any dialog failing the test and the row back identical). `@phone` on add (AC-1.1, AC-1.3) and done + undo. `data-urgency` on the due label (plan §5.4, markup only). Locators by role, label and text only (`e2e/support/tasks-page.ts`). **Suite: 23 passed in ~32 s** (17 desktop + 6 phone). **Mutation check:** reversed sort → the list test fails ("Pay rent" not first), restored. **Order dependence found by `--shuffle 2026`:** "the Add button works too" ended before its save reached the server, which then inserted "Call the bank" after the next test's reset → AC-2.7 red. Fixed twice: that test now waits for the save, and a new automatic `settleRequests` fixture makes every test wait for the browser's requests to finish (shown fixing seed 2026 on its own). Seeds 1, 42, 2026, 7, 99 and the fixed order → 23 passed each. Typecheck, lint, 83 unit tests pass. |
| 2026-11-23 | T09 ✅ | `@axe-core/playwright` **4.14.0** (Oct 15) pinned, with an npm override pinning `axe-core` to 4.14.0 (4.14.1 is 7 days old). `e2e/support/accessibility.ts`: tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, no rule disabled; the full axe report is attached and the error lists one line per finding. `e2e/accessibility.spec.ts`: sign-in, mixed list, empty, edit view, undo bar × light/dark × desktop/phone = **20 scans**. **First run: 10 failed, 10 passed** → 3 findings, 2 rules, all "serious" (table above). Sign-in page clean everywhere; light mode only has A1. Small, well within the time box: no ⛳ needed (AC-6.3). |
| 2026-11-23 | T10 (fixes pushed) | **AC-6.2 shown live:** PR #22's first commit (scan only) → CI **End-to-end tests failed** (10 failed, 33 passed; 4 min 20 s because each failing scan was retried once), PR **BLOCKED**; the CI error lists A1 and A2/A3 by rule. **Fixes (markup and styles only, AC-6.4):** A1: Edit button without `aria-label`, hidden "Edit" + title + due label → name "Edit Dentist Tomorrow 9:00 a.m." (asserted in `list.spec.ts`); A2/A3: footer `dark:text-zinc-400`. Tests find the Edit button with one `editButton()` helper (name starts with "Edit <title>"). Locally: **43 passed** (23 flows + 20 scans), shuffle seeds 2026 and 7 → 43 passed; typecheck, lint, 83 unit tests pass. Still to do: CI green, merge, deploy. |
| 2026-11-23 | T10 ✅ | PR #22 merged; CI on the PR's fix commit: **43 passed (2.6 min)**, End-to-end tests **3 min 44 s** (under 5 min, AC-1.7; the 20 scans add about 1.5 min). On `main` after merge: End-to-end tests ✅ 3 min 32 s; Vercel production deploy "Deployment has completed". The fixes are behind sign-in, so the PO sees them live in UAT (T14). |
| 2026-11-23 | T11 ✅ | `retries: 1` + `failOnFlakyTests` were already in `playwright.config.ts` (T03, Playwright 1.65.0 has the option: no JSON-report script needed). **Proof:** throwaway branch with a test that fails on its first attempt and passes on the retry. Locally with `CI=1`: "1 flaky", exit code 1. On GitHub, draft PR #23, run 45231479117: **1 flaky, 43 passed**, End-to-end tests **failed**, PR **BLOCKED**, `playwright-report` artifact uploaded (893 KB, trace included). PR #23 closed and branch `throwaway/003-t11-flaky-proof` deleted (local and remote). **Slice 3 done.** |
