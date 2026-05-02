# Delivery Governance

This file defines how implementation work advances after Phase 0.

## Definition Of Done For A Feature Slice

A feature slice is done only when all applicable conditions are met:

- The behavior is implemented in the correct layer.
- Authorization boundaries are enforced for the intended roles.
- Validation, loading, empty, success, and error states exist where relevant.
- Shared DTO and endpoint contracts remain aligned.
- Regressions for impacted roles were checked.
- Progress tracker status was updated.
- Documentation was updated if the implementation changed a contract or phase assumption.

## Definition Of Done For A Frontend Slice

- Screen follows the shared shell and component inventory.
- UI uses shared tokens and component primitives rather than one-off styling.
- AJAX behavior uses the shared response contract.
- Mock payload matches the DTO contract exactly.
- Responsive behavior works at mobile, tablet, and desktop breakpoints.

## Definition Of Done For A Backend Slice

- Controller is thin and delegates to services.
- DTOs are used for JSON responses.
- Validation is centralized.
- Audit logging and notification triggers are applied where required.
- Security checks cover auth, role access, and unsafe input handling.

## Regression Matrix

| Change area | Minimum regression checks |
| --- | --- |
| Auth or session flow | login, logout, session expiry page, expired AJAX response, role redirect |
| Shared layout or navigation | admin, organizer, volunteer, and student shell navigation smoke checks |
| Admin event management | admin event list, create or edit flow, health widget visibility, student registration availability |
| Admin user management | admin user list, create or edit flow, organizer assignment eligibility, volunteer login access |
| Organizer task flows | organizer task list, assignment flow, volunteer task visibility, delay alert visibility |
| Volunteer task update flow | volunteer task detail, status change, organizer board refresh, performance summary |
| Student registration or check-in | event discovery, registration, check-in, health score input, notifications |
| Feedback flow | student feedback submit, engagement aggregation, admin report view |
| Notifications or email triggers | in-app feed, read state update, email log creation, no blocking failure on delivery error |
| Metrics, score, or risk logic | admin dashboard widgets, organizer alerts, report summaries, stale-state fallback |

## Contract Change Process

1. Update the relevant Phase 0 artifact before implementation continues.
2. Update `docs/PHASED_DEVELOPMENT_PLAN.md` if the high-level plan changes.
3. Update `docs/DEVELOPMENT_PROGRESS.md` if the active phase or checklist is affected.
4. Re-check affected frontend mocks and backend DTO names.
5. Only then implement the contract change.

## Phase Advancement Gates

### Gate To Start Phase 1

- User journeys are complete.
- Page inventory and navigation are frozen.
- DTOs and endpoints are drafted.
- Schema refinements are recorded.
- Validation, enums, and regression rules are documented.

### Gate To Start Backend Phases

- Frontend route map is stable.
- DTO payloads used by the frontend are frozen or intentionally versioned.
- Mock data and UI assumptions are recorded for every AJAX flow.

## Update Process During Implementation

- Update the progress tracker at the end of each completed subtask.
- If blocked, record the blocker in the progress tracker before switching context.
- Do not change phase order informally inside implementation commits.
- Do not treat uncovered regression paths as acceptable debt unless explicitly recorded.