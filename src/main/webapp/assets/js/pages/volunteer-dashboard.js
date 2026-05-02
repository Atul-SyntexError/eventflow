(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var mockData = window.EventFlowMockData || null;
  var apiClient = window.EventFlowMockApi ? window.EventFlowMockApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-volunteer-gate]");
  var gateTitle = document.querySelector("[data-volunteer-gate-title]");
  var gateMessage = document.querySelector("[data-volunteer-gate-message]");
  var content = document.querySelector("[data-volunteer-dashboard-content]");
  var summaryAssigned = document.querySelector("[data-volunteer-assigned-count]");
  var summaryDueSoon = document.querySelector("[data-volunteer-due-soon-count]");
  var summaryOverdue = document.querySelector("[data-volunteer-overdue-count]");
  var summaryOnTime = document.querySelector("[data-volunteer-on-time-rate]");
  var assignmentBody = document.querySelector("[data-volunteer-assignment-body]");
  var alertList = document.querySelector("[data-volunteer-alert-list]");
  var performanceList = document.querySelector("[data-volunteer-dashboard-performance-list]");
  var notificationList = document.querySelector("[data-volunteer-dashboard-notification-list]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "VOLUNTEER",
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

  function formatLabel(value) {
    return value.replace(/_/g, " ");
  }

  function formatPercent(value) {
    return Math.round(value * 100) + "%";
  }

  function loadDashboardData(reason) {
    if (apiClient) {
      return apiClient.get("/api/volunteer/dashboard", { retries: 1 });
    }

    return Promise.resolve({
      ok: true,
      data: mockData.getVolunteerDashboardData(),
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
        message: "Skeleton placeholders simulate the volunteer dashboard while personal assignments and notifications load."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful volunteer dashboard response with no assigned tasks or recent updates."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed volunteer dashboard request while keeping safe fallback copy visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function buildAlerts() {
    if (!state.data) {
      return [];
    }

    return state.data.assignedTasks
      .filter(function (task) {
        return task.status === "BLOCKED" || task.delayFlag || task.status === "OPEN";
      })
      .map(function (task) {
        var severity = task.status === "BLOCKED" ? "HIGH" : (task.delayFlag ? "MEDIUM" : "LOW");
        var message = task.status === "BLOCKED"
          ? "This task is blocked and needs organizer attention."
          : (task.delayFlag ? "This task is tracking a delivery risk and should be reviewed early." : "This task is due soon and should be started before the next shift window.");

        return {
          severity: severity,
          title: task.title,
          message: message + " Deadline " + task.deadlineAt + "."
        };
      });
  }

  function renderSummary() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      summaryAssigned.textContent = "...";
      summaryDueSoon.textContent = "...";
      summaryOverdue.textContent = "...";
      summaryOnTime.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      summaryAssigned.textContent = "0";
      summaryDueSoon.textContent = "0";
      summaryOverdue.textContent = "0";
      summaryOnTime.textContent = "0%";
      return;
    }

    if (state.previewMode === "error") {
      summaryAssigned.textContent = "--";
      summaryDueSoon.textContent = "--";
      summaryOverdue.textContent = "--";
      summaryOnTime.textContent = "--";
      return;
    }

    summaryAssigned.textContent = String(state.data.assignedTasks.length);
    summaryDueSoon.textContent = String(state.data.dueSoonCount);
    summaryOverdue.textContent = String(state.data.overdueCount);
    summaryOnTime.textContent = formatPercent(state.data.performanceSummary.onTimeRate);
  }

  function renderAssignments() {
    if (!assignmentBody || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      assignmentBody.innerHTML = '<tr><td colspan="5">Volunteer task data is loading.</td></tr>';
      return;
    }

    if (state.previewMode === "empty") {
      assignmentBody.innerHTML = '<tr><td colspan="5">No assigned tasks are visible in this preview state.</td></tr>';
      return;
    }

    if (state.previewMode === "error") {
      assignmentBody.innerHTML = '<tr><td colspan="5">Volunteer dashboard data is unavailable in this preview state.</td></tr>';
      return;
    }

    assignmentBody.innerHTML = state.data.assignedTasks
      .map(function (task) {
        var statusVariant = taskUiUtils ? taskUiUtils.getTaskStatusVariant(task.status) : "neutral";
        var priorityVariant = taskUiUtils ? taskUiUtils.getPriorityVariant(task.priority) : "neutral";

        return [
          '<tr>',
          '<td><strong>' + task.title + '</strong></td>',
          '<td>' + task.eventName + '</td>',
          '<td><span class="badge badge-' + priorityVariant + '">' + formatLabel(task.priority) + '</span></td>',
          '<td><span class="badge badge-' + statusVariant + '">' + formatLabel(task.status) + '</span></td>',
          '<td>' + task.deadlineAt + '</td>',
          '</tr>'
        ].join("");
      })
      .join("");
  }

  function renderAlerts() {
    if (!alertList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      alertList.innerHTML = '<li class="delay-alert-item severity-low"><strong>Loading alerts</strong><span class="delay-meta">Volunteer task pressure is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      alertList.innerHTML = '<li class="delay-alert-item severity-low"><strong>No active alerts</strong><span class="delay-meta">No due-soon or blocked assignments are active in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      alertList.innerHTML = '<li class="delay-alert-item severity-high"><strong>Alerts unavailable</strong><span class="delay-meta">The preview is simulating a failed volunteer dashboard request.</span></li>';
      return;
    }

    var alerts = buildAlerts();

    if (!alerts.length) {
      alertList.innerHTML = '<li class="delay-alert-item severity-low"><strong>No active alerts</strong><span class="delay-meta">Your current assignments are on track in this preview state.</span></li>';
      return;
    }

    alertList.innerHTML = alerts
      .map(function (alert) {
        var variant = taskUiUtils ? taskUiUtils.getDelaySeverityVariant(alert.severity) : "neutral";

        return '<li class="delay-alert-item severity-' + alert.severity.toLowerCase() + '"><div class="task-meta-row"><strong>' + alert.title + '</strong><span class="badge badge-' + variant + '">' + formatLabel(alert.severity) + '</span></div><span class="delay-meta">' + alert.message + '</span></li>';
      })
      .join("");
  }

  function renderPerformance() {
    if (!performanceList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      performanceList.innerHTML = '<li class="suggestion-item"><strong>Loading performance</strong><span class="suggestion-copy">Recent event performance history is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      performanceList.innerHTML = '<li class="suggestion-item"><strong>No performance history yet</strong><span class="suggestion-copy">Recent event history will render here once assignments have been completed.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      performanceList.innerHTML = '<li class="suggestion-item"><strong>Performance unavailable</strong><span class="suggestion-copy">The preview is simulating a failed performance request.</span></li>';
      return;
    }

    performanceList.innerHTML = state.data.performanceSummary.recentEvents
      .map(function (eventItem) {
        return '<li class="suggestion-item"><div class="suggestion-score-row"><strong>' + eventItem.eventName + '</strong><span class="suggestion-score">' + formatPercent(eventItem.onTimeRate) + '</span></div><span class="suggestion-copy">' + eventItem.roleLabel + ' • ' + eventItem.completedTasks + ' completed tasks</span><span class="suggestion-copy">' + eventItem.highlight + '</span></li>';
      })
      .join("");
  }

  function renderNotifications() {
    if (!notificationList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      notificationList.innerHTML = '<li class="suggestion-item"><strong>Loading notifications</strong><span class="suggestion-copy">Recent volunteer updates are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      notificationList.innerHTML = '<li class="suggestion-item"><strong>No notifications</strong><span class="suggestion-copy">No recent updates are visible in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      notificationList.innerHTML = '<li class="suggestion-item"><strong>Notifications unavailable</strong><span class="suggestion-copy">The preview is simulating a failed notification request.</span></li>';
      return;
    }

    notificationList.innerHTML = state.data.recentNotifications
      .map(function (item) {
        var variant = taskUiUtils ? taskUiUtils.getNotificationVariant(item.type) : "neutral";

        return '<li class="suggestion-item"><div class="task-meta-row"><strong>' + item.title + '</strong><span class="badge badge-' + variant + '">' + formatLabel(item.type) + '</span></div><span class="suggestion-copy">' + item.meta + '</span></li>';
      })
      .join("");
  }

  function renderDashboard() {
    renderSummary();
    renderAssignments();
    renderAlerts();
    renderPerformance();
    renderNotifications();
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
        roleLabel: "Volunteer",
        blockedTitle: "Volunteer dashboard blocked",
        phaseTitle: "Phase 5 preview is gated.",
        missingSessionMessage: "Open the login preview first and sign in with the volunteer demo account to view the volunteer dashboard."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 7 frontend integration preview is active.",
        phaseCopy: "Volunteer dashboard cards now refresh through the shared mock API and polling layer before backend work begins.",
        topbarEyebrow: "Volunteer preview",
        topbarTitle: "Volunteer dashboard"
      }
    });

    state.data = mockData.getVolunteerDashboardData();
    refreshController = window.EventFlowMockRefreshController
      ? window.EventFlowMockRefreshController.create({
          intervalMs: 13000,
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