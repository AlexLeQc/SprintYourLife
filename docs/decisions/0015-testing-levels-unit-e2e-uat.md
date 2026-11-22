# ADR-0015 — Testing levels: unit, end-to-end with accessibility, and UAT (supersedes ADR-0010)

- **Status:** Accepted (PO, 2026-11-22 — plan 003 D-2)
- **Date:** 2026-11-22
- **Deciders:** Alexis (PO), Claude (architect, recommendation)
- **Supersedes:** [ADR-0010](0010-testing-and-ci.md)
- **Source:** vision v0.4 (goal G2, quality bar) · [spec 003](../../specs/003-portfolio-ready/spec.md) · [plan 003](../../specs/003-portfolio-ready/plan.md)

## Context

ADR-0010 chose level **(b)**: unit tests on the domain, CI on every push, and *"UI behavior is verified by my UAT, not by end-to-end tests (for now)"*. Level (c), with browser tests, was "too much for a solo part-time project".

Two facts changed:

1. **Vision v0.4** adds goal G2 (portfolio-ready). The repository is evidence for a QA role, and browser tests in CI are what a reviewer looks for first.
2. **Spec 002 is delivered** and used daily. F02 to F06 will all touch the home page. Only the PO's manual UAT would notice if one of them broke a task flow.

The cost argument of ADR-0010 still holds in part. The decision below keeps the end-to-end layer **small and focused on flows**, not a copy of the unit tests.

## Options considered

| Option | Description | Trade-off |
|---|---|---|
| Keep (b) | Unit tests + UAT only | No new cost. UI regressions are still caught late. Weak evidence for G2. |
| **(b+) Unit + focused end-to-end + accessibility + UAT** | Domain unit tests stay the detailed layer. A small Playwright suite covers each user flow once, in desktop and phone viewports, with an axe scan. UAT stays the final acceptance. | Moderate setup cost, paid once. Each feature adds a few flow tests. |
| (c) Full | High coverage targets, visual regression, several browsers | Too much maintenance for the time available (vision A1) |

## Decision

**(b+)**, accepted by the PO on 2026-11-22:

| Layer | Tool | What it covers | Runs |
|---|---|---|---|
| Unit | Vitest | Every business rule (BR-x), with all its edge cases. Pure functions in `src/domain/` | Every pull request and push to `main`, required check |
| End-to-end | Playwright (Chromium; desktop and phone viewports) | Each user flow of each spec, 1–2 cases per rule; access control; tests named after AC ids | Every pull request and push to `main`, **required check**; skipped when only documentation changed |
| Accessibility | axe (`@axe-core/playwright`) inside the end-to-end suite | WCAG 2.1 A + AA rules on every page and main state. **Any violation fails CI** | With the end-to-end tests |
| UAT | The PO, on production, on the iPhone | Real device and Safari, the Google sign-in round-trip, "does it feel right", NFR timings | Once per spec, before *Delivered* |

Rules:
- A spec's plan says, for each AC, which layer verifies it.
- End-to-end tests run against a production build (`next build` + `next start`), on a disposable database with fake data only. They never touch `dev` or production.
- The test sign-in uses a session created in the test database by Better Auth's test helpers, from the test code only. The app gets no extra way to sign in.
- A flaky test is a bug: it is fixed or removed, never just retried until it passes. A retry may run only to label a failure as flaky; the run stays red (plan 003 D-3).
- The end-to-end job is skipped when a pull request changes only documentation (`docs/`, `specs/`, `*.md`); the unit-test job always runs (plan 003 D-4).

## Consequences

- ➕ Regressions in task flows (and later features) are caught on the pull request, not in UAT.
- ➕ Clear test pyramid to explain: many fast unit tests, few flow tests, one human acceptance.
- ➕ Accessibility is checked on every change, not once.
- ➖ CI is slower (target: end-to-end job under 5 minutes) and has more moving parts (browser, database container).
- ➖ Every new feature spec must budget its flow tests and keep the axe scan green.
- Not covered automatically, on purpose: the Google sign-in round-trip, Safari/iPhone rendering, performance. They stay in UAT.
- ADR-0010 status becomes "Superseded by ADR-0015".
