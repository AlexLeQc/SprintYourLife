# Architecture Decision Records

An ADR records **one** important decision: the context, the options considered, what was chosen, and the consequences. ADRs are never edited after acceptance — a changed decision gets a **new** ADR that supersedes the old one.

Format: lightweight [Nygard style](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). Statuses: `Proposed` → `Accepted` → (`Superseded by ADR-XXXX`).

| ADR | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-two-week-sprints-sunday-to-saturday.md) | Two-week sprints, Sunday to Saturday | Accepted |
| [0003](0003-online-only-pwa.md) | Online-only PWA, no native app | Accepted |
| [0004](0004-english-for-ui-and-docs.md) | English for UI and documentation | Accepted |
| [0005](0005-no-custom-backups-in-mvp.md) | No custom backups in the MVP | Accepted |
| [0006](0006-single-user-access-google-allowlist.md) | Single-user access: Google sign-in + email allowlist | Accepted |
| [0007](0007-stack-nextjs-vercel-neon.md) | Stack and hosting: Next.js on Vercel + Neon PostgreSQL | Accepted |
| [0008](0008-auth-library-authjs.md) | Authentication library: Auth.js | Superseded by 0011 |
| [0009](0009-typescript-and-drizzle.md) | TypeScript and Drizzle ORM | Accepted |
| [0010](0010-testing-and-ci.md) | Testing strategy and CI | Superseded by 0015 |
| [0011](0011-auth-library-better-auth.md) | Authentication library: Better Auth (supersedes 0008) | Accepted |
| [0012](0012-google-oauth-testing-mode.md) | Keep the Google OAuth app in "Testing" mode | Accepted |
| [0013](0013-due-date-time-as-local-wall-clock.md) | Store task due date and time as local wall-clock values | Accepted |
| [0014](0014-read-only-production-access-for-claude.md) | Read-only production access for Claude, without sign-in secrets | Accepted |
| [0015](0015-testing-levels-unit-e2e-uat.md) | Testing levels: unit, end-to-end with accessibility, and UAT (supersedes 0010) | Accepted |

To add one: copy the structure of an existing ADR, take the next number, add a row here.
