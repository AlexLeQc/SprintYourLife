# SprintYourLife

[![CI](https://github.com/AlexLeQc/SprintYourLife/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AlexLeQc/SprintYourLife/actions/workflows/ci.yml)

**A personal web app that answers "what could I do right now?" in seconds**, and turns learning goals into short, measurable 2-week sprints. It's built to replace idle scrolling with *sidequests*: things I actually want to learn or try.

It's also a case study in **spec-driven development**. Every feature starts as a written spec with acceptance criteria, every significant choice is an Architecture Decision Record, and nothing is called done until it passes user acceptance testing on a real phone.

## Status

In daily use since November 2026, installed on my phone's home screen.

| Spec | What it delivers | Status |
|---|---|---|
| [001 Foundation](specs/001-foundation/spec.md) | Installable app (PWA), Google sign-in restricted to an allowlist, 90-day session, usage days, CI | ✅ Delivered |
| [002 Tasks](specs/002-tasks/spec.md) | Add, edit, complete and delete tasks, with optional due date and time, urgency colours and undo | ✅ Delivered |
| [003 Portfolio-ready](specs/003-portfolio-ready/spec.md) | End-to-end browser tests and accessibility checks in CI; this README | 🚧 In progress |
| Next: F02 Sidequest bank | Capture and browse sidequests by category | [Backlog](specs/backlog.md) |

## Why

- In idle moments (in bed, between two activities), I picked up my phone and scrolled by default.
- My ideas for things to learn existed, scattered in notes, but they weren't in front of me **at the moment of choice**.
- Obligations worked because they had deadlines. So the app puts tasks and sidequests in one place: opening it for a task also shows something worth doing.

The full problem statement, success metrics and design principles are in the [vision](docs/vision.md).

## How it's built

The documentation is the source of truth. Code is written only from a validated spec, and when the code and the spec disagree, the spec wins (or gets changed on purpose, with a new version).

```mermaid
flowchart TD
    A["Need<br/><i>PO</i>"] --> B["Spec<br/><i>PO</i>"]
    B --> C["Plan + ADRs<br/><i>Claude proposes,<br/>PO decides</i>"]
    C --> D["Tasks<br/><i>Claude</i>"]
    D --> E["Code + tests<br/><i>Claude</i>"]
    E --> F(["UAT → Delivered<br/><i>PO</i>"])
    F -. friction .-> A
```

| Step | Artifact | What it holds |
|---|---|---|
| Spec | `spec.md` | User stories, Given/When/Then acceptance criteria, business rules, open questions with the PO's answers, UAT checklist |
| Plan | `plan.md` + ADRs | How it will be built, options with a recommendation, the PO's decisions, how each acceptance criterion will be verified |
| Tasks | `tasks.md` | Small steps with a "done when", ⛳ checkpoints where work stops for the PO, a progress log with evidence |
| UAT | spec's checklist | Run by the PO on production, on the real phone, before the spec is called Delivered |

| Role | Who | Responsibilities |
|---|---|---|
| Product Owner / Business Analyst | Alexis | Discovery, vision, backlog, specs and acceptance criteria, every decision, plan validation, UAT, declaring a spec Delivered |
| Implementation | [Claude Code](https://claude.com/claude-code), AI-assisted | Plans and options with a recommendation, tasks, code, tests, evidence for each check |

**About the AI part, plainly:** most of the code is written by an AI assistant. The work I show here is the analysis, the decisions and their reasons, the acceptance criteria, and the verification. An example of what that looks like in practice: when a library choice turned out to rest on outdated information, the decision wasn't edited away; a [new ADR](docs/decisions/0011-auth-library-better-auth.md) replaced it and says why.

**Rules every change follows:**

- Each spec moves through `Spec draft → Spec validated → Planned → In progress → In UAT → Delivered`, tracked in the [backlog](specs/backlog.md).
- Business rules live in a pure TypeScript module ([`src/domain/`](src/domain/)) with no framework or database, enforced by a lint rule. Each rule has unit tests named after its id (e.g. `BR-5`), so a requirement can be followed straight to its test.
- Every page and server action checks the session and the allowlist **before** reading anything private. A direct request with a fake cookie is part of each spec's verification.
- Branch → pull request → CI green → merge. Nothing goes to `main` directly.
- Public repository, private data: no real emails, secrets or user data in code, tests or screenshots.

## Documentation

| Document | What it contains |
|---|---|
| [docs/vision.md](docs/vision.md) | Problem, users, goals and metrics, design principles, non-functional requirements |
| [specs/backlog.md](specs/backlog.md) | MoSCoW backlog, release plan, idea inbox |
| [specs/](specs/) | One folder per feature: `spec.md` (what), `plan.md` (how), `tasks.md` (steps + progress log with evidence) |
| [docs/architecture.md](docs/architecture.md) | Solution overview, data model, cross-cutting rules, NFR traceability |
| [docs/decisions/](docs/decisions/README.md) | Architecture Decision Records: context, options, decision, consequences |

A good place to start: [spec 002 Tasks](specs/002-tasks/spec.md), then its [plan](specs/002-tasks/plan.md) and [tasks with the progress log](specs/002-tasks/tasks.md).

## Stack

Next.js (React + Node, TypeScript) on Vercel · PostgreSQL on Neon · Drizzle ORM · Better Auth (Google sign-in + allowlist) · Vitest · GitHub Actions. Running cost: $0/month. The reasons for each choice are in the [ADRs](docs/decisions/README.md).

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
