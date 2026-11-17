# ADR-0002 — Two-week sprints, Sunday to Saturday

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

The original idea was 4-week sprints. During discovery, the main uncertainty turned out not to be the skills themselves but **whether the system works for me at all**. Sprint length controls how often I can learn from a retro.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| 4 weeks | Enough time for real progress on a skill | Few retros → slow feedback on the system; a lost week 2 sinks the whole sprint |
| **2 weeks** | 3 retros in 6 weeks; short-term motivation; mistakes are cheap | Some skills barely progress in 2 weeks |
| Configurable | Flexible | Complexity before knowing what's needed |

## Decision

Sprints last **2 weeks**, from **Sunday to Saturday**, back to back. The retro of the ending sprint and the planning of the next one happen on the Sunday between them. A goal that needs more time is **carried over** to the next sprint.

## Consequences

- ➕ Simple date rules: a sprint's start date is always a Sunday; end date = start + 13 days.
- ➕ Fast feedback on the system itself.
- ➖ Fixed length. Making it configurable would be a new ADR, driven by real retro feedback.
- All date logic follows the `America/Toronto` time zone (see architecture §4).
