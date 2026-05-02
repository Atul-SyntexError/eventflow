<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Admin Reports</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body
    data-context-path="${pageContext.request.contextPath}"
    data-current-route="/admin/reports"
    data-report-selected-id="<c:out value='${requestScope.reportSelectedEventId}' />">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 13 admin reporting</p>
              <h1 class="page-title">Admin reports with live attendance, feedback, volunteer, and health summaries.</h1>
              <p class="page-lead">
                This analytics landing now consumes the Phase 13 report summary API so admins can review event performance
                without relying on dashboard preview anchors.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/admin/dashboard.jsp">Back to admin dashboard</a>
              <button class="button button-primary" type="button" data-report-refresh-button>Refresh selected report</button>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-admin-gate hidden>
            <strong data-admin-gate-title>Admin access is required</strong>
            <span data-admin-gate-message>Sign in with the admin account before opening the reporting screen.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/admin/dashboard.jsp">Return to dashboard preview</a>
            </div>
          </section>

          <div class="stack-lg" data-admin-reports-content hidden>
            <section class="component-panel filter-shell">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Report scope</p>
                  <p class="text-muted">Choose an event to load the current report summary contract and compare attendance, sentiment, volunteer coverage, and event health.</p>
                </div>
                <span class="badge badge-info" data-report-status-badge>Ready</span>
              </div>

              <div class="filter-grid">
                <label class="field">
                  <span class="field-label">Event</span>
                  <select class="select-control" data-report-event-select></select>
                </label>
              </div>

              <div class="filter-summary">
                <span data-report-selection-summary>No report selected.</span>
                <span class="mono-copy" data-report-last-updated>Waiting for report data.</span>
              </div>
            </section>

            <section class="alert alert-info" data-report-loading-state hidden>
              <strong>Loading report summary</strong>
              <span>The selected event report is being refreshed from the Phase 13 reporting API.</span>
            </section>

            <section class="alert alert-warning" data-report-empty-state hidden>
              <strong>No events available</strong>
              <span>Create or publish an admin event before opening the reporting screen.</span>
            </section>

            <section class="alert alert-danger" data-report-error-state hidden>
              <strong data-report-error-title>Report unavailable</strong>
              <span data-report-error-message>The report request failed. Try refreshing the selected event.</span>
            </section>

            <div class="stack-lg" data-report-content-shell hidden>
              <section class="metric-grid">
                <article class="metric-card">
                  <span class="metric-label">Tracked events</span>
                  <span class="metric-value" data-report-total-events>0</span>
                  <span class="text-muted">Events currently available for admin reporting.</span>
                </article>
                <article class="metric-card">
                  <span class="metric-label">Forecast fill rate</span>
                  <span class="metric-value" data-report-fill-rate>0%</span>
                  <span class="text-muted">Confirmed registrations versus the attendance plan.</span>
                </article>
                <article class="metric-card">
                  <span class="metric-label">Projected walk-ins</span>
                  <span class="metric-value" data-report-walk-ins>0</span>
                  <span class="text-muted">Additional arrivals needed to close the current attendance gap.</span>
                </article>
                <article class="metric-card">
                  <span class="metric-label">Health score</span>
                  <span class="metric-value" data-report-health-score>0.00</span>
                  <span class="text-muted">Latest persisted health signal for the selected event.</span>
                </article>
              </section>

              <section class="section-grid">
                <article class="component-panel span-4 detail-card">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Selected event</p>
                      <p class="text-muted">The reporting screen stays scoped to one admin event at a time.</p>
                    </div>
                    <span class="badge badge-neutral" data-report-event-status>Pending</span>
                  </div>

                  <div class="detail-card-header">
                    <strong data-report-event-name>No event selected</strong>
                    <span class="signal-meta" data-report-event-meta>Select an event to review its report summary.</span>
                  </div>

                  <div class="detail-stat-grid">
                    <div class="detail-summary-card">
                      <span class="module-subtitle">Attendance note</span>
                      <span class="signal-meta" data-report-attendance-note>Report details will appear here once an event is selected.</span>
                    </div>
                    <div class="detail-summary-card">
                      <span class="module-subtitle">Health trend</span>
                      <span class="inline-metric" data-report-health-trend>Pending</span>
                      <span class="signal-meta" data-report-health-snapshot>Waiting for the latest health snapshot.</span>
                    </div>
                  </div>
                </article>

                <article class="component-panel span-4 dashboard-section">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Attendance summary</p>
                      <p class="text-muted">Current plan coverage and operational buffer for the selected event.</p>
                    </div>
                    <span class="badge badge-info">Attendance</span>
                  </div>
                  <ul class="report-preview-list report-card-grid">
                    <li class="report-preview-item">
                      <strong>Volunteer coverage</strong>
                      <span class="report-meta" data-report-volunteer-coverage>0%</span>
                    </li>
                    <li class="report-preview-item">
                      <strong>No-show buffer</strong>
                      <span class="report-meta" data-report-no-show-buffer>0%</span>
                    </li>
                  </ul>
                </article>

                <article class="component-panel span-4 dashboard-section">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Feedback analysis</p>
                      <p class="text-muted">Sentiment summary derived from the persisted feedback aggregate.</p>
                    </div>
                    <span class="badge badge-success" data-report-feedback-trend>Pending</span>
                  </div>
                  <div class="stack-sm">
                    <strong data-report-feedback-title>Feedback summary</strong>
                    <p class="text-muted" data-report-feedback-summary>Feedback insights will render after the report loads.</p>
                  </div>
                </article>

                <article class="component-panel span-6 dashboard-section">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Volunteer performance</p>
                      <p class="text-muted">Coverage and task-completion context sourced from the live event workload.</p>
                    </div>
                    <span class="badge badge-warning" data-report-volunteer-trend>Pending</span>
                  </div>
                  <div class="stack-sm">
                    <strong data-report-volunteer-title>Volunteer performance</strong>
                    <p class="text-muted" data-report-volunteer-summary>Volunteer performance insights will render after the report loads.</p>
                  </div>
                </article>

                <article class="component-panel span-6 dashboard-section">
                  <div class="section-header">
                    <div class="stack-sm">
                      <p class="panel-title">Health snapshot</p>
                      <p class="text-muted">Latest attendance, engagement, and volunteer efficiency metrics for the selected event.</p>
                    </div>
                    <span class="badge badge-neutral" data-report-health-badge>Pending</span>
                  </div>

                  <div class="detail-stat-grid">
                    <div class="detail-summary-card">
                      <span class="module-subtitle">Attendance ratio</span>
                      <span class="inline-metric" data-report-health-attendance>0%</span>
                    </div>
                    <div class="detail-summary-card">
                      <span class="module-subtitle">Engagement score</span>
                      <span class="inline-metric" data-report-health-engagement>0.00</span>
                    </div>
                    <div class="detail-summary-card">
                      <span class="module-subtitle">Volunteer efficiency</span>
                      <span class="inline-metric" data-report-health-volunteer>0.00</span>
                    </div>
                    <div class="detail-summary-card">
                      <span class="module-subtitle">Snapshot timestamp</span>
                      <span class="signal-meta" data-report-health-timestamp>Waiting for report data.</span>
                    </div>
                  </div>
                </article>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>

    <%@ include file="../partials/shell-overlays.jspf" %>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/state/mock-session-data.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-session-shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-role-page.js"></script>
    <script id="admin-report-bootstrap" type="application/json"><c:out value="${requestScope.adminReportBootstrapJson}" /></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/admin-reports.js"></script>
  </body>
</html>