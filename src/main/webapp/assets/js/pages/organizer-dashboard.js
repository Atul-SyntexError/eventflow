(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var mockData = window.EventFlowMockData || null;
  var apiClient = window.EventFlowMockApi ? window.EventFlowMockApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-organizer-gate]");
  var gateTitle = document.querySelector("[data-organizer-gate-title]");
  var gateMessage = document.querySelector("[data-organizer-gate-message]");
  var content = document.querySelector("[data-organizer-dashboard-content]");
  var summaryOpen = document.querySelector("[data-organizer-open-tasks]");
  var summaryInProgress = document.querySelector("[data-organizer-in-progress-tasks]");
  var summaryBlocked = document.querySelector("[data-organizer-blocked-tasks]");
  var summaryVolunteers = document.querySelector("[data-organizer-available-volunteers]");
  var delayList = document.querySelector("[data-organizer-delay-alert-list]");
  var suggestionList = document.querySelector("[data-organizer-suggestion-list]");
  var assignmentBody = document.querySelector("[data-organizer-assignment-body]");
  var pulseList = document.querySelector("[data-organizer-pulse-list]");
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
  var refreshController = null;
  var state = {
    previewMode: "ready",
    data: null
  };

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function setBadgeClass(node, variant) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + variant;
  }

  function formatLabel(value) {
    return value.replace(/_/g, " ");
  }

  function formatScore(score) {
    return Math.round(score * 100) + "%";
  }

  function loadDashboardData(reason) {
    if (apiClient) {
      return apiClient.get("/api/organizer/dashboard", { retries: 1 });
    }

    return Promise.resolve({
      ok: true,
      data: mockData.getOrganizerDashboardData(),
      meta: { reason: reason || "initial" }
    });
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate organizer metrics, delay alerts, and assignment momentum while the dashboard data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful organizer dashboard response with no active tasks, delay alerts, or volunteer suggestions."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed organizer dashboard request while preserving safe fallback copy and route navigation."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function renderSummary() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      summaryOpen.textContent = "...";
      summaryInProgress.textContent = "...";
      summaryBlocked.textContent = "...";
      summaryVolunteers.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      summaryOpen.textContent = "0";
      summaryInProgress.textContent = "0";
      summaryBlocked.textContent = "0";
      summaryVolunteers.textContent = "0";
      return;
    }

    if (state.previewMode === "error") {
      summaryOpen.textContent = "--";
      summaryInProgress.textContent = "--";
      summaryBlocked.textContent = "--";
      summaryVolunteers.textContent = "--";
      return;
    }

    summaryOpen.textContent = String(state.data.openTasks);
    summaryInProgress.textContent = String(state.data.inProgressTasks);
    summaryBlocked.textContent = String(state.data.blockedTasks);
    summaryVolunteers.textContent = String(state.data.availableVolunteers);
  }

  function renderDelayAlerts() {
    if (!delayList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      delayList.innerHTML = [
        '<li class="delay-alert-item severity-low"><strong>Loading delay alerts</strong><span class="delay-meta">Organizer delay guidance is being prepared.</span></li>',
        '<li class="delay-alert-item severity-low"><strong>Loading actions</strong><span class="delay-meta">Suggested organizer follow-up actions are on the way.</span></li>'
      ].join("");
      return;
    }

    if (state.previewMode === "empty") {
      delayList.innerHTML = '<li class="delay-alert-item severity-low"><strong>No active delay alerts</strong><span class="delay-meta">The organizer queue is clear in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      delayList.innerHTML = '<li class="delay-alert-item severity-high"><strong>Delay alerts unavailable</strong><span class="delay-meta">The dashboard could not load the delay feed for this preview state.</span></li>';
      return;
    }

    delayList.innerHTML = state.data.delayAlerts
      .map(function (alert) {
        var variant = taskUiUtils ? taskUiUtils.getDelaySeverityVariant(alert.severity) : "neutral";

        return [
          '<li class="delay-alert-item severity-' + alert.severity.toLowerCase() + '">',
          '<div class="task-meta-row"><strong>' + alert.message + '</strong><span class="badge badge-' + variant + '">' + formatLabel(alert.severity) + '</span></div>',
          '<span class="delay-meta">' + alert.suggestedAction + '</span>',
          '</li>'
        ].join("");
      })
      .join("");
  }

  function renderSuggestions() {
    if (!suggestionList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>Loading suggestions</strong><span class="suggestion-copy">Volunteer ranking signals are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>No suggestions available</strong><span class="suggestion-copy">This preview simulates a healthy organizer state with no pending ranking needs.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>Suggestions unavailable</strong><span class="suggestion-copy">The dashboard could not load smart assignment guidance for this preview state.</span></li>';
      return;
    }

    suggestionList.innerHTML = state.data.volunteerSuggestions
      .map(function (suggestion) {
        return [
          '<li class="suggestion-item">',
          '<div class="suggestion-score-row"><strong>' + suggestion.volunteerName + '</strong><span class="suggestion-score">' + formatScore(suggestion.totalScore) + '</span></div>',
          '<span class="suggestion-copy">Skill match ' + formatScore(suggestion.skillMatchScore) + ' • Availability ' + formatScore(suggestion.availabilityScore) + ' • Performance ' + formatScore(suggestion.performanceScore) + '</span>',
          '<ul class="task-chip-list">',
          suggestion.explanation.map(function (line) {
            return '<li class="task-chip">' + line + '</li>';
          }).join(""),
          '</ul>',
          '</li>'
        ].join("");
      })
      .join("");
  }

  function renderAssignments() {
    if (!assignmentBody || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      assignmentBody.innerHTML = '<tr><td colspan="5">Organizer assignment momentum is loading.</td></tr>';
      return;
    }

    if (state.previewMode === "empty") {
      assignmentBody.innerHTML = '<tr><td colspan="5">No recent assignments are visible in this preview state.</td></tr>';
      return;
    }

    if (state.previewMode === "error") {
      assignmentBody.innerHTML = '<tr><td colspan="5">Assignment momentum is unavailable for this preview state.</td></tr>';
      return;
    }

    assignmentBody.innerHTML = state.data.recentAssignments
      .map(function (task) {
        var statusVariant = taskUiUtils ? taskUiUtils.getTaskStatusVariant(task.status) : "neutral";

        return [
          '<tr>',
          '<td><strong>' + task.title + '</strong></td>',
          '<td>' + task.eventName + '</td>',
          '<td>' + task.assignedVolunteerName + '</td>',
          '<td>' + task.deadlineAt + '</td>',
          '<td><span class="badge badge-' + statusVariant + '">' + formatLabel(task.status) + '</span></td>',
          '</tr>'
        ].join("");
      })
      .join("");
  }

  function renderPulse() {
    if (!pulseList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      pulseList.innerHTML = '<li class="task-chip">Loading organizer pulse</li>';
      return;
    }

    if (state.previewMode === "empty") {
      pulseList.innerHTML = '<li class="task-chip">No active pulse items</li>';
      return;
    }

    if (state.previewMode === "error") {
      pulseList.innerHTML = '<li class="task-chip">Organizer pulse unavailable</li>';
      return;
    }

    pulseList.innerHTML = [
      '<li class="task-chip">' + state.data.blockedTasks + ' blocked tasks need intervention</li>',
      '<li class="task-chip">' + state.data.delayAlerts.length + ' live delay alerts to review</li>',
      '<li class="task-chip">' + state.data.availableVolunteers + ' volunteers available for coverage help</li>',
      '<li class="task-chip">Task board and operations routes are ready for preview</li>'
    ].join("");
  }

  function renderDashboard() {
    renderSummary();
    renderDelayAlerts();
    renderSuggestions();
    renderAssignments();
    renderPulse();
    syncPreviewPanel();
  }

  function handlePreviewModeChange(nextState) {
    state.previewMode = nextState;

    if (refreshController) {
      if (nextState === "ready") {
        refreshController.refresh();
        refreshController.start();
        return;
      }

      refreshController.stop();
    }

    renderDashboard();
  }

  function hydrateDashboard() {
    if (!pageApi || !mockData || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Organizer",
        blockedTitle: "Organizer dashboard blocked",
        phaseTitle: "Phase 4 preview is gated.",
        phaseCopy: "Organizer pages should only render for organizer sessions while frontend flows remain mocked.",
        missingSessionMessage: "Open the login preview first and sign in with the organizer demo account to view the live operations dashboard."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 7 frontend integration preview is active.",
        phaseCopy: "Organizer dashboard cards now refresh through the shared mock API and polling layer before backend wiring begins.",
        topbarEyebrow: "Organizer preview",
        topbarTitle: "Organizer live operations dashboard"
      }
    });

    state.data = mockData.getOrganizerDashboardData();
    refreshController = window.EventFlowMockRefreshController
      ? window.EventFlowMockRefreshController.create({
          intervalMs: 12000,
          shouldPoll: function () {
            return state.previewMode === "ready";
          },
          loader: loadDashboardData,
          onData: function (data) {
            state.data = data;
            renderDashboard();
          },
          onError: function () {
            renderDashboard();
          }
        })
      : null;

    pageApi.bindLogout(logoutButtons, "/login.jsp");

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: handlePreviewModeChange
      });
      state.previewMode = previewController.getState();
    }

    if (state.previewMode === "ready" && refreshController) {
      refreshController.load("initial").then(function () {
        refreshController.start();
      });
      return;
    }

    renderDashboard();
  }

  hydrateDashboard();
})();