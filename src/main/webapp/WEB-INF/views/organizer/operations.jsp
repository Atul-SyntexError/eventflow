<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Organizer Event Operations Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/organizer/events/{eventId}/operations">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 4 organizer module</p>
              <h1 class="page-title">Organizer event operations with timeline, workload map, and schedule adjustment previews.</h1>
              <p class="page-lead">
                This page covers the live operations contract for an organizer by combining the event timeline, delay alerts, workload lanes,
                and schedule adjustment recommendations on the same reusable Phase 4 shell and preview-state path.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/organizer/tasks/board.jsp">Back to task board</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/organizer/tasks.jsp">Open task table</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-organizer-gate hidden>
            <strong data-organizer-gate-title>Organizer access is required</strong>
            <span data-organizer-gate-message>Use the organizer demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login.jsp">Open login preview</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/organizer/dashboard.jsp">Return to organizer dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-organizer-operations-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready event operations"
              data-preview-state-ready-copy="Showing the active organizer event operations preview with timeline and schedule adjustments."
              data-preview-state-loading-label="Loading event operations"
              data-preview-state-loading-copy="Skeleton placeholders simulate the live operations view while event data loads."
              data-preview-state-empty-label="Empty event operations"
              data-preview-state-empty-copy="This simulates a successful event operations response with no live workload yet."
              data-preview-state-error-label="Event operations error"
              data-preview-state-error-copy="This simulates a failed operations request with recovery messaging."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Event window</span>
                <span class="metric-value" data-operations-event-window>--</span>
                <span class="text-muted">Current operations window for the selected organizer event</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Timeline items</span>
                <span class="metric-value" data-operations-timeline-count>0</span>
                <span class="text-muted">Operational milestones and handoff windows</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Delay alerts</span>
                <span class="metric-value" data-operations-delay-count>0</span>
                <span class="text-muted">Active schedule or task pressure indicators</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Adjustments</span>
                <span class="metric-value" data-operations-adjustment-count>0</span>
                <span class="text-muted">Recommended schedule changes for organizer review</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-8 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Operations timeline</p>
                    <p class="text-muted">Timeline items preview the live operations route defined in the Phase 0 organizer inventory.</p>
                  </div>
                  <span class="badge badge-info" data-operations-event-name>Organizer event</span>
                </div>
                <div class="timeline-shell">
                  <ul class="timeline-list" data-operations-timeline-list>
                    <li class="timeline-item">
                      <strong>No timeline items yet</strong>
                      <span class="timeline-meta">Mock operations data will render here.</span>
                    </li>
                  </ul>
                </div>
              </article>

              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Delay alert feed</p>
                    <p class="text-muted">Organizer-specific delay pressure tied directly to the active event operations flow.</p>
                  </div>
                  <span class="badge badge-warning">Delay feed</span>
                </div>
                <ul class="delay-alert-list" data-operations-delay-list>
                  <li class="delay-alert-item severity-low">
                    <strong>No operations alerts yet</strong>
                    <span class="delay-meta">Mock delay data will render here.</span>
                  </li>
                </ul>
              </article>

              <article class="component-panel span-6 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Workload lanes</p>
                    <p class="text-muted">A simple workload map showing where organizer attention is currently concentrated.</p>
                  </div>
                  <span class="badge badge-neutral">Workload</span>
                </div>
                <div class="workload-grid" data-operations-workload-grid>
                  <article class="workload-card">
                    <strong>No workload data yet</strong>
                    <span class="workload-copy">Mock operations data will render here.</span>
                  </article>
                </div>
              </article>

              <article class="component-panel span-6 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Schedule adjustments</p>
                    <p class="text-muted">Preview of recommendation cards that guide organizer schedule changes before backend actions exist.</p>
                  </div>
                  <span class="badge badge-success">Suggested</span>
                </div>
                <ul class="adjustment-list" data-operations-adjustment-list>
                  <li class="adjustment-item">
                    <strong>No schedule adjustments yet</strong>
                    <span class="adjustment-copy">Mock operations data will render adjustment suggestions here.</span>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/organizer-operations.js"></script>
  </body>
</html>