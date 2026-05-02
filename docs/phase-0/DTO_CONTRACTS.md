# DTO Contracts

This document defines the contract shapes that frontend mocks and backend implementations must share.

## Contract Conventions

- Numeric identifiers use `Long` on the backend and JSON numbers in responses.
- Timestamps use ISO 8601 UTC strings.
- Enum values are uppercase strings.
- Optional values are nullable and must be documented by the DTO using them.
- Collections return empty arrays, not null.

## Shared Response Envelope

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {},
  "errors": [],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 1,
    "totalPages": 1,
    "pollIntervalMs": 15000
  },
  "timestamp": "2026-04-26T00:00:00Z"
}
```

## Shared DTOs

| DTO | Fields | Notes |
| --- | --- | --- |
| `ApiResponse<T>` | `success`, `message`, `data`, `errors[]`, `meta`, `timestamp` | base envelope for all AJAX responses |
| `FieldErrorDto` | `field`, `code`, `message` | field-level validation feedback |
| `PageMetaDto` | `page`, `pageSize`, `totalItems`, `totalPages`, `sortBy`, `sortDirection`, `pollIntervalMs` | pagination and polling metadata |
| `OptionDto` | `value`, `label`, `description` | select and filter options |
| `RoleSessionDto` | `userId`, `fullName`, `email`, `role`, `permissions[]`, `unreadNotificationCount`, `lastLoginAt` | returned on auth and session endpoints |
| `NotificationItemDto` | `notificationId`, `type`, `title`, `body`, `link`, `severity`, `createdAt`, `read` | shared notification feed item |
| `NotificationFeedDto` | `items[]`, `unreadCount` | shared live notification payload |
| `MetricTrendDto` | `value`, `delta`, `trend` | reusable KPI delta block |

## Authentication And Session DTOs

| DTO | Fields | Used by |
| --- | --- | --- |
| `LoginRequestDto` | `email`, `password` | login submit |
| `LoginResponseDto` | `session`, `redirectPath` | successful login response |
| `SessionStatusDto` | `authenticated`, `expired`, `session` | session check and keep-alive |

## Admin DTOs

| DTO | Fields | Used by |
| --- | --- | --- |
| `AdminDashboardDto` | `activeEvents`, `liveEvents`, `totalUsers`, `volunteerCoverage`, `healthOverview[]`, `riskAlerts[]`, `recentNotifications[]` | admin dashboard |
| `EventSummaryDto` | `eventId`, `code`, `name`, `category`, `status`, `venue`, `startAt`, `endAt`, `expectedAttendance`, `registeredCount`, `checkedInCount`, `healthScore`, `riskLevel` | event table and cards |
| `EventDetailDto` | `eventId`, `code`, `name`, `description`, `category`, `status`, `venue`, `startAt`, `endAt`, `registrationOpenAt`, `registrationCloseAt`, `expectedAttendance`, `resourcePlan[]`, `healthSnapshot`, `riskPredictions[]`, `timeline[]` | event detail |
| `ResourceRequirementDto` | `resourceName`, `quantityRequired`, `quantityAllocated`, `notes` | nested in event detail and event form |
| `EventFormRequestDto` | `name`, `description`, `category`, `venue`, `startAt`, `endAt`, `registrationOpenAt`, `registrationCloseAt`, `expectedAttendance`, `resourcePlan[]`, `status` | create and edit event |
| `UserSummaryDto` | `userId`, `fullName`, `email`, `role`, `active`, `availabilityStatus`, `performanceScore`, `skills[]` | user listing |
| `UserDetailDto` | `userId`, `fullName`, `email`, `role`, `active`, `availabilityStatus`, `performanceScore`, `skills[]`, `recentAssignments[]`, `registeredEvents[]` | user detail or edit preload |
| `UserFormRequestDto` | `firstName`, `lastName`, `email`, `password`, `role`, `active`, `availabilityStatus`, `skills[]` | create and edit user |
| `RiskPredictionDto` | `riskType`, `riskLevel`, `score`, `headline`, `description`, `recommendedAction` | admin risk panel |
| `EventHealthSnapshotDto` | `eventId`, `healthScore`, `attendanceRatio`, `engagementScore`, `volunteerEfficiencyScore`, `trend`, `snapshotAt` | live score widgets |

## Organizer DTOs

| DTO | Fields | Used by |
| --- | --- | --- |
| `OrganizerDashboardDto` | `openTasks`, `inProgressTasks`, `blockedTasks`, `availableVolunteers`, `delayAlerts[]`, `recentAssignments[]` | organizer dashboard |
| `TaskSummaryDto` | `taskId`, `eventId`, `eventName`, `title`, `priority`, `status`, `deadlineAt`, `assignedVolunteerName`, `delayFlag` | task table and board |
| `TaskDetailDto` | `taskId`, `eventId`, `title`, `description`, `priority`, `status`, `requiredSkills[]`, `dependencies[]`, `assignedVolunteer`, `deadlineAt`, `activityFeed[]` | task detail |
| `TaskFormRequestDto` | `eventId`, `title`, `description`, `priority`, `requiredSkills[]`, `dependencyTaskIds[]`, `requiredStartAt`, `deadlineAt`, `status` | create and edit task |
| `TaskAssignmentSuggestionDto` | `volunteerId`, `volunteerName`, `skillMatchScore`, `availabilityScore`, `performanceScore`, `totalScore`, `explanation[]` | smart assignment panel |
| `TaskAssignmentRequestDto` | `volunteerId`, `assignmentMode`, `assignmentReason` | assign volunteer |
| `DelayAlertDto` | `taskId`, `eventId`, `severity`, `message`, `suggestedAction` | organizer live alert feed |
| `TimelineItemDto` | `timelineItemId`, `label`, `startAt`, `endAt`, `status`, `relatedTaskIds[]` | event operations timeline |
| `ScheduleAdjustmentSuggestionDto` | `eventId`, `reasonCode`, `headline`, `description`, `currentWindow`, `suggestedWindow`, `impactedTaskIds[]` | schedule adjustment UI |

## Volunteer DTOs

| DTO | Fields | Used by |
| --- | --- | --- |
| `VolunteerDashboardDto` | `assignedTasks[]`, `dueSoonCount`, `overdueCount`, `performanceSummary`, `recentNotifications[]` | volunteer dashboard |
| `VolunteerTaskStatusUpdateRequestDto` | `status`, `blockerNote` | volunteer task updates |
| `VolunteerPerformanceDto` | `completionRate`, `onTimeRate`, `activeTaskCount`, `completedTaskCount`, `recentEvents[]` | volunteer performance view |

## Student DTOs

| DTO | Fields | Used by |
| --- | --- | --- |
| `StudentDashboardDto` | `recommendedEvents[]`, `upcomingRegistrations[]`, `liveUpdates[]` | student dashboard |
| `StudentEventCardDto` | `eventId`, `name`, `category`, `venue`, `startAt`, `endAt`, `registrationStatus`, `capacityState`, `highlightBadge` | event discovery cards |
| `EventRecommendationDto` | `eventId`, `name`, `score`, `reasonTags[]`, `headline` | recommendation panel |
| `RegistrationRequestDto` | `eventId` | event registration submit |
| `RegistrationStatusDto` | `eventId`, `studentId`, `status`, `registeredAt`, `checkedInAt` | registrations list and event detail |
| `CheckInRequestDto` | `eventId`, `confirmationCode` | event check-in |
| `FeedbackSubmissionRequestDto` | `eventId`, `mood`, `comment` | emoji feedback submit |

## Reporting And Live DTOs

| DTO | Fields | Used by |
| --- | --- | --- |
| `LiveUpdateFeedDto` | `eventId`, `updates[]`, `generatedAt` | student and organizer update panels |
| `ReportSummaryDto` | `eventId`, `attendanceSummary`, `feedbackSummary`, `volunteerSummary`, `healthSummary` | admin reports |
| `FeedbackAnalysisDto` | `eventId`, `positiveCount`, `neutralCount`, `negativeCount`, `averageMoodScore`, `topComments[]` | feedback reporting |
| `VolunteerPerformanceReportDto` | `eventId`, `topVolunteers[]`, `coverageRate`, `completionRate` | volunteer performance report |

## Contract Freeze Rules

- Frontend mock data files must use these DTO names and shapes.
- If a field is added or renamed, update this file before implementing the consuming screen or endpoint.
- View-only JSP model attributes may vary internally, but all AJAX payloads must honor these contracts.