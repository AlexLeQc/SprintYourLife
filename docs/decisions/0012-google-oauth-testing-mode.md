# ADR-0012 — Keep the Google OAuth app in "Testing" mode

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)
- **Refines:** [ADR-0006](0006-single-user-access-google-allowlist.md)

## Context

Plan 001 (§8) said to publish the Google OAuth app "In production", so that our own allowlist would be the only barrier and could be tested. While doing T11, Google refused: publishing requires a homepage URL **and a privacy policy URL**, which the app doesn't have.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Stay in "Testing" mode, with explicit test users** | Nothing to build. Two barriers: Google only lets listed test users through, then our allowlist (ADR-0006) checks again. AC-3.1 stays testable with a second account added as a test user but not allowlisted. | Max 100 test users (irrelevant). Google may show an "unverified app" screen at sign-in. |
| Publish, adding a privacy policy page | Cleaner sign-in screen | New page outside spec 001; more Google configuration before sign-in can even be tested |

## Decision

The Google OAuth app stays in **Testing** mode. Test users: the owner's Google account and one secondary account used only for UAT. Our allowlist remains the authoritative rule and is still enforced and tested.

## Consequences

- ➕ Defense in depth at no cost.
- ➖ Adding a new person would require both a test-user entry in Google and the allowlist. Acceptable for a single-user app.
- Google's Testing-mode limits on Google's own tokens don't affect us: Google is used only to sign in, and the 90-day session is ours.
- If the app is ever published, a privacy policy page and a new ADR are required.
