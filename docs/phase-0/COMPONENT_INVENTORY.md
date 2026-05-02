# Component Inventory

This inventory defines the reusable UI surface that should be built before role-specific page code expands. The look should remain minimalist, neutral, and shadcn-inspired, but framework-agnostic.

## Foundation Layer

| Component | Purpose | Required variants | Used by |
| --- | --- | --- | --- |
| Color tokens | neutral surfaces, accent, success, warning, danger, info | default, hover, active, disabled | all pages |
| Typography scale | headings, body, caption, label, metric text | responsive sizes | all pages |
| Spacing scale | layout rhythm and padding consistency | xs to 3xl | all pages |
| Radius and shadow tokens | cards, inputs, dialogs, overlays | subtle, medium | all pages |
| Breakpoint tokens | responsive layout behavior | mobile, tablet, desktop | all pages |

## Shell And Navigation Components

| Component | Purpose | Required variants | Used by |
| --- | --- | --- | --- |
| AppShell | base page wrapper | full-width, narrow-content | all authenticated pages |
| SidebarNav | role-aware navigation | collapsed, expanded, mobile drawer | role dashboards |
| TopBar | top header actions | with breadcrumb, with page actions | all authenticated pages |
| Breadcrumbs | location context | two-level, three-level | detail and edit pages |
| PageHeader | page title and actions | default, compact | all major pages |
| NotificationTray | live notification center | unread, empty, loading | all roles |
| UserMenu | session actions and profile summary | desktop, mobile | authenticated pages |

## Form Components

| Component | Purpose | Required variants | Used by |
| --- | --- | --- | --- |
| TextInput | single-line text | default, error, disabled, loading | user and event forms |
| TextArea | multi-line notes | default, error | event and feedback forms |
| Select | role, status, category, priority selection | single, searchable single | all modules |
| MultiSelect | skills and filters | tag style | volunteer and filter forms |
| DateTimeRangeInput | schedule windows | with validation feedback | event and task forms |
| NumberInput | attendance and quantities | min and max states | event planning |
| Checkbox | boolean options | default, disabled | shared forms |
| RadioGroup | mutually exclusive choices | default, inline | feedback and settings |
| EmojiRatingGroup | mood capture | positive, neutral, negative | student feedback |
| InlineFieldError | field-level validation text | error only | all forms |
| FormActionsBar | submit and cancel actions | sticky, inline | major forms |

## Data Display Components

| Component | Purpose | Required variants | Used by |
| --- | --- | --- | --- |
| Card | generic content container | default, elevated, compact | dashboards and detail pages |
| MetricCard | KPI display | neutral, warning, danger | dashboards |
| StatusBadge | concise state labeling | role, status, risk, health trend | all modules |
| DataTable | tabular records | sortable, filterable, paged | users, events, tasks |
| FilterBar | list filtering controls | simple, advanced | tables and discovery pages |
| EmptyState | no-data messaging | default, action-oriented | all list pages |
| SkeletonLoader | loading placeholder | card, row, table, form | all AJAX views |
| TimelineList | chronological event or task timeline | dense, detailed | event operations |
| ActivityFeed | recent changes stream | compact, expanded | task detail and notifications |
| RecommendationCard | recommended event presentation | default, highlighted | student dashboard |

## Overlay And Feedback Components

| Component | Purpose | Required variants | Used by |
| --- | --- | --- | --- |
| Modal | focused workflow container | small, medium, large | shared dialogs |
| ConfirmDialog | destructive or critical confirmation | delete, publish, status change | admin and organizer |
| Drawer | mobile or secondary detail surface | right, bottom | notifications and quick details |
| Toast | transient success and error feedback | success, warning, error, info | all AJAX flows |
| InlineAlert | persistent contextual feedback | info, warning, error, success | dashboards and forms |
| RetryPanel | async recovery state | inline, block | live widgets |

## Domain Composite Components

| Component | Purpose | Required variants | Used by |
| --- | --- | --- | --- |
| EventHealthCard | score, sub-metrics, trend | live, stale, loading | admin dashboard, event detail |
| RiskPredictionPanel | ranked risks and recommendations | empty, warning, critical | admin pages |
| VolunteerSuggestionList | assignment ranking with reasons | compact, detailed | organizer assignment |
| TaskBoard | visual task states | desktop board, mobile list fallback | organizer |
| TaskProgressStrip | quick task status summary | compact, expanded | organizer and volunteer |
| PerformanceSummaryCard | personal performance metrics | volunteer, admin summary | volunteer and reports |
| RegistrationStatusCard | student event registration state | registered, checked-in, no-show | student pages |
| CheckInPanel | check-in confirmation workflow | success, already checked in, blocked | student |
| FeedbackSummaryCard | mood aggregation snapshot | neutral, warning | reports and admin overview |

## Component Governance Rules

- Build foundation tokens and shell components before domain composites.
- Any new page requirement should first try to compose existing primitives.
- If a role-specific pattern appears in more than one screen, promote it to a shared composite.
- Every component must define loading, empty, error, and disabled behavior where relevant.