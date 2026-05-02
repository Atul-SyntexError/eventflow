<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Volunteer Tasks Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/volunteer/tasks">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 5 volunteer module</p>
              <h1 class="page-title">Volunteer task list with personal filters, overdue indicators, and handoff into task detail updates.</h1>
              <p class="page-lead">
                This page covers the assigned task list contract with status filters, urgency indicators, and a selected task summary that
                drives the dedicated task detail route instead of collapsing the entire volunteer flow into a single screen.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/dashboard.jsp">Back to dashboard</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/volunteer/tasks">Open task detail</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-volunteer-gate hidden>
            <strong data-volunteer-gate-title>Volunteer access is required</strong>
            <span data-volunteer-gate-message>Use the volunteer demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/dashboard.jsp">Return to volunteer dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-volunteer-tasks-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready volunteer tasks"
              data-preview-state-ready-copy="Showing the active volunteer task list with selected task summary and overdue indicators."
              data-preview-state-loading-label="Loading volunteer tasks"
              data-preview-state-loading-copy="Skeleton placeholders simulate the volunteer task list while assignments load."
              data-preview-state-empty-label="Empty volunteer tasks"
              data-preview-state-empty-copy="This simulates a successful volunteer response with no assigned tasks yet."
              data-preview-state-error-label="Volunteer tasks error"
              data-preview-state-error-copy="This simulates a failed volunteer task request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Assigned</span>
                <span class="metric-value" data-volunteer-task-assigned-count>0</span>
                <span class="text-muted">Current assignments visible in this list</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Due soon</span>
                <span class="metric-value" data-volunteer-task-due-soon-count>0</span>
                <span class="text-muted">Tasks inside the next action window</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Overdue</span>
                <span class="metric-value" data-volunteer-task-overdue-count>0</span>
                <span class="text-muted">Assignments that need organizer visibility</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Completed</span>
                <span class="metric-value" data-volunteer-task-completed-count>0</span>
                <span class="text-muted">Finished assignments kept visible for personal history</span>
              </article>
            </section>

            <section class="component-panel filter-shell">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Task filters</p>
                  <p class="text-muted">Filter only your assigned tasks and keep overdue work visible without losing the full queue context.</p>
                </div>
                <button class="button button-ghost" type="button" data-volunteer-task-reset-filters>Reset filters</button>
              </div>

              <div class="filter-grid">
                <label class="field">
                  <span class="field-label">Search tasks</span>
                  <input class="control" type="search" placeholder="Task title or event" data-volunteer-task-search />
                </label>
                <label class="field">
                  <span class="field-label">Status</span>
                  <select class="select-control" data-volunteer-task-status-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Priority</span>
                  <select class="select-control" data-volunteer-task-priority-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Event</span>
                  <select class="select-control" data-volunteer-task-event-filter></select>
                </label>
              </div>

              <div class="filter-summary">
                <span data-volunteer-task-filter-summary>Showing the full volunteer task list.</span>
                <span class="mono-copy" data-volunteer-selected-task-summary>No task selected.</span>
              </div>
            </section>

            <section class="section-grid">
              <article class="table-shell span-8">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Assigned tasks</p>
                    <p class="text-muted">Your task queue with overdue indicators and direct handoff into the detail route.</p>
                  </div>
                  <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/tasks" data-volunteer-open-detail-link>Open selected detail</a>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Event</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody data-volunteer-task-table-body>
                      <tr>
                        <td colspan="6">Volunteer task data is loading.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="empty-inline-state" data-volunteer-task-empty-state hidden>
                  No tasks match the current filters. Reset the filters to restore the full personal queue.
                </div>
              </article>

              <article class="component-panel span-4 task-detail-card">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Selected task summary</p>
                    <p class="text-muted">A quick summary before opening the dedicated task detail and status update route.</p>
                  </div>
                  <span class="badge badge-neutral" data-volunteer-selected-task-status>Pending</span>
                </div>
                <strong data-volunteer-selected-task-title>No task selected</strong>
                <span class="signal-meta" data-volunteer-selected-task-meta>Select a task row to inspect its location and dependencies.</span>
                <p class="task-card-copy" data-volunteer-selected-task-copy>The selected task summary will render here.</p>
                <ul class="task-chip-list" data-volunteer-selected-task-chips>
                  <li class="task-chip">No dependencies loaded</li>
                </ul>
                <div class="button-row">
                  <a class="button button-primary" href="${pageContext.request.contextPath}/volunteer/tasks" data-volunteer-open-detail-link-secondary>Open task detail</a>
                  <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/notifications">View notifications</a>
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/state/mock-session-data.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-role-page.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-preview-state.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-task-ui-utils.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/volunteer-tasks.js"></script>
  </body>
</html>