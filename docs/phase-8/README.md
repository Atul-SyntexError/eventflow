# Phase 8 Implementation Notes

## Scope Snapshot

Phase 8 establishes the backend foundation behind the frozen frontend contract. The first implementation slice creates the Maven WAR build baseline, aligns the Java package structure with the approved architecture, and adds the initial web deployment descriptor without jumping ahead into authentication, CRUD, or service logic.

## Contract Sources

- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/DATA_MODEL_AND_ERD.md`
- `docs/phase-0/VALIDATION_AND_STANDARDS.md`

## Step Order For This Phase

1. Initialize Maven web project and dependency management
2. Configure environment properties and secure configuration loading
3. Configure database connection management and pooling
4. Create schema scripts, migrations, and seed data
5. Implement base domain models and enums
6. Implement DTOs and mappers matching approved frontend contracts
7. Implement common response wrapper for AJAX endpoints
8. Implement exception handling and centralized error mapping
9. Set up logging strategy for controller, service, DAO, and email flows

## Current Slice

- Complete the role-specific DTO inventory for admin, organizer, volunteer, student, reporting, and live-update payloads
- Add mapper coverage so future service and controller work can compose backend responses from typed domain objects
- Preserve the frozen Phase 0 payload surface without leaking frontend mock-only naming into backend models
- Keep the local Tomcat setup as validation-only infrastructure rather than a repository runtime dependency

## Artifacts

- `pom.xml`
- `.mvn/wrapper/maven-wrapper.properties`
- `mvnw`
- `mvnw.cmd`
- `src/main/resources/db/migration/V1__create_base_schema.sql`
- `src/main/resources/db/seed/V1__seed_preview_data.sql`
- `src/main/java/com/eventflow/model/`
- `src/main/java/com/eventflow/dto/`
- `src/main/java/com/eventflow/mapper/`
- `src/main/java/com/eventflow/utils/ErrorResponseMapper.java`
- `src/main/java/com/eventflow/validation/ValidationException.java`
- `src/main/resources/logback.xml`
- `src/main/webapp/WEB-INF/web.xml`
- `src/main/java/com/eventflow/`

## Validation Target

- `mvn -q -DskipTests package`

## Notes

- This slice does not implement controllers, services, DAO logic, or authentication.
- Secure property loading, database pooling configuration, and schema creation remain separate Phase 8 subtasks and should be added incrementally after the Maven baseline is verified.

## Configuration Loading Rules

- Safe defaults live in `src/main/resources/eventflow-defaults.properties`.
- Deployment-specific overrides can be loaded from an external properties file via the `eventflow.config.file` system property or the `EVENTFLOW_CONFIG_FILE` environment variable.
- Sensitive values can bypass files entirely through targeted environment variable overrides such as `EVENTFLOW_DB_PASSWORD` and `EVENTFLOW_MAIL_PASSWORD`.
- The loaded configuration is stored in the servlet context under `eventflow.appConfig` during application startup.

## Database Pooling Rules

- The shared connection pool is exposed through `eventflow.connectionManager` in the servlet context.
- Pool initialization only runs when the database URL, username, and password are all configured.
- Pooled JDBC connections default to manual transaction control and `TRANSACTION_READ_COMMITTED`.
- The pool is closed during servlet context shutdown so later DAO work does not need to manage application-wide lifecycle itself.

## Schema And Seed Rules

- Versioned schema SQL lives under `src/main/resources/db/migration/`.
- Preview and local development seed SQL lives under `src/main/resources/db/seed/`.
- Schema constraints follow the approved Phase 0 enum values, uniqueness rules, and foreign-key guidance instead of relying on the frontend mock state alone.
- Seed data is representative bootstrapping data for local development and contract verification, not production bootstrap data.

## Progress Log

- Added the initial `pom.xml` WAR build with Java 17, Jakarta Servlet, JSTL, HikariCP, MySQL, logging, and JavaMail dependencies.
- Added `src/main/webapp/WEB-INF/web.xml` with the initial application name, welcome file, and session timeout baseline.
- Created the backend package skeleton under `src/main/java/com/eventflow/` to match the approved repository structure.
- Static validation passed for the new README, `pom.xml`, and `web.xml`.
- Added typed application, database, and mail configuration objects plus a shared loader under `src/main/java/com/eventflow/config/`.
- Added `AppBootstrapListener` so configuration is loaded once during servlet startup instead of being scattered across controllers or services.
- Added safe defaults and an example deployment properties file under `src/main/resources/`.
- Static validation passed for the new configuration classes, properties files, and updated `web.xml`.
- Added `ConnectionManager` with a shared HikariCP-backed pool configuration and central connection access for future DAO work.
- Updated application bootstrap so the connection pool is created once when DB credentials exist and is closed during servlet shutdown.
- Static validation passed for the connection manager and updated bootstrap listener.
- Added `V1__create_base_schema.sql` with the approved core tables, support tables, enum-backed checks, foreign keys, and reporting indexes.
- Added `V1__seed_preview_data.sql` with representative admin, organizer, volunteer, student, event, task, notification, and audit data for local development.
- Static validation passed for the migration and seed SQL files.
- Removed the `task_dependencies` self-check from the schema after MySQL `8.4.9` rejected that constraint on foreign-key columns; this validation remains a service-layer responsibility.
- Installed the local Java web toolchain on macOS with Homebrew: `openjdk@17`, `maven`, `tomcat@10`, and `mysql@8.4`.
- Added Maven Wrapper files pinned to Maven `3.9.15` so future builds can use `./mvnw` instead of relying on a global Maven installation.
- Updated `pom.xml` to current stable plugin versions, refreshed Logback, and enforced a minimum Maven version alongside the Java 17 guard.
- Executable build validation passed with `source ~/.zprofile && ./mvnw -q -DskipTests package`.
- Started local `mysql@8.4` and `tomcat@10` services through Homebrew.
- Created the local `eventflow` database, provisioned `eventflow_app@localhost`, and verified the schema and seed scripts execute successfully against MySQL.
- Verified local row counts after seeding: `users=4`, `events=1`, `tasks=2`, `notifications=2`, `audit_logs=2`.
- Added the Phase 0 enum set as Java enums under `src/main/java/com/eventflow/model/`, including transition helpers for user, event, registration, task, and schedule-adjustment states.
- Added schema-backed domain records for the current persistence model so DAO work can target typed entities instead of raw maps or ad hoc structs.
- Added shared and auth DTO records including `ApiResponse`, `FieldErrorDto`, `PageMetaDto`, notification feed DTOs, and session/login DTOs.
- Added seed mappers for notification feeds and role-session payloads so future controller work starts from reusable mapping seams instead of inline transformation code.
- Added `ApplicationException`, `ValidationException`, `ErrorCode`, and `ErrorResponseMapper` as the initial centralized error-response baseline.
- Added `logback.xml` so backend logging uses the application logger stack instead of depending only on container defaults.
- Executable build validation passed again after the model, DTO, mapper, error, and logging additions with `source ~/.zprofile && ./mvnw -q -DskipTests package`.
- Added the remaining role-specific DTO records for admin, organizer, volunteer, student, reporting, event detail, task detail, and live-update payloads so the backend contract layer now covers the frozen Phase 0 DTO catalog.
- Added role-specific mapper coverage for admin, organizer, volunteer, student, and reporting transformations, giving later controllers and services reusable typed mapping seams.
- Executable build validation passed again after the full DTO and mapper coverage landed with `source ~/.zprofile && ./mvnw -q -DskipTests package`.