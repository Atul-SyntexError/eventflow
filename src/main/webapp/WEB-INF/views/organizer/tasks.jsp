<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Organizer Task Management</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body
    data-context-path="${pageContext.request.contextPath}"
    data-current-route="/organizer/tasks"
    data-task-initial-mode="<c:out value='${requestScope.taskInitialMode}' />"
    data-task-selected-id="<c:out value='${requestScope.taskSelectedId}' />">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container module-page">
          <section class="page-header">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 10 organizer module</p>
              <h1 class="page-title">Organizer task management with real filters, detail review, and assignment actions.</h1>
              <p class="page-lead">
                This screen now runs on the Phase 10 backend task module while preserving the existing organizer layout and
                the frozen `TaskSummaryDto`, `TaskDetailDto`, `TaskFormRequestDto`, and `TaskAssignmentRequestDto` contracts.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/organizer/dashboard.jsp">Back to organizer dashboard</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/organizer/tasks/board.jsp">Open board view</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-organizer-gate hidden>
            <strong data-organizer-gate-title>Organizer access is required</strong>
            <span data-organizer-gate-message>Use the organizer demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/organizer/dashboard.jsp">Return to organizer dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-organizer-tasks-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready tasks"
              data-preview-state-ready-copy="Showing the active organizer task table, detail flow, and assignment suggestions."
              data-preview-state-loading-label="Loading tasks"
              data-preview-state-loading-copy="Skeleton placeholders simulate the organizer task flow while task data loads."
              data-preview-state-empty-label="Empty tasks"
              data-preview-state-empty-copy="This simulates a successful task response with no matching records yet."
              data-preview-state-error-label="Task error"
              data-preview-state-error-copy="This simulates a failed task-management request with recovery messaging."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Total tasks</span>
                <span class="metric-value" data-task-total-count>0</span>
                <span class="text-muted">Organizer-managed tasks across active events</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Due today</span>
                <span class="metric-value" data-task-due-today>0</span>
                <span class="text-muted">Tasks needing attention in the current operations window</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Blocked</span>
                <span class="metric-value" data-task-blocked-count>0</span>
                <span class="text-muted">Tasks requiring intervention or dependency clearing</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Unassigned</span>
                <span class="metric-value" data-task-unassigned-count>0</span>
                <span class="text-muted">Tasks still waiting for the best volunteer match</span>
              </article>
            </section>

            <section class="component-panel filter-shell">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Task filters</p>
                  <p class="text-muted">Search by task or event, narrow the queue, and drive detail and assignment review from the same screen.</p>
                </div>
                <div class="button-row">
                  <button class="button button-ghost" type="button" data-task-reset-filters>Reset filters</button>
                  <button class="button button-secondary" type="button" data-task-create-button>Start create flow</button>
                </div>
              </div>

              <div class="filter-grid">
                <label class="field">
                  <span class="field-label">Search tasks</span>
                  <input class="control" type="search" placeholder="Task title or event" data-task-search />
                </label>
                <label class="field">
                  <span class="field-label">Status</span>
                  <select class="select-control" data-task-status-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Priority</span>
                  <select class="select-control" data-task-priority-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Event</span>
                  <select class="select-control" data-task-event-filter></select>
                </label>
              </div>

              <div class="filter-summary">
                <span data-task-filter-summary>Showing the full organizer task roster.</span>
                <span class="mono-copy" data-task-selected-summary>No task selected.</span>
              </div>
            </section>

            <section class="section-grid">
              <article class="table-shell span-7">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Task table</p>
                    <p class="text-muted">Dedicated organizer task table with quick detail review and assignment entry points.</p>
                  </div>
                  <span class="badge badge-success">Task queue</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Event</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Volunteer</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody data-task-table-body>
                      <tr>
                        <td colspan="7">Organizer task data is loading.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="empty-inline-state" data-task-empty-state hidden>
                  No tasks match the current filters. Reset the filters or switch to the create flow.
                </div>
              </article>

              <article class="component-panel span-5 task-detail-card" id="task-detail-preview">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Selected task detail</p>
                    <p class="text-muted">Organizer detail preview with dependencies, required skills, and recent task activity.</p>
                  </div>
                  <span class="badge badge-neutral" data-task-detail-status>Pending</span>
                </div>

                <strong data-task-detail-title>No task selected</strong>
                <span class="signal-meta" data-task-detail-meta>Select a row to inspect the task detail and assignment context.</span>
                <p class="task-card-copy" data-task-detail-description>The selected task summary, dependency chain, and activity feed will render here.</p>

                <div class="task-detail-grid">
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Required skills</span>
                    <ul class="task-chip-list" data-task-skill-chip-list>
                      <li class="task-chip">No skills loaded</li>
                    </ul>
                  </div>
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Dependencies</span>
                    <ul class="task-chip-list" data-task-dependency-chip-list>
                      <li class="task-chip">No dependencies loaded</li>
                    </ul>
                  </div>
                </div>

                <div class="stack-sm">
                  <p class="module-subtitle">Activity feed</p>
                  <ul class="activity-list" data-task-activity-list>
                    <li class="activity-item">
                      <strong>No activity yet</strong>
                      <span class="activity-meta">Mock task detail data will render here.</span>
                    </li>
                  </ul>
                </div>
              </article>

              <article class="component-panel span-12 module-preview-shell" id="task-form-preview">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Task create and assignment flow</p>
                    <p class="text-muted" data-task-form-caption>Use create mode for a fresh task draft or switch to edit mode from a selected row.</p>
                  </div>
                  <div class="form-mode-row">
                    <button class="form-mode-button is-active" type="button" data-task-mode-button data-mode="create">Create task</button>
                    <button class="form-mode-button" type="button" data-task-mode-button data-mode="edit">Edit selected</button>
                  </div>
                </div>

                <div class="form-shell">
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">Event</span>
                      <select class="select-control" data-task-form-event></select>
                    </label>
                    <label class="field">
                      <span class="field-label">Title</span>
                      <input class="control" type="text" data-task-form-title />
                    </label>
                    <label class="field">
                      <span class="field-label">Priority</span>
                      <select class="select-control" data-task-form-priority>
                        <option>CRITICAL</option>
                        <option>HIGH</option>
                        <option>MEDIUM</option>
                        <option>LOW</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Status</span>
                      <select class="select-control" data-task-form-status>
                        <option>TODO</option>
                        <option>ASSIGNED</option>
                        <option>IN_PROGRESS</option>
                        <option>BLOCKED</option>
                        <option>COMPLETED</option>
                        <option>CANCELLED</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Required start</span>
                      <input class="control" type="text" data-task-form-start />
                    </label>
                    <label class="field">
                      <span class="field-label">Deadline</span>
                      <input class="control" type="text" data-task-form-deadline />
                    </label>
                    <label class="field field-span-full">
                      <span class="field-label">Description</span>
                      <textarea class="textarea-control" data-task-form-description></textarea>
                    </label>
                  </div>

                  <div class="planning-grid">
                    <div class="planning-card">
                      <div class="stack-sm">
                        <p class="panel-title">Smart assignment suggestion UI</p>
                        <p class="text-muted">The live task slice now serves lightweight assignment suggestions while keeping richer scoring work in Phase 11.</p>
                      </div>
                      <ul class="suggestion-list" data-task-suggestion-list>
                        <li class="suggestion-item">
                          <strong>No suggestions yet</strong>
                          <span class="suggestion-copy">Select a task to review ranked assignment suggestions.</span>
                        </li>
                      </ul>
                    </div>

                    <div class="planning-card">
                      <div class="stack-sm">
                        <p class="panel-title">Required skills and dependencies</p>
                        <p class="text-muted">Task form inputs now persist required skills, dependency links, and organizer assignment actions through the live backend.</p>
                      </div>
                      <ul class="task-chip-list" data-task-form-skill-list>
                        <li class="task-chip">No skills selected</li>
                      </ul>
                      <ul class="task-chip-list" data-task-form-dependency-list>
                        <li class="task-chip">No dependencies selected</li>
                      </ul>
                      <div class="alert alert-danger" data-task-form-feedback hidden>
                        <strong data-task-form-feedback-title>Unable to save task</strong>
                        <span data-task-form-feedback-message>Fix the current organizer task request and try again.</span>
                      </div>
                      <div class="button-row">
                        <button class="button button-primary" type="button" data-task-save-button>Create task</button>
                        <button class="button button-secondary" type="button" data-task-assign-button>Assign selected</button>
                        <button class="button button-ghost" type="button" data-task-delete-button>Delete selected</button>
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
    <script src="${pageContext.request.contextPath}/assets/js/components/mock-task-ui-utils.js"></script>
    <script id="organizer-task-bootstrap" type="application/json"><c:out value="${requestScope.organizerTaskManagementBootstrapJson}" /></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/organizer-tasks.js"></script>
  </body>
</html>