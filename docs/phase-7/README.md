# Phase 7 Implementation Notes

## Scope Snapshot

Phase 7 finishes the frontend integration boundary by introducing shared AJAX and polling utilities, centralized mock fixtures for JSON-style flows, and a QA audit pass over the reusable UI system before backend implementation begins.

## Contract Sources

- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/FRONTEND_INFORMATION_ARCHITECTURE.md`

## Step Order For This Phase

1. Create shared AJAX utility layer
2. Create polling and partial-refresh helpers
3. Centralize mock AJAX fixtures by endpoint contract
4. Wire key dashboard and notification surfaces to the shared utilities
5. Audit responsive, accessibility, and visual consistency gaps
6. Freeze frontend integration assumptions for backend work

## Audit Focus

- Keep request, error, retry, and polling behavior in shared modules instead of duplicating it inside page controllers.
- Make fixtures derive from the existing shared mock data getters so DTO drift is caught in one place.
- Prefer thin page integrations on a few representative real-time surfaces over inventing role-specific transport layers.
- Record any validation that cannot be completed without a runnable servlet environment instead of silently skipping it.

## Implemented Surfaces

- shared mock fixture registry for the frozen JSON endpoint catalog
- shared mock API client with retry and normalized response metadata
- shared polling and partial-refresh controller helpers
- shell-level notification tray refresh through the shared notification endpoint
- dashboard polling on admin, organizer, volunteer, and student dashboard pages
- route-level notification polling on volunteer and student notification pages
- reusable table overflow wrapper and narrower small-screen table min-width handling
- tablet breakpoint improvement for shared form grids

## Key Artifacts

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

## Contract Freeze Decisions

- The Phase 0 API catalog remains the binding contract source for JSON routes.
- Dashboard endpoints intentionally remain top-level DTO responses such as `AdminDashboardDto` and `StudentDashboardDto`, while collection, detail, and mutation endpoints that were defined as `ApiResponse<T>` remain wrapped that way.
- Shared notification polling now targets `/api/notifications` for shell and route-level feeds instead of introducing role-specific notification transport helpers.
- Mock fixtures are derived from the shared `EventFlowMockData` getters so any DTO drift must be corrected in one place before backend implementation begins.
- No new organizer operations JSON endpoint was added in Phase 7; Phase 8 backend work should either compose that page from the existing frozen endpoints or explicitly update the contract docs first.

## Audit Notes

- The shared shell now owns notification refresh so unread counts and feed items do not rely on page-local mock arrays.
- Representative live surfaces now use the shared API and polling layer rather than direct one-off mock data access, which gives backend integration a stable transport seam without rewriting the rendering layer.
- The Phase 7 UI audit removed repeated inline overflow styling from JSP views and moved that behavior into a reusable table wrapper class.
- Shared table and form breakpoints were tightened to reduce tablet and small-screen squeeze before backend integration begins.

## Deferred Validation

- Browser-level responsive QA across all role dashboards and key workflows is deferred.
- Browser-level accessibility QA, keyboard traversal QA, and visual consistency QA are deferred.
- Reason: the repository is still not runnable in a servlet container, so the complete frontend cannot be exercised in-browser even though the static code audit and Problems validation passed.
- Carry-forward phase: Phase 14 integration hardening, regression, and release readiness, with supporting smoke checks in Phase 8 once the runtime exists.