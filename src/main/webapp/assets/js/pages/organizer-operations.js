(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var mockData = window.EventFlowMockData || null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-organizer-gate]");
  var gateTitle = document.querySelector("[data-organizer-gate-title]");
  var gateMessage = document.querySelector("[data-organizer-gate-message]");
  var content = document.querySelector("[data-organizer-operations-content]");
  var eventWindow = document.querySelector("[data-operations-event-window]");
  var timelineCount = document.querySelector("[data-operations-timeline-count]");
  var delayCount = document.querySelector("[data-operations-delay-count]");
  var adjustmentCount = document.querySelector("[data-operations-adjustment-count]");
  var eventNameBadge = document.querySelector("[data-operations-event-name]");
  var timelineList = document.querySelector("[data-operations-timeline-list]");
  var delayList = document.querySelector("[data-operations-delay-list]");
  var workloadGrid = document.querySelector("[data-operations-workload-grid]");
  var adjustmentList = document.querySelector("[data-operations-adjustment-list]");
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

  function getTimelineVariant(status) {
    if (status === "LIVE") {
      return "success";
    }

    if (status === "UPCOMING") {
      return "info";
    }

    return "neutral";
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the event timeline, workload lanes, and schedule adjustments while operations data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful organizer operations response with no live workload or schedule changes."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed organizer operations request while keeping route-level shell and recovery copy visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function renderMetrics() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      eventWindow.textContent = "...";
      timelineCount.textContent = "...";
      delayCount.textContent = "...";
      adjustmentCount.textContent = "...";
      setBadgeClass(eventNameBadge, "neutral");
      eventNameBadge.textContent = "Loading";
      return;
    }

    if (state.previewMode === "empty") {
      eventWindow.textContent = "No window";
      timelineCount.textContent = "0";
      delayCount.textContent = "0";
      adjustmentCount.textContent = "0";
      setBadgeClass(eventNameBadge, "neutral");
      eventNameBadge.textContent = "No active event";
      return;
    }

    if (state.previewMode === "error") {
      eventWindow.textContent = "--";
      timelineCount.textContent = "--";
      delayCount.textContent = "--";
      adjustmentCount.textContent = "--";
      setBadgeClass(eventNameBadge, "danger");
      eventNameBadge.textContent = "Unavailable";
      return;
    }

    eventWindow.textContent = state.data.eventWindow;
    timelineCount.textContent = String(state.data.timeline.length);
    delayCount.textContent = String(state.data.delayAlerts.length);
    adjustmentCount.textContent = String(state.data.scheduleAdjustments.length);
    setBadgeClass(eventNameBadge, "info");
    eventNameBadge.textContent = state.data.eventName;
  }

  function renderTimeline() {
    if (!timelineList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      timelineList.innerHTML = '<li class="timeline-item"><strong>Loading timeline</strong><span class="timeline-meta">Timeline milestones are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      timelineList.innerHTML = '<li class="timeline-item"><strong>No timeline items</strong><span class="timeline-meta">No operations milestones are active in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      timelineList.innerHTML = '<li class="timeline-item"><strong>Timeline unavailable</strong><span class="timeline-meta">The preview is simulating a failed organizer operations request.</span></li>';
      return;
    }

    timelineList.innerHTML = state.data.timeline
      .map(function (item) {
        return '<li class="timeline-item timeline-item-' + getTimelineVariant(item.status) + '"><div class="task-meta-row"><strong>' + item.label + '</strong><span class="badge badge-' + getTimelineVariant(item.status) + '">' + formatLabel(item.status) + '</span></div><span class="timeline-meta">' + item.startAt + ' to ' + item.endAt + ' • Related tasks ' + item.relatedTaskIds.join(", ") + '</span></li>';
      })
      .join("");
  }

  function renderDelayAlerts() {
    if (!delayList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      delayList.innerHTML = '<li class="delay-alert-item severity-low"><strong>Loading delay alerts</strong><span class="delay-meta">Operations delay guidance is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      delayList.innerHTML = '<li class="delay-alert-item severity-low"><strong>No operations alerts</strong><span class="delay-meta">No live delay pressure is active in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      delayList.innerHTML = '<li class="delay-alert-item severity-high"><strong>Delay alerts unavailable</strong><span class="delay-meta">The preview is simulating a failed operations request.</span></li>';
      return;
    }

    delayList.innerHTML = state.data.delayAlerts
      .map(function (alert) {
        var variant = taskUiUtils ? taskUiUtils.getDelaySeverityVariant(alert.severity) : "neutral";

        return '<li class="delay-alert-item severity-' + alert.severity.toLowerCase() + '"><div class="task-meta-row"><strong>' + alert.message + '</strong><span class="badge badge-' + variant + '">' + formatLabel(alert.severity) + '</span></div><span class="delay-meta">' + alert.suggestedAction + '</span></li>';
      })
      .join("");
  }

  function renderWorkload() {
    if (!workloadGrid || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      workloadGrid.innerHTML = '<article class="workload-card"><strong>Loading workload</strong><span class="workload-copy">Workload lanes are being prepared.</span></article>';
      return;
    }

    if (state.previewMode === "empty") {
      workloadGrid.innerHTML = '<article class="workload-card"><strong>No workload lanes</strong><span class="workload-copy">No active workload is visible in this preview state.</span></article>';
      return;
    }

    if (state.previewMode === "error") {
      workloadGrid.innerHTML = '<article class="workload-card"><strong>Workload unavailable</strong><span class="workload-copy">The preview is simulating a failed operations request.</span></article>';
      return;
    }

    workloadGrid.innerHTML = state.data.workloadLanes
      .map(function (lane) {
        return '<article class="workload-card"><div class="workload-meta"><strong>' + lane.label + '</strong><span class="badge badge-neutral">' + lane.taskLoad + '</span></div><span class="workload-copy">' + lane.activeVolunteers + ' active volunteers</span><span class="workload-copy">' + lane.note + '</span></article>';
      })
      .join("");
  }

  function renderAdjustments() {
    if (!adjustmentList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      adjustmentList.innerHTML = '<li class="adjustment-item"><strong>Loading schedule adjustments</strong><span class="adjustment-copy">Recommendation cards are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      adjustmentList.innerHTML = '<li class="adjustment-item"><strong>No schedule adjustments</strong><span class="adjustment-copy">No schedule changes are suggested in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      adjustmentList.innerHTML = '<li class="adjustment-item"><strong>Schedule adjustments unavailable</strong><span class="adjustment-copy">The preview is simulating a failed operations request.</span></li>';
      return;
    }

    adjustmentList.innerHTML = state.data.scheduleAdjustments
      .map(function (adjustment) {
        return '<li class="adjustment-item"><div class="adjustment-meta"><strong>' + adjustment.headline + '</strong><span class="badge badge-success">' + formatLabel(adjustment.reasonCode) + '</span></div><span class="adjustment-copy">' + adjustment.description + '</span><span class="adjustment-copy">Current window ' + adjustment.currentWindow + ' • Suggested window ' + adjustment.suggestedWindow + '</span><span class="adjustment-copy">Impacted tasks ' + adjustment.impactedTaskIds.join(", ") + '</span></li>';
      })
      .join("");
  }

  function renderOperations() {
    renderMetrics();
    renderTimeline();
    renderDelayAlerts();
    renderWorkload();
    renderAdjustments();
    syncPreviewPanel();
  }

  function hydrateOperations() {
    if (!pageApi || !mockData || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Organizer",
        blockedTitle: "Organizer event operations blocked",
        phaseTitle: "Phase 4 preview is gated.",
        phaseCopy: "Organizer pages should only render for organizer sessions while frontend flows remain mocked.",
        missingSessionMessage: "Open the login preview first and sign in with the organizer demo account to view event operations."
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
        topbarTitle: "Organizer event operations"
      }
    });

    state.data = mockData.getOrganizerOperationsData();

    pageApi.bindLogout(logoutButtons, "/login.jsp");

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          renderOperations();
        }
      });
      state.previewMode = previewController.getState();
    }

    renderOperations();
  }

  hydrateOperations();
})();