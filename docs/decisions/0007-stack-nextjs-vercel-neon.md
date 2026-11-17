# ADR-0007 — Stack and hosting: Next.js on Vercel + Neon PostgreSQL

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alexis (PO), Claude (architect, recommendation)

## Context

Constraints: Node + React, SQL, $0/month, opens in ~2 s (NFR-03), solo and part-time. The biggest trap at $0: **free Node servers that sleep** after a few minutes of inactivity and take 30+ seconds to wake up — fatal for an app that must beat TikTok in a transition moment.

*Free-tier details change often; they must be re-verified during E01.*

## Options considered

### A. Next.js (React + Node in one app) on Vercel + Neon PostgreSQL — recommended

- ➕ One repo, one deployment, one language. UI and server code live together.
- ➕ Serverless functions start fast; no sleeping server.
- ➕ Neon is plain PostgreSQL: free tier, separate dev/prod branches, a short restore window (helps ADR-0005).
- ➕ Next.js + React + PostgreSQL is common in job postings.
- ➖ Next.js has its own concepts (server vs client components) to understand.
- ➖ Neon's free compute sleeps when idle: the first query after a pause is a bit slower (to measure, AR2).

### B. React SPA (Vite) + Express API, hosted separately (e.g. Render free + Neon)

- ➕ Classic, explicit separation: a REST API that's easy to explain.
- ➖ Two deployments to manage.
- ➖ Free Node hosting typically sleeps → 30–60 s cold start. **Breaks NFR-03.**

### C. React SPA + Supabase (database + auth + auto-generated API, no custom server)

- ➕ Fastest to build; Google auth included.
- ➖ Almost no Node code: business rules end up in the client or in database policies → harder to test and to show.
- ➖ Free projects pause after about a week of inactivity, and no backups on the free plan.

## Recommendation

**Option A.** It's the only one that satisfies $0 **and** fast opening **and** a real, testable server layer — with the least to manage for a solo developer.

## Decision

**Option A** — Next.js on Vercel (Hobby) with Neon PostgreSQL (Free). Accepted by the PO on 2026-11-16.

## Consequences

- Hosting: Vercel Hobby (personal, non-commercial use). Database: Neon Free.
- The domain module stays framework-free, so moving away from Next.js or Vercel later remains possible.
