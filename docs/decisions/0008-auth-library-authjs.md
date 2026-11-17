# ADR-0008 — Authentication library: Auth.js

- **Status:** Superseded by [ADR-0011](0011-auth-library-better-auth.md)
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO), Claude (architect, recommendation)

## Context

ADR-0006 decided *what* (Google sign-in + allowlist, long sessions). This ADR decides *how*, assuming the Next.js stack from ADR-0007.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Auth.js (NextAuth)** | Free, open source, runs inside the app; the allowlist check is a few visible lines of our own code; sessions stored in our database | We configure it ourselves |
| Clerk (hosted service) | Very little code; nice prebuilt UI | Third-party service holding the user data; free-tier limits; allowlist is a dashboard setting, not visible in the repo |
| Roll our own OAuth | Full understanding | Security-sensitive code written from scratch. No. |

## Recommendation

**Auth.js** with the Google provider. The allowlist check lives in the sign-in callback; sessions are stored in PostgreSQL with a long expiry.

## Decision

**Auth.js** with the Google provider, allowlist check in the sign-in callback, database sessions. Accepted by the PO on 2026-11-16.

## Consequences

- ➕ $0, no extra vendor; the security rule is readable in the code and covered by a test.
- ➖ Google Cloud console setup is a manual step for the PO (OAuth client, redirect URLs for localhost and production).
