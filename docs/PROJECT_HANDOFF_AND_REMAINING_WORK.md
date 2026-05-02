# Project Handoff And Remaining Work

## Purpose

This document is for the next developer or team picking up EventFlow after the Phase 14 hardening pass. It summarizes the real current state of the repository, what is already validated, and what still remains outside the finished implementation phases.

## Current Project State

- The planned implementation phases through Phase 14 have been completed and validated in the local servlet runtime used during development.
- The application currently builds as a Java 17 WAR and runs as a Jakarta Servlet + JSP MVC application backed by MySQL.
- Local runtime validation has already covered admin, organizer, volunteer, and student role flows, plus shared hardening for permissions, session expiry, AJAX recovery, notification history, output escaping, and duplicate registration integrity.
- SMTP is intentionally left unconfigured in checked-in defaults, so email delivery currently safe-fails as `EMAIL:SKIPPED` while in-app notifications remain active.

## Source Of Truth

Use these files first before changing code:

- `AGENTS.md`
- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/phase-0/README.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-14/README.md`

Important reading rule:

- The master plan contains historical unchecked checklist items and should not be read in isolation as the current implementation truth.
- The live operational truth is the phase sections in `docs/DEVELOPMENT_PROGRESS.md` plus the detailed phase README for the area being touched.

## What Is Still Left

These are the meaningful remaining items after the completed phase sequence.

### 1. SMTP And Real Email Delivery

- Mail configuration plumbing is already implemented.
- The repo is ready for SMTP credentials through external config or environment overrides.
- What remains is environment setup and one real delivery validation pass.
- Expected current behavior without SMTP is notification log rows with `EMAIL:SKIPPED`.

### 2. Database Migration Automation

- SQL migrations are not auto-applied on startup.
- Developers must currently apply migration files manually to the local MySQL schema.
- A future improvement would be adding an explicit migration workflow or tool so new developers do not have to manage schema drift by hand.

### 3. Developer Bootstrap Automation

- The repository now has a checked-in database seeding helper at `./scripts/seed-local-db.sh` for the migration and preview-data load sequence.
- The repository also now has `./scripts/bootstrap-local.sh` for the common local sequence of seed, package, and WAR redeploy.
- There is still no checked-in one-command startup script for full environment bootstrap from a fresh machine, Tomcat process startup, and smoke validation.
- The repository does still have some runtime steps documented rather than fully scripted.
- A future improvement would be adding shell scripts or a Makefile for common developer tasks.

### 4. Automated Tests And CI

- There is currently no `src/test` tree in the repository.
- Validation so far has been build packaging, browser checks, HTTP smoke tests, and MySQL verification.
- The next maintainers should decide whether to add DAO/service tests, controller tests, and CI packaging/smoke automation.

### 5. Full Frontend QA Automation

- Core role flows are working, but the broader browser-level responsive, accessibility, and visual consistency sweeps were historically deferred until the app became runnable and then only partially covered through targeted runtime checks.
- A formal cross-browser QA pass and repeatable frontend automation would still add value.

### 6. Windows Runtime Validation

- The codebase has been validated through a macOS Homebrew Tomcat setup.
- Earlier project notes explicitly say the app must stay portable to the eventual Windows runtime target.
- A real Windows deployment and rollback validation pass still remains.

### 7. Operational Hardening Beyond Local Validation

- The repo now has deployment and rollback notes for the local Tomcat path.
- What still remains for a larger handoff is whichever environment-specific packaging, service management, secret handling, and monitoring approach the next team wants to adopt.

## Recommended Next Work Order

If a new developer is taking over, this is the cleanest order to continue:

1. Read the source-of-truth docs listed above.
2. Follow `docs/DEVELOPER_STARTUP_GUIDE.md` to get the local environment running.
3. Confirm the seeded runtime with the packaged WAR and the login smoke check.
4. Decide whether the next priority is SMTP enablement, migration automation, test automation, or Windows deployment validation.
5. Update `docs/DEVELOPMENT_PROGRESS.md` and the relevant phase README immediately when new work starts.

## Known Constraints For New Developers

- Phase 0 contracts are the baseline and should not be changed casually.
- Controllers should stay thin, services should own business rules, and DAOs should own persistence only.
- JSP pages should remain presentation-only.
- If a schema change is added under `src/main/resources/db/migration/`, the local MySQL schema must be updated manually before runtime testing that depends on it.
- If Tomcat does not receive the external config path, DB-backed routes will fail because the connection pool will not initialize.
- If Tomcat serves stale routes after a redeploy, clear the exploded app plus `work` and `temp` cache directories and wait until `GET /event-flow/login.jsp` returns `200`.

## Supporting Docs Added For Handoff

- `docs/DEVELOPER_STARTUP_GUIDE.md`
- `docs/LOCAL_REPO_MEMORY.md`
