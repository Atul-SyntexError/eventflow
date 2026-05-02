<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Dashboard</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/dashboard">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 6 student module</p>
              <h1 class="page-title">Student dashboard with personalized recommendations, upcoming registrations, and live event notices.</h1>
              <p class="page-lead">
                This first Phase 6 slice starts the student participation journey from the contracted dashboard route and keeps the
                experience anchored to recommendations, upcoming registrations, and live updates without bypassing the shared shell or preview-state path.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/dashboard.jsp">Shared dashboard preview</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Switch demo account</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-student-gate hidden>
            <strong data-student-gate-title>Student access is required</strong>
            <span data-student-gate-message>Use the student demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/error/403.jsp">Open unauthorized preview</a>
            </div>
          </section>

          <div class="stack-lg" data-student-dashboard-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready student dashboard"
              data-preview-state-ready-copy="Showing the active student dashboard with recommendations, registrations, and live notices."
              data-preview-state-loading-label="Loading student dashboard"
              data-preview-state-loading-copy="Skeleton placeholders simulate the student dashboard while recommendation and registration data loads."
              data-preview-state-empty-label="Empty student dashboard"
              data-preview-state-empty-copy="This simulates a successful student response with no recommendations or active registrations yet."
              data-preview-state-error-label="Student dashboard error"
              data-preview-state-error-copy="This simulates a failed student dashboard request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Recommended now</span>
                <span class="metric-value" data-student-recommended-count>0</span>
                <span class="text-muted">Events ranked for this student profile</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Upcoming registrations</span>
                <span class="metric-value" data-student-registration-count>0</span>
                <span class="text-muted">Registered events still ahead on the calendar</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Live updates</span>
                <span class="metric-value" data-student-live-update-count>0</span>
                <span class="text-muted">Fresh schedule changes, reminders, and announcements</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Checked in</span>
                <span class="metric-value" data-student-checked-in-count>0</span>
                <span class="text-muted">Registrations that have already completed attendance</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-7 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Recommended events</p>
                    <p class="text-muted">Personalized event suggestions anchored to the frozen student dashboard contract.</p>
                  </div>
                  <span class="badge badge-info">Recommendations</span>
                </div>
                <div class="stack-sm" data-student-recommendation-list>
                  <article class="detail-summary-card">
                    <strong>No recommendations yet</strong>
                    <span class="text-muted">Recommended event cards will render here.</span>
                  </article>
                </div>
              </article>

              <article class="table-shell span-5">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Upcoming registrations</p>
                    <p class="text-muted">A compact view of the next events this student has already registered for.</p>
                  </div>
                  <span class="badge badge-success">Registered</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Status</th>
                        <th>Start</th>
                      </tr>
                    </thead>
                    <tbody data-student-registration-body>
                      <tr>
                        <td colspan="3">Registration data is loading.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <article id="student-live-updates" class="component-panel span-12 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Live notices</p>
                    <p class="text-muted">Schedule changes, reminders, and event announcements that should be visible even before the dedicated notification route is built.</p>
                  </div>
                  <span class="badge badge-warning">Live feed</span>
                </div>
                <ul class="activity-list" data-student-live-update-list>
                  <li class="activity-item">
                    <strong>No live updates yet</strong>
                    <span class="activity-meta">Student live notices will render here.</span>
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
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-dashboard.js"></script>
  </body>
</html>