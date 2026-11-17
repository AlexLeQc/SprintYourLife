# ADR-0011 — Authentication library: Better Auth (supersedes ADR-0008)

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO), Claude (architect, recommendation)
- **Supersedes:** [ADR-0008](0008-auth-library-authjs.md)

## Context

ADR-0008 chose Auth.js. While preparing the plan for spec 001, a fact check found that **Auth.js has been maintained by the Better Auth team since September 2025**. Auth.js still gets security fixes, but new projects are directed to Better Auth, and Auth.js v5 never left beta.

ADR-0008 was decided on outdated information. Per ADR-0001, it is not edited: this ADR replaces it.

Sources: [Auth.js is now part of Better Auth](https://better-auth.com/blog/authjs-joins-better-auth) · [GitHub discussion #13252](https://github.com/nextauthjs/next-auth/discussions/13252)

## Options considered

| Option | Pros | Cons |
|---|---|---|
| Keep Auth.js | Already accepted; widely documented | Maintenance mode; a 3-year beta; tutorials may age badly; starting a new project on a library in maintenance is a weak choice to defend |
| **Better Auth** | Actively developed, recommended for new projects; open source, runs inside the app ($0, no vendor); Google provider; database sessions; Drizzle adapter; hooks to refuse non-allowlisted emails | Younger library; less Stack Overflow history |
| Clerk (hosted) | Very little code | Same cons as in ADR-0008: third-party holds user data, allowlist not visible in code |

## Recommendation

**Better Auth.** Same design as ADR-0006 (Google sign-in, allowlist in an environment variable, long database sessions), on a library that is actively maintained.

## Decision

**Better Auth**, with the Google provider, the Drizzle adapter, database sessions, and a hook that refuses non-allowlisted emails. Accepted by the PO on 2026-11-16.

## Consequences

- ADR-0008 status becomes "Superseded by ADR-0011".
- Nothing else changes: ADR-0006 (what) is unaffected; only the library (how) changes.
- Lesson recorded: verify the current state of a library before accepting it, not only during setup.
