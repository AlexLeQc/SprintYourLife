# ADR-0013 — Store task due date and time as local wall-clock values

- **Status:** Accepted (PO, 2026-11-17 — plan 002 D-1)
- **Date:** 2026-11-17
- **Deciders:** Alexis (PO)
- **Builds on:** architecture §4 (all "day" logic in `America/Toronto`)

## Context

Spec 002 lets a task have no due, a due **date**, or a due **date + time** (BR-2). The app must decide "overdue" (BR-5), "today / tomorrow" (BR-6, BR-7) and the sort order (BR-3). Vercel servers run in UTC; the only user lives in `America/Toronto`, which switches between UTC−5 and UTC−4 (daylight saving).

PostgreSQL offers two ways to store "Thursday at 2 p.m.":

## Options considered

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. Local wall-clock** | `due_date DATE` + `due_time TIME` (both nullable), exactly as typed, meaning Toronto time | Date-only and timed tasks share one model. Every rule is a plain string comparison (`"2026-11-20" < "2026-11-21"`, `"09:00" < "14:00"`). No conversion, so no daylight-saving bug. Matches how a person thinks of a deadline. | The stored value has no time zone. If the app ever serves several time zones, it needs a migration. |
| B. UTC instant | `due_at TIMESTAMPTZ` + a flag "date only" | Standard for multi-zone systems | Every read and write converts to and from Toronto; a date-only task must be faked as 23:59 or flagged; daylight-saving days need their own tests. More code for no user benefit. |
| C. Text | One `"2026-11-20 14:00"` string | Simple to write | No database type checks; sorting and validation all by hand |

## Decision

**Option A.** A due is stored as the local Toronto date and optional local time the owner typed. The domain compares these values with today's local date and time (from `src/domain/local-date.ts`), never with the server clock directly. The database enforces "no time without a date".

## Consequences

- ➕ The rules in spec 002 (BR-2, BR-3, BR-5 to BR-7) are pure string comparisons, tested in milliseconds.
- ➕ No daylight-saving conversion in the task code at all.
- ➖ If the owner travels to another time zone, times stay Toronto times. Out of scope (spec 002 §5).
- ➖ Supporting several time zones later means a new ADR and a migration to option B. PO note: if travel becomes a need, plan that migration then.
- During the autumn daylight-saving switch, 1:00–2:00 a.m. happens twice; a task due at 1:30 a.m. that night is overdue after the first one. Accepted.
