# ADR-0003 — Online-only PWA, no native app

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

The key moment of use is a transition, phone in hand. The app competes with TikTok: it must open from the home screen and stay signed in. I always have mobile data.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| Native app (iOS) | Best phone experience | Separate codebase, App Store, cost; overkill for one user |
| **Online-only PWA** | One codebase for phone and desktop; installable on the home screen; $0 | Slightly less "native" feel; needs a connection |
| Offline-first PWA | Works without network | Sync and conflict handling: the most expensive requirement in the whole architecture, for a need I don't have |

## Decision

Build a **responsive web app, installable as a PWA, that requires a connection**. No offline mode, no native app.

## Consequences

- ➕ A plain client/server app: no sync engine, no local database.
- ➕ One codebase for both contexts (phone "Now" screen, desktop planning).
- ➖ Without a connection, the app shows an error. Accepted (NFR-10).
- Revisit only if real use shows offline moments that matter.
