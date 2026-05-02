<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Volunteer Performance</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/volunteer/performance">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 13 volunteer reporting</p>
              <h1 class="page-title">Volunteer performance metrics with completion rate, on-time history, and recent event context.</h1>
              <p class="page-lead">
                This screen now consumes the live volunteer performance API so personal progress stays visible without leaking
                admin-only reporting surfaces into the volunteer experience.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/volunteer/dashboard.jsp">Back to dashboard</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/volunteer/tasks">Open tasks</a>
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

          <div class="stack-lg" data-volunteer-performance-content hidden>
            <section class="alert alert-info" data-volunteer-performance-loading-state hidden>
              <strong>Loading performance</strong>
              <span>The latest volunteer completion and timeliness metrics are being refreshed.</span>
            </section>

            <section class="alert alert-warning" data-volunteer-performance-empty-state hidden>
              <strong>No performance history yet</strong>
              <span>Performance metrics will appear after tasks have been assigned and completed.</span>
            </section>

            <section class="alert alert-danger" data-volunteer-performance-error-state hidden>
              <strong data-volunteer-performance-error-title>Performance unavailable</strong>
              <span data-volunteer-performance-error-message>The volunteer performance request failed.</span>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Completion rate</span>
                <span class="metric-value" data-volunteer-performance-completion>0%</span>
                <span class="text-muted">Completed tasks compared with assigned work</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">On-time rate</span>
                <span class="metric-value" data-volunteer-performance-on-time>0%</span>
                <span class="text-muted">Timeliness across recent assignments</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Active tasks</span>
                <span class="metric-value" data-volunteer-performance-active>0</span>
                <span class="text-muted">Current assignment count</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Completed tasks</span>
                <span class="metric-value" data-volunteer-performance-completed>0</span>
                <span class="text-muted">Total completed tasks in the current history set</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Performance summary</p>
                    <p class="text-muted">High-level personal progress cues without exposing cross-volunteer rankings.</p>
                  </div>
                  <span class="badge badge-success">Personal view</span>
                </div>
                <ul class="suggestion-list" data-volunteer-performance-summary-list>
                  <li class="suggestion-item">
                    <strong>No summary yet</strong>
                    <span class="suggestion-copy">Performance summary items will render here.</span>
                  </li>
                </ul>
              </article>

              <article class="table-shell span-8">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Recent event history</p>
                    <p class="text-muted">Recent event-level history gives the volunteer a clear view of completion and timeliness trends.</p>
                  </div>
                  <span class="badge badge-info">Recent history</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Role</th>
                        <th>Completed tasks</th>
                        <th>Completion rate</th>
                        <th>On-time rate</th>
                        <th>Highlight</th>
                      </tr>
                    </thead>
                    <tbody data-volunteer-performance-history-body>
                      <tr>
                        <td colspan="6">Volunteer performance history is loading.</td>
                      </tr>
                    </tbody>
                  </table>
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
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/volunteer-performance.js"></script>
  </body>
</html>