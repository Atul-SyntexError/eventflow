# Phase 9 Implementation Notes

## Scope Snapshot

Phase 9 secures the existing page and AJAX surface before any CRUD backend is exposed. The implementation focus is authentication, session lifecycle, role-based access control, and shared handling for unauthorized or expired-session responses.

## Contract Sources

- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/VALIDATION_AND_STANDARDS.md`
- `docs/phase-0/ENUMS_AND_STATE_TRANSITIONS.md`

## Step Order For This Phase

1. Implement user authentication flow with secure password handling
2. Implement login, logout, and session timeout behavior
3. Implement authentication filter for protected routes
4. Implement role-based authorization filter and redirect rules
5. Implement current-user session context helper
6. Implement unauthorized access logging and handling
7. Validate page and AJAX responses for expired sessions and forbidden actions

## Current Slice

- Replace mock-only login submission with a servlet-backed login flow
- Add secure password hashing and seeded-auth compatibility for the local database
- Add session storage and current-user helpers for page and API flows
- Add authentication and role filters for the current JSP route surface and `/api/session`

## Delivered Slice

- Added PBKDF2-based password hashing support and switched invalid sign-in handling to explicit auth error codes.
- Added DB-backed auth lookup through `AuthUserDao` and `AuthService` using the seeded local users table.
- Added clean servlet routes for `GET/POST /login`, `POST /logout`, `GET /dashboard`, `GET /api/session`, and the Phase 0 public error routes.
- Added reusable session and JSON response helpers plus route-level authentication and role-authorization filters for the existing JSP surface.
- Added a dashboard bridge view and shared frontend shell updates so authenticated server sessions can continue to drive the current preview-only role pages.
- Replaced placeholder seed password hashes and added `V2__seed_auth_password_hashes.sql` for existing local databases.

## Validation Target

- `source ~/.zprofile && ./mvnw -q -DskipTests package`

## Validation Log

- Executable build validation passed with `source ~/.zprofile && ./mvnw -q -DskipTests package` after the auth/session slice landed.
- Applied `src/main/resources/db/migration/V2__seed_auth_password_hashes.sql` to the local MySQL `eventflow` database using the active external config file.
- Local runtime validation passed against Tomcat after redeploying the refreshed WAR:
	- `GET /event-flow/login` returned `200` with the new backend login markers.
	- `POST /event-flow/login` returned `302` to `/event-flow/dashboard` for the seeded admin account.
	- `GET /event-flow/api/session` returned `200` with `authenticated=true` after login.
	- `GET /event-flow/student/dashboard.jsp` returned `302` to `/event-flow/error/403` when using the admin session.
	- `POST /event-flow/logout` returned `302` to `/event-flow/login?loggedOut=1`.
	- `GET /event-flow/api/session` returned `401` with `authenticated=false` and `expired=false` after logout.

## Notes

- Local Tomcat remains a validation aid only; the implementation must stay portable for the eventual Windows runtime target.
- Filters and controllers should secure the existing route surface without forcing a broad rewrite of the current JSP preview structure.
- The active local runtime config is still external to the repository; repository code must continue to run with `eventflow.config.file` or `EVENTFLOW_CONFIG_FILE` overrides rather than checked-in secrets.
- Local Tomcat restarts used for validation must carry the external config file path in the process environment or equivalent JVM property, otherwise DB-backed login will fail because the connection manager will not initialize.
- Phase 9 checklist items are satisfied. The next implementation phase should start from Phase 10 CRUD modules rather than extending auth scope further.