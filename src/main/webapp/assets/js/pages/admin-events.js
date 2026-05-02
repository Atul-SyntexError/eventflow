(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var initialMode = body.getAttribute("data-event-initial-mode") || "list";
  var selectedEventIdValue = body.getAttribute("data-event-selected-id") || "";
  var initialSelectedEventId = selectedEventIdValue ? Number(selectedEventIdValue) : null;
  var mockData = window.EventFlowMockData || null;
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var bootstrapScript = document.getElementById("admin-event-bootstrap");
  var gatePanel = document.querySelector("[data-admin-gate]");
  var gateTitle = document.querySelector("[data-admin-gate-title]");
  var gateMessage = document.querySelector("[data-admin-gate-message]");
  var content = document.querySelector("[data-admin-events-content]");
  var summaryTotal = document.querySelector("[data-events-total]");
  var summaryLive = document.querySelector("[data-events-live]");
  var summaryDrafts = document.querySelector("[data-events-drafts]");
  var summaryAttention = document.querySelector("[data-events-attention]");
  var searchInput = document.querySelector("[data-event-search]");
  var statusFilter = document.querySelector("[data-event-status-filter]");
  var categoryFilter = document.querySelector("[data-event-category-filter]");
  var riskFilter = document.querySelector("[data-event-risk-filter]");
  var filterSummary = document.querySelector("[data-event-filter-summary]");
  var selectedSummary = document.querySelector("[data-event-selected-summary]");
  var tableBody = document.querySelector("[data-event-table-body]");
  var emptyState = document.querySelector("[data-event-empty-state]");
  var detailStatus = document.querySelector("[data-event-detail-status]");
  var detailTitle = document.querySelector("[data-event-detail-title]");
  var detailMeta = document.querySelector("[data-event-detail-meta]");
  var detailDescription = document.querySelector("[data-event-detail-description]");
  var detailHealth = document.querySelector("[data-event-detail-health]");
  var detailHealthMeta = document.querySelector("[data-event-detail-health-meta]");
  var detailFillRate = document.querySelector("[data-event-detail-fill-rate]");
  var detailCoverage = document.querySelector("[data-event-detail-coverage]");
  var resourceList = document.querySelector("[data-event-resource-list]");
  var riskList = document.querySelector("[data-event-risk-list]");
  var timelineList = document.querySelector("[data-event-timeline-list]");
  var formCaption = document.querySelector("[data-event-form-caption]");
  var modeButtons = document.querySelectorAll("[data-event-mode-button]");
  var createButtons = document.querySelectorAll("[data-event-create-button]");
  var resetFiltersButton = document.querySelector("[data-event-reset-filters]");
  var focusSelectedButton = document.querySelector("[data-event-focus-selected]");
  var formName = document.querySelector("[data-event-form-name]");
  var formCategory = document.querySelector("[data-event-form-category]");
  var formVenue = document.querySelector("[data-event-form-venue]");
  var formStatus = document.querySelector("[data-event-form-status]");
  var formStart = document.querySelector("[data-event-form-start]");
  var formEnd = document.querySelector("[data-event-form-end]");
  var formRegistrationOpen = document.querySelector("[data-event-form-registration-open]");
  var formRegistrationClose = document.querySelector("[data-event-form-registration-close]");
  var formDescription = document.querySelector("[data-event-form-description]");
  var formAttendance = document.querySelector("[data-event-form-attendance]");
  var resourceTableBody = document.querySelector("[data-event-form-resource-body]");
  var formFillRate = document.querySelector("[data-event-form-fill-rate]");
  var formWalkins = document.querySelector("[data-event-form-walkins]");
  var formNoShow = document.querySelector("[data-event-form-no-show]");
  var formVolunteerCoverage = document.querySelector("[data-event-form-volunteer-coverage]");
  var formPlanningNote = document.querySelector("[data-event-form-planning-note]");
  var formFeedback = document.querySelector("[data-event-form-feedback]");
  var formFeedbackTitle = document.querySelector("[data-event-form-feedback-title]");
  var formFeedbackMessage = document.querySelector("[data-event-form-feedback-message]");
  var saveButton = document.querySelector("[data-event-save-button]");
  var deleteButton = document.querySelector("[data-event-delete-button]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
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
    searchTerm: "",
    status: "ALL",
    category: "ALL",
    riskLevel: "ALL",
    selectedEventId: null,
    previewMode: "ready",
    formMode: "create",
    data: null
  };
  var previewController = null;

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function setBadgeClass(node, variant) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + variant;
  }

  function getRiskBadgeVariant(level) {
    if (level === "HIGH" || level === "CRITICAL") {
      return "danger";
    }

    if (level === "MEDIUM") {
      return "warning";
    }

    if (level === "LOW") {
      return "success";
    }

    return "neutral";
  }

  function getStatusBadgeVariant(status) {
    if (status === "LIVE") {
      return "success";
    }

    if (status === "REGISTRATION_OPEN") {
      return "info";
    }

    if (status === "PLANNED") {
      return "warning";
    }

    if (status === "REGISTRATION_CLOSED") {
      return "neutral";
    }

    if (status === "DRAFT") {
      return "warning";
    }

    if (status === "CANCELLED") {
      return "danger";
    }

    return "neutral";
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Mock data unavailable",
        message: "Shared mock data must load before the admin event preview can render.",
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin event management should only render for admin sessions while the frontend is still mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin event management blocked"
        }
      },
      missingSession: {
        title: "Admin preview needs a session",
        message: "Open the login preview first and sign in with the admin demo account to view event management.",
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin event management should only render for admin sessions while the frontend is still mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin event management blocked"
        }
      },
      wrongRole: {
        title: "This preview is admin-only",
        message: "The stored session belongs to another role, so the admin event management content is intentionally hidden.",
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin event management should only render for admin sessions while the frontend is still mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin event management blocked"
        }
      }
    };
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the event list, detail panel, and planning form while data is still loading."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful event-management response with no matching records, so the empty paths can be reviewed."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed event-management request while keeping safe fallback copy and planning surfaces visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function populateSelect(selectNode, options) {
    if (!selectNode) {
      return;
    }

    selectNode.innerHTML = options
      .map(function (option) {
        return '<option value="' + option + '">' + option.replace(/_/g, ' ') + '</option>';
      })
      .join("");
  }

  function createDefaultAttendancePlan() {
    return {
      forecastFillRate: "0%",
      projectedWalkIns: 0,
      noShowBuffer: "5%",
      volunteerCoverage: "100%",
      note: "Planning note pending."
    };
  }

  function createDefaultTemplate() {
    return {
      name: "",
      description: "",
      category: "Conference",
      venue: "",
      startAt: "",
      endAt: "",
      registrationOpenAt: "",
      registrationCloseAt: "",
      expectedAttendance: "",
      resourcePlan: [],
      status: "DRAFT",
      attendancePlan: createDefaultAttendancePlan()
    };
  }

  function createDefaultData() {
    return {
      summary: {
        totalEvents: 0,
        liveEvents: 0,
        draftEvents: 0,
        attentionRequired: 0
      },
      filterOptions: {
        statuses: ["ALL", "DRAFT", "PLANNED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "LIVE", "COMPLETED", "CANCELLED"],
        categories: ["ALL"],
        riskLevels: ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
      },
      events: [],
      details: [],
      createTemplate: createDefaultTemplate()
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

  function sortEvents(events) {
    return events.slice().sort(function (left, right) {
      var leftStart = left && left.startAt ? String(left.startAt) : "";
      var rightStart = right && right.startAt ? String(right.startAt) : "";
      if (leftStart === rightStart) {
        return Number(left.eventId || 0) - Number(right.eventId || 0);
      }
      return leftStart.localeCompare(rightStart);
    });
  }

  function buildSummary(events) {
    return {
      totalEvents: events.length,
      liveEvents: events.filter(function (eventItem) {
        return eventItem.status === "LIVE";
      }).length,
      draftEvents: events.filter(function (eventItem) {
        return eventItem.status === "DRAFT";
      }).length,
      attentionRequired: events.filter(function (eventItem) {
        return eventItem.riskLevel === "HIGH" || eventItem.riskLevel === "CRITICAL";
      }).length
    };
  }

  function buildFilterOptions(events) {
    var statuses = ["ALL"];
    var categories = ["ALL"];

    events.forEach(function (eventItem) {
      if (eventItem && eventItem.status && statuses.indexOf(eventItem.status) === -1) {
        statuses.push(eventItem.status);
      }
      if (eventItem && eventItem.category && categories.indexOf(eventItem.category) === -1) {
        categories.push(eventItem.category);
      }
    });

    return {
      statuses: statuses,
      categories: categories,
      riskLevels: ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
    };
  }

  function formatPercent(value) {
    var numeric = Number(value);
    if (!isFinite(numeric) || numeric <= 0) {
      return "0%";
    }
    if (numeric > 1) {
      numeric = 1;
    }
    return String(Math.round(numeric * 100)) + "%";
  }

  function buildAttendancePlan(summary, detail) {
    var expectedAttendance = Number(summary && summary.expectedAttendance != null ? summary.expectedAttendance : detail && detail.expectedAttendance != null ? detail.expectedAttendance : 0);
    var registeredCount = Number(summary && summary.registeredCount != null ? summary.registeredCount : 0);
    var fillRatio = expectedAttendance > 0 ? Math.min(registeredCount / expectedAttendance, 1) : 0;
    var requiredQuantity = 0;
    var allocatedQuantity = 0;

    (detail && Array.isArray(detail.resourcePlan) ? detail.resourcePlan : []).forEach(function (resource) {
      requiredQuantity += Number(resource && resource.quantityRequired != null ? resource.quantityRequired : 0);
      allocatedQuantity += Number(resource && resource.quantityAllocated != null ? resource.quantityAllocated : 0);
    });

    var coverageRatio = requiredQuantity > 0 ? Math.min(allocatedQuantity / requiredQuantity, 1) : 1;
    var projectedWalkIns = expectedAttendance > registeredCount
      ? Math.max(Math.round((expectedAttendance - registeredCount) * 0.15), 0)
      : 0;
    var noShowBuffer = expectedAttendance > 0
      ? Math.max(Math.round((1 - fillRatio) * 10), 5)
      : 5;
    var note = "Planning coverage is holding against the current event target.";

    if (coverageRatio < 0.8) {
      note = "Resource coverage is below plan and should be corrected before the event window starts.";
    } else if (fillRatio < 0.5) {
      note = "Registration pacing is below the current attendance target and should be reviewed.";
    }

    return {
      forecastFillRate: formatPercent(fillRatio),
      projectedWalkIns: projectedWalkIns,
      noShowBuffer: String(noShowBuffer) + "%",
      volunteerCoverage: formatPercent(coverageRatio),
      note: note
    };
  }

  function enrichDetail(detail, events) {
    if (!detail || typeof detail !== "object") {
      return null;
    }

    var summary = events.find(function (eventItem) {
      return eventItem.eventId === detail.eventId;
    }) || null;
    var healthSnapshot = detail.healthSnapshot || {
      healthScore: 0,
      attendanceRatio: 0,
      engagementScore: 0,
      volunteerEfficiencyScore: 0,
      trend: "STABLE",
      snapshotAt: null
    };

    return Object.assign({}, detail, {
      healthSnapshot: healthSnapshot,
      resourcePlan: Array.isArray(detail.resourcePlan) ? detail.resourcePlan.slice() : [],
      riskPredictions: Array.isArray(detail.riskPredictions) ? detail.riskPredictions.slice() : [],
      timeline: Array.isArray(detail.timeline) ? detail.timeline.slice() : [],
      attendancePlan: detail.attendancePlan || buildAttendancePlan(summary, detail)
    });
  }

  function normalizeData(rawData) {
    var fallback = createDefaultData();
    var dataset = rawData && typeof rawData === "object" ? rawData : {};
    var events = Array.isArray(dataset.events) ? sortEvents(dataset.events.slice()) : fallback.events.slice();
    var details = Array.isArray(dataset.details)
      ? dataset.details.map(function (detail) {
          return enrichDetail(detail, events);
        }).filter(Boolean)
      : fallback.details.slice();

    return {
      summary: buildSummary(events),
      filterOptions: buildFilterOptions(events),
      events: events,
      details: details,
      createTemplate: Object.assign(createDefaultTemplate(), dataset.createTemplate || {}, {
        attendancePlan: Object.assign(createDefaultAttendancePlan(), dataset.createTemplate && dataset.createTemplate.attendancePlan ? dataset.createTemplate.attendancePlan : {})
      })
    };
  }

  function syncFilterControls() {
    if (!state.data) {
      return;
    }

    populateSelect(statusFilter, state.data.filterOptions.statuses);
    populateSelect(categoryFilter, state.data.filterOptions.categories);
    populateSelect(riskFilter, state.data.filterOptions.riskLevels);

    if (statusFilter) {
      if (state.data.filterOptions.statuses.indexOf(state.status) === -1) {
        state.status = "ALL";
      }
      statusFilter.value = state.status;
    }

    if (categoryFilter) {
      if (state.data.filterOptions.categories.indexOf(state.category) === -1) {
        state.category = "ALL";
      }
      categoryFilter.value = state.category;
    }

    if (riskFilter) {
      riskFilter.value = state.riskLevel;
    }
  }

  function rebuildDerivedData() {
    if (!state.data) {
      return;
    }

    state.data.events = sortEvents(state.data.events);
    state.data.details = state.data.details.map(function (detail) {
      return enrichDetail(detail, state.data.events);
    }).filter(Boolean);
    state.data.summary = buildSummary(state.data.events);
    state.data.filterOptions = buildFilterOptions(state.data.events);
    syncFilterControls();
  }

  function showFormFeedback(variant, title, message) {
    if (!formFeedback) {
      return;
    }

    formFeedback.hidden = false;
    formFeedback.className = "alert " + (variant === "success" ? "alert-info" : "alert-danger");

    if (formFeedbackTitle) {
      formFeedbackTitle.textContent = title;
    }

    if (formFeedbackMessage) {
      formFeedbackMessage.textContent = message;
    }
  }

  function hideFormFeedback() {
    if (!formFeedback) {
      return;
    }

    formFeedback.hidden = true;
    formFeedback.className = "alert alert-danger";

    if (formFeedbackTitle) {
      formFeedbackTitle.textContent = "Unable to save event";
    }

    if (formFeedbackMessage) {
      formFeedbackMessage.textContent = "Fix the current event request and try again.";
    }
  }

  function applyApiErrors(response, title) {
    var firstError = Array.isArray(response && response.errors) && response.errors.length
      ? response.errors[0]
      : null;
    showFormFeedback(
      "error",
      title,
      firstError && firstError.message ? firstError.message : response && response.message ? response.message : "The event request failed before a valid response was returned."
    );
  }

  function collectFormPayload() {
    var selectedDetail = getSelectedDetail();
    var fallbackResourcePlan = state.formMode === "edit" && selectedDetail
      ? selectedDetail.resourcePlan
      : state.data && state.data.createTemplate
        ? state.data.createTemplate.resourcePlan
        : [];
    var parsedAttendance = formAttendance ? Number(formAttendance.value) : 0;

    return {
      name: formName ? formName.value.trim() : "",
      description: formDescription ? formDescription.value.trim() : "",
      category: formCategory ? formCategory.value : "Conference",
      venue: formVenue ? formVenue.value.trim() : "",
      startAt: formStart ? formStart.value.trim() : null,
      endAt: formEnd ? formEnd.value.trim() : null,
      registrationOpenAt: formRegistrationOpen && formRegistrationOpen.value.trim() ? formRegistrationOpen.value.trim() : null,
      registrationCloseAt: formRegistrationClose && formRegistrationClose.value.trim() ? formRegistrationClose.value.trim() : null,
      expectedAttendance: isFinite(parsedAttendance) ? parsedAttendance : 0,
      resourcePlan: Array.isArray(fallbackResourcePlan) ? fallbackResourcePlan.slice() : [],
      status: formStatus ? formStatus.value : "DRAFT"
    };
  }

  function toEventSummary(detail) {
    var currentSummary = getSelectedSummary() || {};
    var firstRisk = Array.isArray(detail.riskPredictions) && detail.riskPredictions.length ? detail.riskPredictions[0] : null;
    return {
      eventId: detail.eventId,
      code: detail.code,
      name: detail.name,
      category: detail.category,
      status: detail.status,
      venue: detail.venue,
      startAt: detail.startAt,
      endAt: detail.endAt,
      expectedAttendance: detail.expectedAttendance,
      registeredCount: currentSummary.registeredCount || 0,
      checkedInCount: currentSummary.checkedInCount || 0,
      healthScore: detail.healthSnapshot ? detail.healthSnapshot.healthScore : 0,
      riskLevel: firstRisk ? firstRisk.riskLevel : currentSummary.riskLevel || "LOW"
    };
  }

  function upsertEventSummary(summary) {
    var replaced = false;
    state.data.events = state.data.events.map(function (eventItem) {
      if (eventItem.eventId !== summary.eventId) {
        return eventItem;
      }

      replaced = true;
      return summary;
    });

    if (!replaced) {
      state.data.events = state.data.events.concat(summary);
    }

    rebuildDerivedData();
  }

  function upsertEventDetail(detail) {
    var enrichedDetail = enrichDetail(detail, state.data.events);
    var replaced = false;
    state.data.details = state.data.details.map(function (item) {
      if (item.eventId !== enrichedDetail.eventId) {
        return item;
      }

      replaced = true;
      return enrichedDetail;
    });

    if (!replaced) {
      state.data.details = state.data.details.concat(enrichedDetail);
    }
  }

  function removeEvent(eventId) {
    state.data.events = state.data.events.filter(function (eventItem) {
      return eventItem.eventId !== eventId;
    });
    state.data.details = state.data.details.filter(function (detail) {
      return detail.eventId !== eventId;
    });
    rebuildDerivedData();
  }

  async function submitEvent() {
    if (!apiClient) {
      showFormFeedback("error", "Event API unavailable", "The live admin event API client did not load.");
      return;
    }

    if (state.previewMode !== "ready") {
      showFormFeedback("error", "Preview state is not editable", "Reset the preview state to ready before saving events.");
      return;
    }

    hideFormFeedback();
    var payload = collectFormPayload();
    var response;

    if (state.formMode === "edit" && state.selectedEventId) {
      response = await apiClient.put("/api/admin/events/" + state.selectedEventId, payload, { retries: 1 });
    } else {
      response = await apiClient.post("/api/admin/events", payload, { retries: 1 });
    }

    if (!response.ok || !response.data) {
      applyApiErrors(response, "Unable to save event");
      return;
    }

    upsertEventDetail(response.data);
    upsertEventSummary(toEventSummary(response.data));
    state.selectedEventId = response.data.eventId;
    state.formMode = "edit";
    renderAll();
    showFormFeedback("success", "Event saved", response.message || "The event record was saved successfully.");
  }

  async function deleteSelectedEvent() {
    if (!apiClient) {
      showFormFeedback("error", "Event API unavailable", "The live admin event API client did not load.");
      return;
    }

    if (state.previewMode !== "ready") {
      showFormFeedback("error", "Preview state is not editable", "Reset the preview state to ready before deleting events.");
      return;
    }

    if (state.formMode !== "edit" || !state.selectedEventId) {
      showFormFeedback("error", "No editable event selected", "Select an existing event before sending a delete request.");
      return;
    }

    hideFormFeedback();
    var deletedEventId = state.selectedEventId;
    var response = await apiClient.delete("/api/admin/events/" + deletedEventId, { retries: 1 });
    if (!response.ok) {
      applyApiErrors(response, "Unable to delete event");
      return;
    }

    removeEvent(deletedEventId);
    state.selectedEventId = state.data.details.length ? state.data.details[0].eventId : null;
    state.formMode = "create";
    renderAll();
    showFormFeedback("success", "Event deleted", response.message || "The selected event was deleted successfully.");
  }

  function getSelectedDetail() {
    if (!state.data) {
      return null;
    }

    return state.data.details.find(function (detail) {
      return detail.eventId === state.selectedEventId;
    }) || null;
  }

  function getSelectedSummary() {
    if (!state.data) {
      return null;
    }

    return state.data.events.find(function (eventItem) {
      return eventItem.eventId === state.selectedEventId;
    }) || null;
  }

  function getFilteredEvents() {
    if (!state.data) {
      return [];
    }

    return state.data.events.filter(function (eventItem) {
      var haystack = [eventItem.code, eventItem.name, eventItem.venue].join(" ").toLowerCase();
      var matchesSearch = !state.searchTerm || haystack.indexOf(state.searchTerm) !== -1;
      var matchesStatus = state.status === "ALL" || eventItem.status === state.status;
      var matchesCategory = state.category === "ALL" || eventItem.category === state.category;
      var matchesRisk = state.riskLevel === "ALL" || eventItem.riskLevel === state.riskLevel;

      return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
    });
  }

  function renderSummary() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      if (summaryTotal) {
        summaryTotal.textContent = "...";
      }

      if (summaryLive) {
        summaryLive.textContent = "...";
      }

      if (summaryDrafts) {
        summaryDrafts.textContent = "...";
      }

      if (summaryAttention) {
        summaryAttention.textContent = "...";
      }

      return;
    }

    if (state.previewMode === "empty") {
      if (summaryTotal) {
        summaryTotal.textContent = "0";
      }

      if (summaryLive) {
        summaryLive.textContent = "0";
      }

      if (summaryDrafts) {
        summaryDrafts.textContent = "0";
      }

      if (summaryAttention) {
        summaryAttention.textContent = "0";
      }

      return;
    }

    if (state.previewMode === "error") {
      if (summaryTotal) {
        summaryTotal.textContent = "--";
      }

      if (summaryLive) {
        summaryLive.textContent = "--";
      }

      if (summaryDrafts) {
        summaryDrafts.textContent = "--";
      }

      if (summaryAttention) {
        summaryAttention.textContent = "--";
      }

      return;
    }

    if (summaryTotal) {
      summaryTotal.textContent = String(state.data.summary.totalEvents);
    }

    if (summaryLive) {
      summaryLive.textContent = String(state.data.summary.liveEvents);
    }

    if (summaryDrafts) {
      summaryDrafts.textContent = String(state.data.summary.draftEvents);
    }

    if (summaryAttention) {
      summaryAttention.textContent = String(state.data.summary.attentionRequired);
    }
  }

  function renderDetail(detail) {
    if (state.previewMode === "loading") {
      if (detailTitle) {
        detailTitle.textContent = "Loading event detail";
      }

      if (detailMeta) {
        detailMeta.textContent = "Waiting for the selected event detail response.";
      }

      if (detailDescription) {
        detailDescription.textContent = "The detail panel is showing a loading preview state.";
      }

      if (detailStatus) {
        setBadgeClass(detailStatus, "neutral");
        detailStatus.textContent = "Loading";
      }

      if (resourceList) {
        resourceList.innerHTML = "<li>Event resources are loading.</li>";
      }

      if (riskList) {
        riskList.innerHTML = '<li class="risk-item"><strong>Loading risk predictions</strong><span class="risk-meta">The loading preview keeps detail surfaces stable while data is pending.</span></li>';
      }

      if (timelineList) {
        timelineList.innerHTML = "<li>Timeline items are loading.</li>";
      }

      return;
    }

    if (state.previewMode === "empty") {
      if (detailTitle) {
        detailTitle.textContent = "No event available";
      }

      if (detailMeta) {
        detailMeta.textContent = "The empty state is simulating a successful request with no event records.";
      }

      if (detailDescription) {
        detailDescription.textContent = "Switch back to ready state to restore the mock event detail payload.";
      }

      if (detailStatus) {
        setBadgeClass(detailStatus, "neutral");
        detailStatus.textContent = "Empty";
      }

      if (resourceList) {
        resourceList.innerHTML = "<li>No resource requirements are available in the empty preview state.</li>";
      }

      if (riskList) {
        riskList.innerHTML = '<li class="risk-item"><strong>No risk predictions yet</strong><span class="risk-meta">The empty state keeps detail surfaces stable without selected event data.</span></li>';
      }

      if (timelineList) {
        timelineList.innerHTML = "<li>No timeline items are available in the empty preview state.</li>";
      }

      return;
    }

    if (state.previewMode === "error") {
      if (detailTitle) {
        detailTitle.textContent = "Event detail unavailable";
      }

      if (detailMeta) {
        detailMeta.textContent = "The preview is simulating a failed event detail request.";
      }

      if (detailDescription) {
        detailDescription.textContent = "Switch back to ready state to restore the mocked event detail payload.";
      }

      if (detailStatus) {
        setBadgeClass(detailStatus, "danger");
        detailStatus.textContent = "Error";
      }

      if (resourceList) {
        resourceList.innerHTML = "<li>Resource planning is unavailable because the detail request failed.</li>";
      }

      if (riskList) {
        riskList.innerHTML = '<li class="risk-item"><strong>Risk predictions unavailable</strong><span class="risk-meta">The preview is simulating a failed event detail request.</span></li>';
      }

      if (timelineList) {
        timelineList.innerHTML = "<li>Timeline data is unavailable because the detail request failed.</li>";
      }

      return;
    }

    if (!detail) {
      if (detailTitle) {
        detailTitle.textContent = "No event selected";
      }

      if (detailMeta) {
        detailMeta.textContent = "Select a row to inspect the detail state.";
      }

      if (detailDescription) {
        detailDescription.textContent = "The selected event summary, live metrics, and planning coverage will render here.";
      }

      if (detailHealth) {
        detailHealth.textContent = "Pending";
      }

      if (detailHealthMeta) {
        detailHealthMeta.textContent = "No snapshot loaded";
      }

      if (detailFillRate) {
        detailFillRate.textContent = "0%";
      }

      if (detailCoverage) {
        detailCoverage.textContent = "Volunteer coverage pending";
      }

      if (detailStatus) {
        setBadgeClass(detailStatus, "neutral");
        detailStatus.textContent = "Pending";
      }

      if (resourceList) {
        resourceList.innerHTML = "<li>Resource requirements will appear when an event is selected.</li>";
      }

      if (riskList) {
        riskList.innerHTML = '<li class="risk-item"><strong>No risk predictions loaded</strong><span class="risk-meta">Select an event to inspect its detail-level risk state.</span></li>';
      }

      if (timelineList) {
        timelineList.innerHTML = "<li>No event timeline loaded.</li>";
      }

      return;
    }

    if (detailStatus) {
      setBadgeClass(detailStatus, getStatusBadgeVariant(detail.status));
      detailStatus.textContent = detail.status;
    }

    if (detailTitle) {
      detailTitle.textContent = detail.name + " · " + detail.code;
    }

    if (detailMeta) {
      detailMeta.textContent = detail.venue + " · " + detail.startAt + " to " + detail.endAt;
    }

    if (detailDescription) {
      detailDescription.textContent = detail.description;
    }

    if (detailHealth) {
      detailHealth.textContent = String(detail.healthSnapshot.healthScore || 0);
    }

    if (detailHealthMeta) {
      detailHealthMeta.textContent = detail.healthSnapshot.snapshotAt
        ? "Snapshot at " + detail.healthSnapshot.snapshotAt + " · trend " + detail.healthSnapshot.trend
        : "No health snapshot recorded yet · trend " + detail.healthSnapshot.trend;
    }

    if (detailFillRate) {
      detailFillRate.textContent = detail.attendancePlan.forecastFillRate;
    }

    if (detailCoverage) {
      detailCoverage.textContent = "Volunteer coverage " + detail.attendancePlan.volunteerCoverage + " · no-show buffer " + detail.attendancePlan.noShowBuffer;
    }

    if (resourceList) {
      resourceList.innerHTML = detail.resourcePlan.length
        ? detail.resourcePlan
            .map(function (resource) {
              return "<li><strong>" + resource.resourceName + "</strong><span class=\"signal-meta\">Allocated " + resource.quantityAllocated + " of " + resource.quantityRequired + " · " + (resource.notes || "No note") + "</span></li>";
            })
            .join("")
        : "<li><strong>No resource plan recorded</strong><span class=\"signal-meta\">Add resource requirements as planning needs become clear.</span></li>";
    }

    if (riskList) {
      riskList.innerHTML = detail.riskPredictions.length
        ? detail.riskPredictions
            .map(function (risk) {
              return '<li class="risk-item"><div class="split"><strong>' + risk.headline + '</strong><span class="badge badge-' + getRiskBadgeVariant(risk.riskLevel) + '">' + risk.riskLevel + '</span></div><span class="risk-meta">' + risk.description + '</span><span class="risk-meta">Recommended action: ' + risk.recommendedAction + '</span></li>';
            })
            .join("")
        : '<li class="risk-item"><strong>No risk predictions loaded</strong><span class="risk-meta">This event does not have persisted risk records yet.</span></li>';
    }

    if (timelineList) {
      timelineList.innerHTML = detail.timeline.length
        ? detail.timeline
            .map(function (item) {
              return "<li><strong>" + item.label + "</strong><span class=\"signal-meta\">" + item.startAt + " to " + item.endAt + " · " + item.status + "</span></li>";
            })
            .join("")
        : "<li>No event timeline loaded.</li>";
    }
  }

  function renderTable() {
    var filteredEvents = getFilteredEvents();

    if (state.previewMode === "loading") {
      if (filterSummary) {
        filterSummary.textContent = "Loading event listing preview.";
      }

      if (selectedSummary) {
        selectedSummary.textContent = "Loading current event selection.";
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="8"><span class="skeleton"></span></td></tr><tr><td colspan="8"><span class="skeleton"></span></td></tr>';
      }

      return;
    }

    if (state.previewMode === "empty") {
      if (filterSummary) {
        filterSummary.textContent = "Showing 0 of " + state.data.events.length + " events for the empty preview state.";
      }

      if (selectedSummary) {
        selectedSummary.textContent = "No event available in the empty preview state.";
      }

      if (tableBody) {
        tableBody.innerHTML = "";
      }

      if (emptyState) {
        emptyState.hidden = false;
      }

      return;
    }

    if (state.previewMode === "error") {
      if (filterSummary) {
        filterSummary.textContent = "The event listing failed to load in the error preview state.";
      }

      if (selectedSummary) {
        selectedSummary.textContent = "Event selection is unavailable during the error preview state.";
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="8">The event listing request failed. Use the preview-state reset button to return to ready data.</td></tr>';
      }

      return;
    }

    if (filterSummary) {
      filterSummary.textContent = "Showing " + filteredEvents.length + " of " + state.data.events.length + " events for the current filters.";
    }

    if (emptyState) {
      emptyState.hidden = filteredEvents.length !== 0;
    }

    if (!tableBody) {
      return;
    }

    if (!filteredEvents.length) {
      tableBody.innerHTML = "";
      return;
    }

    tableBody.innerHTML = filteredEvents
      .map(function (eventItem) {
        var riskLevel = eventItem.riskLevel || "LOW";
        return '<tr><td>' + eventItem.code + '</td><td><strong>' + eventItem.name + '</strong><br /><span class="signal-meta">' + eventItem.category + '</span></td><td><span class="badge badge-' + getStatusBadgeVariant(eventItem.status) + '">' + eventItem.status + '</span></td><td>' + eventItem.venue + '</td><td>' + eventItem.startAt + '<br /><span class="signal-meta">to ' + eventItem.endAt + '</span></td><td>' + eventItem.registeredCount + ' / ' + eventItem.expectedAttendance + '<br /><span class="signal-meta">checked in ' + eventItem.checkedInCount + '</span></td><td><span class="badge badge-' + getRiskBadgeVariant(riskLevel) + '">' + riskLevel + '</span></td><td><div class="table-actions"><button class="button button-ghost" type="button" data-event-action="detail" data-event-id="' + eventItem.eventId + '">Detail</button><button class="button button-secondary" type="button" data-event-action="edit" data-event-id="' + eventItem.eventId + '">Edit</button></div></td></tr>';
      })
      .join("");
  }

  function renderSelectedSummary(detail) {
    if (!selectedSummary) {
      return;
    }

    if (state.previewMode === "loading") {
      selectedSummary.textContent = "Loading current event selection.";
      return;
    }

    if (state.previewMode === "empty") {
      selectedSummary.textContent = "No event available in the empty preview state.";
      return;
    }

    if (state.previewMode === "error") {
      selectedSummary.textContent = "Event selection is unavailable during the error preview state.";
      return;
    }

    if (!detail) {
      selectedSummary.textContent = "No event selected.";
      return;
    }

    selectedSummary.textContent = "Selected " + detail.code + " in " + state.formMode + " mode.";
  }

  function transformDetailToForm(detail) {
    if (!detail) {
      return state.data.createTemplate;
    }

    return {
      name: detail.name,
      description: detail.description,
      category: detail.category,
      venue: detail.venue,
      startAt: detail.startAt,
      endAt: detail.endAt,
      registrationOpenAt: detail.registrationOpenAt,
      registrationCloseAt: detail.registrationCloseAt,
      expectedAttendance: detail.expectedAttendance,
      status: detail.status,
      resourcePlan: detail.resourcePlan,
      attendancePlan: detail.attendancePlan
    };
  }

  function renderForm(detail) {
    var formData = state.formMode === "edit" && detail ? transformDetailToForm(detail) : state.data.createTemplate;

    modeButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-mode") === state.formMode);
    });

    if (formCaption) {
      if (state.previewMode === "loading") {
        formCaption.textContent = "Loading the event create and edit surface so pending states can be reviewed.";
      } else if (state.previewMode === "empty") {
        formCaption.textContent = "The empty preview keeps the event form available even when no event records match the current filters.";
      } else if (state.previewMode === "error") {
        formCaption.textContent = "The error preview keeps a safe event form fallback visible while list and detail requests are unavailable.";
      } else {
        formCaption.textContent = state.formMode === "edit" && detail
          ? "Editing " + detail.name + " while keeping attendance and resource planning visible in the same admin flow."
          : "Create mode starts from a clean event draft while preserving the same resource and attendance planning surface.";
      }
    }

    if (formName) {
      formName.value = formData.name;
    }

    if (formCategory) {
      formCategory.value = formData.category;
    }

    if (formVenue) {
      formVenue.value = formData.venue;
    }

    if (formStatus) {
      formStatus.value = formData.status;
    }

    if (formStart) {
      formStart.value = formData.startAt;
    }

    if (formEnd) {
      formEnd.value = formData.endAt;
    }

    if (formRegistrationOpen) {
      formRegistrationOpen.value = formData.registrationOpenAt;
    }

    if (formRegistrationClose) {
      formRegistrationClose.value = formData.registrationCloseAt;
    }

    if (formDescription) {
      formDescription.value = formData.description;
    }

    if (formAttendance) {
      formAttendance.value = formData.expectedAttendance;
    }

    if (resourceTableBody) {
      if (state.previewMode === "loading") {
        resourceTableBody.innerHTML = '<tr><td colspan="4"><span class="skeleton"></span></td></tr><tr><td colspan="4"><span class="skeleton"></span></td></tr>';
      } else if (state.previewMode === "error") {
        resourceTableBody.innerHTML = '<tr><td colspan="4">Resource planning is unavailable while the error preview state is active.</td></tr>';
      } else {
        resourceTableBody.innerHTML = formData.resourcePlan
          .map(function (resource) {
            return "<tr><td>" + resource.resourceName + "</td><td>" + resource.quantityRequired + "</td><td>" + resource.quantityAllocated + "</td><td>" + (resource.notes || "No note") + "</td></tr>";
          })
          .join("");
      }
    }

    if (formFillRate) {
      formFillRate.textContent = formData.attendancePlan.forecastFillRate;
    }

    if (formWalkins) {
      formWalkins.textContent = String(formData.attendancePlan.projectedWalkIns);
    }

    if (formNoShow) {
      formNoShow.textContent = formData.attendancePlan.noShowBuffer;
    }

    if (formVolunteerCoverage) {
      formVolunteerCoverage.textContent = formData.attendancePlan.volunteerCoverage;
    }

    if (formPlanningNote) {
      if (state.previewMode === "loading") {
        formPlanningNote.textContent = "Attendance planning is loading in the preview state.";
      } else if (state.previewMode === "empty") {
        formPlanningNote.textContent = "Attendance planning remains available as a safe empty-state draft.";
      } else if (state.previewMode === "error") {
        formPlanningNote.textContent = "Attendance planning is showing a safe fallback because the error preview state is active.";
      } else {
        formPlanningNote.textContent = formData.attendancePlan.note;
      }
    }

    if (saveButton) {
      saveButton.textContent = state.formMode === "edit" ? "Save changes" : "Create event";
      saveButton.disabled = state.previewMode !== "ready";
    }

    if (deleteButton) {
      deleteButton.disabled = state.previewMode !== "ready" || state.formMode !== "edit" || !state.selectedEventId;
    }
  }

  function renderAll() {
    var detail = state.previewMode === "ready" ? getSelectedDetail() : null;

    syncPreviewPanel();
    renderSummary();
    renderTable();
    renderDetail(detail);
    renderForm(detail);
    renderSelectedSummary(detail);
  }

  function focusPreview(targetId) {
    var target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function bindInteractions() {
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.searchTerm = event.target.value.trim().toLowerCase();
        renderAll();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", function (event) {
        state.status = event.target.value;
        renderAll();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", function (event) {
        state.category = event.target.value;
        renderAll();
      });
    }

    if (riskFilter) {
      riskFilter.addEventListener("change", function (event) {
        state.riskLevel = event.target.value;
        renderAll();
      });
    }

    if (resetFiltersButton) {
      resetFiltersButton.addEventListener("click", function () {
        state.searchTerm = "";
        state.status = "ALL";
        state.category = "ALL";
        state.riskLevel = "ALL";

        if (searchInput) {
          searchInput.value = "";
        }

        if (statusFilter) {
          statusFilter.value = "ALL";
        }

        if (categoryFilter) {
          categoryFilter.value = "ALL";
        }

        if (riskFilter) {
          riskFilter.value = "ALL";
        }

        renderAll();
      });
    }

    createButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.formMode = "create";
        hideFormFeedback();
        renderForm(getSelectedDetail());
        renderSelectedSummary(getSelectedDetail());
        focusPreview("event-form-preview");
      });
    });

    if (focusSelectedButton) {
      focusSelectedButton.addEventListener("click", function () {
        focusPreview("event-detail-preview");
      });
    }

    modeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var nextMode = button.getAttribute("data-mode");

        if (nextMode === "edit" && !state.selectedEventId && state.data.details.length) {
          state.selectedEventId = state.data.details[0].eventId;
        }

        state.formMode = nextMode;
        hideFormFeedback();
        renderForm(getSelectedDetail());
        renderSelectedSummary(getSelectedDetail());
      });
    });

    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var actionButton = event.target.closest("[data-event-action]");

        if (!actionButton) {
          return;
        }

        state.selectedEventId = Number(actionButton.getAttribute("data-event-id"));

        if (actionButton.getAttribute("data-event-action") === "edit") {
          state.formMode = "edit";
          focusPreview("event-form-preview");
        } else {
          focusPreview("event-detail-preview");
        }

        hideFormFeedback();
        renderAll();
      });
    }

    if (saveButton) {
      saveButton.addEventListener("click", function () {
        void submitEvent();
      });
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", function () {
        void deleteSelectedEvent();
      });
    }

  }

  if (window.EventFlowMockPreviewState && previewStateShell) {
    previewController = window.EventFlowMockPreviewState.create({
      shell: previewStateShell,
      onChange: function (nextState) {
        state.previewMode = nextState;

        if (nextState !== "ready") {
          state.selectedEventId = null;
          state.formMode = "create";
        } else if (!state.selectedEventId && state.data && state.data.details.length) {
          state.selectedEventId = initialSelectedEventId || state.data.details[0].eventId;
        }

        renderAll();
      }
    });
    state.previewMode = previewController.getState();
  }

  function hydratePage() {
    if (!pageApi || !mockData) {
      return;
    }

    var roleContext = pageApi.requireRole(getGateConfig());

    if (!roleContext) {
      return;
    }

    state.data = normalizeData(parseBootstrapData());
    state.formMode = initialMode === "edit" ? "edit" : "create";
    state.selectedEventId = initialSelectedEventId || (state.data.details.length ? state.data.details[0].eventId : null);

    syncFilterControls();

    pageApi.showReady(roleContext, {
      shell: {
          phaseTitle: "Phase 10 is active.",
          phaseCopy: "Admin event management is now wired to the live backend CRUD slice while preserving the frozen UI contracts.",
          topbarEyebrow: "Admin event management",
          topbarTitle: roleContext.uiConfig ? roleContext.uiConfig.label : "Admin workspace"
      }
    });

    renderAll();
    bindInteractions();
  }

  if (pageApi) {
    pageApi.bindLogout(logoutButtons, "/login");
  }

  hydratePage();
})();