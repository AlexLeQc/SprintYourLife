# ADR-0010 — Testing strategy and CI

- **Status:** Accepted (level chosen by PO; tools follow ADR-0007/0009)
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

The repo is public, so quality is visible. But time is limited, and every testing layer costs time.

## Options considered

| Option | Description | Trade-off |
|---|---|---|
| (a) Minimal | It works, manual UAT only | Fast now, regressions later |
| **(b) Reasonable** | Automated tests on business rules + CI on every push | Good signal for the cost |
| (c) Full | High coverage + end-to-end browser tests | Too much for a solo part-time project |

## Decision

Level **(b)**:
- **Unit tests (Vitest)** on the domain module. Each Given/When/Then acceptance criterion that expresses a business rule gets a test.
- **One test on the allowlist** (ADR-0006): an unknown email is refused.
- **GitHub Actions** runs typecheck, lint, and tests on every push and pull request. A red build blocks merging to `main`.
- UI behavior is verified by my **UAT**, not by end-to-end tests (for now).

## Consequences

- ➕ Business rules can't silently break; CI badge visible in the README.
- ➖ UI regressions are caught only by UAT. Revisit if that hurts.
