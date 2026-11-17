# ADR-0009 — TypeScript and Drizzle ORM

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO), Claude (architect, recommendation)

## Context

Code is mostly written by an AI and reviewed by me. Types catch whole classes of mistakes before UAT. For the database, we need a way to define tables, run migrations, and write queries from Node.

## Options considered

**Language**

| Option | Pros | Cons |
|---|---|---|
| **TypeScript** | Errors caught at build time; types document the data model; standard in job postings | A build step (already present with Next.js) |
| JavaScript | No types to write | Mistakes surface at runtime, during my UAT |

**Data access**

| Option | Pros | Cons |
|---|---|---|
| **Drizzle** | Reads like SQL (I prefer SQL); light, works well in serverless; versioned migrations | Smaller community than Prisma |
| Prisma | Very popular; great tooling | Its own schema language; heavier in serverless |
| Raw SQL | Full control | Hand-written mapping and migrations |

## Recommendation

**TypeScript everywhere**, **Drizzle** for schema, migrations, and queries.

## Decision

**TypeScript** everywhere and **Drizzle** for schema, migrations, and queries. Accepted by the PO on 2026-11-16.

## Consequences

- ➕ Table definitions in TypeScript are the single source for the data model; migration files are committed.
- ➖ Lower-impact choice: easy to revisit early on if it causes friction.
