# Tasks 001 — Foundation: private, installable app

| | |
|---|---|
| **Status** | In progress — 18 / 19 done — UAT next |
| **Spec** | [spec.md](spec.md) · **Plan** | [plan.md](plan.md) |
| **Branch** | `feat/001-foundation` → pull requests into `main` |
| **Last updated** | 2026-11-16 |

**Legend:** 🤖 Claude · 👤 PO (Alexis: needs your accounts or your phone) · ⛳ checkpoint (stop until the PO confirms)

Each task is small enough to review in one sitting. Tick the box when its "Done when" is true.

---

## Phase A — Code with no accounts needed

- [x] **T01** 🤖 **Scaffold the app**
  Next.js + TypeScript + ESLint; Node 24 LTS (`.nvmrc`); the folder structure from plan §2; `.gitignore` that covers `.env*` except `.env.example`; `.env.example` with variable names only; a README (what the app is, how it's built — spec-driven, AI-assisted — and links to `docs/` and `specs/`).
  *Done when:* `npm run dev` shows a placeholder page locally; `npm run typecheck` and `npm run lint` pass.

- [x] **T02** 🤖 **BR-2: local date in America/Toronto**
  `domain/local-date.ts` + tests, including Saturday 23:30 Toronto = Sunday 04:30 UTC → Saturday (AC-5.3) and both daylight-saving switch days.
  *Done when:* tests pass.

- [x] **T03** 🤖 **BR-1: allowlist**
  `domain/allowlist.ts` + tests: exact match, case and spaces ignored, unknown refused, empty allowlist refuses everyone.
  *Done when:* tests pass.

- [x] **T04** 🤖 **BR-4: "used N of the last 7 days"**
  `domain/usage.ts` + tests: today included, the 8th day back excluded, empty → 0.
  *Done when:* tests pass.

- [x] **T05** 🤖 **CI workflow** (AC-6.1)
  `.github/workflows/ci.yml`: on push and pull request, run `npm ci` → typecheck → lint → tests.
  *Done when:* the first pull request shows a green check on GitHub.

> ⛳ **Checkpoint A:** the PO reviews and merges the PR (T01–T05).

## Phase B — Deploy and install

- [x] **T06** 👤 **Create the Vercel project**
  1. Go to vercel.com → **Sign Up** → choose **Hobby** → **Continue with GitHub**.
  2. **Add New… → Project** → import `SprintYourLife` (give Vercel access to that repo only).
  3. Framework should be detected as **Next.js**. Click **Deploy**.
  4. Project → **Settings → Functions** → check the region is **Washington, D.C. (iad1)**.
  5. Send Claude the production URL (`https://….vercel.app`).
  *Done when:* the placeholder page loads from the `vercel.app` URL.

- [x] **T07** 🤖 **PWA: manifest and icons** (AC-1.1, AC-1.2)
  `app/manifest.ts` (`name` "SprintYourLife", `display: standalone`, `start_url` and `scope` `/`), simple placeholder icons, Apple touch icon.
  *Done when:* merged and deployed.

- [x] **T08** 👤 **Check on the iPhone** ⛳
  In Safari, open the production URL → **Share → Add to Home Screen** → open it from the icon.
  *Done when:* the icon is on the home screen and the app opens full-screen, with no Safari bar.

## Phase C — Database

- [x] **T09** 👤🤖 **Create the Neon database**
  1. ✅ PO created the project in **AWS US East 1 (N. Virginia)**, Free plan. Its default branch is named **`production`** (Neon's current default, not `main`).
  2. ✅ Claude linked the repo with the Neon CLI (`npx neon@latest`, agent setup skipped): `neon.ts` committed, `.neon` git-ignored. `neon.ts` exempts `dev` from the default 7-day expiry for new branches.
  3. ✅ Claude created the **`dev`** branch (`neon checkout dev --create`) and pulled its variables into the local `.env` (git-ignored).
  4. 👤 **Remaining — Vercel variables.** In the Neon console, for each branch: **Connect** → toggle **Connection pooling** on → copy the string. Then Vercel → Project → **Settings → Environment Variables** → add `DATABASE_URL`:
     - value = `production` string, environment **Production** only;
     - value = `dev` string, environment **Preview** only.
     Never paste these strings in chat or commit them.
  *Done when:* both variables are in Vercel and the local `.env` exists.

- [x] **T10** 🤖 **Drizzle + `usage_day` table + migrations in the build**
  Drizzle with the Neon serverless driver; `server/db/schema.ts` with `usage_day (day DATE PRIMARY KEY)`; first migration generated and committed; the build command runs migrations before `next build` (plan §5.7).
  *Done when:* after deploy, the `usage_day` table exists in both Neon branches.

## Phase D — Private sign-in

- [x] **T11** 👤 **Create the Google OAuth client**
  1. console.cloud.google.com → create a project `SprintYourLife`.
  2. **Google Auth Platform** (formerly "OAuth consent screen") → **Get started**: app name, your support email, audience **External**, your contact email.
  3. Scopes: leave the defaults (email, profile, openid). Add nothing sensitive.
  4. ~~Publish app~~ → Google requires a privacy policy to publish. **Stay in Testing** ([ADR-0012](../../docs/decisions/0012-google-oauth-testing-mode.md)): **Audience → Test users → Add users**: your Gmail + a second Google account for the UAT refusal test.
  5. **Clients → Create client → Web application**. Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://<your-app>.vercel.app/api/auth/callback/google`
  6. Copy the **Client ID** and **Client secret**.
  7. In a terminal, generate two secrets (one for local, one for production): `openssl rand -base64 32`
  8. In Vercel (**Production**) and in the local `.env`, set:
     `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET` (a different one per environment), `BETTER_AUTH_URL` (`http://localhost:3000` locally, production URL in Vercel), `ALLOWED_EMAILS` (your Gmail address).
  *Done when:* all variables are set in both places. (Labels in the Google console change often: if a step doesn't match, tell Claude what you see.)

- [x] **T12** 🤖 **Better Auth setup** (AC-2.2, AC-3.1, AC-4.1)
  `server/auth.ts`: Google provider, Drizzle adapter, auth tables migration, 90-day session renewed on use, hook that refuses non-allowlisted emails using `isAllowed` (T03); route `app/api/auth/[...all]`.
  *Done when:* sign-in works locally with the allowlisted account.

- [x] **T13** 🤖 **Sign-in page, guard, sign-out** (AC-2.1, AC-3.1, AC-3.2, AC-4.2)
  `/sign-in` with one "Sign in with Google" button and the message "This app is private." for refused accounts; redirect to `/sign-in` when not signed in; each page calls `requireAllowedSession()` (session **and** allowlist) before rendering; "Sign out" button on home.
  *Done when:* locally, a non-allowlisted account is refused and sign-out works; merged and deployed.

- [x] **T14** 👤🤖 **Spike: sign in from the installed iPhone app** (AC-2.3, OQ-3) ⛳ **go / no-go**
  On the iPhone: delete the old home screen icon, add it again, open from the icon, sign in with Google. Then fully close the app (swipe it away) and reopen it.
  *Go:* you end up signed in **inside** the installed app, and you're still signed in after reopening.
  *No-go:* you're left in Safari, or signed out on reopening → **stop**. Claude comes back with options before any other task.

## Phase E — Usage days

- [x] **T15** 🤖 **Record today on page load** (AC-5.1, AC-5.2, AC-5.4)
  `server/usage-repository.ts`: "insert today if not exists" using `localDate` (T02); called from `requireAllowedSession()` only, after the session and allowlist checks.
  *Done when:* opening the app twice in a day creates exactly one row.

- [x] **T16** 🤖 **Record today when the app comes back to the screen** (plan §5.4)
  On `visibilitychange` → visible, call a small server action that records today and refreshes the home line.
  *Done when:* locally, switching tabs and coming back records the day without a reload.

- [x] **T17** 🤖 **"Used N of the last 7 days" on home** (AC-5.5)
  Placeholder home page: app name, the neutral line using `countUsedLastNDays` (T04), and the sign-out button. No colours that judge, no streak.
  *Done when:* merged and deployed; the number matches the rows in Neon.

## Phase F — Lock down and accept

- [x] **T18** 👤 **Protect `main` on GitHub** (AC-6.2)
  GitHub repo → **Settings → Rules → Rulesets → New branch ruleset**: target `main`, enable **Require a pull request before merging** (0 approvals: you're solo), **Require status checks to pass** → select the CI check, **Block force pushes**. Save as **Active**.
  *Done when:* a direct push to `main` is refused.

- [ ] **T19** 👤 **UAT** ⛳
  Run the [UAT checklist in the spec](spec.md#8-uat-checklist-for-the-po) on production with the iPhone, and write the warm/cold timings in the UAT notes. To test AC-6.2, Claude opens a PR with a deliberately failing test. Check that it's red and can't be merged, then close it.
  *Done when:* every box is ticked → spec 001 status becomes **Delivered**, and backlog E01–E03 become **Delivered**.

---

## Progress log

| Date | Tasks | Note |
|---|---|---|
| 2026-11-16 | T01–T04 | Next.js 16.4 scaffold, domain rules BR-1, BR-2, BR-4 (27 tests), lint rule keeping `src/domain` pure. T05 workflow written; done once CI is green on the PR. |
| 2026-11-16 | T05, T06 | PR #1 merged with CI green. Vercel project live at `sprintyourlife.vercel.app`, region iad1. Node pinned to `24.x` after a Vercel warning about `>=24`. |
| 2026-11-16 | T07 | Web manifest (standalone, scope `/`), placeholder icons generated by `npm run icons`, Apple home-screen metadata. Next: T08 on the iPhone. |
| 2026-11-16 | T08 ⛳ | PO confirmed on iPhone: icon "SprintYourLife" on the home screen, opens full-screen. AC-1.1 and AC-1.2 pass. |
| 2026-11-16 | T09 (partly), T10 (dev) | Neon linked via CLI; `dev` branch created (no expiry). Drizzle + Neon HTTP driver, `usage_day` migration applied to `dev` with the pooled URL only (as on Vercel); re-run is a no-op. End-to-end probe with the app driver: double insert → 1 row (BR-3), warm query 39 ms. `vercel-build` runs migrations then `next build`. Waiting on Vercel `DATABASE_URL` (T09 step 4) before merge. |
| 2026-11-16 | T09, T10 ✅ | PO set `DATABASE_URL` in Vercel (Production → `production`, Preview → `dev`); PR #3 preview went green after redeploy, then merged. Verified: `usage_day` exists on `production` with 1 recorded migration; site responds 200. |
| 2026-11-16 | T11 ✅ | Google refused "Publish app" without a privacy policy URL. PO chose to stay in Testing mode with 2 test users (ADR-0012). Client created; local `.env` and Vercel Production variables set (local `BETTER_AUTH_SECRET` generated by Claude). |
| 2026-11-16 | T12, T13 (code) | Better Auth 1.7 + Google + Drizzle adapter (checked: no transactions on PostgreSQL, so the Neon HTTP driver works); allowlist refused at user **and** session creation; OAuth tokens encrypted; 90-day session. Proxy (UX redirect), sign-in page, sign-out. **Fix found by testing:** a layout guard let page content through with a fake cookie (Next renders layouts and pages in parallel) → each page now calls `requireAllowedSession()` first; rule added to CLAUDE.md and plan §5.1. Verified locally: redirect without cookie, no private HTML with a fake cookie, `get-session` → null, Google request uses the right redirect URI and basic scopes. **Pending PO:** a real Google sign-in (allowed and refused accounts). |
| 2026-11-16 | T12, T13 ✅ | PO tested locally: signed in with the allowlisted Gmail ("Signed in as …"), sign-out returned to `/sign-in`; with `ALLOWED_EMAILS` temporarily set to a fake address, the same account got "This app is private." (Google passed it as a test user, our allowlist refused it: session-creation hook). Refusal of a brand-new account (user-creation hook) left for UAT if a second account is available. |
| 2026-11-16 | T14 ⛳ **GO** | PR #4 merged. PO on iPhone: reinstalled from Safari, signed in with Google from the installed app → signed in inside the app; after fully closing and reopening, still signed in. AC-2.3 passes; risk OQ-3 closed. |
| 2026-11-16 | T15 ✅, T16–T17 (code) | `usage-repository.ts`: idempotent `recordUsageDay` (2 calls → 1 row on `dev`), `countUsageDays(7)` via `countUsedLastNDays`. Recorded inside `requireAllowedSession()`. AC-5.4 checked: no row created by a visit without a cookie or with a fake cookie. T16: `visibilitychange` → server action `recordVisit()` (checks session, records, `refresh()`). T17: neutral "Used N of the last 7 days" line. Pending: PO tab-switch check (T16), production check (T17). |
| 2026-11-16 | T16 ✅ | Claude deleted today's row on `dev` (0 rows); PO switched tabs and came back **without reloading**; the row was recreated (1 row). The resume path records the day. |
| 2026-11-16 | T17 ✅ | PR #5 merged. iPhone shows "Used 1 of the last 7 days"; Neon `production` has exactly 1 usage day (2026-11-16) and 1 user account. Matches. |
| 2026-11-16 | T18 ✅ | PO created the `main` ruleset. Verified via GitHub API: deletion and force-push blocked, pull request required (0 approvals), required check `Typecheck, lint, test`. |
