<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Registrations</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/registrations">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 10 student module</p>
              <h1 class="page-title">Registered events, status badges, and next-step actions.</h1>
              <p class="page-lead">
                This route now loads the current student's persisted registration records with contract-backed status badges and
                quick links into check-in, feedback, or event detail depending on the current registration state.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/events">Back to discovery</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/student/check-in.jsp">Open check-in</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-student-gate hidden>
            <strong data-student-gate-title>Student access is required</strong>
            <span data-student-gate-message>Use the student account before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/dashboard">Return to dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-student-registrations-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready registrations view"
              data-preview-state-ready-copy="Showing the current persisted student registrations list with status and quick-action links."
              data-preview-state-loading-label="Loading registrations"
              data-preview-state-loading-copy="Skeleton placeholders simulate the student registrations list while route data loads."
              data-preview-state-empty-label="Empty registrations"
              data-preview-state-empty-copy="The current student has no persisted registrations yet."
              data-preview-state-error-label="Registrations error"
              data-preview-state-error-copy="This simulates a failed student registration request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Total records</span>
                <span class="metric-value" data-student-registrations-total>0</span>
                <span class="text-muted">All current registration records in this preview</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Registered</span>
                <span class="metric-value" data-student-registrations-registered>0</span>
                <span class="text-muted">Events ready for future check-in</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Checked in</span>
                <span class="metric-value" data-student-registrations-checked-in>0</span>
                <span class="text-muted">Events already confirmed on arrival</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Waitlisted</span>
                <span class="metric-value" data-student-registrations-waitlisted>0</span>
                <span class="text-muted">Registrations still pending capacity</span>
              </article>
            </section>

            <section class="component-panel stack-md">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Registration filters</p>
                  <p class="text-muted">Review all, registered, checked-in, or waitlisted student event records.</p>
                </div>
                <button class="button button-ghost" type="button" data-student-registrations-reset>Reset filters</button>
              </div>

              <div class="form-mode-row">
                <button class="form-mode-button is-active" type="button" data-student-registrations-filter data-filter="ALL">All</button>
                <button class="form-mode-button" type="button" data-student-registrations-filter data-filter="REGISTERED">Registered</button>
                <button class="form-mode-button" type="button" data-student-registrations-filter data-filter="CHECKED_IN">Checked in</button>
                <button class="form-mode-button" type="button" data-student-registrations-filter data-filter="WAITLISTED">Waitlisted</button>
              </div>

              <p class="text-muted" data-student-registrations-summary>Showing the full registration list.</p>
            </section>

            <section class="component-panel stack-md">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Registered events</p>
                  <p class="text-muted">Each row includes the status and the next route the student is expected to open.</p>
                </div>
                <span class="badge badge-info">Route actions</span>
              </div>

              <div class="table-shell">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Schedule</th>
                      <th>Next action</th>
                    </tr>
                  </thead>
                  <tbody data-student-registrations-body>
                    <tr>
                      <td colspan="4">Registration rows will render here.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

    <script id="student-registrations-bootstrap" type="application/json">${studentRegistrationsBootstrapJson}</script>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-role-page.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-preview-state.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-task-ui-utils.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-registrations.js"></script>
  </body>
</html>