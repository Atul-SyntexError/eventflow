# Local Repo Memory

## Purpose

This file is the local, repository-visible mirror of the most useful project memory that would otherwise live only in agent memory. Keep it short, practical, and update it when a reusable repo fact is learned.

This file intentionally mirrors only EventFlow-specific memory. It does not include unrelated global memory from other repositories or tasks.

## Workflow Memory

- `AGENTS.md`, `docs/PHASED_DEVELOPMENT_PLAN.md`, and `docs/DEVELOPMENT_PROGRESS.md` are the main source-of-truth files for implementation order, architecture rules, and live status.
- `docs/phase-0/` is the binding contract baseline for user journeys, IA, DTOs, endpoints, schema, validation rules, enums, and regression expectations.
- Each implementation phase should keep a `docs/phase-<n>/README.md` that records scope, validations, reusable decisions, and deferred checks.

## Build And Runtime Memory

- The canonical package command is `./mvnw -q -DskipTests package`.
- The package output is `target/event-flow.war`.
- SQL migrations are manual in this repository. New files in `src/main/resources/db/migration/` must be applied to the local MySQL schema before runtime validation that depends on them.
- DB-backed routes require Tomcat to receive the external config path through `EVENTFLOW_CONFIG_FILE` or the `eventflow.config.file` JVM property.
- The validated local Tomcat deployment path was `/opt/homebrew/opt/tomcat@10/libexec/webapps/event-flow.war`.
- If a redeploy looks stale, clear the exploded app plus `work/Catalina/localhost/event-flow*` and `temp/*`, then wait for `GET /event-flow/login.jsp` to return `200` before smoke testing.

## Seed Data Memory

- Preview and local development seed SQL lives under `src/main/resources/db/seed/`.
- The main seed file is `src/main/resources/db/seed/V1__seed_preview_data.sql`.
- Local seed accounts validated in runtime checks are:
  - `admin@eventflow.local / Admin123!`
  - `organizer@eventflow.local / Organizer123!`
  - `volunteer@eventflow.local / Volunteer123!`
  - `student@eventflow.local / Student123!`
- Seed data is for local development and contract verification, not production bootstrap.

## Architecture And Convention Memory

- Controllers coordinate requests and responses only.
- Services own business rules, orchestration, AI/scoring logic, notifications, and reporting aggregation.
- DAOs own persistence only.
- Generic cross-role layout and filter styling belongs in `src/main/webapp/assets/css/components/module-surfaces.css`, not role-specific page CSS.
- Task-driven pages should reuse `src/main/webapp/assets/js/components/mock-task-ui-utils.js` for shared task badges, priority badges, lane grouping, and notification variants.

## Validation And Security Memory

- The `task_dependencies` no-self-reference rule should stay in service or validation logic rather than a MySQL `CHECK` constraint because MySQL 8.4 rejected the earlier schema-level version.
- Phase 14 found and fixed a stored-XSS path in live student and volunteer pages that rendered API strings through `innerHTML`. Any future page that writes API data through `innerHTML` must escape dynamic values first.
- Shared hardening already validated wrong-role blocking, session-expiry handling, notification history logging, and duplicate-registration integrity.

## Deployment Memory

- SMTP is intentionally not configured in checked-in defaults.
- Without SMTP credentials, notification logs are expected to show `EMAIL:SKIPPED` while in-app delivery still succeeds.
- The current repo has local Tomcat redeploy notes, but a real Windows-target deployment validation pass is still a future operational task.
