# Enums And State Transitions

This document defines the enums and legal lifecycle transitions for EventFlow.

## Enums

| Enum | Values |
| --- | --- |
| `RoleType` | `ADMIN`, `ORGANIZER`, `VOLUNTEER`, `STUDENT` |
| `UserStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `AvailabilityStatus` | `AVAILABLE`, `LIMITED`, `UNAVAILABLE` |
| `EventStatus` | `DRAFT`, `PLANNED`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `LIVE`, `COMPLETED`, `CANCELLED` |
| `RegistrationStatus` | `REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `CANCELLED`, `NO_SHOW` |
| `TaskStatus` | `TODO`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED` |
| `TaskPriority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `FeedbackMood` | `POSITIVE`, `NEUTRAL`, `NEGATIVE` |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `NotificationType` | `TASK_ASSIGNED`, `TASK_UPDATED`, `EVENT_UPDATED`, `SCHEDULE_CHANGED`, `RISK_ALERT`, `CHECKIN_REMINDER`, `GENERAL_ANNOUNCEMENT` |
| `NotificationChannel` | `IN_APP`, `EMAIL` |
| `DeliveryStatus` | `PENDING`, `SENT`, `FAILED`, `RETRYING`, `SKIPPED` |
| `HealthTrend` | `UP`, `STABLE`, `DOWN` |
| `AdjustmentStatus` | `SUGGESTED`, `APPROVED`, `APPLIED`, `REJECTED` |

## User Status Transitions

| From | Allowed to |
| --- | --- |
| `ACTIVE` | `INACTIVE`, `SUSPENDED` |
| `INACTIVE` | `ACTIVE` |
| `SUSPENDED` | `ACTIVE`, `INACTIVE` |

## Event Status Transitions

| From | Allowed to |
| --- | --- |
| `DRAFT` | `PLANNED`, `CANCELLED` |
| `PLANNED` | `REGISTRATION_OPEN`, `CANCELLED` |
| `REGISTRATION_OPEN` | `REGISTRATION_CLOSED`, `LIVE`, `CANCELLED` |
| `REGISTRATION_CLOSED` | `LIVE`, `CANCELLED` |
| `LIVE` | `COMPLETED`, `CANCELLED` |
| `COMPLETED` | terminal |
| `CANCELLED` | terminal |

## Registration Status Transitions

| From | Allowed to |
| --- | --- |
| `REGISTERED` | `CHECKED_IN`, `CANCELLED`, `NO_SHOW` |
| `WAITLISTED` | `REGISTERED`, `CANCELLED` |
| `CHECKED_IN` | terminal |
| `CANCELLED` | terminal |
| `NO_SHOW` | terminal |

## Task Status Transitions

| From | Allowed to |
| --- | --- |
| `TODO` | `ASSIGNED`, `CANCELLED` |
| `ASSIGNED` | `IN_PROGRESS`, `BLOCKED`, `CANCELLED` |
| `IN_PROGRESS` | `BLOCKED`, `COMPLETED`, `CANCELLED` |
| `BLOCKED` | `ASSIGNED`, `IN_PROGRESS`, `CANCELLED` |
| `COMPLETED` | terminal |
| `CANCELLED` | terminal |

## Schedule Adjustment Status Transitions

| From | Allowed to |
| --- | --- |
| `SUGGESTED` | `APPROVED`, `REJECTED` |
| `APPROVED` | `APPLIED`, `REJECTED` |
| `APPLIED` | terminal |
| `REJECTED` | terminal |

## State Transition Rules

- Status transitions must be enforced on the backend even if the UI hides invalid actions.
- Terminal states cannot be edited back into active states except by explicit admin override, which must be audited if later introduced.
- Notifications do not change source entity state by themselves; they only reflect changes that already occurred.