# Phase 11 Implementation Notes

## Scope Snapshot

Phase 11 begins the intelligence layer that turns transactional EventFlow data into live health, sentiment, recommendation, and risk signals. The first slice should attach to real Phase 10 data instead of introducing standalone simulated logic.

## Contract Sources

- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/USER_JOURNEYS.md`
- `docs/phase-0/DATA_MODEL_AND_ERD.md`

## Step Order For This Phase

1. Start with an intelligence slice that depends directly on a live Phase 10 transactional flow
2. Prefer reusable service and DAO seams before wiring new UI or AJAX endpoints
3. Persist derived metric snapshots only when the triggering transactional path already exists
4. Keep explanation and recommendation outputs aligned to frozen DTO contracts
5. Validate the derived data path with the triggering live role flow before widening scope

## Current Slice

- Start with mood and engagement aggregation because student feedback is now live in Phase 10
- Add a reusable event-intelligence DAO for feedback aggregation and health input loading
- Compute `FeedbackAnalysisDto` from stored emoji feedback plus recent comments
- Refresh and persist an `event_metrics` snapshot after successful student feedback submissions and successful student check-ins
- Expand volunteer efficiency scoring beyond raw assignment coverage by folding in live task momentum plus blocked or overdue task penalties from the organizer task backend
- Reuse the persisted health snapshot seam for `GET /api/student/events/{eventId}` so student event detail can read the latest event health without inventing new recommendation or prediction logic yet
- Load the latest `event_metrics` row when it exists and lazily refresh one snapshot on first detail read when it does not
- Return the contracted `EventDetailDto` with live `resourcePlan`, `healthSnapshot`, an event-window timeline, and persisted `riskPredictions[]` once the admin-side risk slice lands
- Wire the user-facing student event-detail page through a real `/student/events/detail` page controller that bootstraps the selected event detail plus current registration state
- Add a reusable `StudentRecommendationService` plus `GET /api/student/recommendations` so recommendation cues can be computed from live discovery rows and persisted health snapshots
- Persist the resulting recommendation score and explanation outputs per student so the intelligence layer no longer discards recommendation rationale after each API read
- Extract the organizer task suggestion scorer into a reusable `VolunteerAssignmentIntelligenceService` so smart volunteer assignment logic can widen independently from the organizer CRUD service
- Add a reusable `RiskPredictionService` so admin event detail and `/api/admin/events/{eventId}/risks` can regenerate and persist live shortage and conflict signals from current event intelligence inputs
- Add a reusable `ScheduleAdjustmentService` plus organizer event-operations API wiring so `/api/organizer/events/{eventId}/schedule-adjustments/suggestion` can generate and persist live event-window shift suggestions from current volunteer coverage or task-delay pressure
- Surface the persisted health snapshot and live recommendation cues inside the student detail UI while keeping route-level live updates as an explicit later slice
- Replace the old preview-only detail registration button with the already-live student registration action so the page can create a real registration for open events

## Validation Target

- `source ~/.zprofile && ./mvnw -q -DskipTests package`
- Disposable student feedback or student check-in smoke test that verifies a live `event_metrics` snapshot is written and then cleaned up
- Disposable student event-detail smoke test that verifies `GET /api/student/events/{eventId}` returns `EventDetailDto.healthSnapshot` and writes one first-read `event_metrics` snapshot when none exists yet
- Disposable student event-detail smoke test that verifies a task-backed event persists the weighted `volunteerEfficiencyScore` from assignment coverage, task momentum, and blocked or overdue task penalties
- Organizer task suggestion smoke test that verifies `GET /api/organizer/tasks/{taskId}/assignment-suggestions` returns explanation data and that `POST /api/organizer/tasks/{taskId}/assign` still succeeds through the extracted assignment service seam
- Admin risk smoke test that verifies `GET /api/admin/events/{eventId}/risks` returns persisted live `RiskPredictionDto[]` data and that the backing `risk_predictions` rows match the API payload
- Organizer schedule-adjustment smoke test that verifies `GET /api/organizer/events/{eventId}/schedule-adjustments/suggestion` returns persisted `ScheduleAdjustmentSuggestionDto` data and that the latest `event_schedule_adjustments` `SUGGESTED` row matches the API reason code
- Disposable student event-detail page smoke test that verifies `GET /student/events/detail.jsp?eventId={eventId}` emits the bootstrap marker, includes a non-null health snapshot, lazily writes one `event_metrics` row, and can create a registration through the existing student registration endpoint
- Disposable student recommendation smoke test that verifies `GET /api/student/recommendations` returns `EventRecommendationDto[]` for a disposable open event and that the student detail page serves the updated recommendation-aware client asset
- Student recommendation snapshot smoke test that verifies `GET /api/student/recommendations` persists matching `student_recommendation_snapshots` rows for the returned event id, reason tags, and headline

## Validation Log

- Build validation passed after the first intelligence slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation passed locally through the live student feedback flow after redeploying the fresh WAR to the active Tomcat instance:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account.
	- `GET /event-flow/student/feedback` returned `200` and surfaced the disposable checked-in event used for the smoke test.
	- `POST /event-flow/api/student/events/{eventId}/feedback` returned `201` with `success=true`.
	- The follow-up MySQL check confirmed one `event_metrics` snapshot row for the disposable event with persisted `health_score`, `attendance_ratio`, `engagement_score`, `volunteer_efficiency_score`, and `risk_level` values.
	- Disposable `event_metrics`, `feedback`, `registrations`, and `events` rows were cleaned back to zero after the check.
- Runtime validation also passed locally through the live student check-in flow after redeploying the fresh WAR to the active Tomcat instance:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account.
	- `GET /event-flow/student/check-in` returned `200` and surfaced the disposable in-window event used for the smoke test.
	- `POST /event-flow/api/student/events/{eventId}/check-in` returned `200` with `success=true`.
	- The follow-up MySQL check confirmed the disposable registration row transitioned to `CHECKED_IN` and one `event_metrics` snapshot row was written for the same disposable event.
	- Disposable `event_metrics`, `registrations`, and `events` rows were cleaned back to zero after the check.
- Runtime validation also passed locally for the student event-detail health slice after redeploying the fresh WAR to the active Tomcat instance:
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded student account.
	- `GET /event-flow/api/student/events/{eventId}` returned `200` for a disposable registration-open event with one disposable `event_resources` row and no pre-existing `event_metrics` rows.
	- The JSON response included the disposable `resourcePlan`, a non-null `healthSnapshot`, an empty `riskPredictions` array, and the minimal derived timeline.
	- The follow-up MySQL check confirmed one `event_metrics` snapshot row was written on first detail read for the disposable event.
	- Disposable `event_metrics`, `event_resources`, and `events` rows were cleaned back to zero after the check.
- Runtime validation also passed locally for the user-facing student event-detail page after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` once the redeployed application had fully settled in Tomcat.
	- The student-authenticated `GET /event-flow/student/events/detail.jsp?eventId={eventId}` route returned `200` for a disposable registration-open event and included the `student-event-detail-bootstrap` marker.
	- The page bootstrap JSON matched the disposable event id, included a non-null `healthSnapshot`, and carried the nullable `registration` field expected by the live page script.
	- The follow-up MySQL check confirmed one `event_metrics` snapshot row was written on the page read for the same disposable event.
	- The live `POST /event-flow/api/student/events/{eventId}/registrations` action returned `201` with a persisted `REGISTERED` status for the disposable event.
	- Disposable `registrations`, `event_metrics`, `event_resources`, and `events` rows were cleaned back to zero after the check.
- Build validation passed again after the recommendation service and student detail recommendation wiring landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the recommendation slice after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness.
	- Student-authenticated `GET /event-flow/api/student/recommendations` returned `200` with `success=true` for a disposable registration-open event with one disposable `event_metrics` row.
	- The response contained the disposable `eventId` with populated `name`, `score`, `reasonTags[]`, and `headline` fields.
	- Student-authenticated `GET /event-flow/student/events/detail.jsp?eventId={eventId}` returned `200` with the detail bootstrap marker for the same disposable event, and the served `student-event-detail.js` asset included the new `/api/student/recommendations` fetch path.
	- Disposable `event_metrics` and `events` rows were cleaned back to zero after the recommendation checks.
- Build validation passed again after the volunteer efficiency scoring inputs were widened with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the volunteer efficiency slice after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness.
	- A disposable registration-open event with three disposable organizer tasks and two active task assignments was inserted directly into the local MySQL validation schema.
	- Student-authenticated `GET /event-flow/api/student/events/{eventId}` returned `200` with `success=true` for that disposable event.
	- The response `healthSnapshot.volunteerEfficiencyScore` was `0.63`, reflecting the new weighted score from coverage, momentum, and blocked-task penalty inputs.
	- The follow-up MySQL check confirmed one persisted `event_metrics` row for the same event with `volunteer_efficiency_score=0.63`, `health_score=31.40`, and `risk_level=CRITICAL`.
	- Disposable `event_metrics`, `task_assignments`, `tasks`, and `events` rows were cleaned back to zero after the check.
- Build validation passed again after the smart volunteer assignment extraction landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the smart volunteer assignment slice after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness.
	- Organizer-authenticated `GET /event-flow/api/organizer/tasks/1/assignment-suggestions` returned `200` with `success=true` and a non-empty `explanation[]` payload for the seeded task.
	- A disposable organizer task was created with `POST /event-flow/api/organizer/tasks` returning `201`.
	- `GET /event-flow/api/organizer/tasks/{taskId}/assignment-suggestions` returned `200` with `success=true` for the disposable task.
	- `POST /event-flow/api/organizer/tasks/{taskId}/assign` returned `200` with `success=true`, proving the extracted scoring seam still backed the assign flow.
	- The disposable organizer task was cleaned back to zero with `DELETE /event-flow/api/organizer/tasks/{taskId}` returning `200`.
- Build validation passed again after the risk prediction service landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the risk prediction slice after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login` returned `200` before authentication.
	- `POST /event-flow/login` returned `302 -> /event-flow/dashboard` for the seeded admin account.
	- Admin-authenticated `GET /event-flow/api/admin/events/1/risks` returned `200` with `success=true` and a persisted `VOLUNTEER_SHORTAGE` prediction carrying `MEDIUM` risk at `63.50`.
	- The follow-up MySQL check confirmed the `risk_predictions` row for `event_id=1` matched the API payload after the route regenerated and persisted the live prediction data.
- Build validation passed again after the schedule adjustment suggestion service landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the schedule adjustment slice after redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness.
	- `POST /event-flow/login` returned `200` for the seeded organizer session flow used by the cookie-backed validation script.
	- Organizer-authenticated `GET /event-flow/api/organizer/events/1/schedule-adjustments/suggestion` returned `200` with `reasonCode=VOLUNTEER_COVERAGE`, `headline=Volunteer coverage is below the event plan`, `suggestedWindow=2026-06-15 09:30 UTC to 2026-06-15 15:30 UTC`, and `impactedTaskIds=[1, 2]`.
	- The follow-up MySQL check confirmed the latest `event_schedule_adjustments` `SUGGESTED` row for `event_id=1` persisted `reason_code=VOLUNTEER_COVERAGE` with the same shifted event window.
- Build validation passed again after the recommendation snapshot persistence slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the recommendation snapshot slice after manually applying `src/main/resources/db/migration/V4__add_student_recommendation_snapshots.sql` to the local MySQL schema and redeploying the fresh WAR to the active Tomcat instance:
	- `GET /event-flow/login.jsp` returned `200` after redeploy readiness.
	- Student-authenticated `GET /event-flow/api/student/recommendations` returned `200`.
	- Because the seeded dataset returned no recommendations in the current local state, a disposable registration-open event `21` was inserted for the validation and then surfaced as the first recommendation with `score=0.80`, `reasonTags=[campus showcase, networking, student-facing]`, and headline `This campus showcase event is open and currently has room for new registrations.`.
	- The follow-up MySQL check confirmed the matching `student_recommendation_snapshots` row for `student_id=4` persisted the same event id, score, reason tags, and headline.
	- Disposable `student_recommendation_snapshots`, `event_metrics`, `registrations`, and `events` rows for the fallback event were cleaned back to zero after the check.

## Notes

- The first Phase 11 slice should be reusable by future admin dashboard, reports, and event detail work without forcing those routes live yet.
- This slice now covers health snapshots, recommendation snapshots, risk prediction, and schedule-adjustment suggestions, and it is complete for Phase 11.
- Student event detail now uses the real backend read contract in both the API and the dedicated page route, recommendation cues load from the shared live recommendation endpoint with persisted snapshot rows, volunteer efficiency reflects real organizer task state, smart volunteer assignment scoring now sits behind a reusable Phase 11 service seam, admin risk routes now persist live shortage and conflict predictions, and organizer event operations now persist live schedule-adjustment suggestions.