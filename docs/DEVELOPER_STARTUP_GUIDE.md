# Developer Startup Guide

## Purpose

This guide is the practical starting point for any developer who needs to run, inspect, and continue work on EventFlow locally.

## Project Shape

- Java 17 WAR application
- Jakarta Servlet + JSP MVC
- MySQL-backed persistence
- Local Tomcat 10.x validation flow
- Maven Wrapper build baseline

Important directories:

- `src/main/java/com/eventflow/` for controllers, services, DAOs, config, filters, DTOs, models, mappers, and utilities
- `src/main/webapp/` for JSP pages, assets, and wrappers
- `src/main/resources/db/migration/` for schema changes
- `src/main/resources/db/seed/` for local preview seed data
- `docs/phase-0/` for frozen contracts
- `docs/phase-<n>/README.md` for implementation history and validation logs

## Read These First

Before writing code, read these files in this order:

1. `AGENTS.md`
2. `docs/PHASED_DEVELOPMENT_PLAN.md`
3. `docs/DEVELOPMENT_PROGRESS.md`
4. `docs/phase-0/README.md`
5. `docs/phase-0/DTO_CONTRACTS.md`
6. `docs/phase-0/API_ENDPOINT_CATALOG.md`
7. The README for the phase or area you are changing

## Local Prerequisites

Validated local stack:

- Java 17
- MySQL 8.x
- Tomcat 10.x
- `curl`
- `mysql` CLI

Notes:

- The repository already includes `./mvnw`, so a global Maven install is not required.
- The current validated local runtime path was Homebrew Tomcat on macOS, but repository code should remain portable to the eventual Windows target runtime.

## Configuration Model

Configuration is loaded in this order:

1. `src/main/resources/eventflow-defaults.properties`
2. External properties file from `-Deventflow.config.file=/absolute/path/to/file.properties`
3. External properties file from `EVENTFLOW_CONFIG_FILE`
4. Per-key system property or environment overrides such as `EVENTFLOW_DB_PASSWORD`

Useful files:

- `src/main/resources/eventflow-defaults.properties`
- `src/main/resources/eventflow.properties.example`

Example local external config path used during validation:

- `/Users/centillionaire/.config/eventflow/eventflow.properties`

Important rule:

- Tomcat must actually receive the external config path. If it does not, the app starts without a DB connection pool and DB-backed routes fail.

## Minimal External Config Example

Use `src/main/resources/eventflow.properties.example` as the template.

Expected keys:

```properties
eventflow.app.name=EventFlow
eventflow.app.environment=development
eventflow.app.base-url=http://localhost:8080/event-flow

eventflow.db.driver=com.mysql.cj.jdbc.Driver
eventflow.db.url=jdbc:mysql://localhost:3306/eventflow?useSSL=false&serverTimezone=UTC
eventflow.db.username=eventflow_app
eventflow.db.password=change-me

eventflow.mail.host=smtp.example.com
eventflow.mail.port=587
eventflow.mail.username=eventflow_mailer
eventflow.mail.password=change-me
eventflow.mail.from-address=no-reply@example.com
eventflow.mail.tls.enabled=true
```

Mail note:

- Leave SMTP unset if you only want local in-app notification behavior.
- With SMTP unset, email logs are expected to be recorded as skipped rather than sent.

## Database Bootstrap

The repo does not auto-run migrations.

Create the local database and app user first:

```sql
CREATE DATABASE eventflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eventflow_app'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON eventflow.* TO 'eventflow_app'@'localhost';
FLUSH PRIVILEGES;
```

Then apply SQL files manually in this order:

1. `src/main/resources/db/migration/V1__create_base_schema.sql`
2. `src/main/resources/db/migration/V2__seed_auth_password_hashes.sql`
3. `src/main/resources/db/migration/V3__add_task_required_skills.sql`
4. `src/main/resources/db/migration/V4__add_student_recommendation_snapshots.sql`
5. `src/main/resources/db/seed/V1__seed_preview_data.sql`

Fastest checked-in seed command:

```bash
./scripts/seed-local-db.sh
```

The script applies the same migration and preview-seed files in the validated order above.

Useful overrides when the local database is not on the default host, port, schema, or app user:

```bash
DB_HOST=127.0.0.1 DB_PORT=3307 DB_NAME=eventflow DB_USER=eventflow_app ./scripts/seed-local-db.sh
```

One-command local bootstrap for seed, package, and Tomcat redeploy:

```bash
./scripts/bootstrap-local.sh
```

Useful overrides:

```bash
EVENTFLOW_CONFIG_FILE="$HOME/.config/eventflow/eventflow.properties" TOMCAT_HOME=/opt/homebrew/opt/tomcat@10/libexec ./scripts/bootstrap-local.sh
SKIP_SEED=1 ./scripts/bootstrap-local.sh
SKIP_REDEPLOY=1 ./scripts/bootstrap-local.sh
```

If you want to run the SQL files one by one instead of using the helper script, use this command pattern:

```bash
mysql -u eventflow_app -p eventflow < src/main/resources/db/migration/V1__create_base_schema.sql
mysql -u eventflow_app -p eventflow < src/main/resources/db/migration/V2__seed_auth_password_hashes.sql
mysql -u eventflow_app -p eventflow < src/main/resources/db/migration/V3__add_task_required_skills.sql
mysql -u eventflow_app -p eventflow < src/main/resources/db/migration/V4__add_student_recommendation_snapshots.sql
mysql -u eventflow_app -p eventflow < src/main/resources/db/seed/V1__seed_preview_data.sql
```

Seed sanity checks that were validated earlier:

- `users=4`
- `events=1`
- `tasks=2`
- `notifications=2`
- `audit_logs=2`

## Seed Accounts

These local credentials have been validated in runtime smoke checks:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@eventflow.local` | `Admin123!` |
| Organizer | `organizer@eventflow.local` | `Organizer123!` |
| Volunteer | `volunteer@eventflow.local` | `Volunteer123!` |
| Student | `student@eventflow.local` | `Student123!` |

These are development-only seed accounts tied to the preview dataset.

## Build Command

Canonical package command:

```bash
./mvnw -q -DskipTests package
```

Expected output artifact:

- `target/event-flow.war`

## Local Tomcat Redeploy Flow

Validated Tomcat base path on the current local setup:

- `/opt/homebrew/opt/tomcat@10/libexec`

Important rule:

- Make sure Tomcat starts with the external config path available through `EVENTFLOW_CONFIG_FILE` or `-Deventflow.config.file=...`.

Canonical redeploy flow:

```bash
export EVENTFLOW_CONFIG_FILE="$HOME/.config/eventflow/eventflow.properties"

./mvnw -q -DskipTests package

TOMCAT_HOME=/opt/homebrew/opt/tomcat@10/libexec

rm -rf "$TOMCAT_HOME/webapps/event-flow"
rm -f "$TOMCAT_HOME/webapps/event-flow.war"
rm -rf "$TOMCAT_HOME/work/Catalina/localhost"/event-flow*
rm -rf "$TOMCAT_HOME/temp"/*

cp target/event-flow.war "$TOMCAT_HOME/webapps/event-flow.war"
```

Readiness check:

```bash
curl -I http://localhost:8080/event-flow/login.jsp
```

Expected readiness signal:

- `200 OK`

Do not run role smoke checks before `GET /event-flow/login.jsp` returns `200`.

## Daily Working Routine

1. Confirm the active work area in `docs/DEVELOPMENT_PROGRESS.md`.
2. Read the matching phase README and the relevant Phase 0 contract docs.
3. Apply any needed SQL migrations manually before runtime testing.
4. Implement the smallest complete slice.
5. Validate the directly touched route, endpoint, or behavior first.
6. Re-run nearby role or shared regression checks if the slice affects auth, live updates, notifications, or shared UI behavior.
7. Update the tracker and the active phase README.

## Current Validation Style

What currently exists:

- WAR packaging through Maven Wrapper
- Manual HTTP smoke tests
- Browser-based checks for key UI paths
- MySQL verification for persistence-side effects

What does not currently exist:

- A checked-in `src/test` automated test suite
- CI pipeline definitions in this repository
- A checked-in one-command full environment bootstrap script for DB creation, Tomcat startup, and smoke validation against a fresh machine

## Known Troubleshooting Cases

### DB-backed routes fail or login breaks

Likely causes:

- Tomcat did not receive the external config path
- DB credentials are wrong in the external config file
- Migrations were not fully applied

### New servlet routes are missing after packaging

Likely cause:

- Tomcat is serving a stale exploded deployment or stale cache

Fix:

- Clear `webapps/event-flow`, `webapps/event-flow.war`, `work/Catalina/localhost/event-flow*`, and `temp/*`, then redeploy the new WAR

### Schema-related DAO errors appear after pulling new code

Likely cause:

- New migration SQL exists in the repo but was not manually applied to the local MySQL database

### Email is not sent but the source request succeeds

Current expected behavior without SMTP:

- Notification logs record `EMAIL:SKIPPED`
- In-app notification delivery still works

## Important Development Rules

- Keep controllers thin.
- Keep business rules in services.
- Keep DAOs persistence-only.
- Keep JSP pages free of business logic.
- Treat Phase 0 DTOs, endpoints, and route contracts as frozen unless the plan and tracker are updated first.
- Reuse shared frontend helpers and styling primitives instead of introducing new role-specific duplicates when a shared abstraction already exists.
