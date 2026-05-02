(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var mockData = window.EventFlowMockData || null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-organizer-gate]");
  var gateTitle = document.querySelector("[data-organizer-gate-title]");
  var gateMessage = document.querySelector("[data-organizer-gate-message]");
  var content = document.querySelector("[data-organizer-board-content]");
  var boardGrid = document.querySelector("[data-task-board-grid]");
  var delayList = document.querySelector("[data-board-delay-alert-list]");
  var suggestionList = document.querySelector("[data-board-suggestion-list]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "ORGANIZER",
        gatedContent: content,
        gatePanel: gatePanel,
        gateTitle: gateTitle,
        gateMessage: gateMessage
      })
    : null;
  var previewController = null;
  var state = {
    previewMode: "ready",
    taskData: null,
    dashboardData: null
  };

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function formatLabel(value) {
    return value.replace(/_/g, " ");
  }

  function formatScore(score) {
    return Math.round(score * 100) + "%";
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the organizer task board and live context rail while board data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful task board response with no task cards in any lane."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed task board request while keeping route-level shell and recovery copy visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function renderBoard() {
    if (!boardGrid || !state.taskData) {
      return;
    }

    if (state.previewMode === "loading") {
      boardGrid.innerHTML = [
        '<section class="task-board-column"><div class="task-card-header"><strong>Open</strong><span class="badge badge-info">...</span></div><ul class="task-board-list"><li class="task-card">Loading board cards</li></ul></section>',
        '<section class="task-board-column"><div class="task-card-header"><strong>In progress</strong><span class="badge badge-success">...</span></div><ul class="task-board-list"><li class="task-card">Loading board cards</li></ul></section>'
      ].join("");
      return;
    }

    if (state.previewMode === "empty") {
      boardGrid.innerHTML = ["OPEN", "IN_PROGRESS", "BLOCKED", "COMPLETED"]
        .map(function (status) {
          return '<section class="task-board-column"><div class="task-card-header"><strong>' + formatLabel(status) + '</strong><span class="badge badge-neutral">0</span></div><ul class="task-board-list"><li class="task-card">No tasks in this lane</li></ul></section>';
        })
        .join("");
      return;
    }

    if (state.previewMode === "error") {
      boardGrid.innerHTML = '<section class="task-board-column"><div class="task-card-header"><strong>Board unavailable</strong><span class="badge badge-danger">!</span></div><ul class="task-board-list"><li class="task-card">The organizer board is unavailable in this preview state.</li></ul></section>';
      return;
    }

    var grouped = taskUiUtils ? taskUiUtils.groupTasksByStatus(state.taskData.tasks) : {
      OPEN: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      COMPLETED: []
    };
    var laneOrder = ["OPEN", "IN_PROGRESS", "BLOCKED", "COMPLETED"];

    boardGrid.innerHTML = laneOrder
      .map(function (status) {
        var tasks = grouped[status] || [];
        var variant = taskUiUtils ? taskUiUtils.getTaskStatusVariant(status) : "neutral";

        return [
          '<section class="task-board-column">',
          '<div class="task-card-header"><strong>' + formatLabel(status) + '</strong><span class="badge badge-' + variant + '">' + tasks.length + '</span></div>',
          '<ul class="task-board-list">',
          tasks.length
            ? tasks.map(function (task) {
                var priorityVariant = taskUiUtils ? taskUiUtils.getPriorityVariant(task.priority) : "neutral";

                return [
                  '<li class="task-card">',
                  '<div class="task-card-header"><strong>' + task.title + '</strong><span class="badge badge-' + priorityVariant + '">' + formatLabel(task.priority) + '</span></div>',
                  '<span class="task-card-copy">' + task.eventName + ' • ' + task.deadlineAt + '</span>',
                  '<div class="task-meta-row"><span>' + task.assignedVolunteerName + '</span><span>' + (task.delayFlag ? 'Delay risk' : 'On track') + '</span></div>',
                  '</li>'
                ].join("");
              }).join("")
            : '<li class="task-card">No tasks in this lane</li>',
          '</ul>',
          '</section>'
        ].join("");
      })
      .join("");
  }

  function renderDelayAlerts() {
    if (!delayList || !state.dashboardData) {
      return;
    }

    if (state.previewMode === "loading") {
      delayList.innerHTML = '<li class="delay-alert-item severity-low"><strong>Loading board alerts</strong><span class="delay-meta">The live context rail is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      delayList.innerHTML = '<li class="delay-alert-item severity-low"><strong>No board alerts</strong><span class="delay-meta">No live alerts are active in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      delayList.innerHTML = '<li class="delay-alert-item severity-high"><strong>Board alerts unavailable</strong><span class="delay-meta">The preview is simulating a failed board request.</span></li>';
      return;
    }

    delayList.innerHTML = state.dashboardData.delayAlerts
      .map(function (alert) {
        var variant = taskUiUtils ? taskUiUtils.getDelaySeverityVariant(alert.severity) : "neutral";

        return '<li class="delay-alert-item severity-' + alert.severity.toLowerCase() + '"><div class="task-meta-row"><strong>' + alert.message + '</strong><span class="badge badge-' + variant + '">' + formatLabel(alert.severity) + '</span></div><span class="delay-meta">' + alert.suggestedAction + '</span></li>';
      })
      .join("");
  }

  function renderSuggestions() {
    if (!suggestionList || !state.dashboardData) {
      return;
    }

    if (state.previewMode === "loading") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>Loading quick matches</strong><span class="suggestion-copy">Volunteer ranking is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>No quick matches</strong><span class="suggestion-copy">No ranked volunteer suggestions are needed in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>Quick matches unavailable</strong><span class="suggestion-copy">The preview is simulating a failed board request.</span></li>';
      return;
    }

    suggestionList.innerHTML = state.dashboardData.volunteerSuggestions
      .map(function (suggestion) {
        return '<li class="suggestion-item"><div class="suggestion-score-row"><strong>' + suggestion.volunteerName + '</strong><span class="suggestion-score">' + formatScore(suggestion.totalScore) + '</span></div><span class="suggestion-copy">' + suggestion.explanation[0] + '</span></li>';
      })
      .join("");
  }

  function renderTaskBoard() {
    renderBoard();
    renderDelayAlerts();
    renderSuggestions();
    syncPreviewPanel();
  }

  function hydrateTaskBoard() {
    if (!pageApi || !mockData || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Organizer",
        blockedTitle: "Organizer task board blocked",
        phaseTitle: "Phase 4 preview is gated.",
        phaseCopy: "Organizer pages should only render for organizer sessions while frontend flows remain mocked.",
        missingSessionMessage: "Open the login preview first and sign in with the organizer demo account to view the task board."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 4 organizer preview is active.",
        phaseCopy: "Organizer dashboard, task table, board, and event operations now share the same mocked shell and preview-state path.",
        topbarEyebrow: "Organizer preview",
        topbarTitle: "Organizer task board"
      }
    });

    state.taskData = mockData.getOrganizerTaskManagementData();
    state.dashboardData = mockData.getOrganizerDashboardData();

    pageApi.bindLogout(logoutButtons, "/login.jsp");

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          renderTaskBoard();
        }
      });
      state.previewMode = previewController.getState();
    }

    renderTaskBoard();
  }

  hydrateTaskBoard();
})();