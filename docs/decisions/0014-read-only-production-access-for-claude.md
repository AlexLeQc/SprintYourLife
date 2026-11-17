# ADR-0014 — Read-only production access for Claude, without sign-in secrets

- **Status:** Accepted
- **Date:** 2026-11-17
- **Deciders:** Alexis (PO)
- **Related:** [ADR-0005](0005-no-custom-backups-in-mvp.md) (no custom backups), [ADR-0007](0007-stack-nextjs-vercel-neon.md) (Neon)

## Context

Specs end with a production check (e.g. spec 002 T12: "a task marked done has today's date"). In T12, Claude Code's safety check refused to let Claude fetch production credentials through the Neon CLI, so the PO had to run the query himself. The PO is fine with Claude reading all production data.

What Claude actually needs is to **read** rows to verify features. It never needs to write to production: changes reach production only through migrations in reviewed, merged pull requests. Production has no custom backup (ADR-0005) and Neon Free keeps about 6 hours of restore history, so a mistaken write or delete could be permanent.

Two Better Auth tables hold credentials, not data: `session` (the token in the app's cookie: reading it lets anyone act as the owner for up to 90 days) and `account` (Google tokens, encrypted). `verification` holds short-lived sign-in codes.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. A read-only database role, all tables except sign-in secrets** | Claude can verify anything in the app's data, now and in future specs, with no PO step. Cannot change or delete anything. Cannot read anything that would let it act as the owner. | One more secret in the local `.env`. A future table holding secrets must be revoked explicitly. |
| B. Same role, all tables including `session`, `account`, `verification` | Simplest grant | "Read-only" becomes "can act as the owner" through the session token |
| C. Full Neon account access (Neon CLI + MCP server, "agent setup" prompt) | Claude could also manage branches and projects | No read-only option; one wrong command could delete production. Far more than the need. |
| D. Keep asking the PO to run queries (as in T12) | No access at all | A few minutes of PO time at every check |

## Decision

**Option A.** The PO created, on the Neon `production` branch, a Postgres role `claude_readonly` (with SQL, so it is **not** a member of `neon_superuser`):

- `SELECT` on all tables in `public`, plus **default privileges** so every table that `neondb_owner` creates later (i.e. every migration) is readable automatically;
- `SELECT` revoked on `session`, `account`, `verification`;
- `default_transaction_read_only = on` for the role.

Its connection string is stored **only** in the PO's local `.env` as `PROD_READONLY_DATABASE_URL` (git-ignored). It is never put in Vercel, the repo, or any log.

## Verification (2026-11-17)

Run by Claude with `PROD_READONLY_DATABASE_URL`:

| Check | Result |
|---|---|
| Role flags | not superuser, cannot create roles or databases, no group membership |
| `SELECT` on `task`, `usage_day`, `user` | allowed (5 tasks, 2 usage days, 1 user) |
| `SELECT` on `session`, `account`, `verification` | refused: *permission denied* |
| `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE` | refused: *read-only transaction* |
| Switch the transaction to read-write, then `INSERT` | refused: *permission denied for table task* |
| Default privileges | `claude_readonly=r` on tables created by `neondb_owner` |

Two layers protect production: the read-only setting (which the role *can* turn off for its own session, so it is only a seat belt) and the **grants** (no write privilege at all — the real guarantee, shown by the last write test).

## Consequences

- ➕ Claude verifies production data itself at the end of each spec; the PO's time goes to UAT.
- ➕ No path from this access to changing data or acting as the owner.
- ➖ If a future table holds secrets (tokens, keys), its spec must `REVOKE SELECT` on it for `claude_readonly`. Plans must check this when they add a table.
- ➖ Better Auth tables added by a library upgrade would become readable automatically; check new auth tables when upgrading Better Auth.
- To remove the access: `DROP OWNED BY claude_readonly; DROP ROLE claude_readonly;` on `production`, and delete the line from `.env`.
