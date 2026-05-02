# Phase 7 QA Audit - Findings In Progress

## Findings So Far

### CRITICAL - Contract Mismatches
1. Admin and Organizer dashboard endpoints return raw DTOs (not wrapped in ApiResponse)
   - `/api/admin/dashboard` returns `AdminDashboardDto` directly (not wrapped)
   - `/api/organizer/dashboard` returns `OrganizerDashboardDto` directly (not wrapped)
   - Other list endpoints like `/api/organizer/tasks` return wrapped `ApiResponse<TaskSummaryDto[]>`
   - **Impact**: Inconsistent response handling pattern across dashboard vs other endpoints

### HIGH - Responsive Design Issues
1. `filter-grid` at 72rem has no media query; goes 4-col → 1-col (should collapse at 72rem too)
   - Located: `src/main/webapp/assets/css/components/module-surfaces.css` line 17
2. `task-board-grid` missing 64rem media query; jumps from 4-col to 2-col at 72rem to 1-col at 48rem
   - Located: `src/main/webapp/assets/css/components/task-operations.css` line 19
3. Tables still have `min-width: 42rem` on mobile (<48rem) which causes horizontal overflow
   - Located: Multiple JSP files have inline `style="overflow-x: auto;"` wrappers (10 instances)

### MEDIUM - Code Quality Issues
1. Inline `style="overflow-x: auto;"` appearing 10 times across JSP files
   - Should be replaced with CSS class `.table-scroll-wrapper` or similar
   - Files affected: admin/*, student/*, volunteer/*, organizer/*, shared/design-system-showcase.jsp
2. Form grid (`form-grid`) only has media query for 48rem, no 64rem handler
   - Located: `src/main/webapp/assets/css/components/forms.css` line 73

### LOW - Filter Grid Responsive Gap
1. `.filter-grid` uses `minmax(0, 2fr) repeat(3, minmax(0, 1fr))` (4-column layout)
   - Media queries: 72rem → 2-col, 48rem → 1-col
   - **Gap**: No 64rem handler; on tablet (64rem) still renders 4-col which is cramped
   - Located: `src/main/webapp/assets/css/components/module-surfaces.css`
2. `.task-board-grid` has incomplete breakpoints: 72rem, 48rem but missing 64rem
   - Located: `src/main/webapp/assets/css/components/task-operations.css`

### VERIFIED - Working Correctly
- Polling/refresh lifecycle stops correctly on preview state change
- Error handlers present in all page scripts (admin, organizer, volunteer, student)
- Skip link and accessibility attributes (aria-label, role) properly implemented
- Focus states and keyboard navigation via `:focus-visible` with outline-offset
- CSS custom properties and prefers-reduced-motion honored

## Structural Assessment
- Phase 7 shared API/polling integration appears **sound**: mock-api-client, mock-polling, and mock-refresh-controller are properly modularized
- Error handling is wired but contracts have **response envelope inconsistency**: dashboard endpoints return raw DTOs while list endpoints return wrapped ApiResponse
- No major accessibility violations detected; form and table controls have proper focus rings
- Responsive breakpoints **mostly good** but have edge gaps at 64rem (tablet landscape)