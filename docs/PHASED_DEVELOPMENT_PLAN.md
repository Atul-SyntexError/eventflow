# EventFlow Phase-Wise Development Plan

## 1. Planning Intent

This plan is the source of truth before implementation starts. The delivery order is:

1. Architecture and delivery controls
2. Frontend-first implementation with mock contracts
3. Backend implementation behind the approved frontend contracts
4. Integration, regression, and release hardening

The project should be built as a modular Java web application that stays maintainable as the feature set grows.

## 2. Non-Negotiable Delivery Principles

- Build frontend first, but define backend contracts early so UI work does not need to be rewritten later.
- Keep the codebase modular: views, client scripts, controllers, services, DAOs, models, and utilities must remain separate.
- Keep business logic out of JSP files.
- Keep controllers thin. Complex logic belongs in services.
- Validate every feature against role-based permissions and regression risk before marking it complete.
- Treat real-time behavior, notification flows, and AI simulation as first-class features, not late add-ons.
- Do not merge unrelated work into the same implementation slice.

## 3. Architecture Decisions To Lock Before Coding

### 3.1 Technical Baseline

- Java 17 LTS
- Maven-based WAR project
- Jakarta Servlet + JSP MVC on Tomcat 10.x
- MySQL 8
- JDBC with connection pooling
- JavaMail for notifications
- Vanilla JavaScript with modular page scripts and shared AJAX utilities

### 3.2 Target Project Structure

```text
EventFlow/
├── AGENTS.md
├── docs/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/eventflow/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── filter/
│   │   │   ├── mapper/
│   │   │   ├── model/
│   │   │   ├── dao/
│   │   │   ├── service/
│   │   │   ├── validation/
│   │   │   └── utils/
│   │   ├── resources/
│   │   └── webapp/
│   │       ├── WEB-INF/views/
│   │       │   ├── layouts/
│   │       │   ├── partials/
│   │       │   ├── admin/
│   │       │   ├── organizer/
│   │       │   ├── volunteer/
│   │       │   └── student/
│   │       └── assets/
│   │           ├── css/
│   │           │   ├── base/
│   │           │   ├── components/
│   │           │   └── pages/
│   │           ├── js/
│   │           │   ├── api/
│   │           │   ├── components/
│   │           │   ├── pages/
│   │           │   └── state/
│   │           └── images/
│   └── test/
└── database/
    ├── schema/
    ├── seed/
    └── migrations/
```

### 3.3 Frontend Architecture Rules

- Use JSP for rendering views and partials, but keep reusable UI primitives centralized.
- Use a design-token approach inspired by shadcn/ui patterns: CSS variables, neutral surfaces, clear spacing scale, restrained accent usage, consistent border radius, and accessible contrast.
- Create a shared application shell with sidebar, header, notification tray, status badges, cards, tables, forms, modals, and toast patterns.
- Keep page-specific JavaScript in isolated modules; shared AJAX, polling, DOM helpers, and notification code must live in shared utilities.
- Build frontend flows first against mock JSON fixtures that match final DTOs.

### 3.4 Backend Architecture Rules

- Separate page-rendering controllers from AJAX/JSON controllers.
- Use DTOs for API payloads and never expose raw DAO entities directly to the browser.
- Put AI simulation, scoring, recommendation, risk logic, notification triggers, and reporting aggregation in the service layer.
- Use filters for authentication, role authorization, and session checks.
- Centralize validation rules to avoid duplicating checks across controllers.
- Keep email delivery behind a notification service so triggers remain testable.

### 3.5 Data Model Decisions

The required entities remain, but the schema should be refined before implementation:

- `users`: identity, role, skills, availability, performance, active status
- `events`: event metadata, schedule, venue, expected attendance, resource plan, status
- `registrations`: student registration, attendance state, check-in timestamp
- `tasks`: task metadata, assignment, status, deadline, required skills, dependency markers
- `feedback`: emoji rating, optional text, event reference, submitted by, submitted at
- `event_metrics`: health score snapshots, attendance ratio, engagement score, volunteer efficiency, risk level

Recommended support tables to plan early:

- `skills`: normalized skill catalog for assignment logic
- `user_skills`: volunteer and user skill mapping
- `event_resources`: resource planning per event
- `task_assignments`: assignment history and scoring output
- `risk_predictions`: persisted prediction snapshots and recommendations
- `notifications`: in-app notification feed
- `notification_logs`: email and in-app notification history
- `audit_logs`: admin and organizer change history
- `event_schedule_adjustments`: suggested or applied timeline changes

### 3.6 Quality and Regression Strategy

- Each phase must define acceptance criteria before coding starts.
- Every feature must list impacted roles and the minimum regression checks required.
- Frontend phases must be validated with mocked contracts before backend work starts.
- Backend phases must preserve the agreed UI contract unless the plan and progress tracker are updated first.
- Security checks must cover input validation, session handling, authorization boundaries, SQL safety, output escaping, and email trigger safety.

## 4. Phase-Wise Roadmap

### Phase 0 - Discovery, Contracts, and Delivery Controls

**Goal:** freeze the scope, module boundaries, and integration contracts before implementation.

**Expected outputs:** artifacts under `docs/phase-0/` covering user journeys, frontend IA, component inventory, DTOs, endpoints, data model, validation standards, enums, and delivery governance.

**Checklist**

- [ ] Finalize user journeys for Admin, Organizer, Volunteer, and Student
- [ ] Prepare the page inventory for all views, dialogs, and panels
- [ ] Prepare the component inventory for reusable UI primitives
- [ ] Define frontend route map and navigation structure per role
- [ ] Draft DTO contracts for AJAX responses and form submissions
- [ ] Draft endpoint catalog for page and JSON controllers
- [ ] Draft ERD and schema refinements for required and support tables
- [ ] Define validation rules and error message conventions
- [ ] Define status enums for roles, task states, event states, feedback moods, and notification types
- [ ] Define Definition of Done for feature slices
- [ ] Lock the development order: frontend first, backend second, integration last
- [ ] Establish regression matrix and update process

### Phase 1 - Frontend Foundation and Design System

**Goal:** build the shared visual language and app shell before any role-specific screen work.

**Checklist**

- [ ] Define design tokens: colors, typography, spacing, radius, shadows, borders, z-index, breakpoints
- [ ] Create base CSS structure for reset, tokens, utilities, and layout primitives
- [ ] Build app shell: header, sidebar, breadcrumb, page header, footer area
- [ ] Build shared components: button, input, select, textarea, checkbox, radio, badge, alert, card, table, modal, toast, tabs, empty state, skeleton loader
- [ ] Build notification tray and live status badge components
- [ ] Create form validation UI states: default, error, success, disabled, loading
- [ ] Create data table patterns with pagination, filters, search, and action menus
- [ ] Define responsive behavior for desktop, tablet, and mobile layouts
- [ ] Define accessibility rules for focus states, keyboard navigation, labels, and feedback messaging
- [ ] Create static component showcase page for quick QA

### Phase 2 - Frontend Authentication and Shared Application Flow

**Goal:** build the shared entry flow and global interaction patterns using mocked state.

**Checklist**

- [ ] Design and build login page with error and loading states
- [ ] Design session-expired, unauthorized, and not-found screens
- [ ] Build role-aware landing and redirect behavior in frontend mocks
- [ ] Build top-level notification center shell
- [ ] Build user profile dropdown and session controls UI
- [ ] Define frontend permission map for menu visibility and action visibility
- [ ] Create mock authentication payloads for each role
- [ ] Create shared flash message and async error display patterns
- [ ] Create global loading and retry behavior for AJAX-driven widgets

### Phase 3 - Admin Frontend Module

**Goal:** deliver complete admin-facing screens and interactions using stable mock contracts.

**Checklist**

- [ ] Build admin dashboard layout with KPI cards and summary panels
- [ ] Build event management list view with search, filters, and actions
- [ ] Build event create, edit, detail, and delete confirmation flows
- [ ] Build expected attendance and resource planning forms
- [ ] Build user management list view with role filters and status indicators
- [ ] Build user create, edit, activate/deactivate, and delete confirmation flows
- [ ] Build event health score widget with live-refresh placeholder states
- [ ] Build risk prediction panel with severity indicators and recommendations UI
- [ ] Build admin report preview cards for attendance, feedback, and volunteer performance
- [ ] Validate empty, loading, and failure states across all admin screens

### Phase 4 - Organizer Frontend Module

**Goal:** deliver the organizer workspace for task orchestration and live operational visibility.

**Checklist**

- [ ] Build organizer dashboard with task summary, volunteer overview, and alert panels
- [ ] Build task board and task table views
- [ ] Build task create, edit, assign, reschedule, and delete flows
- [ ] Build volunteer assignment UI with smart suggestion panel and scoring explanation area
- [ ] Build live task progress widgets and delay alert components
- [ ] Build volunteer workload and availability views
- [ ] Build event-specific operational timeline and schedule adjustment UI
- [ ] Validate organizer interactions for real-time refresh and partial updates

### Phase 5 - Volunteer Frontend Module

**Goal:** deliver a focused and lightweight volunteer experience.

**Checklist**

- [ ] Build volunteer dashboard with assigned tasks summary and status overview
- [ ] Build assigned tasks list and task detail views
- [ ] Build task status update actions: pending, in progress, completed
- [ ] Build notification inbox panel for task and event updates
- [ ] Build performance metrics view with history and current score summary
- [ ] Build empty, delayed, overdue, and reassigned task states
- [ ] Validate mobile-friendly task update flow for quick usage during events

### Phase 6 - Student Frontend Module

**Goal:** deliver the student event participation journey end to end.

**Checklist**

- [ ] Build student dashboard with recommended events, upcoming registrations, and live notices
- [ ] Build event discovery page with search, filters, and category tags
- [ ] Build event detail page with registration and schedule information
- [ ] Build registration confirmation and registered-events view
- [ ] Build personalized recommendation section using mock recommendation payloads
- [ ] Build event check-in UI and status feedback
- [ ] Build emoji-based feedback interaction with optional note field
- [ ] Build live updates panel for event changes and alerts
- [ ] Validate student flow for registration, check-in, feedback, and notifications

### Phase 7 - Frontend Real-Time Behavior, Contract Freeze, and UI QA

**Goal:** finish the frontend with shared real-time mechanics and make it ready for backend integration.

**Checklist**

- [ ] Build shared AJAX utility layer with request, response, error, and retry conventions
- [ ] Build polling strategy for health score, notifications, task updates, and dashboard cards
- [ ] Standardize partial page refresh behavior without full reloads
- [ ] Create mock JSON fixtures for all role-specific AJAX flows
- [ ] Freeze DTO names and payload structures for backend implementation
- [ ] Run responsive QA across all role dashboards and key workflows
- [ ] Run accessibility QA for forms, tables, dialogs, and notification flows
- [ ] Run visual consistency QA for spacing, typography, and component behavior
- [ ] Record frontend integration assumptions before backend work starts

### Phase 8 - Backend Foundation and Database Setup

**Goal:** establish the Java web backbone behind the approved frontend contract.

**Checklist**

- [ ] Initialize Maven web project and dependency management
- [ ] Configure environment properties and secure configuration loading
- [ ] Configure database connection management and pooling
- [ ] Create schema scripts, migrations, and seed data
- [ ] Implement base domain models and enums
- [ ] Implement DTOs and mappers matching approved frontend contracts
- [ ] Implement common response wrapper for AJAX endpoints
- [ ] Implement exception handling and centralized error mapping
- [ ] Set up logging strategy for controller, service, DAO, and email flows

### Phase 9 - Authentication, Session Management, and Role Control

**Goal:** secure access before exposing any operational backend feature.

**Checklist**

- [ ] Implement user authentication flow with secure password handling
- [ ] Implement login, logout, and session timeout behavior
- [ ] Implement authentication filter for protected routes
- [ ] Implement role-based authorization filter and redirect rules
- [ ] Implement current-user session context helper
- [ ] Implement unauthorized access logging and handling
- [ ] Validate page and AJAX responses for expired sessions and forbidden actions

### Phase 10 - Core CRUD Backend for Events, Users, Tasks, Registrations, and Feedback

**Goal:** deliver the transactional core of the platform.

**Checklist**

- [ ] Implement user DAO and service flows for create, update, delete, view, and role assignment
- [ ] Implement event DAO and service flows for create, update, delete, view, status management, attendance expectations, and resource planning
- [ ] Implement task DAO and service flows for create, assign, update, delete, and status changes
- [ ] Implement registration DAO and service flows for event registration and student check-in
- [ ] Implement feedback DAO and service flows for create and read flows
- [ ] Implement page controllers and AJAX controllers for each CRUD module
- [ ] Implement validation, uniqueness checks, referential integrity rules, and transaction boundaries
- [ ] Implement audit trail entries for critical changes

### Phase 11 - Intelligence and Simulation Services

**Goal:** implement the core logic that makes EventFlow more than a CRUD system.

**Checklist**

- [ ] Implement event health score service based on attendance ratio, engagement, and volunteer efficiency
- [ ] Implement volunteer efficiency scoring inputs and update rules
- [ ] Implement smart volunteer assignment scoring using skill match, availability, and previous performance
- [ ] Implement risk prediction service for low attendance, volunteer shortage, and schedule conflicts
- [ ] Implement student recommendation logic for relevant events
- [ ] Implement mood and engagement aggregation from emoji feedback
- [ ] Implement dynamic schedule adjustment suggestion service
- [ ] Persist metric snapshots and recommendation outputs where required
- [ ] Expose explanation data so UI can show why a score or suggestion was generated

### Phase 12 - Real-Time AJAX Endpoints and Notification Engine

**Goal:** connect live frontend behavior to backend state changes.

**Checklist**

- [ ] Implement AJAX endpoints for live task updates, health score refresh, notifications, and dashboards
- [ ] Implement JSON serializers aligned to frozen contracts
- [ ] Implement in-app notification creation and retrieval flow
- [ ] Implement email service abstraction using JavaMail
- [ ] Implement email templates for task assignment, event update, and schedule change
- [ ] Trigger notifications on task assignment, event update, and schedule adjustments
- [ ] Persist notification delivery logs and failure details
- [ ] Add retry or safe-fail behavior for email delivery issues
- [ ] Validate concurrent update behavior for live dashboards and task status changes

### Phase 13 - Reports, Analytics, and Operational Insights

**Goal:** deliver the reporting layer required for decision-making and review.

**Checklist**

- [ ] Implement event performance summary aggregation
- [ ] Implement attendance statistics reporting
- [ ] Implement feedback analysis and sentiment summary
- [ ] Implement volunteer performance reporting
- [ ] Implement role-specific report views and filters
- [ ] Optimize queries and aggregation paths for dashboard use
- [ ] Validate consistency between report totals and transactional data

### Phase 14 - Integration Hardening, Regression, and Release Readiness

**Goal:** verify the full system works as one product and is safe to continue building on.

**Checklist**

- [ ] Run end-to-end regression for Admin flows
- [ ] Run end-to-end regression for Organizer flows
- [ ] Run end-to-end regression for Volunteer flows
- [ ] Run end-to-end regression for Student flows
- [ ] Verify cross-role interactions and permissions
- [ ] Verify AJAX failure handling and recovery states
- [ ] Verify email triggers and notification history
- [ ] Verify session security, authorization boundaries, output escaping, and input validation
- [ ] Verify data integrity under concurrent task and registration updates
- [ ] Prepare deployment notes, environment checklist, and rollback approach
- [ ] Update documentation for setup, architecture, and testing

## 5. Ongoing Phase Exit Criteria

A phase is complete only when all of the following are true:

- All checklist items for the phase are done or explicitly deferred with a reason
- Impacted role flows have been re-verified
- The progress tracker has been updated
- Any contract changes are reflected in the plan before implementation continues
- No unresolved regression risk remains for the completed slice

## 6. Recommended Execution Rhythm

For each future implementation slice:

1. Confirm the current phase and exact subtask in the progress tracker
2. Implement the smallest complete vertical slice inside that phase
3. Validate impacted screens, endpoints, and roles
4. Update the progress tracker immediately
5. Only then move to the next subtask