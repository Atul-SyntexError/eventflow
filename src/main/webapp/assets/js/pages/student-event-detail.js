(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var bootstrapScript = document.getElementById("student-event-detail-bootstrap");
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-detail-content]");
  var registrationMetric = document.querySelector("[data-student-detail-registration-metric]");
  var startMetric = document.querySelector("[data-student-detail-start-metric]");
  var healthScoreMetric = document.querySelector("[data-student-detail-health-score-metric]");
  var healthTrendMetric = document.querySelector("[data-student-detail-health-trend-metric]");
  var detailTitle = document.querySelector("[data-student-detail-title]");
  var detailMeta = document.querySelector("[data-student-detail-meta]");
  var detailCategory = document.querySelector("[data-student-detail-category]");
  var detailDescription = document.querySelector("[data-student-detail-description]");
  var registrationWindow = document.querySelector("[data-student-detail-registration-window]");
  var attendanceValue = document.querySelector("[data-student-detail-attendance]");
  var timelineList = document.querySelector("[data-student-detail-timeline-list]");
  var liveUpdateList = document.querySelector("[data-student-detail-live-update-list]");
  var registrationBadge = document.querySelector("[data-student-detail-registration-badge]");
  var registrationStatus = document.querySelector("[data-student-detail-registration-status]");
  var registrationAt = document.querySelector("[data-student-detail-registration-at]");
  var registrationCopy = document.querySelector("[data-student-detail-registration-copy]");
  var registrationSummary = document.querySelector("[data-student-detail-registration-summary]");
  var registerButton = document.querySelector("[data-student-detail-register-button]");
  var resetButton = document.querySelector("[data-student-detail-reset-button]");
  var recommendationTitle = document.querySelector("[data-student-detail-recommendation-title]");
  var recommendationHeadline = document.querySelector("[data-student-detail-recommendation-headline]");
  var recommendationTags = document.querySelector("[data-student-detail-recommendation-tags]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
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
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var previewController = null;
  var state = {
    previewMode: "ready",
    data: null,
    recommendations: [],
    recommendationsState: "idle",
    submittingRegistration: false,
    registrationMessage: "Registration request output will render here after a live registration action is triggered."
  };

  function createDefaultData() {
    return {
      detail: null,
      registration: null
    };
  }

  function formatLabel(value) {
    return String(value || "").replace(/_/g, " ");
  }

  function formatDateTime(value) {
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

  function formatScore(value) {
    if (value === null || value === undefined || value === "") {
      return "--";
    }

    var number = Number(value);
    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toFixed(2);
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
    if (!rawData || typeof rawData !== "object") {
      return fallback;
    }

    return {
      detail: rawData.detail || null,
      registration: rawData.registration || null
    };
  }

  function getDetail() {
    return state.data ? state.data.detail : null;
  }

  function getRegistration() {
    return state.data ? state.data.registration : null;
  }

  function getHealthSnapshot() {
    var detail = getDetail();
    return detail && detail.healthSnapshot ? detail.healthSnapshot : null;
  }

  function getCurrentRecommendation() {
    var detail = getDetail();
    if (!detail || !Array.isArray(state.recommendations)) {
      return null;
    }

    return state.recommendations.find(function (recommendation) {
      return recommendation && Number(recommendation.eventId) === Number(detail.eventId);
    }) || null;
  }

  function getAlternativeRecommendation() {
    var detail = getDetail();
    if (!Array.isArray(state.recommendations) || !state.recommendations.length) {
      return null;
    }

    return state.recommendations.find(function (recommendation) {
      return recommendation && (!detail || Number(recommendation.eventId) !== Number(detail.eventId));
    }) || null;
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading event detail",
        message: "Skeleton placeholders simulate the student event detail flow while route data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty event detail",
        message: "No event detail is available for this route."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Event detail unavailable",
        message: "Safe fallback copy remains visible while the event detail route is unavailable."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function renderMetrics(detail, registration, healthSnapshot) {
    if (state.previewMode === "loading") {
      registrationMetric.textContent = "...";
      startMetric.textContent = "...";
      healthScoreMetric.textContent = "...";
      healthTrendMetric.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      registrationMetric.textContent = "No event";
      startMetric.textContent = "No event";
      healthScoreMetric.textContent = "No event";
      healthTrendMetric.textContent = "No event";
      return;
    }

    if (state.previewMode === "error") {
      registrationMetric.textContent = "--";
      startMetric.textContent = "--";
      healthScoreMetric.textContent = "--";
      healthTrendMetric.textContent = "--";
      return;
    }

    registrationMetric.textContent = registration ? formatLabel(registration.status) : "OPEN";
    startMetric.textContent = detail ? formatDateTime(detail.startAt) : "--";
    healthScoreMetric.textContent = healthSnapshot ? formatScore(healthSnapshot.healthScore) : "--";
    healthTrendMetric.textContent = healthSnapshot ? formatLabel(healthSnapshot.trend) : "--";
  }

  function renderDetail(detail) {
    if (state.previewMode === "loading") {
      detailTitle.textContent = "Loading event detail";
      detailMeta.textContent = "Student event detail is being prepared.";
      detailCategory.textContent = "Loading";
      detailDescription.textContent = "Student event detail content will render here once the selected route loads.";
      registrationWindow.textContent = "Loading";
      attendanceValue.textContent = "Loading";
      timelineList.innerHTML = "<li>Timeline items are being prepared.</li>";
      return;
    }

    if (state.previewMode === "empty" || !detail) {
      detailTitle.textContent = "No event selected";
      detailMeta.textContent = "Open this route from student discovery to inspect a specific event.";
      detailCategory.textContent = "Empty";
      detailDescription.textContent = "Schedule, venue, resource planning, and registration context will render here once an event is selected.";
      registrationWindow.textContent = "No event";
      attendanceValue.textContent = "No event";
      timelineList.innerHTML = "<li>No timeline items are visible for this route.</li>";
      return;
    }

    if (state.previewMode === "error") {
      detailTitle.textContent = "Event detail unavailable";
      detailMeta.textContent = "The live student event detail request failed.";
      detailCategory.textContent = "Unavailable";
      detailDescription.textContent = "Safe fallback copy remains visible while the detail route is unavailable.";
      registrationWindow.textContent = "Unavailable";
      attendanceValue.textContent = "Unavailable";
      timelineList.innerHTML = "<li>Timeline is unavailable because the event detail route failed.</li>";
      return;
    }

    detailTitle.textContent = detail.name;
    detailMeta.textContent = detail.venue + " • " + formatDateTime(detail.startAt) + " to " + formatDateTime(detail.endAt);
    detailCategory.textContent = detail.category;
    detailDescription.textContent = detail.description;
    registrationWindow.textContent = formatDateTime(detail.registrationOpenAt) + " to " + formatDateTime(detail.registrationCloseAt);
    attendanceValue.textContent = String(detail.expectedAttendance);
    timelineList.innerHTML = (detail.timeline || [])
      .map(function (item) {
        return '<li><div class="task-meta-row"><strong>' + item.label + '</strong><span class="badge badge-neutral">' + formatLabel(item.status) + '</span></div><span class="text-muted">' + formatDateTime(item.startAt) + ' to ' + formatDateTime(item.endAt) + '</span></li>';
      })
      .join("") || "<li>No timeline items are available yet.</li>";
  }

  function renderLiveUpdates() {
    if (state.previewMode === "loading") {
      liveUpdateList.innerHTML = '<li class="activity-item"><strong>Loading live updates</strong><span class="activity-meta">Route-level event notices are being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      liveUpdateList.innerHTML = '<li class="activity-item"><strong>No event selected</strong><span class="activity-meta">Live notices will render once an event is loaded.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      liveUpdateList.innerHTML = '<li class="activity-item"><strong>Updates unavailable</strong><span class="activity-meta">The live detail route is currently unavailable.</span></li>';
      return;
    }

    liveUpdateList.innerHTML = '<li class="activity-item"><strong>Live updates are not published yet</strong><span class="activity-meta">This student detail route is now live for schedule and health data, while event notices remain a later slice.</span></li>';
  }

  function getStatusVariant(value) {
    if (value === "REGISTERED" || value === "CHECKED_IN") {
      return "success";
    }

    if (value === "WAITLISTED") {
      return "warning";
    }

    if (value === "OPEN") {
      return "info";
    }

    return "neutral";
  }

  function renderRegistration(registration, detail) {
    var status = registration ? registration.status : "OPEN";
    var variant = getStatusVariant(status);
    var canRegister = !!detail && status === "OPEN" && !state.submittingRegistration;

    registrationBadge.className = "badge badge-" + variant;

    if (state.previewMode === "loading") {
      registrationBadge.textContent = "Loading";
      registrationStatus.textContent = "Loading";
      registrationAt.textContent = "Loading";
      registrationCopy.textContent = "Registration state is loading.";
      registerButton.disabled = true;
      return;
    }

    if (state.previewMode === "empty") {
      registrationBadge.textContent = "No event";
      registrationStatus.textContent = "No event";
      registrationAt.textContent = "No event";
      registrationCopy.textContent = "Open this route from discovery before attempting registration.";
      registerButton.disabled = true;
      return;
    }

    if (state.previewMode === "error") {
      registrationBadge.className = "badge badge-danger";
      registrationBadge.textContent = "Unavailable";
      registrationStatus.textContent = "Unavailable";
      registrationAt.textContent = "Unavailable";
      registrationCopy.textContent = "Registration is unavailable because the event detail route failed.";
      registerButton.disabled = true;
      return;
    }

    registrationBadge.textContent = formatLabel(status);
    registrationStatus.textContent = formatLabel(status);
    registrationAt.textContent = registration && registration.registeredAt
      ? formatDateTime(registration.registeredAt)
      : "Not submitted yet";

    if (state.submittingRegistration) {
      registrationCopy.textContent = "Submitting the live student registration request.";
    } else if (status === "OPEN") {
      registrationCopy.textContent = "This event is open for registration. Use the live action below to create your registration.";
    } else {
      registrationCopy.textContent = "This event already has a persisted registration state for your student account.";
    }

    registerButton.disabled = !canRegister;
  }

  function renderRecommendation() {
    if (state.previewMode === "loading") {
      recommendationTitle.textContent = "Loading recommendation context";
      recommendationHeadline.textContent = "Recommendation context is being prepared.";
      recommendationTags.innerHTML = "";
      return;
    }

    if (state.previewMode === "empty") {
      recommendationTitle.textContent = "No event selected";
      recommendationHeadline.textContent = "Recommendation cues render after an event detail payload is available.";
      recommendationTags.innerHTML = "";
      return;
    }

    if (state.previewMode === "error") {
      recommendationTitle.textContent = "Recommendation cues unavailable";
      recommendationHeadline.textContent = "The page could not load recommendation context because the event detail route failed.";
      recommendationTags.innerHTML = "";
      return;
    }

    if (state.recommendationsState === "loading") {
      recommendationTitle.textContent = "Loading recommendation cues";
      recommendationHeadline.textContent = "The shared student recommendation endpoint is being checked for this event.";
      recommendationTags.innerHTML = "";
      return;
    }

    if (state.recommendationsState === "error") {
      recommendationTitle.textContent = "Recommendation cues unavailable";
      recommendationHeadline.textContent = "The recommendation endpoint could not be loaded for this event detail page.";
      recommendationTags.innerHTML = "";
      return;
    }

    var currentRecommendation = getCurrentRecommendation();
    var alternativeRecommendation = getAlternativeRecommendation();
    var registration = getRegistration();

    if (currentRecommendation) {
      recommendationTitle.textContent = "Recommended for you";
      recommendationHeadline.textContent = currentRecommendation.headline;
      renderRecommendationTags(currentRecommendation.reasonTags, currentRecommendation.score);
      return;
    }

    if (alternativeRecommendation) {
      recommendationTitle.textContent = "Another strong fit";
      recommendationHeadline.textContent = alternativeRecommendation.name + " is also open: " + alternativeRecommendation.headline;
      renderRecommendationTags(alternativeRecommendation.reasonTags, alternativeRecommendation.score);
      return;
    }

    if (registration && registration.status && registration.status !== "OPEN") {
      recommendationTitle.textContent = "Registration already in progress";
      recommendationHeadline.textContent = "This event already has a live registration state for your account, so recommendation cues will focus on other open events when they are available.";
      recommendationTags.innerHTML = "";
      return;
    }

    recommendationTitle.textContent = "No open recommendations yet";
    recommendationHeadline.textContent = "Recommendation cues will appear here when matching open events are available for your student account.";
    recommendationTags.innerHTML = "";
  }

  function renderRecommendationTags(tags, score) {
    var values = [];

    if (score !== null && score !== undefined && score !== "") {
      values.push("Score " + formatScore(score));
    }

    (tags || []).forEach(function (tag) {
      if (tag) {
        values.push(String(tag));
      }
    });

    recommendationTags.innerHTML = "";
    values.slice(0, 4).forEach(function (value, index) {
      var badge = document.createElement("span");
      badge.className = index === 0 ? "badge badge-success" : "badge badge-neutral";
      badge.textContent = value;
      recommendationTags.appendChild(badge);
    });
  }

  function renderDetailPage() {
    var detail = state.previewMode === "ready" ? getDetail() : null;
    var registration = state.previewMode === "ready" ? getRegistration() : null;
    var healthSnapshot = state.previewMode === "ready" ? getHealthSnapshot() : null;

    renderMetrics(detail, registration, healthSnapshot);
    renderDetail(detail);
    renderLiveUpdates();
    renderRegistration(registration, detail);
    renderRecommendation();
    registrationSummary.textContent = state.registrationMessage;
    syncPreviewPanel();
  }

  async function handleRegistration() {
    var detail = getDetail();
    var registration = getRegistration();

    if (!apiClient || !detail || state.submittingRegistration || (registration && registration.status !== "OPEN")) {
      return;
    }

    state.submittingRegistration = true;
    state.registrationMessage = "Submitting live registration request.";
    renderDetailPage();

    try {
      var result = await apiClient.post(
        "/api/student/events/" + detail.eventId + "/registrations",
        { eventId: detail.eventId }
      );

      if (result.ok && result.data) {
        state.data.registration = result.data;
        state.registrationMessage = result.message || "Registration created successfully.";
      } else {
        state.registrationMessage = result.message || "Registration could not be completed.";
      }
    } catch (error) {
      state.registrationMessage = "Registration could not be completed.";
    }

    state.submittingRegistration = false;
    renderDetailPage();
  }

  function bindEvents() {
    if (registerButton) {
      registerButton.addEventListener("click", function () {
        handleRegistration();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        window.location.href = contextPath + "/student/registrations";
      });
    }
  }

  async function loadRecommendations() {
    if (!apiClient || !getDetail()) {
      return;
    }

    state.recommendationsState = "loading";
    renderDetailPage();

    try {
      var result = await apiClient.get("/api/student/recommendations");
      if (result.ok && Array.isArray(result.data)) {
        state.recommendations = result.data;
        state.recommendationsState = "ready";
      } else {
        state.recommendations = [];
        state.recommendationsState = "error";
      }
    } catch (error) {
      state.recommendations = [];
      state.recommendationsState = "error";
    }

    renderDetailPage();
  }

  function hydrateDetailPage() {
    if (!pageApi || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Student",
        blockedTitle: "Student event detail blocked",
        phaseTitle: "Student event detail is gated.",
        phaseCopy: "Student pages should only render for authenticated student sessions.",
        missingSessionMessage: "Open login first and sign in with the student account to view event detail."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 11 event detail health is active.",
        phaseCopy: "Student event detail now loads live registration, schedule, resource, health snapshot, and recommendation data while event notices remain a later slice.",
        topbarEyebrow: "Student event detail",
        topbarTitle: "Student event detail"
      }
    });

    state.data = normalizeData(parseBootstrapData());
    pageApi.bindLogout(logoutButtons, "/login");
    bindEvents();

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          renderDetailPage();
        }
      });
      state.previewMode = previewController.getState();
    }

    if (!state.data.detail) {
      state.previewMode = "empty";
    }

    renderDetailPage();

    if (state.previewMode === "ready" && state.data.detail) {
      loadRecommendations();
    }
  }

  hydrateDetailPage();
})();