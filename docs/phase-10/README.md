# Phase 10 Implementation Notes

## Scope Snapshot

Phase 10 moves the frozen frontend contracts onto real database-backed CRUD flows. The implementation focus is modular backend slices for users, events, tasks, registrations, check-in, and feedback, with matching page and AJAX controllers, centralized validation, and audit logging.

## Contract Sources

- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/VALIDATION_AND_STANDARDS.md`
- `docs/phase-0/FRONTEND_INFORMATION_ARCHITECTURE.md`
- `docs/phase-0/ENUMS_AND_STATE_TRANSITIONS.md`

## Step Order For This Phase

1. Implement the first complete CRUD module behind an existing role page and AJAX contract
2. Add page and AJAX controllers only for the touched module
3. Centralize module validation and transaction rules in the service layer
4. Add audit logging for destructive or state-changing actions in the touched module
5. Validate the direct role flow before widening to the next module

## Current Slice

- Completed the admin user management slice because the `/admin/users` page, `UserSummaryDto`, `UserDetailDto`, `UserFormRequestDto`, and `/api/admin/users*` routes were already frozen in Phase 0
- Completed the admin event management slice because the `/admin/events` page, `EventSummaryDto`, `EventDetailDto`, `EventFormRequestDto`, and `/api/admin/events*` routes were already frozen in Phase 0
- Completed the organizer task management slice because the `/organizer/tasks` page, `TaskSummaryDto`, `TaskDetailDto`, `TaskFormRequestDto`, `TaskAssignmentRequestDto`, and `/api/organizer/tasks*` routes were already frozen in Phase 0
- Completed the student feedback slice because the `/student/feedback` page and `POST /api/student/events/{eventId}/feedback` contract were already frozen in Phase 0
- Completed the student registrations list and create slice because the `/student/registrations` page, `GET /api/student/registrations`, `POST /api/student/events/{eventId}/registrations`, and `RegistrationRequestDto` or `RegistrationStatusDto` contracts were already frozen in Phase 0
- Completed the student check-in slice because the `/student/check-in` page, `POST /api/student/events/{eventId}/check-in`, and `CheckInRequestDto` contract were already frozen in Phase 0
- Completed the student event discovery slice because the `/student/events` page, `GET /api/student/events`, and `StudentEventCardDto` contract were already frozen in Phase 0
- Replaced the mock-only admin user, admin event, organizer task, student feedback, student registrations, student check-in, and student event discovery data paths with real backend page and AJAX controllers plus server bootstrap data where needed
- Added user, event, task, feedback, registration, check-in, and event-discovery DAO or service support for the current live CRUD flows with centralized validation and transaction handling
- Fixed shared JSON response serialization so nested DTO payloads can be returned correctly for Phase 10 CRUD endpoints
- Routed the student registration create and student check-in contracts through the existing `/api/student/events/*` servlet seam so the full student event-action surface can share one controller boundary without conflicting mappings
- Phase 10 is now complete; the next widening step resumes under Phase 11 without reopening the completed CRUD surfaces unnecessarily

## Validation Target

- `./mvnw -q -DskipTests package`
- Local Tomcat smoke test for `/event-flow/admin/users`, `/event-flow/api/admin/users*`, `/event-flow/admin/events`, `/event-flow/api/admin/events*`, `/event-flow/organizer/tasks`, `/event-flow/api/organizer/tasks*`, `/event-flow/student/registrations`, `/event-flow/api/student/registrations`, `/event-flow/student/check-in`, `/event-flow/api/student/events/{eventId}/check-in`, `/event-flow/student/events`, and `/event-flow/api/student/events`

## Validation Log

- Build validation passed after the shared JSON change and again after the admin user controller and page integration landed: `source ~/.zprofile && ./mvnw -q -DskipTests package`
- The active Tomcat instance initially served an older exploded deployment; redeploying the fresh WAR and clearing the exploded app/work cache was required before the new admin-user routes became visible for smoke testing
- Runtime validation passed locally against Tomcat using the seeded admin account:
	- `GET /event-flow/login` returned `200`
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard`
	- `GET /event-flow/admin/users` returned `200` and included the new bootstrap/page markers
	- `GET /event-flow/api/admin/users` returned `200` with `success=true`
	- Disposable admin-user CRUD validation succeeded with `POST 201`, `PUT 200`, and `DELETE 200`
- Build validation passed again after the admin event backend and page slice landed: `./mvnw -q -DskipTests package`
- Runtime validation passed locally for the admin event slice after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded admin account
	- `GET /event-flow/admin/events` returned `200` and included the `admin-event-bootstrap` marker
	- `GET /event-flow/api/admin/events` returned `200` with `success=true`
	- Disposable admin-event CRUD validation succeeded with `POST 201`, `PUT 200`, and `DELETE 200`
- Runtime validation also passed locally for the student feedback slice:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account
	- `GET /event-flow/student/feedback` returned `200` and served the live bootstrap payload
	- A disposable checked-in registration was created only for smoke validation because the seeded student no longer had an eligible feedback event
	- `POST /event-flow/api/student/events/{eventId}/feedback` returned `201` with `success=true`
	- The feedback row was verified in MySQL and the disposable feedback, registration, and event rows were cleaned back to zero
- Build validation passed again after the student registrations backend and page slice landed: `source ~/.zprofile && ./mvnw -q -DskipTests package`
- Runtime validation passed locally for the student registrations read path after redeploying the fresh WAR to the active Tomcat instance:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account
	- `GET /event-flow/student/registrations` returned `200` and included the `student-registrations-bootstrap` marker
	- `GET /event-flow/api/student/registrations` returned `200` with `success=true` and the seeded `REGISTERED` row for the current student
	- A disposable `REGISTRATION_OPEN` event was created for smoke validation and `POST /event-flow/api/student/events/{eventId}/registrations` returned `201` with `success=true`
	- The disposable registration row was verified in MySQL as `REGISTERED` with `checked_in_at = NULL` and the disposable `registrations` and `events` rows were cleaned back to zero
- Build validation passed again after the student check-in backend and page slice landed: `source ~/.zprofile && ./mvnw -q -DskipTests package`
- Runtime validation passed locally for the student check-in slice after redeploying the fresh WAR to the active Tomcat instance:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account
	- `GET /event-flow/student/check-in` returned `200`, included the `student-checkin-bootstrap` marker, and surfaced the disposable in-window event used for the smoke test
	- `POST /event-flow/api/student/events/{eventId}/check-in` returned `200` with `success=true`
	- The disposable registration row was verified in MySQL as `CHECKED_IN` with a non-null `checked_in_at` timestamp
	- One disposable `event_metrics` snapshot row was written for the same event and the disposable `event_metrics`, `registrations`, and `events` rows were cleaned back to zero
- Build validation passed again after the student event discovery backend and page slice landed: `source ~/.zprofile && ./mvnw -q -DskipTests package`
- Runtime validation passed locally for the student event discovery slice after redeploying the fresh WAR to the active Tomcat instance:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account
	- `GET /event-flow/student/events` returned `200` and included the `student-events-bootstrap` marker
	- `GET /event-flow/api/student/events` returned `200` with `success=true`
	- The API response included the seeded `eventId=1` card with `registrationStatus="REGISTERED"`
	- The follow-up MySQL check confirmed the same seed registration row remained `1:REGISTERED`
- Build validation passed again after the organizer task backend and page slice landed: `./mvnw -q -DskipTests package`
- Runtime validation passed locally for the organizer task slice after applying `src/main/resources/db/migration/V3__add_task_required_skills.sql` to the local `eventflow` schema:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded organizer account
	- `GET /event-flow/organizer/tasks`, `GET /event-flow/organizer/tasks.jsp`, `GET /event-flow/organizer/tasks/new`, and `GET /event-flow/organizer/tasks/{taskId}/edit` each returned `200` with the `organizer-task-bootstrap` marker present
	- `GET /event-flow/api/organizer/tasks`, `GET /event-flow/api/organizer/tasks/{taskId}`, and `GET /event-flow/api/organizer/tasks/{taskId}/assignment-suggestions` returned `200` with `success=true`
	- Disposable organizer-task CRUD plus assignment validation succeeded with `POST 201`, `PUT 200`, `POST /assign 200`, and `DELETE 200`

## Notes

- Local Tomcat remains a validation aid only; backend code must remain portable to the eventual Windows runtime target.
- The first CRUD slice should change only the user-management surface and shared backend seams it genuinely depends on.
- If local Tomcat validation is used, the process must still receive the external config path so the DB-backed routes can initialize the connection manager.
- The legacy `/admin/users.jsp` wrapper now needs to remain a forward-only compatibility path so shell navigation still reaches the real page controller.
- The legacy `/admin/events.jsp` and `/organizer/tasks.jsp` wrappers now also need to remain forward-only compatibility paths so shell navigation still reaches the real page controllers.
- Local SQL migrations are still applied manually for this repository's MySQL validation flow; `src/main/resources/db/migration/V3__add_task_required_skills.sql` had to be applied to the external-configured `eventflow` schema before the organizer task page and bootstrap could load successfully.