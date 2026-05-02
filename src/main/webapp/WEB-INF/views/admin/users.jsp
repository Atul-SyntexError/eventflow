<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Admin User Management</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body
    data-context-path="${pageContext.request.contextPath}"
    data-current-route="/admin/users"
    data-user-initial-mode="<c:out value='${requestScope.userInitialMode}' />"
    data-user-selected-id="<c:out value='${requestScope.userSelectedId}' />">
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
              <h1 class="page-title">Admin user management with real filters, detail views, and create or edit flows.</h1>
              <p class="page-lead">
                This screen now runs on the Phase 10 backend user module while preserving the existing admin layout and
                the frozen `UserSummaryDto`, `UserDetailDto`, and `UserFormRequestDto` contracts.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/admin/dashboard.jsp">Back to admin dashboard</a>
              <button class="button button-primary" type="button" data-user-create-button>Start create flow</button>
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

          <div class="stack-lg" data-admin-users-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready users"
              data-preview-state-ready-copy="Showing the active admin user management preview with filters and account flows."
              data-preview-state-loading-label="Loading users"
              data-preview-state-loading-copy="Skeleton placeholders simulate the user roster and account form while data loads."
              data-preview-state-empty-label="Empty users"
              data-preview-state-empty-copy="This simulates a successful user response with no matching accounts yet."
              data-preview-state-error-label="User error"
              data-preview-state-error-copy="This simulates a failed user-management request with recovery messaging."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Total users</span>
                <span class="metric-value" data-users-total>0</span>
                <span class="text-muted">Across every role currently managed inside the admin workspace</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Active users</span>
                <span class="metric-value" data-users-active>0</span>
                <span class="text-muted">Accounts currently enabled for dashboard and workflow access</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Available volunteers</span>
                <span class="metric-value" data-users-volunteers>0</span>
                <span class="text-muted">Volunteers currently ready for assignment pools and coverage planning</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Organizers</span>
                <span class="metric-value" data-users-organizers>0</span>
                <span class="text-muted">Users actively driving event operations and task orchestration</span>
              </article>
            </section>

            <section class="component-panel filter-shell">
              <div class="section-header">
                <div class="stack-sm">
                  <p class="panel-title">Role and availability filters</p>
                  <p class="text-muted">Narrow the listing, inspect a user, then switch directly into the create or edit preview forms without leaving the admin module.</p>
                </div>
                <div class="button-row">
                  <button class="button button-ghost" type="button" data-user-reset-filters>Reset filters</button>
                  <button class="button button-secondary" type="button" data-user-focus-selected>Focus selected user</button>
                </div>
              </div>

              <div class="filter-grid">
                <label class="field">
                  <span class="field-label">Search users</span>
                  <input class="control" type="search" placeholder="Name or email" data-user-search />
                </label>
                <label class="field">
                  <span class="field-label">Role</span>
                  <select class="select-control" data-user-role-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Availability</span>
                  <select class="select-control" data-user-availability-filter></select>
                </label>
                <label class="field">
                  <span class="field-label">Account state</span>
                  <select class="select-control" data-user-active-filter></select>
                </label>
              </div>

              <div class="filter-summary">
                <span data-user-filter-summary>Showing the full admin user roster.</span>
                <span class="mono-copy" data-user-selected-summary>No user selected.</span>
              </div>
            </section>

            <section class="section-grid">
              <article class="table-shell span-7">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">User listing</p>
                    <p class="text-muted">Dedicated `/admin/users` table preview with role, activity, availability, and quick entry into the edit flow.</p>
                  </div>
                  <span class="badge badge-success">Management preview</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Availability</th>
                        <th>Performance</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody data-user-table-body>
                      <tr>
                        <td colspan="7">Admin user data is loading.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="empty-inline-state" data-user-empty-state hidden>
                  No users match the current filters. Reset the filters or switch to the create flow.
                </div>
              </article>

              <article class="component-panel span-5 detail-card" id="user-detail-preview">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Selected user detail</p>
                    <p class="text-muted">Role-aware detail view with assignment history, status context, and current capability tags.</p>
                  </div>
                  <span class="badge badge-neutral" data-user-detail-role>Pending</span>
                </div>

                <div class="detail-card-header">
                  <strong data-user-detail-name>No user selected</strong>
                  <span class="signal-meta" data-user-detail-meta>Select a row to inspect the detail and edit states.</span>
                </div>

                <div class="detail-stat-grid">
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Availability</span>
                    <span class="inline-metric" data-user-detail-availability>Pending</span>
                    <span class="signal-meta" data-user-detail-status>Account state unavailable</span>
                  </div>
                  <div class="detail-summary-card">
                    <span class="module-subtitle">Performance</span>
                    <span class="inline-metric" data-user-detail-performance>0</span>
                    <span class="signal-meta">Operational score or engagement score for the current role</span>
                  </div>
                </div>

                <div class="module-subsection">
                  <p class="module-subtitle">Skills and capabilities</p>
                  <ul class="tag-list" data-user-skill-list>
                    <li class="tag-chip">No skill data loaded</li>
                  </ul>
                </div>

                <div class="module-subsection">
                  <p class="module-subtitle">Recent assignments</p>
                  <ul class="assignment-list" data-user-assignment-list>
                    <li>No assignments loaded.</li>
                  </ul>
                </div>

                <div class="module-subsection">
                  <p class="module-subtitle">Registered events</p>
                  <ul class="registration-list" data-user-registration-list>
                    <li>No registration data loaded.</li>
                  </ul>
                </div>
              </article>

              <article class="component-panel span-12 module-preview-shell" id="user-form-preview">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Create and edit user flow</p>
                    <p class="text-muted" data-user-form-caption>Start with a clean create form or switch into edit mode from a selected row.</p>
                  </div>
                  <div class="form-mode-row">
                    <button class="form-mode-button is-active" type="button" data-user-mode-button data-mode="create">Create user</button>
                    <button class="form-mode-button" type="button" data-user-mode-button data-mode="edit">Edit selected</button>
                  </div>
                </div>

                <div class="alert alert-danger" hidden data-user-form-feedback>
                  <strong data-user-form-feedback-title>Unable to save user</strong>
                  <span data-user-form-feedback-message>Fix the highlighted issues and try again.</span>
                </div>

                <div class="form-shell">
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">First name</span>
                      <input class="control" type="text" data-user-form-first-name />
                      <span class="field-error" hidden data-user-form-first-name-error></span>
                    </label>
                    <label class="field">
                      <span class="field-label">Last name</span>
                      <input class="control" type="text" data-user-form-last-name />
                      <span class="field-error" hidden data-user-form-last-name-error></span>
                    </label>
                    <label class="field">
                      <span class="field-label">Email</span>
                      <input class="control" type="email" data-user-form-email />
                      <span class="field-error" hidden data-user-form-email-error></span>
                    </label>
                    <label class="field">
                      <span class="field-label">Role</span>
                      <select class="select-control" data-user-form-role>
                        <option>ADMIN</option>
                        <option>ORGANIZER</option>
                        <option>VOLUNTEER</option>
                        <option>STUDENT</option>
                      </select>
                      <span class="field-error" hidden data-user-form-role-error></span>
                    </label>
                    <label class="field">
                      <span class="field-label">Availability</span>
                      <select class="select-control" data-user-form-availability>
                        <option>AVAILABLE</option>
                        <option>LIMITED</option>
                        <option>UNAVAILABLE</option>
                      </select>
                      <span class="field-error" hidden data-user-form-availability-error></span>
                    </label>
                    <label class="field">
                      <span class="field-label">Password</span>
                      <input class="control" type="text" data-user-form-password />
                      <span class="field-error" hidden data-user-form-password-error></span>
                    </label>
                    <label class="field field-span-full">
                      <span class="field-label">Account status</span>
                      <label class="checkbox-line">
                        <input type="checkbox" data-user-form-active />
                        <span>Allow this user to access the workspace and participate in assigned flows.</span>
                      </label>
                    </label>
                  </div>

                  <div class="planning-grid">
                    <div class="planning-card">
                      <div class="stack-sm">
                        <p class="panel-title">Skill assignment</p>
                        <p class="text-muted">Select the skill tags that should be persisted in the current user form payload.</p>
                      </div>
                      <ul class="tag-list" data-user-form-skill-list>
                        <li class="tag-chip">No skills loaded</li>
                      </ul>
                      <span class="field-error" hidden data-user-form-skills-error></span>
                    </div>

                    <div class="planning-card">
                      <div class="stack-sm">
                        <p class="panel-title">Preview actions</p>
                        <p class="text-muted">These actions now call the Phase 10 user CRUD backend while preserving the existing module layout.</p>
                      </div>
                      <div class="button-row">
                        <button class="button button-primary" type="button" data-user-save-button>Save user</button>
                        <button class="button button-secondary" type="button" data-user-deactivate-button>Deactivate selected</button>
                      </div>
                      <div class="alert alert-info">
                        <strong>User management note</strong>
                        <span data-user-form-note>Role changes and skill assignments persist through the backend user service and audit log path.</span>
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
    <script id="admin-user-bootstrap" type="application/json"><c:out value="${requestScope.userManagementBootstrapJson}" /></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/admin-users.js"></script>
  </body>
</html>