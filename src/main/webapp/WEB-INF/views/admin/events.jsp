<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Admin Event Management</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body
    data-context-path="${pageContext.request.contextPath}"
    data-current-route="/admin/events"
    data-event-initial-mode="<c:out value='${requestScope.eventInitialMode}' />"
    data-event-selected-id="<c:out value='${requestScope.eventSelectedId}' />">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 10 admin module</p>
              <h1 class="page-title">Admin event management with real filters, detail flow, and event CRUD controls.</h1>
              <p class="page-lead">
                This screen now runs on the Phase 10 backend event module while preserving the existing admin layout and
                the frozen `EventSummaryDto`, `EventDetailDto`, and `EventFormRequestDto` contracts.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/admin/dashboard.jsp">Back to admin dashboard</a>
              <button class="button button-primary" type="button" data-event-create-button>Start create flow</button>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-admin-gate hidden>
            <strong data-admin-gate-title>Admin access is required</strong>
            <span data-admin-gate-message>Use the admin demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/admin/dashboard.jsp">Return to dashboard preview</a>
            </div>
          </section>

          <div class="stack-lg" data-admin-events-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready events"
              data-preview-state-ready-copy="Showing the active admin event management preview with detail and planning flows."
              data-preview-state-loading-label="Loading events"
              data-preview-state-loading-copy="Skeleton placeholders simulate the event listing and planning surfaces while data loads."
              data-preview-state-empty-label="Empty events"
              data-preview-state-empty-copy="This simulates a successful event response with no matching records yet."
              data-preview-state-error-label="Event error"
              data-preview-state-error-copy="This simulates a failed event-management request with recovery messaging."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Total events</span>
                <span class="metric-value" data-events-total>0</span>
                <span class="text-muted">Admin-managed events across current and upcoming operations</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Live now</span>
                <span class="metric-value" data-events-live>0</span>
                <span class="text-muted">Currently active events feeding health and risk signals</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Drafts</span>
                <span class="metric-value" data-events-drafts>0</span>
                <span class="text-muted">Event plans still in pre-publish preparation</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Needs attention</span>
                <span class="metric-value" data-events-attention>0</span>
                <span class="text-muted">Events with material risk or planning coverage gaps</span>
              </article>
            </section>

            <section class="component-panel filter-shell">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Filters and quick actions</p>
                  <p class="text-muted">Search by code or title, narrow the table, then drive the create, detail, and edit preview states from one shared screen.</p>
                </div>
                <div class="button-row">
                  <button class="button button-ghost" type="button" data-event-reset-filters>Reset filters</button>
                  <button class="button button-secondary" type="button" data-event-focus-selected>Focus selected event</button>
                </div>
              </div>

              <div class="filter-grid">
                <label class="field">
                  <span class="field-label">Search events</span>
                  <input class="control" type="search" placeholder="Code, name, or venue" data-event-search />
                </label>
                <label class="field">
                  <span class="field-label">Status</span>
                  <select class="select-control" data-event-status-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Category</span>
                  <select class="select-control" data-event-category-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Risk level</span>
                  <select class="select-control" data-event-risk-filter></select>
                </label>
              </div>

              <div class="filter-summary">
                <span data-event-filter-summary>Showing all planned admin events.</span>
                <span class="mono-copy" data-event-selected-summary>No event selected.</span>
              </div>
            </section>

            <section class="section-grid">
              <article class="table-shell span-7">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Event listing</p>
                    <p class="text-muted">This table previews the eventual `/admin/events` screen with bulk context and direct transitions into detail and edit flows.</p>
                  </div>
                  <span class="badge badge-info">Filterable preview</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Event</th>
                        <th>Status</th>
                        <th>Venue</th>
                        <th>Window</th>
                        <th>Attendance</th>
                        <th>Risk</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody data-event-table-body>
                      <tr>
                        <td colspan="8">Admin event data is loading.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="empty-inline-state" data-event-empty-state hidden>
                  No events match the current filters. Reset the filters or switch back to the create flow.
                </div>
              </article>

              <article class="component-panel span-5 detail-card" id="event-detail-preview">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Selected event detail</p>
                    <p class="text-muted">Contract-aligned event detail preview with timeline, risk notes, and planning summary.</p>
                  </div>
                  <span class="badge badge-neutral" data-event-detail-status>Pending</span>
                </div>

                <div class="detail-card-header">
                  <strong data-event-detail-title>No event selected</strong>
                  <span class="signal-meta" data-event-detail-meta>Select a row to inspect the detail state.</span>
                </div>

                <p class="text-muted" data-event-detail-description>The selected event summary, live metrics, and planning coverage will render here.</p>

                <div class="detail-stat-grid">
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Health score</span>
                    <span class="inline-metric" data-event-detail-health>Pending</span>
                    <span class="signal-meta" data-event-detail-health-meta>No snapshot loaded</span>
                  </div>
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Attendance plan</span>
                    <span class="inline-metric" data-event-detail-fill-rate>0%</span>
                    <span class="signal-meta" data-event-detail-coverage>Volunteer coverage pending</span>
                  </div>
                </div>

                <div class="module-subsection">
                  <p class="module-subtitle">Resource plan</p>
                  <ul class="resource-note-list" data-event-resource-list>
                    <li>Resource requirements will appear when an event is selected.</li>
                  </ul>
                </div>

                <div class="module-subsection">
                  <p class="module-subtitle">Risk predictions</p>
                  <ul class="risk-list" data-event-risk-list>
                    <li class="risk-item">
                      <strong>No risk predictions loaded</strong>
                      <span class="risk-meta">Select an event to inspect its detail-level risk state.</span>
                    </li>
                  </ul>
                </div>

                <div class="module-subsection">
                  <p class="module-subtitle">Timeline preview</p>
                  <ul class="timeline-preview-list" data-event-timeline-list>
                    <li>No event timeline loaded.</li>
                  </ul>
                </div>
              </article>

              <article class="component-panel span-12 module-preview-shell" id="event-form-preview">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Create and edit event flow</p>
                    <p class="text-muted" data-event-form-caption>Use create mode for a fresh draft or switch to edit mode from a selected row.</p>
                  </div>
                  <div class="form-mode-row">
                    <button class="form-mode-button is-active" type="button" data-event-mode-button data-mode="create">Create draft</button>
                    <button class="form-mode-button" type="button" data-event-mode-button data-mode="edit">Edit selected</button>
                  </div>
                </div>

                <div class="form-shell">
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">Event name</span>
                      <input class="control" type="text" data-event-form-name />
                    </label>
                    <label class="field">
                      <span class="field-label">Category</span>
                      <select class="select-control" data-event-form-category>
                        <option>Conference</option>
                        <option>Expo</option>
                        <option>Workshop</option>
                        <option>Meetup</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Venue</span>
                      <input class="control" type="text" data-event-form-venue />
                    </label>
                    <label class="field">
                      <span class="field-label">Status</span>
                      <select class="select-control" data-event-form-status>
                        <option>DRAFT</option>
                        <option>PLANNED</option>
                        <option>REGISTRATION_OPEN</option>
                        <option>REGISTRATION_CLOSED</option>
                        <option>LIVE</option>
                        <option>COMPLETED</option>
                        <option>CANCELLED</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Start window</span>
                      <input class="control" type="text" data-event-form-start />
                    </label>
                    <label class="field">
                      <span class="field-label">End window</span>
                      <input class="control" type="text" data-event-form-end />
                    </label>
                    <label class="field">
                      <span class="field-label">Registration opens</span>
                      <input class="control" type="text" data-event-form-registration-open />
                    </label>
                    <label class="field">
                      <span class="field-label">Registration closes</span>
                      <input class="control" type="text" data-event-form-registration-close />
                    </label>
                    <label class="field field-span-full">
                      <span class="field-label">Description</span>
                      <textarea class="textarea-control" data-event-form-description></textarea>
                    </label>
                    <label class="field">
                      <span class="field-label">Expected attendance</span>
                      <input class="control" type="number" min="0" data-event-form-attendance />
                    </label>
                    <div class="field">
                      <span class="field-label">Form actions</span>
                      <div class="alert alert-danger" data-event-form-feedback hidden>
                        <strong data-event-form-feedback-title>Unable to save event</strong>
                        <span data-event-form-feedback-message>Fix the current event request and try again.</span>
                      </div>
                      <div class="button-row">
                        <button class="button button-primary" type="button" data-event-save-button>Create event</button>
                        <button class="button button-secondary" type="button" data-event-delete-button>Delete selected</button>
                      </div>
                      <span class="field-hint">Create, update, and delete requests now run through the live Phase 10 backend event service.</span>
                    </div>
                  </div>

                  <div class="planning-grid">
                    <div class="planning-card">
                      <div class="stack-sm">
                        <p class="panel-title">Resource planning form</p>
                        <p class="text-muted">Mirrors the nested `resourcePlan[]` portion of the future event form request payload.</p>
                      </div>
                      <div class="resource-plan-shell">
                        <table class="data-table">
                          <thead>
                            <tr>
                              <th>Resource</th>
                              <th>Required</th>
                              <th>Allocated</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody data-event-form-resource-body>
                            <tr>
                              <td colspan="4">Resource planning will render here.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="planning-card">
                      <div class="stack-sm">
                        <p class="panel-title">Attendance planning</p>
                        <p class="text-muted">Attendance and volunteer coverage stay visible during both create and edit flows to prevent late planning drift.</p>
                      </div>
                      <div class="stack-list" data-event-attendance-plan-list>
                        <div class="detail-key-value">
                          <strong>Forecast fill rate</strong>
                          <span data-event-form-fill-rate>0%</span>
                        </div>
                        <div class="detail-key-value">
                          <strong>Projected walk-ins</strong>
                          <span data-event-form-walkins>0</span>
                        </div>
                        <div class="detail-key-value">
                          <strong>No-show buffer</strong>
                          <span data-event-form-no-show>0%</span>
                        </div>
                        <div class="detail-key-value">
                          <strong>Volunteer coverage</strong>
                          <span data-event-form-volunteer-coverage>0%</span>
                        </div>
                      </div>
                      <div class="alert alert-info">
                        <strong>Planning note</strong>
                        <span data-event-form-planning-note>Planning note pending.</span>
                      </div>
                    </div>
                  </div>
                </div>
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
    <script id="admin-event-bootstrap" type="application/json"><c:out value="${requestScope.adminEventManagementBootstrapJson}" /></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/admin-events.js"></script>
  </body>
</html>