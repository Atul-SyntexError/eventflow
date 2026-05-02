(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var bootstrapScript = document.getElementById("student-checkin-bootstrap");
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-checkin-content]");
  var eligibleCount = document.querySelector("[data-student-checkin-eligible-count]");
  var recordedCount = document.querySelector("[data-student-checkin-recorded-count]");
  var selectedEventMetric = document.querySelector("[data-student-checkin-selected-event]");
  var selectedStatusMetric = document.querySelector("[data-student-checkin-selected-status]");
  var eventSelect = document.querySelector("[data-student-checkin-event-select]");
  var codeInput = document.querySelector("[data-student-checkin-code-input]");
  var venueValue = document.querySelector("[data-student-checkin-venue]");
  var scheduleValue = document.querySelector("[data-student-checkin-schedule]");
  var codeHint = document.querySelector("[data-student-checkin-code-hint]");
  var summary = document.querySelector("[data-student-checkin-summary]");
  var recentList = document.querySelector("[data-student-checkin-recent-list]");
  var submitButton = document.querySelector("[data-student-checkin-submit]");
  var resetButton = document.querySelector("[data-student-checkin-reset]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var checkInAlert = document.querySelector("[data-student-checkin-alert]");
  var checkInAlertTitle = document.querySelector("[data-student-checkin-alert-title]");
  var checkInAlertMessage = document.querySelector("[data-student-checkin-alert-message]");
  var fieldErrorNodes = {
    eventId: document.querySelector("[data-student-checkin-event-error]"),
    confirmationCode: document.querySelector("[data-student-checkin-code-error]")
  };
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "STUDENT",
        gatedContent: content,
        gatePanel: gatePanel,
        gateTitle: gateTitle,
        gateMessage: gateMessage
      })
    : null;
  var previewController = null;
  var state = {
    previewMode: "ready",
    selectedEventId: null,
    confirmationCode: "",
    data: null,
    message: "Select an eligible event to submit a live check-in request.",
    isSubmitting: false
  };

  function createDefaultData() {
    return {
      eligibleEvents: [],
      recentResults: []
    };
  }

  function formatLabel(value) {
    return String(value || "").replace(/_/g, " ");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseBootstrapData() {
    if (!bootstrapScript) {
      return null;
    }

    try {
      return JSON.parse(bootstrapScript.textContent || "null");
    } catch (error) {
      return null;
    }
  }

  function normalizeData(rawData) {
    var fallback = createDefaultData();
    var dataset = rawData && typeof rawData === "object" ? rawData : {};
    return {
      eligibleEvents: Array.isArray(dataset.eligibleEvents) ? dataset.eligibleEvents.slice() : fallback.eligibleEvents.slice(),
      recentResults: Array.isArray(dataset.recentResults) ? dataset.recentResults.slice() : fallback.recentResults.slice()
    };
  }

  function formatTimestamp(value) {
    if (!value) {
      return "TBD";
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var hours = String(date.getHours()).padStart(2, "0");
    var minutes = String(date.getMinutes()).padStart(2, "0");
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
  }

  function getInitialEventId() {
    if (!state.data || !state.data.eligibleEvents.length) {
      return null;
    }

    var params = new URLSearchParams(window.location.search);
    var eventId = Number(params.get("eventId"));
    var match = state.data.eligibleEvents.find(function (eventItem) {
      return eventItem.eventId === eventId;
    });

    return match ? match.eventId : state.data.eligibleEvents[0].eventId;
  }

  function ensureSelectedEventId() {
    if (!state.data || !state.data.eligibleEvents.length) {
      state.selectedEventId = null;
      return;
    }

    var exists = state.data.eligibleEvents.some(function (eventItem) {
      return eventItem.eventId === state.selectedEventId;
    });

    if (!exists) {
      state.selectedEventId = getInitialEventId();
    }
  }

  function getSelectedEvent() {
    if (!state.data) {
      return null;
    }

    return state.data.eligibleEvents.find(function (eventItem) {
      return eventItem.eventId === state.selectedEventId;
    }) || null;
  }

  function populateSelect() {
    if (!eventSelect || !state.data) {
      return;
    }

    if (!state.data.eligibleEvents.length) {
      eventSelect.innerHTML = '<option value="">No eligible events</option>';
      eventSelect.value = "";
      eventSelect.disabled = true;
      return;
    }

    eventSelect.disabled = false;

    eventSelect.innerHTML = state.data.eligibleEvents
      .map(function (eventItem) {
        return '<option value="' + eventItem.eventId + '">' + eventItem.eventName + '</option>';
      })
      .join('');

    if (state.selectedEventId) {
      eventSelect.value = String(state.selectedEventId);
    }
  }

  function clearFieldErrors() {
    Object.keys(fieldErrorNodes).forEach(function (field) {
      var node = fieldErrorNodes[field];
      if (node) {
        node.hidden = true;
        node.textContent = "";
      }
    });
  }

  function showAlert(variant, title, message) {
    if (!checkInAlert) {
      return;
    }

    checkInAlert.hidden = false;
    checkInAlert.className = "alert " + (variant === "success" ? "alert-info" : "alert-danger");
    if (checkInAlertTitle) {
      checkInAlertTitle.textContent = title;
    }
    if (checkInAlertMessage) {
      checkInAlertMessage.textContent = message;
    }
  }

  function hideAlert() {
    if (!checkInAlert) {
      return;
    }

    checkInAlert.hidden = true;
    checkInAlert.className = "alert alert-danger";
    if (checkInAlertTitle) {
      checkInAlertTitle.textContent = "Unable to record check-in";
    }
    if (checkInAlertMessage) {
      checkInAlertMessage.textContent = "Fix the highlighted issues and try again.";
    }
  }

  function applyFieldErrors(errors) {
    var globalMessage = null;

    (errors || []).forEach(function (error) {
      if (!error) {
        return;
      }

      if (!error.field) {
        globalMessage = globalMessage || error.message;
        return;
      }

      var node = fieldErrorNodes[error.field];
      if (!node) {
        globalMessage = globalMessage || error.message;
        return;
      }

      node.hidden = false;
      node.textContent = error.message;
    });

    if (globalMessage) {
      showAlert("error", "Unable to record check-in", globalMessage);
    }
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the student check-in flow while route data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful student check-in response with no eligible events yet."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed student check-in request while keeping safe fallback copy visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function renderMetrics(selectedEvent) {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      eligibleCount.textContent = "...";
      recordedCount.textContent = "...";
      selectedEventMetric.textContent = "...";
      selectedStatusMetric.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      eligibleCount.textContent = "0";
      recordedCount.textContent = "0";
      selectedEventMetric.textContent = "0";
      selectedStatusMetric.textContent = "0";
      return;
    }

    if (state.previewMode === "error") {
      eligibleCount.textContent = "--";
      recordedCount.textContent = "--";
      selectedEventMetric.textContent = "--";
      selectedStatusMetric.textContent = "--";
      return;
    }

    eligibleCount.textContent = String(state.data.eligibleEvents.length);
    recordedCount.textContent = String(state.data.recentResults.length + state.previewResults.length);
    selectedEventMetric.textContent = selectedEvent ? selectedEvent.eventName : "--";
    selectedStatusMetric.textContent = selectedEvent ? formatLabel(selectedEvent.status) : "--";
  }

  function renderForm(selectedEvent) {
    if (state.previewMode === "loading") {
      venueValue.textContent = "Loading";
      scheduleValue.textContent = "Loading";
      codeHint.textContent = "Confirmation guidance is loading.";
      submitButton.disabled = true;
      return;
    }

    if (state.previewMode === "empty" || !selectedEvent) {
      venueValue.textContent = "No event";
      scheduleValue.textContent = "No event";
      codeHint.textContent = "No eligible registered event is available in this preview state.";
      submitButton.disabled = true;
      return;
    }

    if (state.previewMode === "error") {
      venueValue.textContent = "Unavailable";
      scheduleValue.textContent = "Unavailable";
      codeHint.textContent = "Check-in preview is unavailable because this route is simulating an error.";
      submitButton.disabled = true;
      return;
    }

    venueValue.textContent = selectedEvent.venue;
    scheduleValue.textContent = selectedEvent.startAt + ' to ' + selectedEvent.endAt;
    codeHint.textContent = 'Use the event code ' + selectedEvent.confirmationCodeHint + ' to confirm attendance.';
    submitButton.disabled = state.isSubmitting;
    submitButton.textContent = state.isSubmitting ? "Recording..." : "Record check-in";

    if (codeInput) {
      codeInput.value = state.confirmationCode;
    }
  }

  function renderRecentResults() {
    if (state.previewMode === "loading") {
      recentList.innerHTML = '<li class="activity-item"><strong>Loading confirmations</strong><span class="activity-meta">Recent check-in results are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      recentList.innerHTML = '<li class="activity-item"><strong>No confirmations yet</strong><span class="activity-meta">No recent check-ins are visible in this preview state.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      recentList.innerHTML = '<li class="activity-item"><strong>Check-in results unavailable</strong><span class="activity-meta">The preview is simulating a failed check-in request.</span></li>';
      return;
    }

    var results = state.data.recentResults;

    if (!results.length) {
      recentList.innerHTML = '<li class="activity-item"><strong>No confirmations loaded yet</strong><span class="activity-meta">Recent check-in results will render here.</span></li>';
      return;
    }

    recentList.innerHTML = results
      .map(function (result) {
        return '<li class="activity-item"><div class="task-meta-row"><strong>' + escapeHtml(result.eventName) + '</strong><span class="badge badge-success">' + formatLabel(result.status) + '</span></div><span class="activity-meta">' + escapeHtml(result.checkedInAt) + ' • ' + escapeHtml(result.note) + '</span></li>';
      })
      .join('');
  }

  function renderCheckInPage() {
    var selectedEvent = state.previewMode === "ready" ? getSelectedEvent() : null;

    renderMetrics(selectedEvent);
    renderForm(selectedEvent);
    renderRecentResults();
    summary.textContent = state.message;
    syncPreviewPanel();
  }

  function bindEvents() {
    if (eventSelect) {
      eventSelect.addEventListener("change", function (event) {
        state.selectedEventId = Number(event.target.value);
        renderCheckInPage();
      });
    }

    if (codeInput) {
      codeInput.addEventListener("input", function (event) {
        state.confirmationCode = event.target.value;
      });
    }

    if (submitButton) {
      submitButton.addEventListener("click", async function () {
        var selectedEvent = getSelectedEvent();
        var trimmedCode = state.confirmationCode.trim();

        clearFieldErrors();
        hideAlert();

        if (!selectedEvent) {
          state.message = "No eligible event is available for check-in.";
          renderCheckInPage();
          return;
        }

        if (!trimmedCode) {
          state.message = "Enter the event code before recording check-in.";
          if (fieldErrorNodes.confirmationCode) {
            fieldErrorNodes.confirmationCode.hidden = false;
            fieldErrorNodes.confirmationCode.textContent = "Confirmation code is required.";
          }
          renderCheckInPage();
          return;
        }

        if (!apiClient) {
          state.message = "Live API client is unavailable for this page.";
          showAlert("error", "Unable to record check-in", state.message);
          renderCheckInPage();
          return;
        }

        state.isSubmitting = true;
        state.message = "Submitting live student check-in request.";
        renderCheckInPage();

        try {
          var response = await apiClient.post(
            "/api/student/events/" + selectedEvent.eventId + "/check-in",
            {
              eventId: selectedEvent.eventId,
              confirmationCode: trimmedCode
            }
          );

          if (!response || response.success !== true) {
            applyFieldErrors(response && response.errors ? response.errors : []);
            if (!response || !response.errors || !response.errors.length) {
              showAlert(
                "error",
                "Unable to record check-in",
                response && response.message ? response.message : "Check-in could not be completed."
              );
            }
            state.message = response && response.message ? response.message : "Check-in could not be completed.";
            return;
          }

          state.data.eligibleEvents = state.data.eligibleEvents.filter(function (eventItem) {
            return eventItem.eventId !== selectedEvent.eventId;
          });
          state.data.recentResults.unshift({
            eventId: selectedEvent.eventId,
            eventName: selectedEvent.eventName,
            status: response.data && response.data.status ? response.data.status : "CHECKED_IN",
            checkedInAt: formatTimestamp(response.data && response.data.checkedInAt),
            note: "Attendance confirmed."
          });
          state.confirmationCode = "";
          ensureSelectedEventId();
          populateSelect();
          state.message = "Check-in recorded successfully for " + selectedEvent.eventName + ".";
          showAlert("success", "Check-in recorded", state.message);
        } catch (error) {
          state.message = error && error.message ? error.message : "Check-in could not be completed.";
          showAlert("error", "Unable to record check-in", state.message);
        } finally {
          state.isSubmitting = false;
          renderCheckInPage();
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        state.confirmationCode = "";
        state.message = "Select an eligible event to submit a live check-in request.";
        clearFieldErrors();
        hideAlert();
        renderCheckInPage();
      });
    }
  }

  function hydrateCheckInPage() {
    if (!pageApi || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Student",
        blockedTitle: "Student check-in blocked",
        phaseTitle: "Phase 6 preview is gated.",
        phaseCopy: "Student pages should only render for student sessions while frontend flows remain mocked.",
        missingSessionMessage: "Open the login preview first and sign in with the student demo account to view check-in."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 10 check-in is active.",
        phaseCopy: "Student check-in now uses live backend eligibility and attendance updates on the shared student shell.",
        topbarEyebrow: "Student check-in",
        topbarTitle: "Student check-in"
      }
    });

    state.data = normalizeData(parseBootstrapData());
    ensureSelectedEventId();
    populateSelect();
    pageApi.bindLogout(logoutButtons, "/login");
    bindEvents();

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          renderCheckInPage();
        }
      });
      state.previewMode = previewController.getState();
    }

    renderCheckInPage();
  }

  hydrateCheckInPage();
})();