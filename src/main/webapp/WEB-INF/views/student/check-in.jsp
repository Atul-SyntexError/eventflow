<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Check-In</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/check-in">
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
              <h1 class="page-title">Student check-in confirmation flow.</h1>
              <p class="page-lead">
                This route now loads the current student's live check-in eligibility, validates the confirmation code against the event,
                and records attendance for the active event window.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/registrations">Back to registrations</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/student/feedback">Open feedback</a>
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

          <div class="stack-lg" data-student-checkin-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready check-in flow"
              data-preview-state-ready-copy="Showing the current student check-in flow with live event eligibility and confirmation state."
              data-preview-state-loading-label="Loading check-in"
              data-preview-state-loading-copy="Skeleton placeholders simulate the student check-in flow while route data loads."
              data-preview-state-empty-label="Empty check-in"
              data-preview-state-empty-copy="The current student has no events in the active check-in window."
              data-preview-state-error-label="Check-in error"
              data-preview-state-error-copy="This simulates a failed student check-in request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Eligible events</span>
                <span class="metric-value" data-student-checkin-eligible-count>0</span>
                <span class="text-muted">Registrations that can reach the check-in route</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Recorded check-ins</span>
                <span class="metric-value" data-student-checkin-recorded-count>0</span>
                <span class="text-muted">Recent confirmed arrivals in this preview</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Selected event</span>
                <span class="metric-value" data-student-checkin-selected-event>--</span>
                <span class="text-muted">Current event chosen for the confirmation request</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Current status</span>
                <span class="metric-value" data-student-checkin-selected-status>--</span>
                <span class="text-muted">Status before or after the preview submission</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-7 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Check-in request</p>
                    <p class="text-muted">Submit the live check-in endpoint with the current event selector and confirmation code.</p>
                  </div>
                  <span class="badge badge-info">Check-in</span>
                </div>

                <div class="alert alert-danger" hidden data-student-checkin-alert>
                  <strong data-student-checkin-alert-title>Unable to record check-in</strong>
                  <span data-student-checkin-alert-message>Fix the highlighted issues and try again.</span>
                </div>

                <div class="filter-grid">
                  <label class="field field-span-full">
                    <span class="field-label">Registered event</span>
                    <select class="select-control" data-student-checkin-event-select></select>
                    <span class="field-error" hidden data-student-checkin-event-error></span>
                  </label>
                  <label class="field field-span-full">
                    <span class="field-label">Confirmation code</span>
                    <input class="control" type="text" placeholder="Enter event confirmation code" data-student-checkin-code-input />
                    <span class="field-error" hidden data-student-checkin-code-error></span>
                  </label>
                </div>

                <div class="detail-summary-card stack-sm">
                  <div class="detail-key-value">
                    <span>Venue</span>
                    <strong data-student-checkin-venue>--</strong>
                  </div>
                  <div class="detail-key-value">
                    <span>Time window</span>
                    <strong data-student-checkin-schedule>--</strong>
                  </div>
                  <p class="text-muted" data-student-checkin-code-hint>Confirmation code guidance will render here.</p>
                </div>

                <div class="button-row">
                  <button class="button button-primary" type="button" data-student-checkin-submit>Record check-in</button>
                  <button class="button button-secondary" type="button" data-student-checkin-reset>Reset form</button>
                </div>

                <p class="text-muted" data-student-checkin-summary>
                  Select an eligible event to submit a live check-in request.
                </p>
              </article>

              <article class="component-panel span-5 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Recent confirmations</p>
                    <p class="text-muted">Keep recently completed live check-ins visible in the student flow.</p>
                  </div>
                  <span class="badge badge-success">Attendance</span>
                </div>
                <ul class="activity-list" data-student-checkin-recent-list>
                  <li class="activity-item">
                    <strong>No confirmations loaded yet</strong>
                    <span class="activity-meta">Recent check-in results will render here.</span>
                  </li>
                </ul>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

    <script id="student-checkin-bootstrap" type="application/json">${studentCheckInBootstrapJson}</script>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-role-page.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-preview-state.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-task-ui-utils.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-check-in.js"></script>
  </body>
</html>