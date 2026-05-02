<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Volunteer Task Detail</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/volunteer/tasks/{taskId}">
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
              <h1 class="page-title">Volunteer task detail with instructions, dependency review, and status update actions.</h1>
              <p class="page-lead">
                This dedicated route covers the volunteer task detail contract instead of folding the update flow into a dense list view,
                keeping instructions, dependencies, and blocker reporting visible on smaller screens.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/tasks">Back to task list</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/volunteer/notifications">Open notifications</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-volunteer-gate hidden>
            <strong data-volunteer-gate-title>Volunteer access is required</strong>
            <span data-volunteer-gate-message>Use the volunteer demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/tasks">Return to volunteer tasks</a>
            </div>
          </section>

          <div class="stack-lg" data-volunteer-detail-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready task detail"
              data-preview-state-ready-copy="Showing the active volunteer task detail, instructions, and status update actions."
              data-preview-state-loading-label="Loading task detail"
              data-preview-state-loading-copy="Skeleton placeholders simulate the volunteer task detail while the assignment loads."
              data-preview-state-empty-label="Empty task detail"
              data-preview-state-empty-copy="This simulates a successful volunteer task response with no selected assignment."
              data-preview-state-error-label="Task detail error"
              data-preview-state-error-copy="This simulates a failed volunteer task detail request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Current status</span>
                <span class="metric-value" data-volunteer-detail-status-value>--</span>
                <span class="text-muted">Live status for the selected task</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Priority</span>
                <span class="metric-value" data-volunteer-detail-priority-value>--</span>
                <span class="text-muted">Priority band for escalation and sequencing</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Deadline</span>
                <span class="metric-value" data-volunteer-detail-deadline-value>--</span>
                <span class="text-muted">Current commitment window for this assignment</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Event</span>
                <span class="metric-value" data-volunteer-detail-event-value>--</span>
                <span class="text-muted">Linked event context for this task</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-8 task-detail-card">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Task instructions</p>
                    <p class="text-muted">Clear volunteer-facing instructions and dependency visibility before status changes are submitted.</p>
                  </div>
                  <span class="badge badge-neutral" data-volunteer-detail-status-badge>Pending</span>
                </div>

                <strong data-volunteer-detail-title>No task selected</strong>
                <span class="signal-meta" data-volunteer-detail-meta>Select a task from the task list to inspect its detail route.</span>
                <p class="task-card-copy" data-volunteer-detail-description>The selected task instructions and context will render here.</p>

                <div class="task-detail-grid">
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Instructions</span>
                    <ul class="activity-list" data-volunteer-detail-instruction-list>
                      <li class="activity-item">
                        <strong>No instructions yet</strong>
                        <span class="activity-meta">Task instructions will render here.</span>
                      </li>
                    </ul>
                  </div>
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Dependencies</span>
                    <ul class="task-chip-list" data-volunteer-detail-dependency-list>
                      <li class="task-chip">No dependencies loaded</li>
                    </ul>
                  </div>
                </div>

                <div class="stack-sm">
                  <p class="module-subtitle">Recent activity</p>
                  <ul class="activity-list" data-volunteer-detail-activity-list>
                    <li class="activity-item">
                      <strong>No activity yet</strong>
                      <span class="activity-meta">Task activity will render here.</span>
                    </li>
                  </ul>
                </div>
              </article>

              <article class="component-panel span-4 stack-md module-preview-shell">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Status action bar</p>
                    <p class="text-muted">Volunteer status updates mirror the approved update request DTO with status and blocker note only.</p>
                  </div>
                  <span class="badge badge-info" data-volunteer-current-status>ASSIGNED</span>
                </div>

                <div class="form-mode-row">
                  <button class="form-mode-button" type="button" data-volunteer-status-button data-status="ASSIGNED">Assigned</button>
                  <button class="form-mode-button" type="button" data-volunteer-status-button data-status="IN_PROGRESS">In progress</button>
                  <button class="form-mode-button" type="button" data-volunteer-status-button data-status="BLOCKED">Blocked</button>
                  <button class="form-mode-button" type="button" data-volunteer-status-button data-status="COMPLETED">Completed</button>
                </div>

                <label class="field">
                  <span class="field-label">Blocker note</span>
                  <textarea class="textarea-control" data-volunteer-blocker-note placeholder="Explain what is blocking progress if this task cannot move forward."></textarea>
                </label>

                <div class="button-row">
                  <button class="button button-primary" type="button" data-volunteer-save-status>Save status update</button>
                  <button class="button button-secondary" type="button" data-volunteer-reset-status>Reset</button>
                </div>

                <div class="detail-summary-card">
                  <span class="module-subtitle">Status request</span>
                  <p class="text-muted" data-volunteer-status-summary>Status updates will render here.</p>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/volunteer-task-detail.js"></script>
  </body>
</html>