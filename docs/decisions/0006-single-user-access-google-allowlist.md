# ADR-0006 — Single-user access: Google sign-in + email allowlist

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

The app holds personal data, and its code and URL are public. I want a convenient login (no password to type) and to stay signed in on my phone.

**Key point:** Google sign-in proves *who* someone is, not *whether they are allowed in*. Without an extra check, any Google account could sign in.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| Password | Universal | A password to manage; more to secure |
| Magic link by email | No password | Needs an email-sending service; slow on the phone |
| **Google sign-in + allowlist** | One tap; Google handles security | Depends on Google |

## Decision

Sign in with **Google**. Access is granted only if the email is in an **allowlist stored in an environment variable** (`ALLOWED_EMAILS`), never in the repo. The check happens at sign-in **and** every server entry point verifies the session. Sessions are long-lived (target: ~90 days, renewed on use).

## Consequences

- ➕ One-tap login; no password storage.
- ➕ A stranger with a Google account is refused — testable with a second account during UAT.
- ➖ If I lose access to my Google account, I lose access to the app. Acceptable.
- Implementation library: see ADR-0008.
