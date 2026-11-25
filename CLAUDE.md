@AGENTS.md

# Project rules — SprintYourLife

- **Spec-driven.** Docs are the source of truth. Never implement anything that isn't in a validated `specs/NNN-*/spec.md`. If code and spec disagree, the spec wins — or ask the PO to change the spec.
- **Roles.** Alexis is the Product Owner / BA and does UAT. Claude implements from `tasks.md` and stops at every ⛳ checkpoint.
- **Read before planning:** `docs/vision.md` (design principles, NFRs), `docs/architecture.md`, `docs/decisions/` (ADRs are immutable; a change of decision = a new ADR that supersedes).
- **Architecture:** business rules live in `src/domain/` as pure TypeScript (no Next.js, React, database, or auth imports; enforced by ESLint). Each rule has Vitest tests named after its BR/AC id.
- **Reuse first.** Before writing a component, business rule, or test helper, check whether one already exists; reuse it, or extract it so both places share it (PO rule, plan 004 D-3). Touching delivered code is fine: that spec's end-to-end tests must stay green.
- **Access control:** every page, server action, and route calls `requireAllowedSession()` / `getAllowedSession()` (`src/server/session.ts`) **before** reading or rendering anything private. Never rely on a layout check: Next.js renders layouts and pages in parallel, so the page's content is still produced. `src/proxy.ts` is a UX redirect only.
- **Production data:** read it only through `PROD_READONLY_DATABASE_URL` (ADR-0014, read-only role, no sign-in secrets). Never write to production outside a merged migration. A plan that adds a table holding secrets must revoke `SELECT` on it for `claude_readonly`.
- **Time:** every "day" uses `America/Toronto` via `src/domain/local-date.ts`, never the server's time zone.
- **Privacy:** public repo. No real emails, secrets, or user data in code, tests, fixtures, or commits. Test data uses `@example.com`.
- **Language:** English for UI, code, and docs. The PO may write in French.
- **Workflow:** branch → PR → CI green → PO merges. Update the task checkboxes and progress log in `tasks.md` as tasks complete.
- **Delivering a spec.** When the PO says a spec's UAT passes, run the `deliver-spec` skill (`.claude/skills/deliver-spec/`): status docs PR here, then follow-up sessions for the README screenshots and the website case study. The website reads the backlog's Status column, so keep its `Delivered — [NNN](…)` shape.
