# SprintYourLife

A personal web app that answers **"what could I do right now?"** in seconds, and organizes learning into short, measurable 2-week sprints. It replaces idle scrolling with sidequests: things I actually want to learn or try.

> **Status:** under construction. Spec 001 (foundation) is being implemented.

## How this project is built

This is a **spec-driven** project. The documentation is the source of truth, and code is written from validated specs.

| Role | Who | Responsibilities |
|---|---|---|
| Product Owner / Business Analyst | Alexis | Discovery, vision, backlog, specs and acceptance criteria, architecture decisions, plan validation, **UAT** |
| Implementation | [Claude Code](https://claude.com/claude-code) (AI-assisted) | Plans, tasks, code and tests, always from a validated spec |

**Cycle per feature:** describe → `spec.md` → validate → `plan.md` → validate → `tasks.md` → implementation → UAT → **Delivered**.

## Documentation

| Document | What it contains |
|---|---|
| [docs/vision.md](docs/vision.md) | Problem, users, success metrics, design principles, NFRs |
| [specs/backlog.md](specs/backlog.md) | MoSCoW backlog and release plan |
| [docs/architecture.md](docs/architecture.md) | Solution overview, data model, NFR traceability |
| [docs/decisions/](docs/decisions/README.md) | Architecture Decision Records (ADRs) |
| [specs/](specs/) | One folder per feature: `spec.md`, `plan.md`, `tasks.md` |

## Stack

Next.js (React + Node, TypeScript) on Vercel · PostgreSQL on Neon · Drizzle ORM · Better Auth (Google sign-in + allowlist) · Vitest · GitHub Actions. Running cost: $0/month. See the ADRs for the why.

## Run locally

Requires Node 24+.

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm test` | Unit tests (business rules in `src/domain/`) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint, including the "pure domain" architecture rule |
