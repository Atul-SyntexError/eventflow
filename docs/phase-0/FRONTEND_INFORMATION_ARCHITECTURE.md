# Frontend Information Architecture

This document locks the page inventory, route map, and navigation structure that Phase 1 through Phase 7 must follow.

## Route Conventions

- Page routes use `GET` and render JSP views.
- Form submissions that require a full-page redirect use controller POST handlers, then redirect.
- AJAX endpoints use `/api/...` and return JSON only.
- Role-specific pages stay under the role prefix even when they reuse shared partials.
- Shared shell widgets such as notifications or live score cards are rendered inside role pages, not as separate top-level routes unless a dedicated page is needed.

## Shared Navigation Structure

### Common Utility Routes

| Route | Purpose |
| --- | --- |
| `/login` | login page |
| `/logout` | session termination |
| `/dashboard` | role-aware redirect entry point |
| `/error/403` | unauthorized access view |
| `/error/404` | not found view |
| `/error/session-expired` | expired-session view |

### Admin Navigation

- Dashboard
- Events
- Users
- Reports
- Notifications

### Organizer Navigation

- Dashboard
- Tasks
- Task Board
- Event Operations
- Notifications

### Volunteer Navigation

- Dashboard
- My Tasks
- Performance
- Notifications

### Student Navigation

- Dashboard
- Browse Events
- My Registrations
- Check-In
- Feedback
- Notifications

## Shared Pages, Panels, And Dialogs

| Type | Name | Purpose |
| --- | --- | --- |
| Page | Login | authenticate user and route by role |
| Page | Unauthorized | handle forbidden navigation |
| Page | Session Expired | recover safely from expired session |
| Page | Not Found | standard missing-route page |
| Panel | Notification Tray | shared live notification feed |
| Panel | Global Search Placeholder | reserved for future cross-role search |
| Dialog | Confirm Delete | shared destructive-action confirmation |
| Dialog | Confirm Status Change | shared confirmation for publish, cancel, or deactivate |
| Dialog | Assignment Modal | shared volunteer assignment surface |
| Dialog | Schedule Adjustment Modal | shared organizer/admin adjustment approval surface |
| Dialog | AJAX Error Retry Modal | shared recovery state for failed async actions |

## Admin Page Inventory

| Route | View purpose | Key panels and dialogs |
| --- | --- | --- |
| `/admin/dashboard` | admin live overview | KPI cards, health card, risk panel, notification tray |
| `/admin/events` | event listing | filters, search, bulk status actions |
| `/admin/events/new` | create event | event form, resource section, publish controls |
| `/admin/events/{eventId}` | event detail | schedule summary, metrics card, risk details, quick actions |
| `/admin/events/{eventId}/edit` | edit event | update form, resource edits, change summary |
| `/admin/users` | user listing | role filters, active-status filters, performance badge |
| `/admin/users/new` | create user | user form, skill assignment, availability setup |
| `/admin/users/{userId}/edit` | edit user | role change, status change, performance view |
| `/admin/reports` | analytics landing | attendance reports, feedback analysis, volunteer performance |
| `/admin/notifications` | full notification feed | filter by type, severity, read state |

## Organizer Page Inventory

| Route | View purpose | Key panels and dialogs |
| --- | --- | --- |
| `/organizer/dashboard` | operations overview | task summary, volunteer summary, delay alerts |
| `/organizer/tasks` | task list management | filters, status badges, assignment quick actions |
| `/organizer/tasks/board` | visual task board | columns by status, drag or quick action controls |
| `/organizer/tasks/new` | create task | task form, dependency selector, skill requirement |
| `/organizer/tasks/{taskId}` | task detail | assignment summary, activity feed, status history |
| `/organizer/tasks/{taskId}/edit` | edit task | task edit form, reschedule controls |
| `/organizer/events/{eventId}/operations` | event-specific live operations | timeline, task list, workload map, schedule adjustments |
| `/organizer/notifications` | organizer notification feed | alerts, task updates, schedule changes |

## Volunteer Page Inventory

| Route | View purpose | Key panels and dialogs |
| --- | --- | --- |
| `/volunteer/dashboard` | personal overview | assigned tasks summary, due-soon alerts, metric cards |
| `/volunteer/tasks` | assigned task list | status filters, overdue indicators |
| `/volunteer/tasks/{taskId}` | task detail and updates | instructions, dependencies, status action bar |
| `/volunteer/performance` | personal metrics | completion rate, timeliness trend, recent history |
| `/volunteer/notifications` | volunteer notification feed | task assignment and event change updates |

## Student Page Inventory

| Route | View purpose | Key panels and dialogs |
| --- | --- | --- |
| `/student/dashboard` | personalized landing page | recommended events, upcoming registrations, live notices |
| `/student/events` | event discovery | search, filters, event cards |
| `/student/events/{eventId}` | event detail | schedule, registration action, update notices |
| `/student/registrations` | registered event list | status badges, quick check-in links |
| `/student/check-in` | check-in flow | event selector, attendance confirmation state |
| `/student/feedback` | feedback flow | emoji selector, note input, recent submissions |
| `/student/notifications` | student notification feed | schedule changes, reminders, announcements |

## Page Composition Rules

- Every role page uses the shared app shell and shared notification tray.
- Tables, forms, filters, empty states, and confirm dialogs come from the shared component inventory.
- Role pages may add domain composites, but they cannot bypass shared primitives for basic interactions.
- Live widgets must degrade gracefully to loading, stale, and failed states.

## Frontend Mocking Requirements

- Every page with AJAX behavior must have a matching mock fixture before UI implementation starts.
- Mock fixture names must map directly to DTO names from `DTO_CONTRACTS.md`.
- Route and navigation decisions in this file are frozen unless both this file and the progress tracker are updated first.