<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Notifications</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/notifications">
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
              <h1 class="page-title">Student notification feed with route-level follow-up actions.</h1>
              <p class="page-lead">
                This route covers the student notification feed with schedule changes, reminders, and announcement items that link back
                into the discovery, detail, check-in, feedback, and registrations routes already built in this phase.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/dashboard">Back to dashboard</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/student/events">Open discovery</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-student-gate hidden>
            <strong data-student-gate-title>Student access is required</strong>
            <span data-student-gate-message>Use the student demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/dashboard">Return to dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-student-notifications-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready notification feed"
              data-preview-state-ready-copy="Showing the active student notification feed with follow-up route links."
              data-preview-state-loading-label="Loading notifications"
              data-preview-state-loading-copy="Skeleton placeholders simulate the student notification feed while route data loads."
              data-preview-state-empty-label="Empty notifications"
              data-preview-state-empty-copy="This simulates a successful student notification response with no updates yet."
              data-preview-state-error-label="Notifications error"
              data-preview-state-error-copy="This simulates a failed student notification request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Unread</span>
                <span class="metric-value" data-student-notification-unread>0</span>
                <span class="text-muted">Unread items in this student feed</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Schedule changes</span>
                <span class="metric-value" data-student-notification-schedule>0</span>
                <span class="text-muted">Route-level schedule updates</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Reminders</span>
                <span class="metric-value" data-student-notification-reminders>0</span>
                <span class="text-muted">Check-in or feedback follow-up reminders</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Total</span>
                <span class="metric-value" data-student-notification-total>0</span>
                <span class="text-muted">Total feed items currently loaded</span>
              </article>
            </section>

            <section class="component-panel stack-md">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Notification filters</p>
                  <p class="text-muted">Filter the student feed to unread, schedule changes, or reminders.</p>
                </div>
                <button class="button button-ghost" type="button" data-student-notification-reset>Reset filters</button>
              </div>

              <div class="form-mode-row">
                <button class="form-mode-button is-active" type="button" data-student-notification-filter data-filter="ALL">All</button>
                <button class="form-mode-button" type="button" data-student-notification-filter data-filter="UNREAD">Unread</button>
                <button class="form-mode-button" type="button" data-student-notification-filter data-filter="SCHEDULE_CHANGE">Schedule changes</button>
                <button class="form-mode-button" type="button" data-student-notification-filter data-filter="REMINDER">Reminders</button>
              </div>

              <p class="text-muted" data-student-notification-summary>Showing the full student notification feed.</p>
            </section>

            <section class="component-panel stack-md">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Student notification feed</p>
                  <p class="text-muted">Each item resolves to the next relevant student route.</p>
                </div>
                <span class="badge badge-info">Follow-up routes</span>
              </div>
              <ul class="suggestion-list" data-student-notification-feed>
                <li class="suggestion-item">
                  <strong>No notifications loaded yet</strong>
                  <span class="suggestion-copy">Student notification items will render here.</span>
                </li>
              </ul>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-notifications.js"></script>
  </body>
</html>