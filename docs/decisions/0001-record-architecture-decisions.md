# ADR-0001 — Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO)

## Context

This project is spec-driven: the documentation is the source of truth, and the code is mostly written by an AI assistant. Without a written record, the *why* behind decisions is lost — for future me, for the AI working on later features, and for anyone reviewing the repo.

## Decision

Every significant decision (architecture, technology, scope trade-off with technical impact) is recorded as an ADR in `docs/decisions/`, numbered sequentially. Accepted ADRs are immutable; changes are made by superseding them.

## Consequences

- ➕ Decisions can be explained and defended later (e.g. in an interview).
- ➕ Claude Code can read the ADRs as context before planning a feature.
- ➖ Small overhead per decision. Kept low with a short format.
