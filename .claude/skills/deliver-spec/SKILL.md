---
name: deliver-spec
description: Close a spec once the PO says its UAT passes — mark it Delivered everywhere in this repo, then start two follow-up sessions (README screenshots here, case study on the PO's website). Use when the PO says "UAT passes for spec NNN", "spec NNN is delivered", or types /deliver-spec NNN.
---

# Deliver a spec

The PO decides that a spec is delivered at its UAT checkpoint (⛳), not when the code PR merges. This skill turns that decision into three pull requests the PO reviews: the status docs (here, now), the README screenshots (here, separate session), and the case study (website, separate session).

Argument: the spec number, e.g. `004`. If it is missing, take the spec whose UAT task is the open ⛳ in `specs/*/tasks.md`, and say which one you picked.

## 1. Check it is really done

Stop and tell the PO if any of these fails; do not mark anything Delivered.

- The PO said, in chat, that every UAT line passes (or gave a written decision for the ones that don't). Ask if unsure.
- Every task in `specs/NNN-*/tasks.md` is ticked except the UAT task.
- Every PR of the spec is merged into `main` (`gh pr list --state open`).
- The UAT lines that the checklist assigns to Claude are done. Production checks go through `PROD_READONLY_DATABASE_URL` only (ADR-0014); write the result, never personal data, in the progress log.

## 2. Status docs PR (this session)

Branch `docs/NNN-delivered` from a fresh `origin/main`. Follow the format of the last delivered spec (look at its spec, tasks, backlog and README rows) rather than inventing a new one:

- `specs/NNN-*/spec.md`: status `Delivered — YYYY-MM-DD` (Toronto date), every UAT box ticked, a revision row "UAT complete; status Delivered".
- `specs/NNN-*/tasks.md`: UAT task ticked, status `Done — n / n — spec NNN Delivered`, spec/plan versions current, progress-log row for the UAT (what the PO confirmed, what Claude checked).
- `specs/backlog.md`: the feature's Status column → `Delivered — [NNN](NNN-…/spec.md)` (keep that exact shape: the PO's website parses this column), plus a revision row.
- `README.md`: the spec's row in the Status table → `✅ Delivered` with a one-line "What it delivers"; the "Next:" row points to the next backlog feature.

Commit (`docs(NNN): UAT passed — spec NNN Delivered`), push, open the PR. Docs only: no code in this PR.

## 3. Start the two follow-up sessions

Start both with `start_session`, `initiation: "user_asked"` (the PO asked by running this skill), `context: "fresh"`. Each brief must stand on its own: spec number and name, what was delivered (2–4 lines from the spec's user stories), the rules below, and "done = a PR the PO reviews".

### 3a. README screenshots — this repo, `use_worktree: true`

- Goal: the README shows the delivered feature. Add or refresh screenshots in `e2e/screenshots.spec.ts` for the feature's main screen (phone light/dark at least), and reference them in the README's screenshot block with descriptive `alt` text.
- `npm run screenshots` needs Docker running (`npm run e2e:db`) and runs on the Mac, never in CI (PO decision, spec 003).
- Fake data only, `@example.com`, generic titles. Never the PO's real tasks or sidequests.
- Existing file names in `docs/screenshots/` stay as they are: the PO's website links to them. New files follow the same `<page>-<device>-<scheme>.png` pattern.
- Run `npm run e2e` before opening the PR (the screenshot spec shares the harness).

### 3b. Case study — the PO's website, `cwd: ~/Projects/alexleqc.github.io`

- Goal: the SprintYourLife case study (`projets/sprintyourlife.html`) reflects the delivered spec. Texts live in `_source/content.py` (FR and EN, same keys); regenerate with `python3 _source/build.py .`, never edit the generated HTML by hand. Read `_source/README.md` first.
- Draft, don't decide: add what the spec delivered and one thing it taught about spec-driven work (a change request, a UAT finding, a reuse decision — take it from the spec's revision history and progress log). Keep the PO's voice; French is the source language.
- Feature statuses come from the backlog automatically (the live board reads `specs/backlog.md`); do not hard-code a status in the prose.
- Nothing private: no personal sidequest titles, no emails, no production numbers beyond what the public repo already shows.
- Open a PR on the website repo. The PO reviews and merges.

## 4. Wrap up

Tell the PO: the docs PR link, and the two sessions (linked). Update the project status memory. Then stop: merging is the PO's job.
