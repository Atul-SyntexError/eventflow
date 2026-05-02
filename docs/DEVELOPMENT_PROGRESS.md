# EventFlow Development Progress Tracker

Use this file as the live checklist during implementation. Do not mark an item complete unless the related validation has also been completed.

## Status Legend

- `Not Started`: no implementation work has begun
- `In Progress`: active implementation or validation is happening
- `Deferred`: implementation landed, but a required validation or follow-up is intentionally carried forward with an explicit reason
- `Blocked`: waiting on a dependency or decision
- `Done`: implemented and validated

## Current Overall Status

- Current phase: `Phase 14 - Integration Hardening, Regression, and Release Readiness`
- Frontend track status: `Deferred`
- Backend track status: `Done`
- Integration track status: `In Progress`

Current runtime note:

- The repository now builds and runs as a local servlet application through the Maven Wrapper, external config loading, MySQL bootstrap, and Tomcat validation flow.
- Phase 9 auth/session routes are now live and validated end to end for login, session inspection, role blocking, and logout.

## Phase 0 - Discovery, Contracts, and Delivery Controls

Status: `Done`

- [x] Finalize user journeys for Admin, Organizer, Volunteer, and Student
- [x] Prepare page inventory for all screens, dialogs, and panels
- [x] Prepare component inventory for reusable UI primitives
- [x] Define route map and navigation structure per role
- [x] Draft DTO contracts for AJAX flows
- [x] Draft page controller and JSON endpoint catalog
- [x] Draft ERD and schema refinements
- [x] Define validation rules and error message standards
- [x] Define enums and state transitions
- [x] Define Definition of Done for future slices
- [x] Finalize regression matrix and update process

Artifacts:

- `docs/phase-0/README.md`
- `docs/phase-0/USER_JOURNEYS.md`
- `docs/phase-0/FRONTEND_INFORMATION_ARCHITECTURE.md`
- `docs/phase-0/COMPONENT_INVENTORY.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/DATA_MODEL_AND_ERD.md`
- `docs/phase-0/VALIDATION_AND_STANDARDS.md`
- `docs/phase-0/ENUMS_AND_STATE_TRANSITIONS.md`
- `docs/phase-0/DELIVERY_GOVERNANCE.md`

## Phase 1 - Frontend Foundation and Design System

Status: `Done`

- [x] Define design tokens and CSS variable strategy
- [x] Build base CSS architecture
- [x] Build shared app shell
- [x] Build reusable UI component library
- [x] Build forms, tables, modal, toast, and state patterns
- [x] Define responsive layout behavior
- [x] Define accessibility baseline
- [x] Create component showcase page

Artifacts:

- `docs/phase-1/README.md`
- `src/main/webapp/assets/css/main.css`
- `src/main/webapp/assets/css/base/tokens.css`
- `src/main/webapp/assets/css/base/reset.css`
- `src/main/webapp/assets/css/base/layout.css`
- `src/main/webapp/assets/css/base/utilities.css`
- `src/main/webapp/assets/css/components/forms.css`
- `src/main/webapp/assets/css/components/data-display.css`
- `src/main/webapp/assets/css/components/feedback.css`
- `src/main/webapp/assets/css/components/module-surfaces.css`
- `src/main/webapp/assets/css/pages/showcase.css`
- `src/main/webapp/assets/js/components/shell.js`
- `src/main/webapp/assets/js/pages/design-system-showcase.js`
- `src/main/webapp/WEB-INF/views/partials/app-head.jspf`
- `src/main/webapp/WEB-INF/views/partials/app-sidebar.jspf`
- `src/main/webapp/WEB-INF/views/partials/app-topbar.jspf`
- `src/main/webapp/WEB-INF/views/shared/design-system-showcase.jsp`
- `src/main/webapp/design-system-showcase.jsp`

Notes:

- Shared frontend foundation is implemented.
- Browser-level visual QA is still pending once the app is run in a servlet container.

## Phase 2 - Frontend Authentication and Shared Application Flow

Status: `Done`

- [x] Build login page and auth state UI
- [x] Build unauthorized, expired-session, and not-found pages
- [x] Build role-aware navigation behavior in frontend mocks
- [x] Build notification center shell
- [x] Build session controls and user menu
- [x] Create shared loading, retry, and async error states

Artifacts:

- `docs/phase-2/README.md`
- `src/main/webapp/login.jsp`
- `src/main/webapp/dashboard.jsp`
- `src/main/webapp/error/403.jsp`
- `src/main/webapp/error/404.jsp`
- `src/main/webapp/error/session-expired.jsp`
- `src/main/webapp/WEB-INF/views/public/login.jsp`
- `src/main/webapp/WEB-INF/views/public/dashboard-preview.jsp`
- `src/main/webapp/WEB-INF/views/public/unauthorized.jsp`
- `src/main/webapp/WEB-INF/views/public/not-found.jsp`
- `src/main/webapp/WEB-INF/views/public/session-expired.jsp`
- `src/main/webapp/WEB-INF/views/partials/public-head.jspf`
- `src/main/webapp/WEB-INF/views/partials/shell-overlays.jspf`
- `src/main/webapp/assets/js/state/mock-session-data.js`
- `src/main/webapp/assets/js/components/mock-session-shell.js`
- `src/main/webapp/assets/js/pages/mock-auth.js`
- `src/main/webapp/assets/js/pages/dashboard-preview.js`
- `src/main/webapp/assets/css/components/shell-widgets.css`
- `src/main/webapp/assets/css/pages/auth-flow.css`

Notes:

- Phase 1 audit fixes were applied to the shared shell and demo dialog accessibility behavior.
- Phase 2 audit fixes removed hardcoded Phase 1 shell copy from reused partials and corrected popover trigger handling for nested click targets.
- Browser-level interaction QA is still pending once the app is run in a servlet container.

## Phase 3 - Admin Frontend Module

Status: `Done`

- [x] Build admin dashboard
- [x] Build event management screens
- [x] Build user management screens
- [x] Build attendance and resource planning forms
- [x] Build health score widget UI
- [x] Build risk prediction panel UI
- [x] Build admin report preview surfaces
- [x] Validate admin empty, error, and loading states

Artifacts:

- `docs/phase-3/README.md`
- `src/main/webapp/admin/dashboard.jsp`
- `src/main/webapp/admin/events.jsp`
- `src/main/webapp/admin/users.jsp`
- `src/main/webapp/WEB-INF/views/admin/dashboard.jsp`
- `src/main/webapp/WEB-INF/views/admin/events.jsp`
- `src/main/webapp/WEB-INF/views/admin/users.jsp`
- `src/main/webapp/WEB-INF/views/partials/preview-state-controls.jspf`
- `src/main/webapp/assets/css/pages/admin-dashboard.css`
- `src/main/webapp/assets/css/components/preview-states.css`
- `src/main/webapp/assets/js/components/mock-role-page.js`
- `src/main/webapp/assets/js/components/mock-preview-state.js`
- `src/main/webapp/assets/js/pages/admin-dashboard.js`
- `src/main/webapp/assets/js/pages/admin-events.js`
- `src/main/webapp/assets/js/pages/admin-users.js`

Notes:

- Admin dashboard preview now consumes shared mock session state and shell widgets from Phase 2.
- Admin route access is gated in the frontend preview so non-admin or missing sessions do not see admin content.
- Admin event management now includes filters, detail state, and shared create/edit form previews against `EventSummaryDto`, `EventDetailDto`, and `EventFormRequestDto`-style mock payloads.
- Admin user management now includes filters, detail state, and shared create/edit form previews against `UserSummaryDto`, `UserDetailDto`, and `UserFormRequestDto`-style mock payloads.
- Attendance and resource planning are now surfaced directly inside the admin event create/edit preview flow so planning coverage stays visible before backend wiring.
- Phase 3 audit removed repeated role-gate and shell-bootstrap logic by moving those responsibilities into shared `mock-role-page.js` and `mock-preview-state.js` helpers.
- Admin dashboard, events, and users now all expose reusable ready, loading, empty, and error preview paths through the shared preview-state partial and styles.

## Phase 4 - Organizer Frontend Module

Status: `Done`

- [x] Build organizer dashboard
- [x] Build task board and task table views
- [x] Build task CRUD and assignment flows
- [x] Build smart assignment suggestion UI
- [x] Build live progress and delay alert UI
- [x] Build timeline and schedule adjustment surfaces

Artifacts:

- `docs/phase-4/README.md`
- `src/main/webapp/organizer/dashboard.jsp`
- `src/main/webapp/organizer/tasks.jsp`
- `src/main/webapp/organizer/tasks/board.jsp`
- `src/main/webapp/organizer/events/operations.jsp`
- `src/main/webapp/WEB-INF/views/organizer/dashboard.jsp`
- `src/main/webapp/WEB-INF/views/organizer/tasks.jsp`
- `src/main/webapp/WEB-INF/views/organizer/task-board.jsp`
- `src/main/webapp/WEB-INF/views/organizer/operations.jsp`
- `src/main/webapp/assets/css/components/task-operations.css`
- `src/main/webapp/assets/js/components/mock-task-ui-utils.js`
- `src/main/webapp/assets/js/pages/organizer-dashboard.js`
- `src/main/webapp/assets/js/pages/organizer-tasks.js`
- `src/main/webapp/assets/js/pages/organizer-task-board.js`
- `src/main/webapp/assets/js/pages/organizer-operations.js`

Notes:

- Organizer pages reuse the shared mock session shell, role guard, and preview-state system introduced during the Phase 3 audit instead of duplicating role-specific boot logic.
- Organizer dashboard preview now surfaces delay alerts, assignment momentum, and volunteer suggestions against the approved organizer DTO contracts.
- Organizer task management now includes task table filtering, detail review, create or edit preview forms, dependency and skill chips, and smart assignment suggestion panels.
- Organizer task board now reuses the same task dataset and shared status helpers to render grouped board lanes without introducing a second board-specific data shape.
- Organizer event operations now cover the timeline, workload lanes, delay alert feed, and schedule adjustment recommendations for the approved live-operations route.
- Shared task badge, grouping, notification, and role-gate utilities were generalized into `mock-task-ui-utils.js` so future task-driven role modules do not duplicate organizer-specific helper logic.

## Phase 5 - Volunteer Frontend Module

Status: `Deferred`

- [x] Build volunteer dashboard
- [x] Build assigned task list and task detail views
- [x] Build task status update actions
- [x] Build notification inbox
- [x] Build performance metrics view
- [ ] Validate mobile-friendly volunteer flow

Artifacts:

- `docs/phase-5/README.md`

- `src/main/webapp/volunteer/dashboard.jsp`
- `src/main/webapp/volunteer/tasks.jsp`
- `src/main/webapp/volunteer/tasks/detail.jsp`
- `src/main/webapp/volunteer/performance.jsp`
- `src/main/webapp/volunteer/notifications.jsp`
- `src/main/webapp/WEB-INF/views/volunteer/dashboard.jsp`
- `src/main/webapp/WEB-INF/views/volunteer/tasks.jsp`
- `src/main/webapp/WEB-INF/views/volunteer/task-detail.jsp`
- `src/main/webapp/WEB-INF/views/volunteer/performance.jsp`
- `src/main/webapp/WEB-INF/views/volunteer/notifications.jsp`
- `src/main/webapp/assets/js/pages/volunteer-dashboard.js`
- `src/main/webapp/assets/js/pages/volunteer-tasks.js`
- `src/main/webapp/assets/js/pages/volunteer-task-detail.js`
- `src/main/webapp/assets/js/pages/volunteer-performance.js`
- `src/main/webapp/assets/js/pages/volunteer-notifications.js`

Notes:

- Volunteer pages reuse the shared role guard, preview-state controls, and generic task UI utilities instead of introducing another role-specific task helper layer.
- The volunteer dashboard now surfaces assigned tasks, due-soon and blocker pressure, performance summary, and recent notifications from the approved volunteer dashboard contract.
- The volunteer task list and dedicated task detail route now cover filters, overdue indicators, instructions, dependency visibility, and preview-only task status update actions based on `VolunteerTaskStatusUpdateRequestDto`.
- The volunteer performance view now isolates personal completion and timeliness history without leaking admin reporting surfaces into the volunteer role.
- The volunteer notification page now presents assignment changes, blocker updates, and event changes in a dedicated feed instead of leaving them trapped in the shell popover.
- Mobile-friendly structural patterns are in place, but browser-level mobile validation is deferred to the broader frontend QA phase because the repository is not yet runnable inside a servlet container and you explicitly asked to skip that step for now.

## Phase 6 - Student Frontend Module

Status: `Deferred`

- [x] Build student dashboard
- [x] Build event discovery and filters
- [x] Build event detail and registration flow
- [x] Build registered-events view
- [x] Build recommendation UI
- [x] Build check-in flow
- [x] Build emoji feedback flow
- [x] Build live updates and notifications UI

Artifacts:

- `docs/phase-6/README.md`
- `src/main/webapp/student/dashboard.jsp`
- `src/main/webapp/student/events.jsp`
- `src/main/webapp/student/events/detail.jsp`
- `src/main/webapp/student/registrations.jsp`
- `src/main/webapp/student/check-in.jsp`
- `src/main/webapp/student/feedback.jsp`
- `src/main/webapp/student/notifications.jsp`
- `src/main/webapp/WEB-INF/views/student/dashboard.jsp`
- `src/main/webapp/WEB-INF/views/student/events.jsp`
- `src/main/webapp/WEB-INF/views/student/event-detail.jsp`
- `src/main/webapp/WEB-INF/views/student/registrations.jsp`
- `src/main/webapp/WEB-INF/views/student/check-in.jsp`
- `src/main/webapp/WEB-INF/views/student/feedback.jsp`
- `src/main/webapp/WEB-INF/views/student/notifications.jsp`
- `src/main/webapp/assets/js/pages/student-dashboard.js`
- `src/main/webapp/assets/js/pages/student-events.js`
- `src/main/webapp/assets/js/pages/student-event-detail.js`
- `src/main/webapp/assets/js/pages/student-registrations.js`
- `src/main/webapp/assets/js/pages/student-check-in.js`
- `src/main/webapp/assets/js/pages/student-feedback.js`
- `src/main/webapp/assets/js/pages/student-notifications.js`

Notes:

- The student phase started with the contracted `/student/dashboard` route so the checklist now matches the Phase 0 route inventory instead of skipping the dashboard surface.
- Student dashboard preview now uses shared role-gate and preview-state helpers while surfacing recommendations, upcoming registrations, and live notices from a dedicated student dashboard mock DTO.
- Student event discovery now provides search, category, registration-state, and capacity filters over a dedicated student event catalog instead of leaving `/student/events` as a dashboard placeholder.
- Recommendation UI is now present in both the student dashboard and the event discovery surface, and the discovery cards now resolve into the real student event detail route.
- Student event detail now renders schedule, registration preview, recommendation context, and route-level live updates from shared student mock data aligned to the frozen DTO contracts.
- Registered-events, check-in, feedback, and notifications routes are now implemented and linked together with route-appropriate follow-up actions.
- Browser-level student smoke flow, responsive QA, and accessibility validation are deferred to Phase 7 because the repository is still not runnable in a servlet container.

## Phase 7 - Frontend Real-Time Behavior, Contract Freeze, and UI QA

Status: `Deferred`

- [x] Build shared AJAX utility layer
- [x] Build polling and partial refresh behavior
- [x] Prepare mock fixtures for all AJAX flows
- [x] Freeze DTOs and payload structures
- [ ] Complete responsive QA
- [ ] Complete accessibility QA
- [ ] Complete visual consistency QA
- [x] Record backend integration assumptions

Artifacts:

- `docs/phase-7/README.md`
- `src/main/webapp/assets/js/api/mock-api-fixtures.js`
- `src/main/webapp/assets/js/api/mock-api-client.js`
- `src/main/webapp/assets/js/api/mock-polling.js`
- `src/main/webapp/assets/js/api/mock-refresh-controller.js`
- `src/main/webapp/assets/js/components/mock-session-shell.js`
- `src/main/webapp/assets/js/pages/admin-dashboard.js`
- `src/main/webapp/assets/js/pages/organizer-dashboard.js`
- `src/main/webapp/assets/js/pages/volunteer-dashboard.js`
- `src/main/webapp/assets/js/pages/student-dashboard.js`
- `src/main/webapp/assets/js/pages/volunteer-notifications.js`
- `src/main/webapp/assets/js/pages/student-notifications.js`
- `src/main/webapp/WEB-INF/views/partials/app-head.jspf`
- `src/main/webapp/assets/css/components/data-display.css`
- `src/main/webapp/assets/css/components/forms.css`

Notes:

- Shared mock API fixtures now cover the frozen Phase 0 JSON endpoint catalog and derive their payloads from the centralized `EventFlowMockData` getters.
- Shared request, retry, polling, and partial-refresh helpers now exist under `src/main/webapp/assets/js/api/` and are loaded globally through the common head partial.
- The shell notification tray and representative dashboard and notification pages now refresh through the shared API layer instead of relying only on page-local mock arrays.
- Static QA fixed repeated inline table overflow styling and tightened small-screen table and tablet form behavior.
- Browser-level responsive, accessibility, and visual consistency validation remain deferred until the servlet runtime exists.

## Phase 8 - Backend Foundation and Database Setup

Status: `Done`

- [x] Initialize Maven project and dependency management
- [x] Configure environment and secure properties
- [x] Configure DB connection and pooling
- [x] Create schema, migrations, and seed data
- [x] Implement core domain enums and models
- [x] Complete remaining role-specific DTOs and mappers
- [x] Implement shared AJAX response structure
- [x] Implement exception handling and logging baseline

Artifacts:

- `docs/phase-8/README.md`
- `.mvn/wrapper/maven-wrapper.properties`
- `mvnw`
- `mvnw.cmd`
- `pom.xml`
- `src/main/java/com/eventflow/config/AppBootstrapListener.java`
- `src/main/java/com/eventflow/config/AppConfig.java`
- `src/main/java/com/eventflow/config/AppConfigLoader.java`
- `src/main/java/com/eventflow/config/ConfigurationException.java`
- `src/main/java/com/eventflow/dao/ConnectionManager.java`
- `src/main/java/com/eventflow/model/`
- `src/main/java/com/eventflow/dto/`
- `src/main/java/com/eventflow/mapper/`
- `src/main/java/com/eventflow/utils/ApplicationException.java`
- `src/main/java/com/eventflow/utils/ErrorCode.java`
- `src/main/java/com/eventflow/utils/ErrorResponseMapper.java`
- `src/main/java/com/eventflow/validation/ValidationException.java`
- `src/main/resources/db/migration/V1__create_base_schema.sql`
- `src/main/resources/db/seed/V1__seed_preview_data.sql`
- `src/main/resources/eventflow-defaults.properties`
- `src/main/resources/eventflow.properties.example`
- `src/main/resources/logback.xml`
- `src/main/webapp/WEB-INF/web.xml`
- `src/main/java/com/eventflow/`

Notes:

- The initial Maven WAR scaffold has been added with the agreed Java 17, Tomcat 10.x, JSTL, JDBC pooling, MySQL, logging, and JavaMail dependency baseline.
- The local macOS environment now has `openjdk@17`, `maven`, `tomcat@10`, and `mysql@8.4` installed through Homebrew, and the shell profile exports Java 17 by default.
- Maven Wrapper is now committed so project builds can run through `./mvnw` with Maven `3.9.15` pinned at the repository level.
- Executable build validation passed with `source ~/.zprofile && ./mvnw -q -DskipTests package`.
- Backend package directories now match the target architecture defined in the master plan.
- Secure configuration loading is now centralized under `com.eventflow.config` with classpath defaults, optional external-file overrides, and environment-variable overrides for sensitive values.
- Application configuration is loaded once at servlet startup and exposed through the servlet context for future config, DAO, and service wiring.
- Database connection management is now centralized in a shared HikariCP-backed `ConnectionManager` with lifecycle ownership at servlet startup and shutdown.
- Pool creation is guarded so incomplete DB credentials do not trigger pool startup during early development or preview deployments.
- Versioned schema and seed SQL now exist under `src/main/resources/db/` and align to the approved Phase 0 entity and enum contract.
- Local executable migration validation passed against MySQL `8.4.9` after removing the MySQL-incompatible `task_dependencies` self-check constraint.
- Local development services `mysql@8.4` and `tomcat@10` are now installed and start successfully through Homebrew.
- The local `eventflow` database and `eventflow_app@localhost` user were provisioned successfully, and the seed dataset loaded with representative data.
- The model layer now includes the approved Phase 0 enums plus schema-backed domain records for users, events, tasks, registrations, notifications, metrics, schedule adjustments, and audit data.
- The shared contract layer now includes the common `ApiResponse` envelope, shared field and pagination DTOs, notification/session DTOs, auth DTOs, and seed mapper utilities.
- The role-specific backend contract layer now covers admin, organizer, volunteer, student, reporting, and live-update DTO shapes, along with mapper baselines for each of those slices.
- The backend baseline now includes a reusable exception-to-response mapper, reserved error code enum, validation exception type, and Logback configuration.
- Executable wrapper builds passed after each major Phase 8 slice, including the final DTO and mapper coverage pass.
- Static validation passed for the new Phase 8 scaffold files.

## Phase 9 - Authentication, Session Management, and Role Control

Status: `Done`

- [x] Implement authentication flow
- [x] Implement login, logout, and session timeout
- [x] Implement auth and role filters
- [x] Implement session context helpers
- [x] Validate protected page and AJAX behavior

Notes:

- Added DB-backed auth lookup, PBKDF2 password hashing support, seeded password-hash migration, clean auth/session servlet routes, and shared auth JSON helpers.
- Added route-level authentication and role filters for the existing JSP and AJAX surface, including unauthorized logging and expired-session handling.
- Runtime validation passed locally after redeploying the refreshed WAR to Tomcat with the external config path present: login `200`, login redirect `302 -> /event-flow/dashboard`, authenticated `/api/session` `200`, role-block redirect `302 -> /event-flow/error/403`, logout redirect `302 -> /event-flow/login?loggedOut=1`, and post-logout `/api/session` `401` with `expired=false`.

## Phase 10 - Core CRUD Backend

Status: `Done`

- [x] Implement admin user module backend
- [x] Implement event module backend
- [x] Implement task module backend
- [x] Implement registration and check-in backend
- [x] Implement feedback backend
- [x] Implement admin user page and AJAX controllers
- [x] Implement admin user validation and transaction rules
- [x] Implement audit logging for admin user changes

Notes:

- Added Jackson-backed shared JSON serialization and request parsing so nested DTO payloads can safely flow through Phase 10 CRUD endpoints.
- Implemented the first complete Phase 10 slice for admin user management: DAO, service, validator, audit logging, `/admin/users`, and `/api/admin/users*`.
- Implemented the full admin event slice with `AdminEventDao`, `RiskPredictionDao`, `EventFormValidator`, `AdminEventService`, `/admin/events`, `/api/admin/events*`, live server bootstrap, and the forward-only `/admin/events.jsp` compatibility route.
- Implemented the full organizer task slice with `V3__add_task_required_skills.sql`, `TaskDao`, `TaskFormValidator`, `OrganizerTaskService`, `/organizer/tasks`, `/api/organizer/tasks*`, live assignment suggestions, assignment actions, live server bootstrap, and the forward-only `/organizer/tasks.jsp` compatibility route.
- Implemented the student feedback slice with live page bootstrap, checked-in eligibility validation, `POST /api/student/events/{eventId}/feedback`, and direct MySQL-backed runtime validation.
- Implemented the student registrations list and create slice with a real `/student/registrations` page controller, `GET /api/student/registrations`, `POST /api/student/events/{eventId}/registrations`, centralized registration validation, and live server bootstrap for the existing page UI.
- Implemented the student check-in slice with a real `/student/check-in` page controller, active-window eligibility loading, `POST /api/student/events/{eventId}/check-in`, event-code validation, and live server bootstrap for the existing page UI.
- Implemented the student event discovery slice with a real `/student/events` page controller, `GET /api/student/events`, live student event-card derivation from events plus current registrations, and server bootstrap for the existing discovery UI.
- The student event action seam under `/api/student/events/*` now serves student event-detail reads together with feedback, registration, and check-in actions on the same contracted controller boundary.
- Runtime validation passed locally after redeploying the refreshed WAR to the active Tomcat instance: `GET /event-flow/login` `200`, `POST /event-flow/login` `302 -> /event-flow/dashboard`, `GET /event-flow/admin/users` `200`, `GET /event-flow/api/admin/users` `200`, and a disposable create/update/delete round-trip on `/api/admin/users` returned `201`, `200`, and `200`.
- Runtime validation also passed locally for the admin event slice: `GET /event-flow/login.jsp` returned `200` after redeploy readiness, admin-authenticated `GET /event-flow/admin/events` returned `200` with the event bootstrap marker present, `GET /event-flow/api/admin/events` returned `200` with `success=true`, and a disposable event create/update/delete round-trip returned `201`, `200`, and `200`.
- Runtime validation also passed locally for the student registrations slice: `POST /event-flow/login` `302 -> /event-flow/dashboard`, `GET /event-flow/student/registrations` `200` with the bootstrap marker present, `GET /event-flow/api/student/registrations` `200` with the seeded `REGISTERED` row, and a disposable `POST /event-flow/api/student/events/{eventId}/registrations` returned `201` before cleanup removed the disposable registration and event rows.
- Runtime validation also passed locally for the student check-in slice: `POST /event-flow/login` `302 -> /event-flow/dashboard`, `GET /event-flow/student/check-in` `200` with the bootstrap marker and disposable in-window event present, `POST /event-flow/api/student/events/{eventId}/check-in` `200`, the disposable registration row flipped to `CHECKED_IN` with `checked_in_at` set, one disposable `event_metrics` row was written, and cleanup removed the disposable metrics, registration, and event rows afterward.
- Runtime validation also passed locally for the student event discovery slice: `POST /event-flow/login` `302 -> /event-flow/dashboard`, `GET /event-flow/student/events` `200` with the bootstrap marker present, `GET /event-flow/api/student/events` `200` with the seeded event card for `eventId=1`, and the response matched the seeded registration row as `REGISTERED`.
- Runtime validation also passed locally for the organizer task slice after applying `src/main/resources/db/migration/V3__add_task_required_skills.sql` to the local `eventflow` schema: `GET /event-flow/login.jsp` returned `200`, organizer-authenticated `GET /event-flow/organizer/tasks`, `GET /event-flow/organizer/tasks.jsp`, `GET /event-flow/organizer/tasks/new`, and `GET /event-flow/organizer/tasks/{taskId}/edit` each returned `200` with the task bootstrap marker present, `GET /event-flow/api/organizer/tasks` and `GET /event-flow/api/organizer/tasks/{taskId}/assignment-suggestions` returned `200` with `success=true`, and a disposable task create/detail/update/assign/delete round-trip returned `201`, `200`, `200`, `200`, and `200`.
- Local SQL migrations are still applied manually in this repository's development flow; the organizer task runtime smoke initially failed until `V3__add_task_required_skills.sql` was applied against the external-configured MySQL database.

## Phase 11 - Intelligence and Simulation Services

Status: `Done`

- [x] Implement event health score service
- [x] Implement volunteer efficiency scoring
- [x] Implement smart volunteer assignment service
- [x] Implement risk prediction service
- [x] Implement recommendation service
- [x] Implement mood and engagement aggregation
- [x] Implement schedule adjustment suggestion service
- [x] Persist metrics and explanation data

Notes:

- Added the first event-intelligence backend slice: live feedback aggregation plus event health snapshot refresh after successful student feedback submissions and successful student check-ins.
- The current health snapshot now uses attendance ratio, emoji-derived engagement, and a weighted volunteer efficiency score built from assignment coverage, task momentum, and blocked or overdue task penalties.
- Runtime validation passed locally for the initial intelligence hook: a disposable student feedback submission returned `201`, a disposable student check-in returned `200`, each path persisted one `event_metrics` snapshot row for the disposable event under test, and cleanup removed the derived and transactional rows afterward.
- Added the next read-side intelligence slice on `GET /api/student/events/{eventId}` so student event detail can reuse persisted health snapshots, lazily seed the first snapshot when missing, and return the contracted `EventDetailDto` with live resources plus a minimal timeline.
- Runtime validation also passed locally for the detail slice: `POST /event-flow/login` returned `302 -> /event-flow/dashboard`, `GET /event-flow/api/student/events/{eventId}` returned `200` for a disposable event with one disposable resource row, the response included a non-null `healthSnapshot`, and cleanup removed the disposable metrics, resources, and event rows afterward.
- Wired the user-facing `/student/events/detail.jsp?eventId={eventId}` route through a real page controller and server bootstrap so the student detail page now renders live event detail, current registration state, and the persisted health snapshot.
- Runtime validation also passed locally for the page slice: `GET /event-flow/login.jsp` returned `200` after redeploy readiness, student-authenticated `GET /event-flow/student/events/detail.jsp?eventId={eventId}` returned `200` with the detail bootstrap marker and a non-null `healthSnapshot`, the page read lazily wrote one disposable `event_metrics` row, and the live registration action returned `201` before cleanup removed the disposable registration, metrics, resources, and event rows afterward.
- Added the shared `GET /api/student/recommendations` backend slice and wired the student event-detail page to load recommendation cues from that live endpoint instead of placeholder copy.
- Runtime validation also passed locally for the recommendation slice: `GET /event-flow/login.jsp` returned `200` after redeploy readiness, student-authenticated `GET /event-flow/api/student/recommendations` returned `200` with the disposable event present and populated recommendation fields, `GET /event-flow/student/events/detail.jsp?eventId={eventId}` returned `200` with the expected bootstrap marker, the served `student-event-detail.js` asset contained the new recommendation fetch path, and cleanup removed the disposable metrics and event rows afterward.
- Build validation passed again after the volunteer efficiency scoring change landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the volunteer efficiency scoring slice after redeploying the fresh WAR to the active Tomcat instance: a disposable registration-open event with three disposable tasks and two active assignments returned `GET /event-flow/api/student/events/{eventId}` `200` with `success=true`, the response `healthSnapshot.volunteerEfficiencyScore` was `0.63`, the persisted `event_metrics` row stored `volunteer_efficiency_score=0.63`, `health_score=31.40`, and `risk_level=CRITICAL`, and cleanup removed the disposable `event_metrics`, `task_assignments`, `tasks`, and `events` rows afterward.
- Extracted the organizer task suggestion scorer into a dedicated `VolunteerAssignmentIntelligenceService` so smart volunteer assignment logic now lives in a reusable Phase 11 service seam instead of private organizer-task helpers.
- Runtime validation also passed locally for the smart volunteer assignment slice after redeploying the fresh WAR to the active Tomcat instance: organizer-authenticated `GET /event-flow/api/organizer/tasks/1/assignment-suggestions` returned `200` with `success=true` and explanation data, a disposable organizer task returned `201` on create, `GET /event-flow/api/organizer/tasks/{taskId}/assignment-suggestions` returned `200` with `success=true`, `POST /event-flow/api/organizer/tasks/{taskId}/assign` returned `200`, and cleanup deleted the disposable task with `DELETE 200`.
- Added a reusable `RiskPredictionService` plus `RiskPredictionDao.replaceForEvent(...)` so admin event detail and risk reads now regenerate and persist live low-attendance, volunteer-shortage, and schedule-conflict predictions from current event intelligence inputs.
- Runtime validation also passed locally for the risk prediction slice after redeploying the fresh WAR to the active Tomcat instance: admin-authenticated `GET /event-flow/api/admin/events/1/risks` returned `200` with a live `VOLUNTEER_SHORTAGE` prediction at `MEDIUM` risk and `63.50`, and the follow-up MySQL check confirmed the persisted `risk_predictions` row for `event_id=1` matched the API payload.
- Added the first organizer event-operations backend slice with `ScheduleAdjustmentService`, `EventScheduleAdjustmentDao`, and `GET /api/organizer/events/{eventId}/schedule-adjustments/suggestion` so live organizer schedule-shift recommendations are now computed from current volunteer coverage or task-delay pressure and persisted as `SUGGESTED` rows.
- Runtime validation also passed locally for the schedule adjustment slice after redeploying the fresh WAR to the active Tomcat instance: organizer-authenticated `GET /event-flow/api/organizer/events/1/schedule-adjustments/suggestion` returned `200` with `reasonCode=VOLUNTEER_COVERAGE`, `headline=Volunteer coverage is below the event plan`, `suggestedWindow=2026-06-15 09:30 UTC to 2026-06-15 15:30 UTC`, and `impactedTaskIds=[1, 2]`, and the follow-up MySQL check confirmed the latest `event_schedule_adjustments` `SUGGESTED` row for `event_id=1` matched the API reason code.
- Added `StudentRecommendationSnapshotDao` plus migration `V4__add_student_recommendation_snapshots.sql` so `GET /event-flow/api/student/recommendations` now persists recommendation scores, reason tags, and headlines for the current student instead of leaving those explanation outputs transient.
- Runtime validation also passed locally for the recommendation snapshot slice after manually applying `V4__add_student_recommendation_snapshots.sql` to the local schema and redeploying the fresh WAR to the active Tomcat instance: student-authenticated `GET /event-flow/api/student/recommendations` returned `200`, the fallback disposable registration-open event `21` was surfaced with `score=0.80`, `reasonTags=[campus showcase, networking, student-facing]`, and headline `This campus showcase event is open and currently has room for new registrations.`, the matching `student_recommendation_snapshots` row for `student_id=4` persisted the same event id and headline, and the disposable event plus snapshot rows were cleaned back to zero afterward.

## Phase 12 - Real-Time AJAX Endpoints and Notification Engine

Status: `Done`

- [x] Implement live AJAX endpoints
- [x] Implement in-app notification flow
- [x] Implement JavaMail service and templates
- [x] Implement notification triggers
- [x] Persist notification logs
- [x] Add retry or safe-fail behavior
- [x] Validate concurrent update behavior

Notes:

- Added the first shared Phase 12 AJAX slice with `NotificationDao`, `NotificationService`, and `GET /api/notifications` so the frozen `NotificationFeedDto` contract now reads live in-app notifications for the authenticated user instead of relying only on mock fixtures.
- Runtime validation passed locally for the notification feed slice after redeploying the fresh WAR to the active Tomcat instance: unauthenticated `GET /event-flow/api/notifications` returned `401` with the shared auth error shape, student-authenticated `GET /event-flow/api/notifications` returned `200`, and the seeded student feed returned `unreadCount=0`, `items.length=1`, and first item `type=GENERAL_ANNOUNCEMENT`, `title=Registration confirmed`, `read=true`.
- Added the adjacent notification read-state mutation path on `POST /api/notifications/{notificationId}/read` so authenticated users can acknowledge feed items that belong to them without exposing cross-user notification ids.
- Runtime validation also passed locally for the notification read slice after redeploying the fresh WAR to the active Tomcat instance: volunteer-authenticated `GET /event-flow/api/notifications` returned `200` with `unreadCount=1` and seeded notification `1` unread, `POST /event-flow/api/notifications/1/read` returned `200` with the shared success envelope, and the follow-up `GET /event-flow/api/notifications` returned `unreadCount=0` with the same first notification now `read=true`.
- Added the first real trigger write on organizer task assignment so `POST /api/organizer/tasks/{taskId}/assign` now persists a `TASK_ASSIGNED` notification row plus a matching `notification_logs` `IN_APP/SENT` entry within the same transaction as the assignment.
- Runtime validation also passed locally for the assignment trigger slice after redeploying the fresh WAR to the active Tomcat instance: disposable task `11` was assigned through the organizer API with `200`, the new `notifications` row persisted as `notificationId=3`, `type=TASK_ASSIGNED`, `title=New assignment: Phase 12 Trigger Validation`, the matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`, the volunteer feed surfaced that new unread notification first, and the disposable task plus related notification and audit rows were cleaned afterward.
- Added the adjacent organizer task update trigger so `PUT /api/organizer/tasks/{taskId}` now persists a `TASK_UPDATED` notification row plus a matching `notification_logs` `IN_APP/SENT` entry whenever the task already has an active volunteer assignment.
- Runtime validation also passed locally for the task update trigger slice after redeploying the fresh WAR to the active Tomcat instance: disposable task `15` was assigned and then updated through the organizer API with `200`, the new `notifications` row persisted as `notificationId=11`, `type=TASK_UPDATED`, `title=Task updated: Phase 12 Update Trigger Validation Updated`, the matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`, the volunteer feed surfaced that new unread notification first, and the disposable task plus related notification and audit rows were cleaned afterward.
- Added the adjacent admin event update trigger so `PUT /api/admin/events/{eventId}` now persists one `EVENT_UPDATED` notification row plus a matching `notification_logs` `IN_APP/SENT` entry for each distinct volunteer actively assigned to that event.
- Runtime validation also passed locally for the event update trigger slice after redeploying the fresh WAR to the active Tomcat instance: disposable event `23` with assigned task `17` was updated through the admin API with `200`, the new `notifications` row persisted as `notificationId=13`, `type=EVENT_UPDATED`, `title=Event updated: Phase 12 Event Update Validation Updated`, the matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`, the volunteer feed surfaced that new unread notification first, and the disposable event plus related task, notification, metric, risk, and audit rows were cleaned afterward.
- Added the adjacent student schedule-change trigger on the same admin event update path so confirmed registrants now receive `SCHEDULE_CHANGED` notifications when an admin changes the event timing or venue.
- Runtime validation also passed locally for the student schedule-change slice after redeploying the fresh WAR to the active Tomcat instance: disposable event `24` with a confirmed registration for student `4` was updated through the admin API with `200`, the new `notifications` row persisted as `notificationId=14`, `type=SCHEDULE_CHANGED`, `title=Schedule changed: Phase 12 Schedule Change Validation Updated`, the matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`, the student feed exposed the matching unread `SCHEDULE_CHANGED` item, and the disposable event plus related registration, notification, metric, risk, and audit rows were cleaned afterward.
- Added a shared `NotificationDeliveryService` backed by Jakarta Mail so the existing task and event notification triggers now render outbound email subjects and plain-text bodies alongside the in-app notifications they already persist.
- Added mail timeout configuration plus placeholder mail keys in `eventflow-defaults.properties` so later SMTP setup only needs the mail values and slow SMTP hosts do not block the originating transaction indefinitely.
- Runtime validation also passed locally for the email safe-fail slice under the current unconfigured SMTP state: a disposable organizer task assignment returned `200` and wrote an `EMAIL` notification log row with `deliveryStatus=SKIPPED` and error `Mail delivery is not configured.`, and a disposable student schedule-change update also returned `200` and wrote the same `EMAIL/SKIPPED` outcome without failing the source request.
- Concurrent notification mutation validation also passed locally: two simultaneous `POST /event-flow/api/notifications/15/read` requests both returned `200`, and the follow-up feed read showed the matching notification once with `read=true` and `unreadCount=0`.

## Phase 13 - Reports, Analytics, and Operational Insights

Status: `Done`

- [x] Implement event performance summary
- [x] Implement attendance reporting
- [x] Implement feedback and sentiment reporting
- [x] Implement volunteer performance reporting
- [x] Implement role-specific report views
- [x] Validate report consistency and query performance

Notes:

- Added the first Phase 13 backend reporting slice through `GET /api/admin/reports/{eventId}` so admins can now load a validated `ApiResponse<ReportSummaryDto>` backed by existing event, registration, feedback, volunteer, and health aggregates.
- Runtime validation passed locally for the first report slice after redeploying the fresh WAR to the active Tomcat instance: admin-authenticated `GET /event-flow/api/admin/reports/1` returned `200` with `eventId=1`, attendance summary `forecastFillRate=0.4%`, `projectedWalkIns=249`, `noShowBuffer=0%`, `volunteerCoverage=33.3%`, a `POSITIVE` feedback summary, an `AT_RISK` volunteer summary, and the seeded health snapshot `healthScore=84.60`, `trend=STABLE`.
- Added the missing contracted `/admin/reports` page route through `AdminReportsPageController`, a forwarding `admin/reports.jsp`, the live `WEB-INF/views/admin/reports.jsp` view, and `admin-reports.js` so the validated reporting API is now reachable from a dedicated admin screen instead of a dashboard preview anchor.
- Runtime validation also passed locally for the page slice after redeploying the fresh WAR: admin-authenticated `GET /event-flow/admin/reports` returned `200` and rendered the new route marker, report event selector, and page script hook, the follow-up `GET /event-flow/api/admin/reports/1` still returned `200` with `forecastFillRate=0.4%`, and the same page route redirected an organizer session with `302` instead of exposing the admin reporting screen.
- Added the missing volunteer reporting slice through `VolunteerPerformanceDao`, `VolunteerPerformanceService`, `VolunteerPerformanceApiController`, and `VolunteerPerformancePageController` so `GET /api/volunteer/performance` and `/volunteer/performance` now serve the contracted personal performance surface instead of mock-only preview data.
- Runtime validation also passed locally for the volunteer reporting slice and final Phase 13 checks after redeploying the fresh WAR: volunteer-authenticated `GET /event-flow/api/volunteer/performance` returned `200` with a non-empty `recentEvents` array, volunteer-authenticated `GET /event-flow/volunteer/performance` returned `200` with the live route marker and script hooks present, unauthenticated reads to both `/event-flow/volunteer/performance` and `/event-flow/admin/reports` redirected with `302`, and local response timings stayed low at `admin_report_time_total=0.015719` and `volunteer_report_time_total=0.014958`.

## Phase 14 - Integration Hardening, Regression, and Release Readiness

Status: `Complete`

- [x] Complete Admin end-to-end regression
- [x] Complete Organizer end-to-end regression
- [x] Complete Volunteer end-to-end regression
- [x] Complete Student end-to-end regression
- [x] Validate cross-role permissions and interactions
- [x] Validate AJAX recovery and failure states
- [x] Validate email triggers and notification history
- [x] Validate security and input/output handling
- [x] Validate concurrent update integrity
- [x] Finalize deployment notes and rollback steps
- [x] Finalize setup, architecture, and testing documentation

Notes:

- Phase 14 started with the admin regression slice after Phase 13 reporting was marked done and the required `docs/phase-14/README.md` file was created.
- Runtime validation passed locally for the admin regression slice against the active Tomcat deployment: admin-authenticated `GET /event-flow/admin/events`, `GET /event-flow/api/admin/events`, `GET /event-flow/admin/users`, and `GET /event-flow/api/admin/users` each returned `200`; a disposable admin event returned `201` on create, `200` on detail with `healthSnapshot` present, `200` on risks with one prediction, `200` on update, and `200` on delete; and a disposable volunteer user returned `201` on create, `200` on update, and `200` on delete.
- The organizer regression slice initially exposed two contract gaps during Phase 14 hardening: the missing `GET /api/organizer/events/{eventId}/timeline` route and the missing `GET /organizer/events/{eventId}/operations` page route. Both were fixed in the smallest local controller-service slices before the organizer regression was rerun.
- Runtime validation then passed locally for the organizer regression slice after redeploying the refreshed WAR: organizer-authenticated `GET /event-flow/organizer/tasks` and `GET /event-flow/organizer/events/1/operations` returned `200`, a disposable organizer task returned `201` on create, `200` on assignment suggestions, `200` on assign, `200` on update, and `200` on delete, `GET /event-flow/api/organizer/events/1/schedule-adjustments/suggestion` returned `200` with `reasonCode=VOLUNTEER_COVERAGE`, and `GET /event-flow/api/organizer/events/1/timeline` returned `200` with `timeline_items=2`.
- The volunteer regression slice initially exposed missing contracted task page and API coverage plus preview-only page scripts that did not match the frozen live task and notification DTOs. Those gaps were closed with `VolunteerTaskService`, `VolunteerTasksApiController`, `VolunteerTasksPageController`, `VolunteerNotificationsPageController`, and live volunteer task, detail, and notification page scripts wired to the existing Phase 0 contracts.
- Runtime validation then passed locally for the volunteer regression slice after redeploying the refreshed WAR: volunteer-authenticated `GET /event-flow/volunteer/tasks` returned `200` with the live route marker and page script hook, `GET /event-flow/api/volunteer/tasks` returned `200` with `task_count=1`, `GET /event-flow/volunteer/tasks/1` and `GET /event-flow/api/volunteer/tasks/1` returned `200`, reversible `PATCH /event-flow/api/volunteer/tasks/1/status` calls returned `200` for `ASSIGNED -> BLOCKED -> ASSIGNED`, `GET /event-flow/volunteer/notifications` and `GET /event-flow/api/notifications` returned `200`, `POST /event-flow/api/notifications/1/read` returned `200` and reduced `unreadCount` from `4` to `3`, and the existing volunteer performance route stayed green with `GET /event-flow/volunteer/performance` and `GET /event-flow/api/volunteer/performance` both returning `200` with `recentEvents=1`.
- The student regression slice initially exposed frozen-contract page gaps around `/student/dashboard`, `/student/events/{eventId}`, `/student/notifications`, and `/api/student/dashboard`. Those gaps were closed with `StudentDashboardService`, `StudentDashboardApiController`, `StudentDashboardPageController`, `StudentNotificationsPageController`, a contracted-path update for `StudentEventDetailPageController`, and live student dashboard and notifications page scripts wired to the shared notification and student APIs.
- Runtime validation then passed locally for the student regression slice after redeploying the refreshed WAR: student-authenticated `GET /event-flow/student/dashboard`, `GET /event-flow/api/student/dashboard`, `GET /event-flow/student/events/1`, and `GET /event-flow/student/notifications` each returned `200` with the expected route markers and page scripts; a disposable admin event returned `201` on create, appeared in `GET /event-flow/api/student/events`, returned `200` on student detail, `201` on `POST /event-flow/api/student/events/{eventId}/registrations`, `200` on admin update to `LIVE`, `200` on `POST /event-flow/api/student/events/{eventId}/check-in`, and `201` on `POST /event-flow/api/student/events/{eventId}/feedback`; the follow-up student notification feed returned `200` with `unreadCount=2` and one matching `SCHEDULE_CHANGED` notification for the disposable event; and MySQL cleanup removed the disposable event, notification, registration, feedback, audit, metric, and recommendation-snapshot rows afterward.
- Shared hardening validation then passed locally against the same Tomcat deployment: unauthenticated student page routes redirected to `/event-flow/login`, unauthenticated student APIs returned `401 AUTHENTICATION_REQUIRED`, wrong-role page routes redirected to `/event-flow/error/403`, wrong-role role-scoped APIs returned `403 ROLE_FORBIDDEN`, and an invalid `JSESSIONID` produced `/event-flow/error/session-expired` for page routes plus `401 SESSION_EXPIRED` for APIs.
- The volunteer AJAX recovery path stayed stable after the live-route rewrites and later security hardening: the volunteer task detail page surfaced the blocker-note validation error for an invalid `BLOCKED` submission, accepted the valid retry, and then successfully reverted back to `ASSIGNED`.
- Notification history and deferred email delivery were validated with a disposable schedule-change event: the student feed showed one matching `SCHEDULE_CHANGED` item, MySQL recorded one related notification row, `notification_logs` recorded `IN_APP:SENT=1` and `EMAIL:SKIPPED=1`, and cleanup removed the disposable event rows afterward.
- Shared security hardening uncovered stored-XSS exposure in the Phase 14 live student and volunteer page renderers where API strings were concatenated into `innerHTML`. Those pages were patched to escape dynamic values before rendering, and the same malicious event-name probe that had previously created live `<img>` nodes on the student pages rendered as literal text after redeploying the refreshed WAR.
- Concurrent registration integrity was validated with two simultaneous student registration requests against one disposable event; the requests returned `409` and `201` in parallel, MySQL recorded exactly one registration row for that event, and cleanup removed the disposable data afterward.
- Deployment-readiness documentation is now backed by the validated package and redeploy path used throughout Phase 14: `./mvnw -q -DskipTests package`, clear the exploded app and cached Tomcat work/temp directories under `/opt/homebrew/opt/tomcat@10/libexec`, copy `target/event-flow.war` into `webapps`, confirm readiness with `GET /event-flow/login.jsp -> 200`, and roll back by restoring the prior WAR and repeating the same cleanup before restart.

## Regression Matrix To Run During Development

- [x] Admin smoke flow: login, event CRUD, user CRUD, health score view, risk panel view
- [x] Organizer smoke flow: login, task CRUD, assignment, delay alert visibility, timeline update
- [x] Volunteer smoke flow: login, assigned task view, status update, notification read, metric view
- [x] Student smoke flow: login, browse event, register, check in, submit feedback, view update
- [x] Shared smoke flow: session expiry, unauthorized access, AJAX error handling, layout responsiveness

## Change Control Notes

- If a new requirement appears, add it to the phase plan first.
- If a contract changes after frontend freeze, update both the phase plan and this tracker before implementation continues.
- If a task is blocked, record the blocker next to the phase before switching scope.