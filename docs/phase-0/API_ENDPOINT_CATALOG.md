# API And Endpoint Catalog

This file separates page-rendering routes from JSON endpoints and binds both to the Phase 0 contracts.

## Page Controllers

### Shared And Authentication Routes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/login` | public | render login page |
| `POST` | `/login` | public | authenticate and redirect |
| `POST` | `/logout` | authenticated | end current session |
| `GET` | `/dashboard` | authenticated | role-aware redirect |
| `GET` | `/error/403` | public | unauthorized page |
| `GET` | `/error/404` | public | not-found page |
| `GET` | `/error/session-expired` | public | expired-session page |

### Admin Pages

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | admin | render admin dashboard |
| `GET` | `/admin/events` | admin | render event listing |
| `GET` | `/admin/events/new` | admin | render event create page |
| `GET` | `/admin/events/{eventId}` | admin | render event detail page |
| `GET` | `/admin/events/{eventId}/edit` | admin | render event edit page |
| `GET` | `/admin/users` | admin | render user listing |
| `GET` | `/admin/users/new` | admin | render user create page |
| `GET` | `/admin/users/{userId}/edit` | admin | render user edit page |
| `GET` | `/admin/reports` | admin | render reports page |
| `GET` | `/admin/notifications` | admin | render notification center page |

### Organizer Pages

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/organizer/dashboard` | organizer | render organizer dashboard |
| `GET` | `/organizer/tasks` | organizer | render task listing |
| `GET` | `/organizer/tasks/board` | organizer | render task board |
| `GET` | `/organizer/tasks/new` | organizer | render task create page |
| `GET` | `/organizer/tasks/{taskId}` | organizer | render task detail page |
| `GET` | `/organizer/tasks/{taskId}/edit` | organizer | render task edit page |
| `GET` | `/organizer/events/{eventId}/operations` | organizer | render event operations page |
| `GET` | `/organizer/notifications` | organizer | render organizer notifications |

### Volunteer Pages

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/volunteer/dashboard` | volunteer | render volunteer dashboard |
| `GET` | `/volunteer/tasks` | volunteer | render assigned tasks list |
| `GET` | `/volunteer/tasks/{taskId}` | volunteer | render task detail page |
| `GET` | `/volunteer/performance` | volunteer | render performance page |
| `GET` | `/volunteer/notifications` | volunteer | render volunteer notifications |

### Student Pages

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/student/dashboard` | student | render student dashboard |
| `GET` | `/student/events` | student | render event discovery page |
| `GET` | `/student/events/{eventId}` | student | render event detail page |
| `GET` | `/student/registrations` | student | render registered events page |
| `GET` | `/student/check-in` | student | render check-in page |
| `GET` | `/student/feedback` | student | render feedback page |
| `GET` | `/student/notifications` | student | render student notifications |

## JSON And AJAX Endpoints

### Shared Endpoints

| Method | Path | Access | Request DTO | Response DTO |
| --- | --- | --- | --- | --- |
| `GET` | `/api/session` | authenticated | none | `SessionStatusDto` |
| `GET` | `/api/notifications` | authenticated | none | `NotificationFeedDto` |
| `POST` | `/api/notifications/{notificationId}/read` | authenticated | none | `ApiResponse<Void>` |
| `GET` | `/api/live/events/{eventId}/health` | admin, organizer | none | `EventHealthSnapshotDto` |
| `GET` | `/api/live/events/{eventId}/updates` | organizer, volunteer, student | none | `LiveUpdateFeedDto` |

### Admin Endpoints

| Method | Path | Access | Request DTO | Response DTO |
| --- | --- | --- | --- | --- |
| `GET` | `/api/admin/dashboard` | admin | none | `AdminDashboardDto` |
| `GET` | `/api/admin/events` | admin | query params | `ApiResponse<EventSummaryDto[]>` |
| `POST` | `/api/admin/events` | admin | `EventFormRequestDto` | `ApiResponse<EventDetailDto>` |
| `GET` | `/api/admin/events/{eventId}` | admin | none | `ApiResponse<EventDetailDto>` |
| `PUT` | `/api/admin/events/{eventId}` | admin | `EventFormRequestDto` | `ApiResponse<EventDetailDto>` |
| `DELETE` | `/api/admin/events/{eventId}` | admin | none | `ApiResponse<Void>` |
| `GET` | `/api/admin/events/{eventId}/risks` | admin | none | `ApiResponse<RiskPredictionDto[]>` |
| `GET` | `/api/admin/users` | admin | query params | `ApiResponse<UserSummaryDto[]>` |
| `POST` | `/api/admin/users` | admin | `UserFormRequestDto` | `ApiResponse<UserDetailDto>` |
| `GET` | `/api/admin/users/{userId}` | admin | none | `ApiResponse<UserDetailDto>` |
| `PUT` | `/api/admin/users/{userId}` | admin | `UserFormRequestDto` | `ApiResponse<UserDetailDto>` |
| `DELETE` | `/api/admin/users/{userId}` | admin | none | `ApiResponse<Void>` |
| `GET` | `/api/admin/reports/{eventId}` | admin | none | `ApiResponse<ReportSummaryDto>` |

### Organizer Endpoints

| Method | Path | Access | Request DTO | Response DTO |
| --- | --- | --- | --- | --- |
| `GET` | `/api/organizer/dashboard` | organizer | none | `OrganizerDashboardDto` |
| `GET` | `/api/organizer/tasks` | organizer | query params | `ApiResponse<TaskSummaryDto[]>` |
| `POST` | `/api/organizer/tasks` | organizer | `TaskFormRequestDto` | `ApiResponse<TaskDetailDto>` |
| `GET` | `/api/organizer/tasks/{taskId}` | organizer | none | `ApiResponse<TaskDetailDto>` |
| `PUT` | `/api/organizer/tasks/{taskId}` | organizer | `TaskFormRequestDto` | `ApiResponse<TaskDetailDto>` |
| `DELETE` | `/api/organizer/tasks/{taskId}` | organizer | none | `ApiResponse<Void>` |
| `GET` | `/api/organizer/tasks/{taskId}/assignment-suggestions` | organizer | none | `ApiResponse<TaskAssignmentSuggestionDto[]>` |
| `POST` | `/api/organizer/tasks/{taskId}/assign` | organizer | `TaskAssignmentRequestDto` | `ApiResponse<TaskDetailDto>` |
| `GET` | `/api/organizer/events/{eventId}/timeline` | organizer | none | `ApiResponse<TimelineItemDto[]>` |
| `GET` | `/api/organizer/events/{eventId}/schedule-adjustments/suggestion` | organizer | none | `ApiResponse<ScheduleAdjustmentSuggestionDto>` |
| `POST` | `/api/organizer/events/{eventId}/schedule-adjustments` | organizer | `ScheduleAdjustmentSuggestionDto` | `ApiResponse<TimelineItemDto[]>` |

### Volunteer Endpoints

| Method | Path | Access | Request DTO | Response DTO |
| --- | --- | --- | --- | --- |
| `GET` | `/api/volunteer/dashboard` | volunteer | none | `VolunteerDashboardDto` |
| `GET` | `/api/volunteer/tasks` | volunteer | query params | `ApiResponse<TaskSummaryDto[]>` |
| `GET` | `/api/volunteer/tasks/{taskId}` | volunteer | none | `ApiResponse<TaskDetailDto>` |
| `PATCH` | `/api/volunteer/tasks/{taskId}/status` | volunteer | `VolunteerTaskStatusUpdateRequestDto` | `ApiResponse<TaskDetailDto>` |
| `GET` | `/api/volunteer/performance` | volunteer | none | `ApiResponse<VolunteerPerformanceDto>` |

### Student Endpoints

| Method | Path | Access | Request DTO | Response DTO |
| --- | --- | --- | --- | --- |
| `GET` | `/api/student/dashboard` | student | none | `StudentDashboardDto` |
| `GET` | `/api/student/events` | student | query params | `ApiResponse<StudentEventCardDto[]>` |
| `GET` | `/api/student/events/{eventId}` | student | none | `ApiResponse<EventDetailDto>` |
| `POST` | `/api/student/events/{eventId}/registrations` | student | `RegistrationRequestDto` | `ApiResponse<RegistrationStatusDto>` |
| `GET` | `/api/student/registrations` | student | none | `ApiResponse<RegistrationStatusDto[]>` |
| `POST` | `/api/student/events/{eventId}/check-in` | student | `CheckInRequestDto` | `ApiResponse<RegistrationStatusDto>` |
| `POST` | `/api/student/events/{eventId}/feedback` | student | `FeedbackSubmissionRequestDto` | `ApiResponse<Void>` |
| `GET` | `/api/student/recommendations` | student | none | `ApiResponse<EventRecommendationDto[]>` |

## Endpoint Rules

- Every page controller must have a matching authorization rule.
- AJAX endpoints must never return raw entity objects.
- Shared live endpoints are consumed by polling utilities and must expose stable timestamps.
- Full-page routes and AJAX routes should not be merged for convenience.