# Tasks 001 — Foundation: private, installable app

| | |
|---|---|
| **Status** | In progress — 4 / 19 done |
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

- [ ] **T05** 🤖 **CI workflow** (AC-6.1)
  `.github/workflows/ci.yml`: on push and pull request, run `npm ci` → typecheck → lint → tests.
  *Done when:* the first pull request shows a green check on GitHub.

> ⛳ **Checkpoint A:** the PO reviews and merges the PR (T01–T05).

## Phase B — Deploy and install

- [ ] **T06** 👤 **Create the Vercel project**
  1. Go to vercel.com → **Sign Up** → choose **Hobby** → **Continue with GitHub**.
  2. **Add New… → Project** → import `SprintYourLife` (give Vercel access to that repo only).
  3. Framework should be detected as **Next.js**. Click **Deploy**.
  4. Project → **Settings → Functions** → check the region is **Washington, D.C. (iad1)**.
  5. Send Claude the production URL (`https://….vercel.app`).
  *Done when:* the placeholder page loads from the `vercel.app` URL.

- [ ] **T07** 🤖 **PWA: manifest and icons** (AC-1.1, AC-1.2)
  `app/manifest.ts` (`name` "SprintYourLife", `display: standalone`, `start_url` and `scope` `/`), simple placeholder icons, Apple touch icon.
  *Done when:* merged and deployed.

- [ ] **T08** 👤 **Check on the iPhone** ⛳
  In Safari, open the production URL → **Share → Add to Home Screen** → open it from the icon.
  *Done when:* the icon is on the home screen and the app opens full-screen, with no Safari bar.

## Phase C — Database

- [ ] **T09** 👤 **Create the Neon database**
  1. Go to neon.com → sign up (GitHub is fine) → **Free** plan.
  2. Create a project `sprintyourlife`, region **AWS US East 1 (N. Virginia)**.
  3. **Branches → New branch** named `dev`, from `main`.
  4. For each branch, open **Connect** and copy the **pooled** connection string.
  5. Vercel → Project → **Settings → Environment Variables**: add `DATABASE_URL` = `main` string for **Production**, and `dev` string for **Preview**.
  6. Locally: copy `.env.example` to `.env` and paste the `dev` string as `DATABASE_URL`. **Never commit `.env`.**
  *Done when:* both variables are in Vercel and the local `.env` exists.

- [ ] **T10** 🤖 **Drizzle + `usage_day` table + migrations in the build**
  Drizzle with the Neon serverless driver; `server/db/schema.ts` with `usage_day (day DATE PRIMARY KEY)`; first migration generated and committed; the build command runs migrations before `next build` (plan §5.7).
  *Done when:* after deploy, the `usage_day` table exists in both Neon branches.

## Phase D — Private sign-in

- [ ] **T11** 👤 **Create the Google OAuth client**
  1. console.cloud.google.com → create a project `SprintYourLife`.
  2. **Google Auth Platform** (formerly "OAuth consent screen") → **Get started**: app name, your support email, audience **External**, your contact email.
  3. Scopes: leave the defaults (email, profile, openid). Add nothing sensitive.
  4. **Audience → Publish app** ("In production"). With only basic scopes, no Google review is needed.
  5. **Clients → Create client → Web application**. Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://<your-app>.vercel.app/api/auth/callback/google`
  6. Copy the **Client ID** and **Client secret**.
  7. In a terminal, generate two secrets (one for local, one for production): `openssl rand -base64 32`
  8. In Vercel (**Production**) and in the local `.env`, set:
     `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET` (a different one per environment), `BETTER_AUTH_URL` (`http://localhost:3000` locally, production URL in Vercel), `ALLOWED_EMAILS` (your Gmail address).
  *Done when:* all variables are set in both places. (Labels in the Google console change often: if a step doesn't match, tell Claude what you see.)

- [ ] **T12** 🤖 **Better Auth setup** (AC-2.2, AC-3.1, AC-4.1)
  `server/auth.ts`: Google provider, Drizzle adapter, auth tables migration, 90-day session renewed on use, hook that refuses non-allowlisted emails using `isAllowed` (T03); route `app/api/auth/[...all]`.
  *Done when:* sign-in works locally with the allowlisted account.

- [ ] **T13** 🤖 **Sign-in page, guard, sign-out** (AC-2.1, AC-3.1, AC-3.2, AC-4.2)
  `/sign-in` with one "Sign in with Google" button and the message "This app is private." for refused accounts; redirect to `/sign-in` when not signed in; the `(app)` layout checks session **and** allowlist; "Sign out" button on home.
  *Done when:* locally, a non-allowlisted account is refused and sign-out works; merged and deployed.

- [ ] **T14** 👤🤖 **Spike: sign in from the installed iPhone app** (AC-2.3, OQ-3) ⛳ **go / no-go**
  On the iPhone: delete the old home screen icon, add it again, open from the icon, sign in with Google. Then fully close the app (swipe it away) and reopen it.
  *Go:* you end up signed in **inside** the installed app, and you're still signed in after reopening.
  *No-go:* you're left in Safari, or signed out on reopening → **stop**. Claude comes back with options before any other task.

## Phase E — Usage days

- [ ] **T15** 🤖 **Record today on page load** (AC-5.1, AC-5.2, AC-5.4)
  `server/usage-repository.ts`: "insert today if not exists" using `localDate` (T02); called from the session-guarded `(app)` layout only.
  *Done when:* opening the app twice in a day creates exactly one row.

- [ ] **T16** 🤖 **Record today when the app comes back to the screen** (plan §5.4)
  On `visibilitychange` → visible, call a small server action that records today and refreshes the home line.
  *Done when:* locally, switching tabs and coming back records the day without a reload.

- [ ] **T17** 🤖 **"Used N of the last 7 days" on home** (AC-5.5)
  Placeholder home page: app name, the neutral line using `countUsedLastNDays` (T04), and the sign-out button. No colours that judge, no streak.
  *Done when:* merged and deployed; the number matches the rows in Neon.

## Phase F — Lock down and accept

- [ ] **T18** 👤 **Protect `main` on GitHub** (AC-6.2)
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
