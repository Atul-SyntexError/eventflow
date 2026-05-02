# EventFlow Agent Operating Rules

This repository is being built phase by phase. Any future implementation work must follow this file together with `docs/PHASED_DEVELOPMENT_PLAN.md` and `docs/DEVELOPMENT_PROGRESS.md`.

## 1. Delivery Order

Follow this order unless the plan is explicitly updated first:

1. Discovery and contract definition
2. Frontend foundation and all role-based frontend modules
3. Frontend real-time behavior and contract freeze
4. Backend foundation and security
5. Backend CRUD modules
6. AI simulation, notifications, reporting, and integration hardening

Do not jump ahead to backend implementation for a feature whose frontend contract is not yet defined.

## 2. Source Of Truth Files

- `docs/PHASED_DEVELOPMENT_PLAN.md`: master implementation plan
- `docs/DEVELOPMENT_PROGRESS.md`: live checklist and current phase status
- `AGENTS.md`: execution guardrails and architecture rules
- `docs/phase-0/*.md`: binding discovery and contract artifacts for the current repository baseline
- `docs/phase-<n>/README.md`: phase-specific implementation notes, audits, decisions, and deferred validations once Phase 1 or later implementation begins

Before starting any new task:

1. Check the current phase in `docs/DEVELOPMENT_PROGRESS.md`
2. Confirm the requested work belongs to that phase
3. Read the phase-specific artifact directory that applies to the active phase; if it does not exist yet for an implementation phase, create `docs/phase-<n>/README.md` before significant coding continues
4. If the requested work does not belong to the active phase, update the plan and progress tracker before coding

## 2.1 Documentation Continuity Rules

- Phase 0 remains the binding contract baseline and must stay complete.
- Once implementation begins for Phase 1 or any later phase, that phase must have a `docs/phase-<n>/README.md` file that records the implementation scope, audit findings, reusable decisions, and any deferred validations.
- If a phase mostly produces code rather than new contract markdown, its phase README must still exist and point to the relevant code artifacts.
- A missing phase README for the active phase is a process defect. Fix the documentation gap before continuing broad implementation.

## 3. Architecture Guardrails

### 3.1 Backend Structure

- Keep a modular MVC structure with an explicit service layer.
- Controllers coordinate requests and responses only.
- Services own business rules, AI simulation logic, notification triggers, scoring, and reporting aggregation.
- DAOs own persistence only.
- Validation logic must be centralized, not duplicated across controllers.
- JSP files must never contain business logic, SQL, or role-decision logic beyond presentation checks.

### 3.2 Frontend Structure

- Use JSP views with reusable partials for shared UI.
- Keep shared CSS tokens, base styles, components, and page styles separated.
- Keep shared JavaScript utilities, AJAX helpers, and polling logic separated from page-specific scripts.
- Use a minimalist, shadcn-inspired visual system: neutral surfaces, strong spacing discipline, CSS variables, restrained accent color, subtle borders, soft shadows, and accessible states.
- Do not add inconsistent one-off components when a shared primitive should be extended.

### 3.3 Contract Rules

- Define DTOs before wiring AJAX endpoints.
- Frontend mock payloads must mirror final backend DTO shapes.
- If a payload changes, update the frontend contract artifacts and regression checks before implementation continues.
- Separate page-rendering routes from JSON/AJAX routes.
- When a phase-specific contract doc exists, it overrides informal assumptions from chat or in-progress code.
- Before starting a role phase, cross-check the phase checklist against `docs/phase-0/FRONTEND_INFORMATION_ARCHITECTURE.md` and `docs/phase-0/DTO_CONTRACTS.md` so no contracted route or surface is omitted from the working checklist.

## 4. Development Workflow Rules

For each task:

1. Pick one subtask from the current phase
2. Implement the smallest complete slice that finishes that subtask
3. Validate only the impacted surface first
4. Run regression checks for impacted roles and shared flows
5. Update `docs/DEVELOPMENT_PROGRESS.md` and the active `docs/phase-<n>/README.md`
6. Then move to the next subtask

Do not bundle unrelated features in the same change.

## 5. Regression Protection Rules

Every implementation must consider whether it impacts:

- Admin event and user management
- Organizer task orchestration and live alerts
- Volunteer task updates and notifications
- Student registration, check-in, and feedback
- Shared authentication, authorization, AJAX, and layout behavior

Minimum expectation after each meaningful change:

- Re-run the direct smoke test for the touched role
- Re-check auth and permission boundaries if routes or actions changed
- Re-check shared AJAX error handling if live updates changed
- Re-check notification side effects if task or event workflows changed
- If a required validation cannot run because the environment is not available, record that deferral explicitly in the phase README and progress tracker instead of silently skipping it

## 6. Quality Gates

Do not mark work complete unless all applicable items are satisfied:

- Functional behavior works for the intended role
- Unauthorized roles cannot access the same behavior
- Validation and error states are handled
- Empty, loading, and failure states exist where needed
- UI remains visually consistent with the shared design system
- The progress tracker is updated
- Any skipped or blocked validation is explicitly marked as deferred with reason and carry-forward phase

## 7. Scope Control

- If a new requirement is introduced, add it to the phase plan before implementing it.
- If current work exposes an architecture issue, fix the root structure before layering on more feature code.
- If a request conflicts with the current phase order, stop and revise the plan first instead of forcing an ad hoc implementation.

## 8. Initial Build Strategy

- Frontend work should start with shared shell, tokens, and reusable components.
- Role-based pages should be built against mocked JSON fixtures and stable UI contracts.
- Backend work should begin only after the relevant frontend contracts are stable enough to avoid rework.
- Real-time features, notification triggers, and AI scoring must be introduced through shared services, not page-specific hacks.

## 9. Definition Of Done For Future Tasks

A task is only done when:

- the feature is implemented in the correct layer,
- the impacted role flow is validated,
- regressions were checked for nearby functionality,
- documentation or progress status was updated if needed,
- and the change does not bypass the agreed phase order.