# Spec 001 — Foundation: private, installable app

| | |
|---|---|
| **Status** | In UAT — started 2026-11-16 (2 checks need day 2, 1 needs timings) |
| **Backlog items** | E01 Walking skeleton · E02 Private access · E03 Usage days · E04 CI (baseline) |
| **Release** | R1 — Usable |
| **Related** | [vision](../../docs/vision.md) · [architecture](../../docs/architecture.md) · ADR-0003, 0006, 0007, 0008, 0009, 0010 |
| **Last updated** | 2026-11-16 |

---

## 1. Goal

Have a real app on my phone's home screen that **only I can open**, that **keeps me signed in**, and that **records the days I use it**. No features yet — this is the base every feature is built on.

**Why first:** every later spec (Tasks, Bank, Sprint…) needs deployment, login, and the database. Doing it first, alone, means the risky setup work (hosting, Google sign-in, PWA on iPhone) is proven before any feature depends on it.

## 2. User stories

| ID | Story |
|---|---|
| US-1 | As the owner, I want to **add the app to my phone's home screen**, so that I can open it in one tap, like any other app. |
| US-2 | As the owner, I want to **sign in with my Google account**, so that I don't have a password to remember. |
| US-3 | As the owner, I want **anyone else to be refused**, even with a valid Google account, so that my personal data stays private while the code and URL are public. |
| US-4 | As the owner, I want to **stay signed in**, so that opening the app during a transition is instant. |
| US-5 | As the owner, I want the app to **record each day I open it**, so that I can measure adoption (metric M1). |
| US-6 | As the owner, I want every change to be **checked automatically and deployed when it reaches `main`**, so that I always use the latest working version. |

## 3. Acceptance criteria

### US-1 — Install on the home screen

- **AC-1.1** — **Given** the production URL is open in Safari on my iPhone, **When** I choose *Share → Add to Home Screen*, **Then** an icon named "SprintYourLife" appears on my home screen.
- **AC-1.2** — **Given** the app is on my home screen, **When** I tap its icon, **Then** it opens full-screen, without the Safari address bar.

### US-2 — Sign in with Google

- **AC-2.1** — **Given** I am not signed in, **When** I open any page of the app, **Then** I am sent to a sign-in page with a single "Sign in with Google" button.
- **AC-2.2** — **Given** my Google email is in the allowlist, **When** I complete Google sign-in, **Then** I land on the home page.
- **AC-2.3** — **Given** the app is installed on my home screen, **When** I sign in **from the installed app**, **Then** I end up signed in **inside the installed app** (not left in Safari).

### US-3 — Strangers are refused

- **AC-3.1** — **Given** a Google account whose email is **not** in the allowlist, **When** it completes Google sign-in, **Then** the app shows "This app is private." and no session is created.
- **AC-3.2** — **Given** I am not signed in, **When** a request is sent directly to any server endpoint (bypassing the UI), **Then** it is refused and no data is returned.
- **AC-3.3** — **Given** the public GitHub repository, **When** anyone searches it, **Then** they find no allowlisted email, no secret, and no real user data.

### US-4 — Stay signed in

- **AC-4.1** — **Given** I signed in, **When** I reopen the app at any time while I keep using it at least once every 90 days, **Then** I am still signed in, with no Google screen.
- **AC-4.2** — **Given** I am signed in, **When** I tap "Sign out", **Then** I am back on the sign-in page.

### US-5 — Usage days

*All "days" are local dates in `America/Toronto` (architecture §4).*

- **AC-5.1** — **Given** no usage day is recorded for today, **When** I open the app while signed in, **Then** today is recorded as a usage day.
- **AC-5.2** — **Given** today is already recorded, **When** I open the app again today, **Then** there is still exactly one usage day for today.
- **AC-5.3** — **Given** it is Saturday 11:30 p.m. in Sherbrooke (Sunday 04:30 UTC), **When** I open the app, **Then** the usage day recorded is **Saturday**.
- **AC-5.4** — **Given** someone who is not signed in (or is refused), **When** they open the app, **Then** no usage day is recorded.
- **AC-5.5** — **Given** I am signed in, **When** I look at the home page, **Then** I see a neutral line: "Used **N** of the last 7 days" (no streak, no colour judgment).

### US-6 — Automatic checks and deployment

- **AC-6.1** — **Given** a push or pull request on GitHub, **When** CI runs, **Then** it runs the typecheck, the linter, and the tests, and shows green or red.
- **AC-6.2** — **Given** a failing test, **When** CI runs, **Then** the build is red and the change cannot be merged into `main`.
- **AC-6.3** — **Given** a change is merged into `main`, **When** the deployment finishes, **Then** the production app shows that change, with no manual step.

### Non-functional checks

- **AC-NF-1 (NFR-03)** — **Given** the installed app on mobile data, **When** I tap the icon, **Then** the home page is usable in **≤ 2 s** if I used the app in the last few minutes (warm). The time after ≥ 1 hour of inactivity (cold) is **measured and recorded** in the UAT notes. *(See OQ-2.)*
- **AC-NF-2 (NFR-08)** — **Given** the app is running in production, **When** I check the Vercel and Neon billing pages, **Then** both show $0.

## 4. Business rules (→ unit tests in the domain module)

| ID | Rule |
|---|---|
| BR-1 | An email is allowed if and only if it is in the allowlist. The comparison ignores case and surrounding spaces. |
| BR-2 | "Today" is computed in `America/Toronto`, whatever the server's time zone. |
| BR-3 | There is at most one usage day per local date. |
| BR-4 | "Used N of the last 7 days" counts usage days from today back to 6 days ago, inclusive. |

## 5. Out of scope

- Any feature: Tasks, Bank, Log, Now screen, Sprints (specs 002+). The home page is a placeholder.
- Custom domain (costs money) — the default `*.vercel.app` URL is used.
- Offline support beyond what installation requires (ADR-0003).
- Sign-in on Vercel preview deployments — production and localhost only.
- Managing the allowlist from the UI — it's an environment variable.
- Polished visual design and final app icon — a simple, clean placeholder icon is enough.

## 6. Dependencies — manual steps for the PO

These need my accounts; Claude cannot do them. The plan will give step-by-step instructions.

1. Create a **Vercel** account (Hobby) and link the GitHub repository.
2. Create a **Neon** account (Free) and a project with `production` (default) and `dev` branches.
3. Create a **Google Cloud** OAuth client (redirect URLs for localhost and production).
4. Enter secrets and the allowlist as environment variables (Vercel + local `.env`).

## 7. Open questions

All resolved by the PO on 2026-11-16 (recommendations accepted).

| # | Question | Resolution |
|---|---|---|
| OQ-1 | How will I **verify US-5 in UAT** if usage days are invisible? | **Resolved** — show the neutral line of AC-5.5 on the placeholder home. |
| OQ-2 | NFR-03 says "~2 s" but doesn't say warm or cold. Neon's free database sleeps when idle. | **Resolved** — hard target on warm (≤ 2 s); cold is measured. If cold is > 5 s, revisit ADR-0007. |
| OQ-3 | Technical risk: on iPhone, signing in with Google from an **installed** app can bounce to Safari and leave the session there (AC-2.3). | **Resolved** — proven first after deployment; the plan addresses it explicitly. |
| OQ-4 | Is my phone an iPhone? | **Resolved** — yes. |

## 8. UAT checklist (for the PO)

To be run on production, with the real phone:

- [x] AC-1.1, AC-1.2 — install, opens full-screen
- [x] AC-2.1 to AC-2.3 — sign in from Safari **and** from the installed app
- [x] AC-3.1 — try with a second Google account → refused *(done with an allowlist swap; see notes)*
- [x] AC-3.3 — search the repo for my email
- [ ] AC-4.1 — still signed in the next day without doing anything
- [x] AC-4.2 — sign out works
- [ ] AC-5.1, AC-5.2, AC-5.5 — open twice in a day; count increases by one only
- [x] AC-5.3 — covered by an automated test (BR-2)
- [x] AC-6.1 to AC-6.3 — break a test in a PR: CI is red, merge blocked
- [ ] AC-NF-1 — time a warm and a cold open, write both numbers below
- [x] AC-NF-2 — billing pages at $0

**UAT notes** — PO: Alexis · started 2026-11-16 · production (`sprintyourlife.vercel.app`) + iPhone

| AC | Result | Evidence |
|---|---|---|
| AC-1.1, 1.2 | ✅ Pass | T08: icon "SprintYourLife", opens full-screen |
| AC-2.1, 2.2 | ✅ Pass | T13: redirect to `/sign-in`; sign-in with the allowlisted Gmail → "Signed in as …" |
| AC-2.3 | ✅ Pass | T14: sign-in from the installed app stays in the app; survives a full close/reopen |
| AC-3.1 | ✅ Pass (partial) | Allowlist swapped to a fake address → same Gmail refused with "This app is private." (Google passed it as a test user; our allowlist refused it). A never-seen account (user-creation hook) not tested: no second account. Covered by unit tests on BR-1. |
| AC-3.2 | ✅ Pass | No cookie → redirect; fake cookie → 0 private content in HTML; `get-session` → `null` |
| AC-3.3 | ✅ Pass | Repo and full history scanned: no allowlisted email, no secret. Note: commit author email (school address) is public via git metadata; not the allowlisted email. |
| AC-4.1 | ⏳ Pending | Re-check on 2026-11-17 |
| AC-4.2 | ✅ Pass | T13: sign-out returns to `/sign-in` |
| AC-5.1, 5.2, 5.5 | ✅ Pass (day 1) · ⏳ day 2 | Day 1: "Used 1 of the last 7 days"; production has exactly 1 row. Re-check on 2026-11-17: count = 2, still 2 after a second open. |
| AC-5.3 | ✅ Pass | Automated test (BR-2), incl. daylight-saving switches |
| AC-5.4 | ✅ Pass | No row created by visits without a cookie or with a fake cookie |
| AC-6.1, 6.2 | ✅ Pass | PR #7 with a deliberately failing test: check red, merge blocked by the `main` ruleset; closed without merging |
| AC-6.3 | ✅ Pass | Every merge (PRs #1–#5) deployed automatically |
| AC-NF-1 | ⏳ Pending | Warm: … s · Cold (≥ 1 h idle): … s |
| AC-NF-2 | ✅ Pass | Vercel Hobby and Neon Free plans: $0 |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-16 | First draft |
| 1.0 | 2026-11-16 | Validated by PO; open questions resolved |
