(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var bootstrapScript = document.getElementById("student-feedback-bootstrap");
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-feedback-content]");
  var eligibleCount = document.querySelector("[data-student-feedback-eligible-count]");
  var submissionCount = document.querySelector("[data-student-feedback-submission-count]");
  var selectedMoodMetric = document.querySelector("[data-student-feedback-selected-mood]");
  var selectedEventMetric = document.querySelector("[data-student-feedback-selected-event]");
  var eventSelect = document.querySelector("[data-student-feedback-event-select]");
  var moodButtons = document.querySelectorAll("[data-student-feedback-mood]");
  var promptTitle = document.querySelector("[data-student-feedback-prompt-title]");
  var promptCopy = document.querySelector("[data-student-feedback-prompt-copy]");
  var commentInput = document.querySelector("[data-student-feedback-comment]");
  var summary = document.querySelector("[data-student-feedback-summary]");
  var submissionList = document.querySelector("[data-student-feedback-submissions]");
  var submitButton = document.querySelector("[data-student-feedback-submit]");
  var resetButton = document.querySelector("[data-student-feedback-reset]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var feedbackAlert = document.querySelector("[data-student-feedback-alert]");
  var feedbackAlertTitle = document.querySelector("[data-student-feedback-alert-title]");
  var feedbackAlertMessage = document.querySelector("[data-student-feedback-alert-message]");
  var fieldErrorNodes = {
    eventId: document.querySelector("[data-student-feedback-event-error]"),
    mood: document.querySelector("[data-student-feedback-mood-error]"),
    comment: document.querySelector("[data-student-feedback-comment-error]")
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
    selectedMood: "POSITIVE",
    comment: "",
    data: null,
    message: "Select a checked-in event to submit a live feedback response.",
    isSubmitting: false
  };

  function formatLabel(value) {
    return String(value || "").replace(/_/g, " ");
  }

  function createDefaultData() {
    return {
      moodOptions: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      eligibleEvents: [],
      submissions: []
    };
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
      moodOptions: Array.isArray(dataset.moodOptions) && dataset.moodOptions.length ? dataset.moodOptions.slice() : fallback.moodOptions,
      eligibleEvents: Array.isArray(dataset.eligibleEvents) ? dataset.eligibleEvents.slice() : fallback.eligibleEvents.slice(),
      submissions: Array.isArray(dataset.submissions) ? dataset.submissions.slice() : fallback.submissions.slice()
    };
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
      .join("");

    if (state.selectedEventId) {
      eventSelect.value = String(state.selectedEventId);
    }
  }

  function syncMoodButtons() {
    Array.prototype.forEach.call(moodButtons, function (button) {
      var isActive = button.getAttribute("data-mood") === state.selectedMood;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading feedback",
        message: "Skeleton placeholders simulate the student feedback flow while route data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty feedback",
        message: "This simulates a successful feedback response with no eligible checked-in events."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Feedback error",
        message: "This simulates a failed student feedback request with safe fallback copy."
      });
      return;
    }

    previewController.setPanel(null);
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
    if (!feedbackAlert) {
      return;
    }

    feedbackAlert.hidden = false;
    feedbackAlert.className = "alert " + (variant === "success" ? "alert-info" : "alert-danger");
    if (feedbackAlertTitle) {
      feedbackAlertTitle.textContent = title;
    }
    if (feedbackAlertMessage) {
      feedbackAlertMessage.textContent = message;
    }
  }

  function hideAlert() {
    if (!feedbackAlert) {
      return;
    }

    feedbackAlert.hidden = true;
    feedbackAlert.className = "alert alert-danger";
    if (feedbackAlertTitle) {
      feedbackAlertTitle.textContent = "Unable to submit feedback";
    }
    if (feedbackAlertMessage) {
      feedbackAlertMessage.textContent = "Fix the highlighted issues and try again.";
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
      showAlert("error", "Unable to submit feedback", globalMessage);
    }
  }

  function renderMetrics(selectedEvent) {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      eligibleCount.textContent = "...";
      submissionCount.textContent = "...";
      selectedMoodMetric.textContent = "...";
      selectedEventMetric.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      eligibleCount.textContent = "0";
      submissionCount.textContent = String(state.data.submissions.length);
      selectedMoodMetric.textContent = "0";
      selectedEventMetric.textContent = "0";
      return;
    }

    if (state.previewMode === "error") {
      eligibleCount.textContent = "--";
      submissionCount.textContent = "--";
      selectedMoodMetric.textContent = "--";
      selectedEventMetric.textContent = "--";
      return;
    }

    eligibleCount.textContent = String(state.data.eligibleEvents.length);
    submissionCount.textContent = String(state.data.submissions.length);
    selectedMoodMetric.textContent = formatLabel(state.selectedMood);
    selectedEventMetric.textContent = selectedEvent ? selectedEvent.eventName : "--";
  }

  function renderDraft(selectedEvent) {
    syncMoodButtons();

    if (state.previewMode === "loading") {
      promptTitle.textContent = "Loading feedback event";
      promptCopy.textContent = "Feedback guidance is being prepared.";
      submitButton.disabled = true;
      return;
    }

    if (state.previewMode === "error") {
      promptTitle.textContent = "Feedback unavailable";
      promptCopy.textContent = "Feedback submission is unavailable because this route is simulating an error.";
      submitButton.disabled = true;
      return;
    }

    if (!selectedEvent) {
      promptTitle.textContent = "No event selected";
      promptCopy.textContent = "No checked-in event is currently available for feedback.";
      submitButton.disabled = true;
      if (commentInput) {
        commentInput.value = state.comment;
      }
      return;
    }

    promptTitle.textContent = selectedEvent.eventName;
    promptCopy.textContent = selectedEvent.prompt;
    submitButton.disabled = state.previewMode !== "ready" || state.isSubmitting;
    submitButton.textContent = state.isSubmitting ? "Submitting..." : "Submit feedback";

    if (commentInput) {
      commentInput.value = state.comment;
    }
  }

  function renderSubmissions() {
    if (state.previewMode === "loading") {
      submissionList.innerHTML = '<li class="suggestion-item"><strong>Loading submissions</strong><span class="suggestion-copy">Recent feedback items are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      submissionList.innerHTML = '<li class="suggestion-item"><strong>Feedback unavailable</strong><span class="suggestion-copy">The route is simulating a failed student feedback request.</span></li>';
      return;
    }

    if (!state.data.submissions.length) {
      submissionList.innerHTML = '<li class="suggestion-item"><strong>No submissions loaded yet</strong><span class="suggestion-copy">Recent feedback items will render here after the first successful submission.</span></li>';
      return;
    }

    submissionList.innerHTML = state.data.submissions
      .map(function (submission) {
        return '<li class="suggestion-item"><div class="task-meta-row"><strong>' + submission.eventName + '</strong><span class="badge badge-info">' + formatLabel(submission.mood) + '</span></div><span class="suggestion-copy">' + (submission.comment || 'No additional comment provided.') + '</span><span class="text-muted">' + submission.submittedAt + '</span></li>';
      })
      .join("");
  }

  function renderFeedbackPage() {
    ensureSelectedEventId();
    populateSelect();

    var selectedEvent = state.previewMode === "ready" ? getSelectedEvent() : null;
    renderMetrics(selectedEvent);
    renderDraft(selectedEvent);
    renderSubmissions();
    if (summary) {
      summary.textContent = state.message;
    }
    syncPreviewPanel();
  }

  function submitFeedback() {
    var selectedEvent = getSelectedEvent();

    if (!selectedEvent || !apiClient || state.previewMode !== "ready" || state.isSubmitting) {
      return;
    }

    clearFieldErrors();
    hideAlert();
    state.isSubmitting = true;
    state.message = "Submitting feedback for " + selectedEvent.eventName + ".";
    renderFeedbackPage();

    var payload = {
      eventId: selectedEvent.eventId,
      mood: state.selectedMood,
      comment: state.comment.trim() || null
    };

    apiClient.post("/api/student/events/" + selectedEvent.eventId + "/feedback", payload, { retries: 1 })
      .then(function (response) {
        state.isSubmitting = false;

        if (!response.ok) {
          applyFieldErrors(response.errors || []);
          if (!response.errors || !response.errors.length) {
            showAlert("error", "Unable to submit feedback", response.message || "The feedback request failed.");
          }
          state.message = response.message || "The feedback request failed.";
          renderFeedbackPage();
          return;
        }

        state.data.submissions.unshift({
          eventId: selectedEvent.eventId,
          eventName: selectedEvent.eventName,
          mood: state.selectedMood,
          comment: payload.comment,
          submittedAt: new Date().toISOString()
        });
        state.data.eligibleEvents = state.data.eligibleEvents.filter(function (eventItem) {
          return eventItem.eventId !== selectedEvent.eventId;
        });
        state.comment = "";
        state.selectedMood = "POSITIVE";
        state.message = response.message || (selectedEvent.eventName + " feedback was submitted successfully.");
        showAlert("success", "Feedback submitted", state.message);
        renderFeedbackPage();
      })
      .catch(function () {
        state.isSubmitting = false;
        state.message = "The feedback request failed before a valid response was returned.";
        showAlert("error", "Unable to submit feedback", state.message);
        renderFeedbackPage();
      });
  }

  function bindEvents() {
    if (eventSelect) {
      eventSelect.addEventListener("change", function (event) {
        state.selectedEventId = event.target.value ? Number(event.target.value) : null;
        hideAlert();
        clearFieldErrors();
        renderFeedbackPage();
      });
    }

    Array.prototype.forEach.call(moodButtons, function (button) {
      button.addEventListener("click", function () {
        state.selectedMood = button.getAttribute("data-mood");
        clearFieldErrors();
        renderFeedbackPage();
      });
    });

    if (commentInput) {
      commentInput.addEventListener("input", function (event) {
        state.comment = event.target.value;
      });
    }

    if (submitButton) {
      submitButton.addEventListener("click", function () {
        submitFeedback();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        state.selectedMood = "POSITIVE";
        state.comment = "";
        state.message = "Select a checked-in event to submit a live feedback response.";
        clearFieldErrors();
        hideAlert();
        renderFeedbackPage();
      });
    }
  }

  function hydrateFeedbackPage() {
    if (!pageApi || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Student",
        blockedTitle: "Student feedback blocked",
        phaseTitle: "Phase 10 feedback is gated.",
        phaseCopy: "Student feedback should only render for student sessions while the backend slice is active.",
        missingSessionMessage: "Open the login screen first and sign in with the student demo account to view feedback."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 10 student feedback is active.",
        phaseCopy: "Student feedback now uses the live backend submission path while preserving the approved participation contract.",
        topbarEyebrow: "Student feedback",
        topbarTitle: "Student feedback"
      }
    });

    state.data = normalizeData(parseBootstrapData());
    state.selectedEventId = getInitialEventId();
    pageApi.bindLogout(logoutButtons, "/login");
    bindEvents();

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          renderFeedbackPage();
        }
      });
      state.previewMode = previewController.getState();
    }

    renderFeedbackPage();
  }

  hydrateFeedbackPage();
})();