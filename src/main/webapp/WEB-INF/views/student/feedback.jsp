<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Student Feedback</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/student/feedback">
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
              <h1 class="page-title">Student emoji feedback and comment submission.</h1>
              <p class="page-lead">
                This route now uses the live student feedback backend with a checked-in event selector, mood capture,
                comment input, and recent submission history kept visible on the same surface.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/check-in.jsp">Back to check-in</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/student/notifications">Open notifications</a>
            </div>
          </section>

          <section class="alert alert-danger admin-gate" data-student-gate hidden>
            <strong data-student-gate-title>Student access is required</strong>
            <span data-student-gate-message>Use the student demo account from the login preview before opening this page.</span>
            <div class="button-row">
              <a class="button button-primary" href="${pageContext.request.contextPath}/login">Open login</a>
              <a class="button button-secondary" href="${pageContext.request.contextPath}/student/dashboard">Return to dashboard</a>
            </div>
          </section>

          <div class="stack-lg" data-student-feedback-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready feedback flow"
              data-preview-state-ready-copy="Showing the active student feedback preview with emoji mood selection and recent submissions."
              data-preview-state-loading-label="Loading feedback"
              data-preview-state-loading-copy="Skeleton placeholders simulate the student feedback flow while route data loads."
              data-preview-state-empty-label="Empty feedback"
              data-preview-state-empty-copy="This simulates a successful feedback response with no eligible checked-in events."
              data-preview-state-error-label="Feedback error"
              data-preview-state-error-copy="This simulates a failed student feedback request with safe fallback copy."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Eligible events</span>
                <span class="metric-value" data-student-feedback-eligible-count>0</span>
                <span class="text-muted">Checked-in events still open for feedback</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Recorded submissions</span>
                <span class="metric-value" data-student-feedback-submission-count>0</span>
                <span class="text-muted">Stored feedback preview items</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Selected mood</span>
                <span class="metric-value" data-student-feedback-selected-mood>--</span>
                <span class="text-muted">Current emoji sentiment for the draft</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Selected event</span>
                <span class="metric-value" data-student-feedback-selected-event>--</span>
                <span class="text-muted">Event receiving the current preview draft</span>
              </article>
            </section>

            <section class="section-grid">
              <article class="component-panel span-7 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Feedback submission preview</p>
                    <p class="text-muted">Submit feedback with the approved DTO fields and keep the recent history visible.</p>
                  </div>
                  <span class="badge badge-info">Feedback</span>
                </div>

                <div class="alert alert-danger" hidden data-student-feedback-alert>
                  <strong data-student-feedback-alert-title>Unable to submit feedback</strong>
                  <span data-student-feedback-alert-message>Fix the highlighted issues and try again.</span>
                </div>

                <label class="field">
                  <span class="field-label">Checked-in event</span>
                  <select class="select-control" data-student-feedback-event-select></select>
                  <span class="field-error" hidden data-student-feedback-event-error></span>
                </label>

                <div class="detail-summary-card stack-sm">
                  <strong data-student-feedback-prompt-title>No event selected</strong>
                  <p class="task-card-copy" data-student-feedback-prompt-copy>Feedback guidance will render here.</p>
                </div>

                <div class="form-mode-row" data-student-feedback-mood-row>
                  <button class="form-mode-button is-active" type="button" data-student-feedback-mood data-mood="POSITIVE">Positive</button>
                  <button class="form-mode-button" type="button" data-student-feedback-mood data-mood="NEUTRAL">Neutral</button>
                  <button class="form-mode-button" type="button" data-student-feedback-mood data-mood="NEGATIVE">Negative</button>
                </div>
                <span class="field-error" hidden data-student-feedback-mood-error></span>

                <label class="field">
                  <span class="field-label">Comment</span>
                  <textarea class="control textarea-control" rows="5" placeholder="Share a quick note about the event experience" data-student-feedback-comment></textarea>
                  <span class="field-error" hidden data-student-feedback-comment-error></span>
                </label>

                <div class="button-row">
                  <button class="button button-primary" type="button" data-student-feedback-submit>Submit feedback</button>
                  <button class="button button-secondary" type="button" data-student-feedback-reset>Reset form</button>
                </div>

                <p class="text-muted" data-student-feedback-summary>
                  Select a checked-in event to submit a live feedback response.
                </p>
              </article>

              <article class="component-panel span-5 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Recent submissions</p>
                    <p class="text-muted">Keep feedback history visible while new drafts are composed.</p>
                  </div>
                  <span class="badge badge-success">Sentiment</span>
                </div>
                <ul class="suggestion-list" data-student-feedback-submissions>
                  <li class="suggestion-item">
                    <strong>No submissions loaded yet</strong>
                    <span class="suggestion-copy">Recent feedback items will render here.</span>
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
    <script id="student-feedback-bootstrap" type="application/json"><c:out value="${requestScope.studentFeedbackBootstrapJson}" /></script>
    <script src="${pageContext.request.contextPath}/assets/js/api/live-api-client.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/student-feedback.js"></script>
  </body>
</html>