# Phase 0 Artifact Index

This directory freezes the scope, contracts, navigation, and governance rules that must exist before frontend implementation begins.

## Locked Outcomes

- Frontend is implemented before backend feature code, but it must be backed by stable DTO and endpoint contracts from the start.
- Page-rendering routes and AJAX routes stay separate.
- Shared UI primitives are defined before role-specific screens.
- Schema refinements are captured now so backend work does not drift into ad hoc table design later.
- Regression scope is updated before new work changes contracts or phase order.

## Phase 0 Checklist Coverage

| Phase 0 item | Primary artifact |
| --- | --- |
| Finalize user journeys | `USER_JOURNEYS.md` |
| Prepare page inventory | `FRONTEND_INFORMATION_ARCHITECTURE.md` |
| Prepare component inventory | `COMPONENT_INVENTORY.md` |
| Define route map and navigation | `FRONTEND_INFORMATION_ARCHITECTURE.md` |
| Draft DTO contracts | `DTO_CONTRACTS.md` |
| Draft endpoint catalog | `API_ENDPOINT_CATALOG.md` |
| Draft ERD and schema refinements | `DATA_MODEL_AND_ERD.md` |
| Define validation rules and error standards | `VALIDATION_AND_STANDARDS.md` |
| Define enums and state transitions | `ENUMS_AND_STATE_TRANSITIONS.md` |
| Define Definition of Done | `DELIVERY_GOVERNANCE.md` |
| Finalize regression matrix and update process | `DELIVERY_GOVERNANCE.md` |

## Naming Conventions Locked In Phase 0

- Page routes use role prefixes such as `/admin/...`, `/organizer/...`, `/volunteer/...`, and `/student/...`.
- AJAX routes use `/api/...` and always return a shared response envelope.
- Request DTOs end with `RequestDto`.
- Read models end with `SummaryDto`, `DetailDto`, `DashboardDto`, `SnapshotDto`, or `ReportDto`.
- Enums are transmitted as uppercase strings.
- Timestamps use ISO 8601 UTC.

## Phase 0 Exit Criteria

- All referenced artifacts exist and are internally consistent.
- Progress tracker status is updated to reflect completion.
- Future implementation tasks can start Phase 1 without redefining contracts.