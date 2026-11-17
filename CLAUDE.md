@AGENTS.md

# Project rules — SprintYourLife

- **Spec-driven.** Docs are the source of truth. Never implement anything that isn't in a validated `specs/NNN-*/spec.md`. If code and spec disagree, the spec wins — or ask the PO to change the spec.
- **Roles.** Alexis is the Product Owner / BA and does UAT. Claude implements from `tasks.md` and stops at every ⛳ checkpoint.
- **Read before planning:** `docs/vision.md` (design principles, NFRs), `docs/architecture.md`, `docs/decisions/` (ADRs are immutable; a change of decision = a new ADR that supersedes).
- **Architecture:** business rules live in `src/domain/` as pure TypeScript (no Next.js, React, database, or auth imports; enforced by ESLint). Each rule has Vitest tests named after its BR/AC id.
- **Time:** every "day" uses `America/Toronto` via `src/domain/local-date.ts`, never the server's time zone.
- **Privacy:** public repo. No real emails, secrets, or user data in code, tests, fixtures, or commits. Test data uses `@example.com`.
- **Language:** English for UI, code, and docs. The PO may write in French.
- **Workflow:** branch → PR → CI green → PO merges. Update the task checkboxes and progress log in `tasks.md` as tasks complete.
