<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Organizer Dashboard Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/organizer/dashboard">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <h1 class="page-title">Organizer Dashboard</h1>
              <p class="page-lead">
                Live operations dashboard with alerts, assignments, and task momentum.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/organizer/tasks">Manage Tasks</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-organizer-gate hidden>
            <strong data-organizer-gate-title>Organizer access is required</strong>
            <span data-organizer-gate-message>Use the organizer demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/error/403.jsp">Open unauthorized preview</a>
            </div>
          </section>

          <div class="stack-lg" data-organizer-dashboard-content hidden>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Open tasks</span>
                <span class="metric-value" data-organizer-open-tasks>0</span>
                <span class="text-muted">Tasks waiting for action or assignment</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">In progress</span>
                <span class="metric-value" data-organizer-in-progress-tasks>0</span>
                <span class="text-muted">Tasks already moving across active event operations</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Blocked tasks</span>
                <span class="metric-value" data-organizer-blocked-tasks>0</span>
                <span class="text-muted">Tasks needing intervention or schedule adjustments</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Available volunteers</span>
                <span class="metric-value" data-organizer-available-volunteers>0</span>
                <span class="text-muted">Volunteers currently ready for reassignment or coverage help</span>
              </article>
            </section>

            <section class="section-grid">
              <article id="organizer-delay-alerts" class="component-panel span-7 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Delay alerts</p>
                    <p class="text-muted">Operational warnings that should influence task sequencing, reassignment, or schedule updates.</p>
                  </div>
                  <span class="badge badge-warning">Live alert feed</span>
                </div>
                <ul class="delay-alert-list" data-organizer-delay-alert-list>
                  <li class="delay-alert-item severity-low">
                    <strong>No delay alerts yet</strong>
                    <span class="delay-meta">Mock organizer data will populate this list.</span>
                  </li>
                </ul>
              </article>

              <article class="component-panel span-5 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Suggested volunteer matches</p>
                    <p class="text-muted">A preview of the smart assignment ranking surface for active organizer decisions.</p>
                  </div>
                  <span class="badge badge-info">Suggested</span>
                </div>
                <ul class="suggestion-list" data-organizer-suggestion-list>
                  <li class="suggestion-item">
                    <strong>No suggestions yet</strong>
                    <span class="suggestion-copy">Smart assignment recommendations will render here.</span>
                  </li>
                </ul>
              </article>

              <article class="table-shell span-8">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Recent assignment momentum</p>
                    <p class="text-muted">Organizer dashboard preview for the task flow now feeding the dedicated task pages.</p>
                  </div>
                  <span class="badge badge-success">Task summary</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Event</th>
                        <th>Volunteer</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody data-organizer-assignment-body>
                      <tr>
                        <td colspan="5">Organizer assignment momentum is waiting for mock data.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Operations pulse</p>
                    <p class="text-muted">Quick organizer cues before diving into tasks, board view, or event operations.</p>
                  </div>
                  <span class="badge badge-neutral">Quick links</span>
                </div>
                <ul class="task-chip-list" data-organizer-pulse-list>
                  <li class="task-chip">No active pulse items yet</li>
                </ul>
                <div class="button-row">
                  <a class="button button-secondary" href="${pageContext.request.contextPath}/organizer/tasks">Task table</a>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/organizer-dashboard.js"></script>
  </body>
</html>