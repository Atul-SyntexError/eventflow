# Phase 12 Implementation Notes

## Scope Snapshot

Phase 12 connects live frontend polling, notification feeds, and delivery-side effects to the backend state changes completed in earlier phases. The first slice should start with a shared read-side endpoint that already has a frozen contract in Phase 0 before widening into trigger writes or email delivery.

## Contract Sources

- `docs/PHASED_DEVELOPMENT_PLAN.md`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/phase-0/DTO_CONTRACTS.md`
- `docs/phase-0/API_ENDPOINT_CATALOG.md`
- `docs/phase-0/VALIDATION_AND_STANDARDS.md`
- `docs/phase-0/DATA_MODEL_AND_ERD.md`

## Step Order For This Phase

1. Start with shared live AJAX reads that already have frozen DTO contracts
2. Reuse shared session and response helpers instead of adding role-specific notification plumbing first
3. Persist and expose in-app notification state before layering on email delivery behavior
4. Keep email or retry logic non-blocking relative to the originating transaction
5. Validate auth and the touched live route before widening to triggers or polling-heavy dashboard slices

## Current Slice

- Create the missing Phase 12 README so implementation notes exist before broader coding continues
- Add a shared `NotificationDao` and `NotificationService` for current-user in-app feed reads from `notifications`
- Expose authenticated `GET /api/notifications` returning the frozen `NotificationFeedDto` contract
- Add `POST /api/notifications/{notificationId}/read` so current users can acknowledge in-app notifications through the same shared service seam
- Add the first real notification trigger write on organizer task assignment and persist an `IN_APP` delivery log entry beside the notification row
- Add the adjacent organizer task update trigger so an already assigned volunteer receives a `TASK_UPDATED` notification and matching `IN_APP` delivery log entry
- Add the adjacent admin event update trigger so volunteers actively assigned to that event receive an `EVENT_UPDATED` notification and matching `IN_APP` delivery log entry
- Add the adjacent student schedule-change trigger so confirmed registrants receive `SCHEDULE_CHANGED` notifications when an admin changes the event timing or venue
- Add a shared `NotificationDeliveryService` so the same task and event triggers render outbound email content, write `EMAIL` delivery logs, and safely skip or fail email without breaking the source transaction
- Validate concurrent notification read-state behavior on the shared `POST /api/notifications/{notificationId}/read` route

## Validation Target

- `source ~/.zprofile && ./mvnw -q -DskipTests package`
- Shared notification feed smoke test that verifies authenticated `GET /api/notifications` returns `NotificationFeedDto` and rejects unauthenticated access
- Disposable organizer task mutation smoke tests that verify assignment and update workflows create notification rows, `notification_logs` rows, and matching volunteer feed items before cleanup
- Disposable admin event mutation smoke test that verifies updating an event with active volunteer assignments creates `EVENT_UPDATED` notification rows, `notification_logs` rows, and matching volunteer feed items before cleanup
- Disposable admin event mutation smoke test that verifies schedule-impacting event updates for registered students create `SCHEDULE_CHANGED` notification rows, `notification_logs` rows, and matching student feed items before cleanup
- Disposable task-assignment and schedule-change smoke tests that verify the corresponding `EMAIL` log rows are recorded as `SKIPPED` while SMTP remains unconfigured
- Concurrent read-state smoke test that verifies two simultaneous notification read mutations settle to one consistent read state

## Validation Log

- Build validation passed for the first Phase 12 notification feed slice with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the notification feed slice after redeploying the fresh WAR to the active Tomcat instance:
	- Unauthenticated `GET /event-flow/api/notifications` returned `401` with the shared JSON auth error shape.
	- Student-authenticated `GET /event-flow/api/notifications` returned `200`.
	- The seeded student feed returned `unreadCount=0`, `items.length=1`, and first item `type=GENERAL_ANNOUNCEMENT`, `title=Registration confirmed`, `read=true`.
- Build validation passed again after the notification read-state mutation slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the notification read slice after redeploying the fresh WAR to the active Tomcat instance:
	- Volunteer-authenticated `GET /event-flow/api/notifications` returned `200` with `unreadCount=1`, `items.length=1`, and first notification `notificationId=1`, `type=TASK_ASSIGNED`, `title=New assignment: Prepare registration desks`, `read=false`.
	- `POST /event-flow/api/notifications/1/read` returned `200` with the shared success envelope.
	- The follow-up `GET /event-flow/api/notifications` returned `200` with `unreadCount=0` and the same first notification now `read=true`.
- Build validation passed again after the organizer task assignment trigger slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the organizer task assignment trigger after redeploying the fresh WAR to the active Tomcat instance:
	- A disposable organizer task for `event_id=1` was inserted as task `11`, assigned through `POST /event-flow/api/organizer/tasks/11/assign`, and returned `200` with the shared success envelope.
	- The new `notifications` row persisted as `notificationId=3`, `type=TASK_ASSIGNED`, `title=New assignment: Phase 12 Trigger Validation`, `read=false`.
	- The matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`.
	- Volunteer-authenticated `GET /event-flow/api/notifications` returned `200` with the new notification as the first unread item.
	- The disposable task, notification rows, and audit rows were cleaned back out after validation.
- Build validation passed again after the organizer task update trigger slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the organizer task update trigger after redeploying the fresh WAR to the active Tomcat instance:
	- A disposable organizer task for `event_id=1` was inserted as task `15`, assigned to volunteer `3`, and then updated through `PUT /event-flow/api/organizer/tasks/15`, which returned `200` with the shared success envelope.
	- The new `notifications` row persisted as `notificationId=11`, `type=TASK_UPDATED`, `title=Task updated: Phase 12 Update Trigger Validation Updated`, `read=false`.
	- The matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`.
	- Volunteer-authenticated `GET /event-flow/api/notifications` returned `200` with the new `TASK_UPDATED` notification as the first unread item and the matching feed item present by `notificationId`.
	- The disposable task, notification rows, and audit rows were cleaned back out after validation.
- Build validation passed again after the admin event update trigger slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the admin event update trigger after redeploying the fresh WAR to the active Tomcat instance:
	- A disposable event `23` plus assigned task `17` for volunteer `3` were inserted, and `PUT /event-flow/api/admin/events/23` returned `200` with the shared success envelope.
	- The new `notifications` row persisted as `notificationId=13`, `type=EVENT_UPDATED`, `title=Event updated: Phase 12 Event Update Validation Updated`, `read=false`.
	- The matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`.
	- Volunteer-authenticated `GET /event-flow/api/notifications` returned `200` with the new `EVENT_UPDATED` notification as the first unread item and the matching feed item present by `notificationId`.
	- The disposable event, task, notification rows, metrics or risk rows, and audit rows were cleaned back out after validation.
- Build validation passed again after the student schedule-change trigger slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the student schedule-change trigger after redeploying the fresh WAR to the active Tomcat instance:
	- A disposable event `24` with a confirmed registration for student `4` was inserted, and `PUT /event-flow/api/admin/events/24` returned `200` with the shared success envelope after changing the event timing and venue.
	- The new `notifications` row persisted as `notificationId=14`, `type=SCHEDULE_CHANGED`, `title=Schedule changed: Phase 12 Schedule Change Validation Updated`, `read=false`.
	- The matching `notification_logs` row persisted as `channel=IN_APP`, `deliveryStatus=SENT`.
	- Student-authenticated `GET /event-flow/api/notifications` returned `200`, and the matching `SCHEDULE_CHANGED` feed item was present by `notificationId` with `read=false`.
	- The disposable event, registration, notification rows, metrics or risk rows, and audit rows were cleaned back out after validation.
- Build validation passed again after the shared email delivery and timeout configuration slice landed with `./mvnw -q -DskipTests package`.
- Runtime validation also passed locally for the email safe-fail slice after redeploying the fresh WAR to the active Tomcat instance with mail still unconfigured:
	- A disposable organizer task assignment returned `200` and wrote an `EMAIL` notification log row with `deliveryStatus=SKIPPED` and error message `Mail delivery is not configured.`.
	- A disposable student schedule-change update returned `200` and wrote a matching `EMAIL` notification log row with `deliveryStatus=SKIPPED` and the same safe-fail reason.
	- Both source workflows completed successfully and their disposable task or event rows were cleaned back out after validation.
- Concurrent read-state validation also passed locally for the shared notification mutation route:
	- Two simultaneous `POST /event-flow/api/notifications/15/read` requests both returned `200` for the same unread task-assignment notification.
	- The follow-up feed read showed the matching notification once with `read=true` and `unreadCount=0`, confirming the route stays consistent under a double-submit race.

## Notes

- The Phase 0 API catalog freezes `GET /api/notifications` and `POST /api/notifications/{notificationId}/read`; Phase 12 now has both shared feed mutations and the first real task-driven in-app notification writes behind those endpoints.
- `notification_logs` now persist both `IN_APP` delivery entries and `EMAIL` delivery outcomes for organizer task assignment, organizer task updates, admin event updates, and student schedule-change notifications.
- The admin event update path now fans out by audience: active volunteers receive `EVENT_UPDATED`, while confirmed student registrants receive `SCHEDULE_CHANGED` when timing or venue changes.
- SMTP remains intentionally unconfigured in the checked-in defaults. The repository now exposes the mail keys and timeout settings so later setup only needs the SMTP values in the external config file or matching environment variables.
- Phase 12 is complete; the next slice moves to Phase 13 reporting and analytics.