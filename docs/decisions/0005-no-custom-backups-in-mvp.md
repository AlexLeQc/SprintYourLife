# ADR-0005 — No custom backups in the MVP

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

Losing my data would be demotivating (discovery, block 4). But the budget is $0, and free database tiers offer limited or no backups. A custom backup (a scheduled export to private storage) is extra work and must never touch the public repo.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| Scheduled custom backup to private storage | Data survives almost anything | Extra setup and secrets; another thing to maintain |
| **Rely on the database provider** | Zero work | A provider incident or my own mistake may be unrecoverable |
| Manual export feature | Cheap insurance, under my control | Only as good as my habit of using it |

## Decision

The MVP relies on the provider. This is an **accepted risk** (vision §11, R1), decided by the PO. Mitigations: prefer a provider with a built-in restore window (see ADR-0007); a data export feature (C07) stays in the backlog.

## Consequences

- ➕ Nothing to build or maintain.
- ➖ Possible data loss. If it happens, or if the data starts to feel valuable, a new ADR introduces backups.
