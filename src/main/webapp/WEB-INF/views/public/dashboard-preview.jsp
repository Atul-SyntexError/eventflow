<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Dashboard Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 2 mock dashboard</p>
              <h1 class="page-title">Role-aware redirect preview</h1>
              <p class="page-lead">
                This page resolves the mock login response into a preview of the route, shared shell behavior,
                notification center, and session controls that later role dashboards will inherit.
              </p>
            </div>
            <div class="flash-banner flash-banner-success" data-session-banner>
              <strong data-session-banner-title>Signed in successfully</strong>
              <span data-session-banner-message>Redirected using the mock `LoginResponseDto.redirectPath` contract.</span>
            </div>
          </section>

          <section class="preview-grid">
            <article class="preview-card preview-primary">
              <div class="split">
                <div class="stack-sm">
                  <p class="panel-title">Resolved landing route</p>
                  <p class="text-muted">Role-aware frontend redirect behavior is mocked here before controller wiring exists.</p>
                </div>
                <span class="badge badge-info" data-role-badge>Role pending</span>
              </div>

              <div class="session-highlight">
                <span class="session-avatar" data-session-avatar>EF</span>
                <div class="stack-sm">
                  <p class="text-strong"><strong data-session-name>Guest preview</strong></p>
                  <p class="text-muted" data-session-email>No session loaded yet.</p>
                </div>
              </div>

              <ul class="route-list" data-route-list>
                <li class="route-item"><span>Resolved route</span><span class="mono-copy">No route yet</span></li>
              </ul>

              <div class="button-row">
                <a class="button button-secondary" href="${pageContext.request.contextPath}/login.jsp">Return to login</a>
                <button type="button" class="button button-ghost" data-logout-preview>Clear mock session</button>
              </div>
            </article>

            <article class="preview-card preview-secondary">
              <p class="panel-title">Session snapshot</p>
              <ul class="session-fact-list">
                <li class="session-fact"><span>Role</span><span class="mono-copy" data-session-role>UNKNOWN</span></li>
                <li class="session-fact"><span>Unread notifications</span><span class="mono-copy" data-session-unread>0</span></li>
                <li class="session-fact"><span>Last login</span><span class="mono-copy" data-session-last-login>Not available</span></li>
                <li class="session-fact"><span>Permissions</span><span class="mono-copy" data-session-permissions>None</span></li>
              </ul>
            </article>

            <article class="preview-card preview-primary">
              <p class="panel-title">Shared async and retry patterns</p>
              <div class="session-grid">
                <div class="retry-panel" data-no-session-panel hidden>
                  <strong>No mock session found</strong>
                  <span>Use the login page first, or return there now to generate a mock `RoleSessionDto`.</span>
                  <div class="button-row">
                    <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login</a>
                  </div>
                </div>

                <div class="retry-panel">
                  <strong>AJAX recovery preview</strong>
                  <span>Shared retry panels are ready for session expiry, notification fetch failures, and dashboard widget reloads.</span>
                  <div class="button-row">
                    <button type="button" class="button button-secondary" data-refresh-preview>Retry mock fetch</button>
                  </div>
                </div>
              </div>
            </article>

            <article class="preview-card preview-secondary">
              <p class="panel-title">Notification center shell</p>
              <p class="text-muted">Use the top-right notification button to open the shared panel. Its list is populated from frontend role mocks.</p>
              <div class="alert alert-info">
                <strong>Shared shell rule</strong>
                <span>Notifications, account controls, and session feedback should be consistent across all role dashboards.</span>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/state/mock-session-data.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/dashboard-preview.js"></script>
  </body>
</html>