# EventFlow User Journeys

This document defines the target journeys that Phase 1 and later phases must support. These are product contracts, not optional examples.

## Shared Journey - Authentication And Session Control

| Step | User action | System behavior | Contract needs | Failure handling |
| --- | --- | --- | --- | --- |
| 1 | User opens login page | Display role-neutral login form and app branding | `LoginRequestDto`, `LoginResponseDto` | Invalid credentials message, locked account message |
| 2 | User submits credentials | Validate session, role, active status, and permissions | `RoleSessionDto` | Stay on login page with field and global errors |
| 3 | System resolves role landing page | Redirect to role dashboard | redirect path in login response | Unauthorized role state if account data is inconsistent |
| 4 | Session times out or becomes invalid | Show session-expired page or AJAX expired-session response | session status endpoint | Preserve safe return path where possible |

## Admin Journeys

### Journey A - Create And Prepare An Event

| Step | Admin goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open event workspace | Show event list with filters and status badges | none | event inventory |
| 2 | Create event | Capture metadata, schedule, venue, expected attendance, and resources | initial risk pre-check placeholder | event record |
| 3 | Refine plan | Edit attendance expectations and resource needs | risk prediction preview | updated event plan |
| 4 | Review readiness | Show predicted risks and health inputs before launch | risk prediction service | risk panel |
| 5 | Publish event | Make event available for student registration | live registration counters later depend on this | event status change |

### Journey B - Manage Users And Volunteer Pool

| Step | Admin goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Review users | Filter by role, status, and performance | none | user inventory |
| 2 | Add or update users | Save role, skills, availability, and active status | volunteer assignment depends on these fields | user record |
| 3 | Deactivate or delete user | Prevent unsafe removal if referenced by active tasks or registrations | integrity checks | status change or deletion denial |

### Journey C - Monitor Live Event Health

| Step | Admin goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open dashboard during live event | Show KPI cards and event status | polling for live widgets | dashboard snapshot |
| 2 | Inspect health score | Combine attendance, engagement, and volunteer efficiency | health score service | score snapshot |
| 3 | Inspect risks | Show low attendance, shortage, or schedule conflict warnings | risk prediction service | ranked risks and recommendations |
| 4 | Review notifications | See operational changes and escalation alerts | notification feed | actionable alerts |

### Journey D - Review Post-Event Outcomes

| Step | Admin goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open report summaries | Show attendance, feedback, and volunteer performance trends | aggregation services | report cards |
| 2 | Compare expected versus actual | Show variance and highlight gaps | metrics history | post-event insight |

## Organizer Journeys

### Journey A - Plan Task Operations

| Step | Organizer goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open event operations workspace | Show event timeline, current tasks, and volunteer pool | none | operations dashboard |
| 2 | Create tasks | Save title, description, deadline, priority, required skills, and dependencies | none | task backlog |
| 3 | Review readiness | Detect missing assignees or schedule pressure | delay and shortage indicators later depend on this | task plan |

### Journey B - Assign Volunteers Manually Or Smartly

| Step | Organizer goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open assignment UI | Show task details and eligible volunteers | availability and skill data | assignment modal |
| 2 | Review smart suggestions | Rank volunteers by skill fit, availability, and performance | assignment scoring service | suggestion list |
| 3 | Confirm assignment | Persist assignment and trigger notifications | email and in-app notifications | assignment record |
| 4 | Track response | Reflect task in volunteer dashboard and organizer live board | live task refresh | updated task state |

### Journey C - Manage Delays During Event

| Step | Organizer goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Watch live task progress | Poll task status and overdue indicators | live task polling | task progress board |
| 2 | Detect delay or blocker | Highlight impacted tasks and dependencies | schedule adjustment service | delay alert |
| 3 | Apply schedule change | Propose or approve adjusted timeline | schedule adjustment service | revised timeline |
| 4 | Inform impacted users | Push event or task update notifications | notification service | update feed and emails |

## Volunteer Journeys

### Journey A - Receive And Review Assigned Work

| Step | Volunteer goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open dashboard | Show assigned tasks, due times, and current metrics | none | volunteer summary |
| 2 | Receive new assignment | Surface task in app and by email | notification service | assignment alert |
| 3 | Open task detail | Show event, deadline, instructions, and dependencies | none | task detail |

### Journey B - Update Task Status During Event

| Step | Volunteer goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Start task | Change status to in progress | live task board update | status event |
| 2 | Report blocker or delay | Save blocker context for organizer visibility | alert feed update | blocker state |
| 3 | Complete task | Persist completion time and metrics input | performance update rules | completed task |

### Journey C - Track Personal Performance

| Step | Volunteer goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open performance screen | Show completion rate, timeliness, and active assignments | metrics aggregation | performance summary |
| 2 | Review history | Show recent events and task outcomes | none | trend history |

## Student Journeys

### Journey A - Discover And Register For Events

| Step | Student goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Browse events | Show searchable event cards and filters | recommendation data enriches this | event list |
| 2 | Open event detail | Show schedule, venue, status, and availability | live event update feed may annotate changes | event detail |
| 3 | Register | Create registration if event is open and capacity allows | validation on registration rules | registration record |
| 4 | Review registered events | Show upcoming participation and statuses | none | registrations list |

### Journey B - Receive Personalized Recommendations

| Step | Student goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open dashboard | Show recommended events | recommendation service | recommendation cards |
| 2 | Compare options | Highlight why the event is relevant | recommendation explanation data | recommendation reasons |

### Journey C - Check In And Stay Informed

| Step | Student goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open check-in flow | Validate active registration and event timing | check-in validation rules | check-in screen |
| 2 | Confirm attendance | Save attendance state and timestamp | health score input depends on this | checked-in registration |
| 3 | Monitor live updates | Show schedule changes or event notices | live update feed | student notifications |

### Journey D - Provide Feedback After Event

| Step | Student goal | System behavior | Real-time or AI dependency | Key outputs |
| --- | --- | --- | --- | --- |
| 1 | Open feedback flow | Show emoji rating choices and optional note field | none | feedback form |
| 2 | Submit feedback | Persist mood and optional comment | engagement analysis depends on this | feedback record |
| 3 | Trigger insight updates | Update engagement metrics and alerts if negative trend emerges | mood aggregation service | updated event metrics |

## Cross-Role Dependency Notes

- Admin user data quality directly affects organizer smart assignment quality.
- Organizer schedule changes must immediately affect volunteer tasks and student event updates.
- Student check-ins and feedback directly influence health score and post-event reports.
- Notification contracts are shared across all roles and cannot diverge by page implementation.
- Every journey depends on reliable session handling and role-based access control.