# Tasks 003 — Portfolio-ready

| | |
|---|---|
| **Status** | In progress — 4 / 14 (+ T00) |
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

- [ ] **T05** 🤖 **CI job "End-to-end tests"** (AC-1.1, AC-1.1b, AC-2.1)
  `changes` job (plain `git diff`); `e2e` job with services, `/etc/hosts`, generated secret, Playwright browser cache, report uploaded on failure.
  *Done when:* green on the PR; a docs-only commit on a test branch shows the job **skipped** and the PR mergeable; job time noted.

- [ ] **T06** 👤 **Required check** ⛳
  GitHub → Settings → Rules → `protect-main` → add **"End-to-end tests"** to the required status checks.
  *Done when:* the PO confirms; Claude checks the ruleset with `gh`.

## Slice 3 — Task flows and accessibility (plan §5)

- [ ] **T07** 🤖 **Fixtures** (AC-1.5, AC-1.6)
  Reset before each test; seed helpers; Toronto dates from `local-date.ts`; midnight guard; browser time zone `America/Toronto`.
  *Done when:* fixtures used by T04's tests; suite passes when run in reversed order.

- [ ] **T08** 🤖 **Flow tests** (spec 002 AC-1.x to AC-6.2)
  `add-task`, `list` (with `data-urgency` on the due label), `done-undo`, `edit-delete`. Names start with the AC ids. `@phone` on add and done + undo.
  *Done when:* green locally and in CI; every row of spec AC-1.3's table has a test.

- [ ] **T09** 🤖 **Accessibility scan — first run** (AC-6.1)
  `accessibility.spec.ts` on the states of plan §5.6, both projects, light and dark.
  *Done when:* every finding is listed below in "Accessibility findings" with page, rule and impact. If the list looks larger than the time box allows: ⛳ stop and ask (AC-6.3).

- [ ] **T10** 🤖 **Accessibility fixes** (AC-6.2 to AC-6.4)
  Markup and style fixes only.
  *Done when:* the scan has zero violations; every flow test still green; PR merged and deployed.

- [ ] **T11** 🤖 **Flaky detection** (AC-2.2, D-3)
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

## Progress log

| Date | Tasks | Note |
|---|---|---|
| 2026-11-22 | Plan ✅, T00 ✅ | Spec 003 v1.1 and plan 003 v1.0 validated; ADR-0015 accepted (supersedes ADR-0010). CI triggers changed to PRs + `main` (PO request). |
| 2026-11-23 | T01 (text) | README rewritten: true status table, pitch, "Why" in 3 points, Mermaid cycle with owners, roles and AI transparency, rules every change follows, documentation map, setup last. CI badge added now (cheap, already true) rather than in T13. No screenshot placeholders. PR #17 merged. |
| 2026-11-23 | T01 ✅ | PR #17 merged; CI green (26 s). |
| 2026-11-23 | T02 ✅ | `docker-compose.e2e.yml`: `postgres:17` + `local-neon-http-proxy`, both pinned by digest (proxy image is multi-arch: amd64 for CI, arm64 for the Mac); data in memory only; only the proxy port is exposed, on 127.0.0.1. `src/server/db/local-proxy.ts` + 8 unit tests: only the exact host `db.localtest.me` is routed (a Neon URL, `localhost`, `evil-db.localtest.me` and `db.localtest.me.example.com` are refused). `client.ts` sets the proxy endpoint for that host only. `npm run e2e:migrate` (Drizzle `neon-http` migrator, same driver as production) → 6 tables, 3 migrations recorded; re-run is a no-op; the database refuses a time without a date. Guard: with a Neon-style URL → "Refusing to run end-to-end setup…", exit 1. Typecheck, lint, 73 unit tests, `next build` pass. |
| 2026-11-23 | T03 ✅ | `@playwright/test` **1.65.0** pinned (1.65.1 was 10 days old; kept to releases ≥ 2 weeks old). `e2e/support/test-auth.ts`: separate Better Auth instance with `testUtils`, same secret, base URL and tables as the app under test, no allowlist hook (so the stranger's session exists and the *app* has to refuse it). Global setup: migrate, truncate users/sessions/tasks, create `owner@example.com` and `stranger@example.com`, save `better-auth.session_token` cookies to `e2e/.auth/` (git-ignored). `playwright.config.ts`: 1 worker, Toronto time zone, owner signed in by default, `desktop` + `phone` (@phone) projects, retries 1 + `failOnFlakyTests` in CI, app on port 3100 with env from `e2eAppEnv()` (overrides `.env`; `PROD_READONLY_DATABASE_URL` forced empty). **Production build on the test database:** no cookie → 307 to `/sign-in`; owner → 200, "Nothing to do.", usage day written to the *test* database; stranger → streamed `NEXT_REDIRECT` to `/sign-in` with no list or usage line in the response (same partial-prerender behaviour as production; T04 checks it in a browser). **ESLint:** `testUtils` and `e2e/` imports from `src/server/` and `src/domain/` → 3 errors (demo files removed). Typecheck, lint, 73 unit tests pass. |
| 2026-11-23 | T04 ✅ | Chromium headless shell for Playwright 1.65.0 installed locally. `e2e/access.spec.ts`, 4 tests (3 also on `phone`) → **7 passed in 8.7 s** on a production build: signed out → `/sign-in` with exactly one button, "Sign in with Google" (spec 001 AC-2.1); owner → usage line + seeded task in the "Tasks" region; stranger → `/sign-in`, task not shown; stranger's raw response (no redirect followed) contains the redirect and neither the task title nor the usage line (spec 002 AC-S.1, the CLAUDE.md streaming rule). **Finding (not a spec 002 AC failure → idea inbox, spec 003 §5):** every page load *with* a session cookie logs one Better Auth `INTERNAL_SERVER_ERROR` — the session query is started during Next.js's prerender pass and rejected when it ends (`HANGING_PROMISE_REJECTION`); the real render then works. Signed-out loads log nothing. Probably also in production logs; costs one abandoned database round trip per open. |
