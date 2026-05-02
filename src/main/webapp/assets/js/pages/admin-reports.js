(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var selectedEventIdValue = body.getAttribute("data-report-selected-id") || "";
  var initialSelectedEventId = selectedEventIdValue ? Number(selectedEventIdValue) : null;
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var bootstrapScript = document.getElementById("admin-report-bootstrap");
  var gatePanel = document.querySelector("[data-admin-gate]");
  var gateTitle = document.querySelector("[data-admin-gate-title]");
  var gateMessage = document.querySelector("[data-admin-gate-message]");
  var content = document.querySelector("[data-admin-reports-content]");
  var statusBadge = document.querySelector("[data-report-status-badge]");
  var eventSelect = document.querySelector("[data-report-event-select]");
  var refreshButton = document.querySelector("[data-report-refresh-button]");
  var selectionSummary = document.querySelector("[data-report-selection-summary]");
  var lastUpdated = document.querySelector("[data-report-last-updated]");
  var loadingState = document.querySelector("[data-report-loading-state]");
  var emptyState = document.querySelector("[data-report-empty-state]");
  var errorState = document.querySelector("[data-report-error-state]");
  var errorTitle = document.querySelector("[data-report-error-title]");
  var errorMessage = document.querySelector("[data-report-error-message]");
  var reportShell = document.querySelector("[data-report-content-shell]");
  var totalEvents = document.querySelector("[data-report-total-events]");
  var fillRate = document.querySelector("[data-report-fill-rate]");
  var walkIns = document.querySelector("[data-report-walk-ins]");
  var healthScore = document.querySelector("[data-report-health-score]");
  var eventStatus = document.querySelector("[data-report-event-status]");
  var eventName = document.querySelector("[data-report-event-name]");
  var eventMeta = document.querySelector("[data-report-event-meta]");
  var attendanceNote = document.querySelector("[data-report-attendance-note]");
  var healthTrend = document.querySelector("[data-report-health-trend]");
  var healthSnapshot = document.querySelector("[data-report-health-snapshot]");
  var volunteerCoverage = document.querySelector("[data-report-volunteer-coverage]");
  var noShowBuffer = document.querySelector("[data-report-no-show-buffer]");
  var feedbackTrend = document.querySelector("[data-report-feedback-trend]");
  var feedbackTitle = document.querySelector("[data-report-feedback-title]");
  var feedbackSummary = document.querySelector("[data-report-feedback-summary]");
  var volunteerTrend = document.querySelector("[data-report-volunteer-trend]");
  var volunteerTitle = document.querySelector("[data-report-volunteer-title]");
  var volunteerSummary = document.querySelector("[data-report-volunteer-summary]");
  var healthBadge = document.querySelector("[data-report-health-badge]");
  var healthAttendance = document.querySelector("[data-report-health-attendance]");
  var healthEngagement = document.querySelector("[data-report-health-engagement]");
  var healthVolunteer = document.querySelector("[data-report-health-volunteer]");
  var healthTimestamp = document.querySelector("[data-report-health-timestamp]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "ADMIN",
        gatedContent: content,
        gatePanel: gatePanel,
        gateTitle: gateTitle,
        gateMessage: gateMessage
      })
    : null;
  var state = {
    events: [],
    selectedEventId: initialSelectedEventId,
    report: null,
    loading: false,
    errorMessage: ""
  };

  function parseBootstrap() {
    if (!bootstrapScript || !bootstrapScript.textContent) {
      return { events: [] };
    }

    try {
      return JSON.parse(bootstrapScript.textContent);
    } catch (error) {
      return { events: [] };
    }
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Reporting bootstrap unavailable",
        message: "The admin reports page could not load its initial event list.",
        shell: {
          phaseTitle: "Phase 13 reporting is gated.",
          phaseCopy: "Admin reporting should only render for admin sessions with the reporting bootstrap available.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin reports blocked"
        }
      },
      missingSession: {
        title: "Admin reports require a session",
        message: "Open the login page and sign in with the admin account before loading reports.",
        shell: {
          phaseTitle: "Phase 13 reporting is gated.",
          phaseCopy: "Admin reporting should only render for authenticated admin sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin reports blocked"
        }
      },
      wrongRole: {
        title: "This reporting route is admin-only",
        message: "The current session belongs to another role, so the admin reports page remains hidden.",
        shell: {
          phaseTitle: "Phase 13 reporting is gated.",
          phaseCopy: "Admin reporting should not leak into organizer, volunteer, or student routes.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin reports blocked"
        }
      }
    };
  }

  function findEvent(eventId) {
    return state.events.find(function (eventItem) {
      return Number(eventItem.eventId) === Number(eventId);
    }) || null;
  }

  function getBadgeVariant(trend) {
    if (trend === "POSITIVE" || trend === "ON_TRACK" || trend === "UP") {
      return "success";
    }
    if (trend === "MIXED" || trend === "WATCH" || trend === "STABLE") {
      return "info";
    }
    if (trend === "AT_RISK" || trend === "NEGATIVE" || trend === "DOWN") {
      return "warning";
    }
    return "neutral";
  }

  function setBadge(node, text, trend) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + getBadgeVariant(trend);
    node.textContent = text || "Pending";
  }

  function formatHealthScore(value) {
    if (typeof value !== "number") {
      return "0.00";
    }
    return value.toFixed(2);
  }

  function formatRatio(value) {
    if (typeof value !== "number") {
      return "0.00";
    }
    return value.toFixed(2);
  }

  function formatPercent(value) {
    if (typeof value !== "number") {
      return "0%";
    }
    var percentage = (value * 100).toFixed(1);
    return percentage.replace(/\.0$/, "") + "%";
  }

  function formatTimestamp(value) {
    if (!value) {
      return "Waiting for report data.";
    }

    var parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "Waiting for report data.";
    }
    return parsed.toLocaleString();
  }

  function setStatus(text, trend) {
    setBadge(statusBadge, text, trend);
  }

  function syncStaticSummary() {
    if (totalEvents) {
      totalEvents.textContent = String(state.events.length);
    }

    if (!selectionSummary) {
      return;
    }

    var selectedEvent = findEvent(state.selectedEventId);
    if (!selectedEvent) {
      selectionSummary.textContent = "No report selected.";
      return;
    }

    selectionSummary.textContent = selectedEvent.name + " · " + (selectedEvent.status || "UNKNOWN") + " · " + (selectedEvent.venue || "Venue pending");
  }

  function populateEventSelect() {
    if (!eventSelect) {
      return;
    }

    eventSelect.innerHTML = state.events
      .map(function (eventItem) {
        return '<option value="' + eventItem.eventId + '">' + eventItem.name + ' (' + eventItem.code + ')</option>';
      })
      .join("");

    if (state.selectedEventId && findEvent(state.selectedEventId)) {
      eventSelect.value = String(state.selectedEventId);
      return;
    }

    if (state.events.length) {
      state.selectedEventId = Number(state.events[0].eventId);
      eventSelect.value = String(state.selectedEventId);
    }
  }

  function renderEmptyState() {
    if (loadingState) {
      loadingState.hidden = true;
    }
    if (errorState) {
      errorState.hidden = true;
    }
    if (emptyState) {
      emptyState.hidden = false;
    }
    if (reportShell) {
      reportShell.hidden = true;
    }
    setStatus("Empty", "STABLE");
    if (lastUpdated) {
      lastUpdated.textContent = "No reportable events are available yet.";
    }
  }

  function renderLoadingState() {
    if (loadingState) {
      loadingState.hidden = false;
    }
    if (errorState) {
      errorState.hidden = true;
    }
    if (emptyState) {
      emptyState.hidden = true;
    }
    if (reportShell) {
      reportShell.hidden = true;
    }
    setStatus("Loading", "STABLE");
    if (lastUpdated) {
      lastUpdated.textContent = "Refreshing report summary from the reporting API.";
    }
  }

  function renderErrorState() {
    if (loadingState) {
      loadingState.hidden = true;
    }
    if (emptyState) {
      emptyState.hidden = true;
    }
    if (errorState) {
      errorState.hidden = false;
    }
    if (reportShell) {
      reportShell.hidden = true;
    }
    if (errorTitle) {
      errorTitle.textContent = "Report unavailable";
    }
    if (errorMessage) {
      errorMessage.textContent = state.errorMessage || "The report request failed. Try refreshing the selected event.";
    }
    setStatus("Error", "DOWN");
  }

  function renderReport() {
    var selectedEvent = findEvent(state.selectedEventId);
    var report = state.report || {};
    var attendance = report.attendanceSummary || {};
    var feedback = report.feedbackSummary || {};
    var volunteer = report.volunteerSummary || {};
    var health = report.healthSummary || {};

    if (loadingState) {
      loadingState.hidden = true;
    }
    if (emptyState) {
      emptyState.hidden = true;
    }
    if (errorState) {
      errorState.hidden = true;
    }
    if (reportShell) {
      reportShell.hidden = false;
    }

    if (fillRate) {
      fillRate.textContent = attendance.forecastFillRate || "0%";
    }
    if (walkIns) {
      walkIns.textContent = String(attendance.projectedWalkIns || 0);
    }
    if (healthScore) {
      healthScore.textContent = formatHealthScore(health.healthScore);
    }
    if (eventStatus) {
      setBadge(eventStatus, selectedEvent ? selectedEvent.status : "Pending", selectedEvent && selectedEvent.riskLevel ? selectedEvent.riskLevel : "STABLE");
    }
    if (eventName) {
      eventName.textContent = selectedEvent ? selectedEvent.name : "No event selected";
    }
    if (eventMeta) {
      eventMeta.textContent = selectedEvent
        ? (selectedEvent.code + " · " + (selectedEvent.category || "Category pending") + " · " + (selectedEvent.venue || "Venue pending"))
        : "Select an event to review its report summary.";
    }
    if (attendanceNote) {
      attendanceNote.textContent = attendance.note || "Attendance summary will render after the report loads.";
    }
    if (healthTrend) {
      healthTrend.textContent = health.trend || "Pending";
    }
    if (healthSnapshot) {
      healthSnapshot.textContent = health.snapshotAt ? "Snapshot recorded at " + formatTimestamp(health.snapshotAt) : "Waiting for the latest health snapshot.";
    }
    if (volunteerCoverage) {
      volunteerCoverage.textContent = attendance.volunteerCoverage || "0%";
    }
    if (noShowBuffer) {
      noShowBuffer.textContent = attendance.noShowBuffer || "0%";
    }
    if (feedbackTitle) {
      feedbackTitle.textContent = feedback.title || "Feedback summary";
    }
    if (feedbackSummary) {
      feedbackSummary.textContent = feedback.summary || "Feedback insights will render after the report loads.";
    }
    if (volunteerTitle) {
      volunteerTitle.textContent = volunteer.title || "Volunteer performance";
    }
    if (volunteerSummary) {
      volunteerSummary.textContent = volunteer.summary || "Volunteer performance insights will render after the report loads.";
    }
    setBadge(feedbackTrend, feedback.trend || "Pending", feedback.trend || "STABLE");
    setBadge(volunteerTrend, volunteer.trend || "Pending", volunteer.trend || "STABLE");
    setBadge(healthBadge, health.trend || "Pending", health.trend || "STABLE");
    if (healthAttendance) {
      healthAttendance.textContent = formatPercent(health.attendanceRatio);
    }
    if (healthEngagement) {
      healthEngagement.textContent = formatRatio(health.engagementScore);
    }
    if (healthVolunteer) {
      healthVolunteer.textContent = formatRatio(health.volunteerEfficiencyScore);
    }
    if (healthTimestamp) {
      healthTimestamp.textContent = formatTimestamp(health.snapshotAt);
    }
    if (lastUpdated) {
      lastUpdated.textContent = health.snapshotAt ? "Latest snapshot: " + formatTimestamp(health.snapshotAt) : "Report summary loaded successfully.";
    }
    setStatus("Ready", health.trend || feedback.trend || volunteer.trend || "STABLE");
  }

  function render() {
    syncStaticSummary();

    if (!state.events.length) {
      renderEmptyState();
      return;
    }

    if (state.loading) {
      renderLoadingState();
      return;
    }

    if (state.errorMessage) {
      renderErrorState();
      return;
    }

    renderReport();
  }

  function loadReport() {
    if (!apiClient || !state.selectedEventId) {
      return Promise.resolve(null);
    }

    state.loading = true;
    state.errorMessage = "";
    render();

    return apiClient.get("/api/admin/reports/" + state.selectedEventId, { retries: 1 })
      .then(function (response) {
        if (!response || !response.ok || !response.data) {
          state.report = null;
          state.errorMessage = response && response.message ? response.message : "The report request failed. Try refreshing the selected event.";
          return response;
        }

        state.report = response.data;
        return response;
      })
      .catch(function () {
        state.report = null;
        state.errorMessage = "The report request failed. Try refreshing the selected event.";
        return null;
      })
      .finally(function () {
        state.loading = false;
        render();
      });
  }

  function bindEvents() {
    if (eventSelect) {
      eventSelect.addEventListener("change", function (event) {
        state.selectedEventId = Number(event.target.value);
        loadReport();
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener("click", function () {
        loadReport();
      });
    }
  }

  function hydrate() {
    if (!pageApi) {
      return;
    }

    var roleContext = pageApi.requireRole(getGateConfig());
    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 13 reporting is active.",
        phaseCopy: "Admin reports now load live summary data from the validated reporting API while the phase continues into deeper analytics slices.",
        topbarEyebrow: "Admin reporting",
        topbarTitle: "Admin reports"
      }
    });

    state.events = parseBootstrap().events || [];
    pageApi.bindLogout(logoutButtons, "/login.jsp");
    populateEventSelect();
    bindEvents();

    if (!state.events.length) {
      render();
      return;
    }

    if (!state.selectedEventId || !findEvent(state.selectedEventId)) {
      state.selectedEventId = Number(state.events[0].eventId);
      if (eventSelect) {
        eventSelect.value = String(state.selectedEventId);
      }
    }

    loadReport();
  }

  hydrate();
})();