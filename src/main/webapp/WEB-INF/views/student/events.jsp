<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Event Discovery</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/events">
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
              <h1 class="page-title">Student event discovery with filters, capacity signals, and recommendation context.</h1>
              <p class="page-lead">
                This route now loads the live student event discovery catalog with search and filter controls plus registration and capacity cues
                from persisted event and registration data.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/dashboard">Back to dashboard</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-student-gate hidden>
            <strong data-student-gate-title>Student access is required</strong>
            <span data-student-gate-message>Use the student account before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/dashboard">Return to student dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-student-events-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready event discovery"
              data-preview-state-ready-copy="Showing the active student event discovery page with live search, filters, and event cards."
              data-preview-state-loading-label="Loading event discovery"
              data-preview-state-loading-copy="Skeleton placeholders simulate discovery cards while event listings load."
              data-preview-state-empty-label="Empty event discovery"
              data-preview-state-empty-copy="No discoverable student events are currently available."
              data-preview-state-error-label="Event discovery error"
              data-preview-state-error-copy="This simulates a failed event discovery request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Visible events</span>
                <span class="metric-value" data-student-events-total>0</span>
                <span class="text-muted">Discovery results after filters are applied</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Open registrations</span>
                <span class="metric-value" data-student-events-open>0</span>
                <span class="text-muted">Events still accepting registrations</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Limited seats</span>
                <span class="metric-value" data-student-events-limited>0</span>
                <span class="text-muted">Events likely to need attention soon</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Recommended</span>
                <span class="metric-value" data-student-events-recommended>0</span>
                <span class="text-muted">Discovery cards with a recommendation match</span>
              </article>
            </section>

            <section class="component-panel filter-shell">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Event discovery filters</p>
                  <p class="text-muted">Search the event catalog and narrow by category, registration state, or capacity without leaving the student flow.</p>
                </div>
                <button class="button button-ghost" type="button" data-student-events-reset-filters>Reset filters</button>
              </div>

              <div class="filter-grid">
                <label class="field">
                  <span class="field-label">Search events</span>
                  <input class="control" type="search" placeholder="Event name or venue" data-student-events-search />
                </label>
                <label class="field">
                  <span class="field-label">Category</span>
                  <select class="select-control" data-student-events-category-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Registration status</span>
                  <select class="select-control" data-student-events-registration-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Capacity</span>
                  <select class="select-control" data-student-events-capacity-filter></select>
                </label>
              </div>

              <div class="filter-summary">
                <span data-student-events-filter-summary>Showing the full student event catalog.</span>
                <span class="mono-copy" data-student-events-filter-note>Event detail is now live with recommendation cues. Discovery summaries stay narrower for now.</span>
              </div>
            </section>

            <section class="section-grid">
              <article class="component-panel span-8 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Event cards</p>
                    <p class="text-muted">Student discovery results with registration and capacity cues visible before opening event detail.</p>
                  </div>
                  <span class="badge badge-info">Discovery</span>
                </div>
                <div class="stack-sm" data-student-events-card-list>
                  <article class="detail-summary-card">
                    <strong>No events loaded yet</strong>
                    <span class="text-muted">Discovery cards will render here.</span>
                  </article>
                </div>
                <div class="empty-inline-state" data-student-events-empty-state hidden>
                  No events match the current filters. Reset the filters to restore the full discovery catalog.
                </div>
              </article>

              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Recommendation context</p>
                    <p class="text-muted">Open event detail for live recommendation cues while this discovery summary panel remains intentionally lightweight.</p>
                  </div>
                  <span class="badge badge-success">Match cues</span>
                </div>
                <ul class="suggestion-list" data-student-events-recommendation-list>
                  <li class="suggestion-item">
                    <strong>No recommendation cues yet</strong>
                    <span class="suggestion-copy">Matched recommendation items will render here.</span>
                  </li>
                </ul>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

    <script id="student-events-bootstrap" type="application/json">${studentEventsBootstrapJson}</script>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-role-page.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-preview-state.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-task-ui-utils.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-events.js"></script>
  </body>
</html>