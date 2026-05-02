<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Event Detail</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/events/{eventId}">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 11 student intelligence</p>
              <h1 class="page-title">Student event detail with live registration context and health snapshot data.</h1>
              <p class="page-lead">
                This route now loads the selected event from the live student detail contract with schedule context, resource planning,
                current registration state, the latest persisted health snapshot, and live recommendation cues. Event notices remain a later slice.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/events">Back to discovery</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/student/registrations">Open registrations</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-student-gate hidden>
            <strong data-student-gate-title>Student access is required</strong>
            <span data-student-gate-message>Use the student account before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/events">Return to discovery</a>
            </div>
          </section>

          <div class="stack-lg" data-student-detail-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready event detail"
              data-preview-state-ready-copy="Showing the active student event detail view with live registration and health snapshot data."
              data-preview-state-loading-label="Loading event detail"
              data-preview-state-loading-copy="Skeleton placeholders simulate the event detail page while live route data loads."
              data-preview-state-empty-label="Empty event detail"
              data-preview-state-empty-copy="No event detail is currently available for this route."
              data-preview-state-error-label="Event detail error"
              data-preview-state-error-copy="This simulates a failed student event detail request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Registration status</span>
                <span class="metric-value" data-student-detail-registration-metric>--</span>
                <span class="text-muted">Current registration state for this event</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Start time</span>
                <span class="metric-value" data-student-detail-start-metric>--</span>
                <span class="text-muted">Schedule reference from the event detail contract</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Health score</span>
                <span class="metric-value" data-student-detail-health-score-metric>--</span>
                <span class="text-muted">Latest persisted event health snapshot</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Health trend</span>
                <span class="metric-value" data-student-detail-health-trend-metric>--</span>
                <span class="text-muted">Direction of change from the recent snapshot history</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-8 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title" data-student-detail-title>Event detail</p>
                    <p class="text-muted" data-student-detail-meta>Schedule and venue information render here.</p>
                  </div>
                  <span class="badge badge-info" data-student-detail-category>Event</span>
                </div>

                <div class="detail-summary-card stack-sm">
                  <p class="task-card-copy" data-student-detail-description>Student event detail content will render here.</p>
                  <div class="detail-key-value">
                    <span>Registration window</span>
                    <strong data-student-detail-registration-window>--</strong>
                  </div>
                  <div class="detail-key-value">
                    <span>Expected attendance</span>
                    <strong data-student-detail-attendance>--</strong>
                  </div>
                </div>

                <section class="stack-md">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Event timeline</p>
                      <p class="text-muted">Student-facing schedule checkpoints from the shared event detail payload.</p>
                    </div>
                    <span class="badge badge-neutral">Schedule</span>
                  </div>
                  <ul class="stack-list" data-student-detail-timeline-list>
                    <li>Timeline items will render here.</li>
                  </ul>
                </section>

                <section class="stack-md">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Live updates</p>
                      <p class="text-muted">Notices attached to the selected event detail route.</p>
                    </div>
                    <span class="badge badge-warning">Live feed</span>
                  </div>
                  <ul class="activity-list" data-student-detail-live-update-list>
                    <li class="activity-item">
                      <strong>No updates loaded yet</strong>
                      <span class="activity-meta">Live detail notices will render here.</span>
                    </li>
                  </ul>
                </section>
              </article>

              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Registration action</p>
                    <p class="text-muted">Create a live registration when the event is still open for students.</p>
                  </div>
                  <span class="badge" data-student-detail-registration-badge>State</span>
                </div>

                <div class="detail-summary-card stack-sm">
                  <div class="detail-key-value">
                    <span>Status</span>
                    <strong data-student-detail-registration-status>--</strong>
                  </div>
                  <div class="detail-key-value">
                    <span>Last registration event</span>
                    <strong data-student-detail-registration-at>--</strong>
                  </div>
                  <p class="text-muted" data-student-detail-registration-copy>
                    Registration preview copy will render here.
                  </p>
                </div>

                <div class="button-row">
                  <button class="button button-primary" type="button" data-student-detail-register-button>Register now</button>
                  <button class="button button-secondary" type="button" data-student-detail-reset-button>Open registrations</button>
                </div>

                <p class="text-muted" data-student-detail-registration-summary>
                  Registration request output will render here after a live registration action is triggered.
                </p>

                <section class="stack-md">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Recommendation context</p>
                      <p class="text-muted">Live recommendation cues from the shared student recommendation endpoint.</p>
                    </div>
                    <span class="badge badge-success">Match</span>
                  </div>
                  <div class="detail-summary-card stack-sm">
                    <strong data-student-detail-recommendation-title>No recommendation loaded</strong>
                    <p class="task-card-copy" data-student-detail-recommendation-headline>Recommendation context will render here.</p>
                    <div class="tag-list" data-student-detail-recommendation-tags></div>
                  </div>
                </section>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

  <script id="student-event-detail-bootstrap" type="application/json">${studentEventDetailBootstrapJson}</script>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/state/mock-session-data.js"></script>
  <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-role-page.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-preview-state.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-task-ui-utils.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-event-detail.js"></script>
  </body>
</html>