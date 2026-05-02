<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Organizer Task Board Preview</title>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body data-context-path="${pageContext.request.contextPath}" data-current-route="/organizer/tasks/board">
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
              <h1 class="page-title">Organizer task board with status lanes, live alerts, and quick assignment context.</h1>
              <p class="page-lead">
                This preview turns the task board contract into a visual operations surface while reusing the same task dataset,
                status utilities, preview-state controls, and organizer role guards as the task table view.
              </p>
            </div>
            <div class="button-row">
              <a class="button button-secondary" href="${pageContext.request.contextPath}/organizer/tasks.jsp">Back to task table</a>
              <a class="button button-primary" href="${pageContext.request.contextPath}/organizer/events/operations.jsp">Open event operations</a>
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

          <div class="stack-lg" data-organizer-board-content hidden>
            <section
              class="component-panel preview-state-shell"
              data-preview-state-shell
              data-preview-state-default="ready"
              data-preview-state-ready-label="Ready task board"
              data-preview-state-ready-copy="Showing the active organizer task board with shared status lanes."
              data-preview-state-loading-label="Loading task board"
              data-preview-state-loading-copy="Skeleton placeholders simulate the task board while lane data loads."
              data-preview-state-empty-label="Empty task board"
              data-preview-state-empty-copy="This simulates a successful board response with no task cards yet."
              data-preview-state-error-label="Task board error"
              data-preview-state-error-copy="This simulates a failed board request with recovery messaging."
            >
              <%@ include file="../partials/preview-state-controls.jspf" %>
            </section>

            <section class="section-grid">
              <article class="component-panel span-8 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Task board</p>
                    <p class="text-muted">Shared task dataset grouped into lanes for a visual organizer operations view.</p>
                  </div>
                  <span class="badge badge-info">Board view</span>
                </div>
                <div class="task-board-grid" data-task-board-grid>
                  <section class="task-board-column">
                    <div class="task-card-header">
                      <strong>Open</strong>
                      <span class="badge badge-info">0</span>
                    </div>
                    <ul class="task-board-list">
                      <li class="task-card">Board data loading</li>
                    </ul>
                  </section>
                </div>
              </article>

              <article class="component-panel span-4 stack-md">
                <div class="section-header">
                  <div class="stack-sm">
                    <p class="panel-title">Delay alerts and quick matches</p>
                    <p class="text-muted">This side rail keeps board work connected to live delays and assignment recommendations.</p>
                  </div>
                  <span class="badge badge-warning">Live context</span>
                </div>
                <ul class="delay-alert-list" data-board-delay-alert-list>
                  <li class="delay-alert-item severity-low">
                    <strong>No board alerts yet</strong>
                    <span class="delay-meta">Mock board data will populate this rail.</span>
                  </li>
                </ul>
                <ul class="suggestion-list" data-board-suggestion-list>
                  <li class="suggestion-item">
                    <strong>No quick matches yet</strong>
                    <span class="suggestion-copy">Board-level assignment hints will render here.</span>
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
    <script src="${pageContext.request.contextPath}/assets/js/pages/organizer-task-board.js"></script>
  </body>
</html>