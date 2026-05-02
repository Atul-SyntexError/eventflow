<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Volunteer Dashboard Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/volunteer/dashboard">
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
              <h1 class="page-title">Volunteer dashboard with assigned task focus, due-soon pressure, and personal performance context.</h1>
              <p class="page-lead">
                This preview starts the volunteer module with a personal overview tied to the approved dashboard DTO while reusing
                the shared shell, role guard, preview-state controls, and task UI helpers already established in earlier phases.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/dashboard.jsp">Shared dashboard preview</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/volunteer/tasks">Open assigned tasks</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-volunteer-gate hidden>
            <strong data-volunteer-gate-title>Volunteer access is required</strong>
            <span data-volunteer-gate-message>Use the volunteer demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/error/403.jsp">Open unauthorized preview</a>
            </div>
          </section>

          <div class="stack-lg" data-volunteer-dashboard-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready volunteer dashboard"
              data-preview-state-ready-copy="Showing the active volunteer overview with assigned tasks, due-soon pressure, and recent updates."
              data-preview-state-loading-label="Loading volunteer dashboard"
              data-preview-state-loading-copy="Skeleton placeholders simulate the volunteer overview while personal task data loads."
              data-preview-state-empty-label="Empty volunteer dashboard"
              data-preview-state-empty-copy="This simulates a successful volunteer response with no active assignments yet."
              data-preview-state-error-label="Volunteer dashboard error"
              data-preview-state-error-copy="This simulates a failed volunteer dashboard request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Assigned now</span>
                <span class="metric-value" data-volunteer-assigned-count>0</span>
                <span class="text-muted">Current tasks assigned to the volunteer session</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Due soon</span>
                <span class="metric-value" data-volunteer-due-soon-count>0</span>
                <span class="text-muted">Tasks inside the next action window</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Overdue</span>
                <span class="metric-value" data-volunteer-overdue-count>0</span>
                <span class="text-muted">Assignments needing immediate attention or escalation</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">On-time rate</span>
                <span class="metric-value" data-volunteer-on-time-rate>0%</span>
                <span class="text-muted">Recent timeliness from the performance summary</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="table-shell span-7">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Assigned task summary</p>
                    <p class="text-muted">Quick access to the active volunteer task queue before opening the full task list.</p>
                  </div>
                  <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/tasks">Open task list</a>
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
                      </tr>
                    </thead>
                    <tbody data-volunteer-assignment-body>
                      <tr>
                        <td colspan="5">Volunteer task data is loading.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <article class="component-panel span-5 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Due-soon and blocker alerts</p>
                    <p class="text-muted">Personal task pressure and follow-up prompts for the current shift window.</p>
                  </div>
                  <span class="badge badge-warning">Attention</span>
                </div>
                <ul class="delay-alert-list" data-volunteer-alert-list>
                  <li class="delay-alert-item severity-low">
                    <strong>No active alerts yet</strong>
                    <span class="delay-meta">Dashboard alert copy will render here.</span>
                  </li>
                </ul>
              </article>

              <article class="component-panel span-6 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Performance snapshot</p>
                    <p class="text-muted">The dashboard surfaces the same personal performance summary used by the dedicated metrics page.</p>
                  </div>
                  <a class="button button-ghost" href="${pageContext.request.contextPath}/volunteer/performance.jsp">Open performance</a>
                </div>
                <ul class="suggestion-list" data-volunteer-dashboard-performance-list>
                  <li class="suggestion-item">
                    <strong>No performance history yet</strong>
                    <span class="suggestion-copy">Recent event history will render here.</span>
                  </li>
                </ul>
              </article>

              <article class="component-panel span-6 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Recent notifications</p>
                    <p class="text-muted">Latest assignment and event change updates for the volunteer flow.</p>
                  </div>
                  <a class="button button-ghost" href="${pageContext.request.contextPath}/volunteer/notifications">Open notifications</a>
                </div>
                <ul class="suggestion-list" data-volunteer-dashboard-notification-list>
                  <li class="suggestion-item">
                    <strong>No notifications yet</strong>
                    <span class="suggestion-copy">Recent updates will render here.</span>
                  </li>
                </ul>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/volunteer-dashboard.js"></script>
  </body>
</html>