# ADR-0004 — English for UI and documentation

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

I'm a French speaker in Québec, but the repo is public and part of my portfolio. Adding a second language after the fact is expensive (every string, every screen).

## Options considered

| Option | Pros | Cons |
|---|---|---|
| French only | My first language | Smaller portfolio audience |
| **English only** | Wider audience; English practice for me | Local employers may prefer French |
| Bilingual (i18n) | Best of both | Extra work on every feature, for one user |

## Decision

UI, code, specs, and documentation are in **English**. No internationalization layer.

## Consequences

- ➕ No i18n overhead.
- ➖ A French-speaking reviewer reads English. Optional mitigation: a short French summary in the README.
