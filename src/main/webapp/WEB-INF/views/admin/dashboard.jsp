<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Admin Dashboard Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/admin/dashboard">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container dashboard-grid">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 3 admin module</p>
              <h1 class="page-title">Admin live overview with health, risk, and report signals.</h1>
              <p class="page-lead">
                This dashboard starts the admin frontend module using the approved contracts for health score,
                risk prediction, notifications, and report previews before backend DTOs are wired in.
              </p>
            </div>
            <div class="flash-banner flash-banner-warning" data-admin-access-banner hidden>
              <strong data-admin-access-banner-title>Admin preview pending</strong>
              <span data-admin-access-banner-message>Admin mock data will appear when an admin session is available.</span>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-admin-gate hidden>
            <strong data-admin-gate-title>Admin access is required</strong>
            <span data-admin-gate-message>Use the admin demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/error/403.jsp">Open unauthorized preview</a>
            </div>
          </section>

          <div data-admin-dashboard-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready dashboard"
              data-preview-state-ready-copy="Showing the active admin dashboard preview against the frozen mock payloads."
              data-preview-state-loading-label="Loading dashboard"
              data-preview-state-loading-copy="Skeleton placeholders simulate the dashboard while admin metrics are still loading."
              data-preview-state-empty-label="Empty dashboard"
              data-preview-state-empty-copy="This simulates a successful dashboard response with no current admin records yet."
              data-preview-state-error-label="Dashboard error"
              data-preview-state-error-copy="This simulates a failed dashboard request with retry messaging and safe fallbacks."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="dashboard-section">
              <div class="metric-grid">
                <article class="metric-card">
                  <span class="metric-label">Active events</span>
                  <span class="metric-value" data-kpi-active-events>0</span>
                  <span class="text-muted">Open and upcoming admin-managed events</span>
                </article>
                <article class="metric-card">
                  <span class="metric-label">Live events</span>
                  <span class="metric-value" data-kpi-live-events>0</span>
                  <span class="text-muted">Event health snapshots are actively refreshing</span>
                </article>
                <article class="metric-card">
                  <span class="metric-label">Total users</span>
                  <span class="metric-value" data-kpi-total-users>0</span>
                  <span class="text-muted">Across admins, organizers, volunteers, and students</span>
                </article>
                <article class="metric-card">
                  <span class="metric-label">Volunteer coverage</span>
                  <span class="metric-value" data-kpi-volunteer-coverage>0%</span>
                  <span class="text-muted">Weighted coverage against live event demand</span>
                </article>
              </div>
            </section>

            <section class="section-grid dashboard-section">
              <article class="component-panel span-7 health-hero">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Event health score</p>
                    <p class="text-muted">Admin dashboard card aligned to the future `EventHealthSnapshotDto` contract.</p>
                  </div>
                  <span class="badge badge-success">Live preview</span>
                </div>

                <div class="health-score-row">
                  <span class="health-score-chip" data-health-score>0</span>
                  <div class="health-detail">
                    <strong data-health-event-name>No live event selected</strong>
                    <span class="signal-meta" data-health-snapshot>Snapshot pending</span>
                  </div>
                </div>

                <div class="health-mini-grid" data-health-signal-list>
                  <div class="health-mini-card">
                    <strong>Attendance ratio</strong>
                    <span class="signal-meta">Waiting for mock data</span>
                  </div>
                </div>
              </article>

              <article class="component-panel span-5 dashboard-section">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Risk prediction panel</p>
                    <p class="text-muted">Flags attendance, staffing, and schedule issues before they become operational failures.</p>
                  </div>
                  <span class="badge badge-warning">Ranked</span>
                </div>
                <ul class="risk-list" data-risk-list>
                  <li class="risk-item">
                    <strong>No risk data loaded</strong>
                    <span class="risk-meta">The preview will hydrate this panel from the mock admin dashboard payload.</span>
                  </li>
                </ul>
              </article>

              <article class="table-shell span-8">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Event watchlist</p>
                    <p class="text-muted">Admin event management starts here with live status, attendance, and risk context.</p>
                  </div>
                  <span class="badge badge-neutral">Preview table</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Status</th>
                        <th>Venue</th>
                        <th>Registered / Expected</th>
                        <th>Checked in</th>
                        <th>Health</th>
                        <th>Risk</th>
                      </tr>
                    </thead>
                    <tbody data-event-table-body>
                      <tr>
                        <td colspan="7">Admin event watchlist is waiting for mock data.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <article id="notification-preview" class="component-panel span-4 dashboard-section">
                <p class="panel-title">Recent admin feed</p>
                <ul class="admin-feed-list" data-admin-feed-list>
                  <li class="admin-feed-item">
                    <strong>No feed items yet</strong>
                    <span class="feed-meta">Live admin updates will be rendered here.</span>
                  </li>
                </ul>
              </article>

              <article class="component-panel span-5 dashboard-section">
                <p class="panel-title">User management snapshot</p>
                <p class="text-muted">A quick admin view of roles, availability, and performance before the dedicated user screens land.</p>
                <ul class="admin-user-list" data-admin-user-list>
                  <li class="admin-user-item">
                    <strong>No user snapshot yet</strong>
                    <span class="user-meta-row">Mock data pending</span>
                  </li>
                </ul>
              </article>

              <article id="report-preview" class="component-panel span-7 dashboard-section">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Report preview surfaces</p>
                    <p class="text-muted">Attendance, volunteer performance, and sentiment cards preview the reporting layer without waiting for backend aggregation.</p>
                  </div>
                  <span class="badge badge-info">Preview cards</span>
                </div>
                <ul class="report-preview-list report-card-grid" data-report-preview-list>
                  <li class="report-card">
                    <strong>No report previews yet</strong>
                    <span class="report-meta">Mock report data pending</span>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/admin-dashboard.js"></script>
  </body>
</html>