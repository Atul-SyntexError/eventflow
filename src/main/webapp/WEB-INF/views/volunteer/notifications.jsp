<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Volunteer Notifications</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/volunteer/notifications">
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
              <h1 class="page-title">Volunteer notifications with assignment updates, blocker escalations, and event change follow-up.</h1>
              <p class="page-lead">
                This preview turns the volunteer notification feed into a dedicated page so task changes, blocker notices, and event updates remain
                readable and actionable, especially on smaller screens.
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

          <div class="stack-lg" data-volunteer-notifications-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready notifications"
              data-preview-state-ready-copy="Showing the active volunteer notification feed with assignment and event updates."
              data-preview-state-loading-label="Loading notifications"
              data-preview-state-loading-copy="Skeleton placeholders simulate the volunteer notification feed while updates load."
              data-preview-state-empty-label="Empty notifications"
              data-preview-state-empty-copy="This simulates a successful volunteer response with no notifications yet."
              data-preview-state-error-label="Notifications error"
              data-preview-state-error-copy="This simulates a failed volunteer notification request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Unread</span>
                <span class="metric-value" data-volunteer-notification-unread>0</span>
                <span class="text-muted">Unread items in the current feed</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Assignment updates</span>
                <span class="metric-value" data-volunteer-notification-assignments>0</span>
                <span class="text-muted">Task changes and delivery updates</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Event changes</span>
                <span class="metric-value" data-volunteer-notification-events>0</span>
                <span class="text-muted">Event-wide timing or route changes</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Total feed items</span>
                <span class="metric-value" data-volunteer-notification-total>0</span>
                <span class="text-muted">Notification history available in this preview</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Notification filters</p>
                    <p class="text-muted">Keep the feed focused on unread items or open the full personal notification history.</p>
                  </div>
                  <button class="button button-ghost" type="button" data-volunteer-notification-reset>Reset</button>
                </div>
                <div class="form-mode-row">
                  <button class="form-mode-button is-active" type="button" data-volunteer-notification-filter data-filter="ALL">All</button>
                  <button class="form-mode-button" type="button" data-volunteer-notification-filter data-filter="UNREAD">Unread</button>
                  <button class="form-mode-button" type="button" data-volunteer-notification-filter data-filter="BLOCKER">Blockers</button>
                </div>
                <p class="text-muted" data-volunteer-notification-filter-summary>Showing the full volunteer notification feed.</p>
              </article>

              <article class="component-panel span-8 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Notification feed</p>
                    <p class="text-muted">Task changes, blocker notices, and event updates linked back to the volunteer routes.</p>
                  </div>
                  <span class="badge badge-info">Feed</span>
                </div>
                <ul class="suggestion-list" data-volunteer-notification-feed-list>
                  <li class="suggestion-item">
                    <strong>No notifications yet</strong>
                    <span class="suggestion-copy">Feed items will render here.</span>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/volunteer-notifications.js"></script>
  </body>
</html>