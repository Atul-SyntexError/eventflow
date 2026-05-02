# Validation And Standards

This document defines the server-side rules that frontend validation must mirror, but never replace.

## Cross-Cutting Standards

- Trim leading and trailing whitespace on user-entered text before validation.
- Reject strings that become empty after trimming when the field is required.
- Normalize email addresses to lowercase before uniqueness checks.
- Use server-side enum validation for every status, role, and mood field.
- Reject malformed timestamps and all client-supplied timezone assumptions.
- Escape user-generated content when rendering in JSP.
- Return field-level errors for invalid form submissions and global errors for authorization or system failures.

## Users And Authentication

| Rule | Standard |
| --- | --- |
| Email | required, valid format, unique |
| Password | required on create, minimum 8 chars, must include letter and number |
| Name fields | required, max 80 chars |
| Role | required, one of defined role enums |
| Volunteer availability | required for volunteer users |
| Skills | required for volunteers, optional for other roles |
| Active status changes | blocked when deactivation would leave active critical tasks without owner |

## Events

| Rule | Standard |
| --- | --- |
| Name | required, max 150 chars |
| Venue | required, max 150 chars |
| Category | required, max 80 chars |
| Date range | `start_at` must be before `end_at` |
| Registration window | open must be before close and both must be before event start |
| Expected attendance | integer greater than zero |
| Resources | quantity required cannot be negative |
| Status changes | must follow defined state transitions |

## Tasks And Assignments

| Rule | Standard |
| --- | --- |
| Task title | required, max 150 chars |
| Event reference | required and must exist |
| Deadline | required and must fall within the event timeline unless explicitly overridden by admin |
| Required skills | optional, but if provided must exist in skills catalog |
| Dependencies | no self-reference and no cyclic dependency chains |
| Assignment | volunteer must be active, available, and role = volunteer |
| Status update | volunteer can update only currently assigned active tasks |
| Completion | blocked if required dependency tasks are incomplete |

## Registrations, Check-In, And Feedback

| Rule | Standard |
| --- | --- |
| Registration | only students can register |
| Duplicate registration | one registration per student per event |
| Registration status | blocked if event is cancelled or closed |
| Check-in | allowed only for registered students within the allowed event window |
| Feedback | one submission per student per event |
| Mood | required and must match supported emoji enum |
| Comment | optional, max 500 chars |

## Notification And Reporting Standards

| Rule | Standard |
| --- | --- |
| Notification creation | must include recipient, type, title, and body |
| Notification link | optional, but if present must resolve to a valid authorized route |
| Email delivery | failures are logged but should not corrupt the originating transaction unless explicitly configured |
| Reports | aggregate only validated persisted data, not UI cache state |

## Error Response Standards

### AJAX Error Shape

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "This email is already in use."
    }
  ],
  "meta": {},
  "timestamp": "2026-04-26T00:00:00Z"
}
```

### Reserved Error Codes

- `FIELD_REQUIRED`
- `INVALID_FORMAT`
- `DATE_RANGE_INVALID`
- `ENUM_INVALID`
- `EMAIL_ALREADY_EXISTS`
- `ROLE_FORBIDDEN`
- `DUPLICATE_REGISTRATION`
- `CHECKIN_WINDOW_CLOSED`
- `TASK_DEPENDENCY_CYCLE`
- `TASK_ASSIGNMENT_INVALID`
- `SESSION_EXPIRED`
- `RESOURCE_CONFLICT`

## Validation Ownership Rules

- Client-side validation improves UX but never replaces server-side validation.
- Controllers should delegate validation logic to dedicated validators or services.
- Validation messages must stay consistent across page submit and AJAX submit paths.
- When a validation rule changes, update this file and the relevant DTO or endpoint contract before implementation continues.