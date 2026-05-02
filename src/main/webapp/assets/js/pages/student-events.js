(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var bootstrapScript = document.getElementById("student-events-bootstrap");
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-events-content]");
  var summaryTotal = document.querySelector("[data-student-events-total]");
  var summaryOpen = document.querySelector("[data-student-events-open]");
  var summaryLimited = document.querySelector("[data-student-events-limited]");
  var summaryRecommended = document.querySelector("[data-student-events-recommended]");
  var searchInput = document.querySelector("[data-student-events-search]");
  var categoryFilter = document.querySelector("[data-student-events-category-filter]");
  var registrationFilter = document.querySelector("[data-student-events-registration-filter]");
  var capacityFilter = document.querySelector("[data-student-events-capacity-filter]");
  var filterSummary = document.querySelector("[data-student-events-filter-summary]");
  var cardList = document.querySelector("[data-student-events-card-list]");
  var emptyState = document.querySelector("[data-student-events-empty-state]");
  var recommendationList = document.querySelector("[data-student-events-recommendation-list]");
  var resetFiltersButton = document.querySelector("[data-student-events-reset-filters]");
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
  var previewController = null;
  var state = {
    searchTerm: "",
    category: "ALL",
    registrationStatus: "ALL",
    capacityState: "ALL",
    previewMode: "ready",
    data: null
  };

  function createDefaultData() {
    return {
      filterOptions: {
        categories: ["ALL"],
        registrationStates: ["ALL"],
        capacityStates: ["ALL"]
      },
      events: [],
      recommendations: []
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

  function deriveOptions(events, fieldName, preferredOrder) {
    var values = events.reduce(function (result, eventItem) {
      var value = eventItem && eventItem[fieldName] ? String(eventItem[fieldName]) : null;
      if (value && result.indexOf(value) === -1) {
        result.push(value);
      }
      return result;
    }, []);

    values.sort(function (left, right) {
      var leftIndex = preferredOrder.indexOf(left);
      var rightIndex = preferredOrder.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right);
      }
      if (leftIndex === -1) {
        return 1;
      }
      if (rightIndex === -1) {
        return -1;
      }
      return leftIndex - rightIndex;
    });

    return ["ALL"].concat(values);
  }

  function normalizeData(rawData) {
    var fallback = createDefaultData();
    var events = Array.isArray(rawData) ? rawData.slice() : [];
    return {
      filterOptions: {
        categories: deriveOptions(events, "category", []),
        registrationStates: deriveOptions(events, "registrationStatus", ["OPEN", "REGISTERED", "WAITLISTED", "CLOSED"]),
        capacityStates: deriveOptions(events, "capacityState", ["AVAILABLE", "LIMITED", "FULL"])
      },
      events: events,
      recommendations: fallback.recommendations
    };
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

  function formatPercent(value) {
    return Math.round(value * 100) + "%";
  }

  function populateSelect(selectNode, options) {
    if (!selectNode) {
      return;
    }

    selectNode.innerHTML = options
      .map(function (option) {
        return '<option value="' + option + '">' + formatLabel(option) + '</option>';
      })
      .join("");
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the student discovery page while event cards and filters load."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful student event discovery response with no events available."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed student event discovery request while keeping safe fallback copy visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function getFilteredEvents() {
    if (!state.data) {
      return [];
    }

    return state.data.events.filter(function (eventItem) {
      var haystack = [eventItem.name, eventItem.venue].join(" ").toLowerCase();
      var matchesSearch = !state.searchTerm || haystack.indexOf(state.searchTerm) !== -1;
      var matchesCategory = state.category === "ALL" || eventItem.category === state.category;
      var matchesRegistration = state.registrationStatus === "ALL" || eventItem.registrationStatus === state.registrationStatus;
      var matchesCapacity = state.capacityState === "ALL" || eventItem.capacityState === state.capacityState;

      return matchesSearch && matchesCategory && matchesRegistration && matchesCapacity;
    });
  }

  function getRecommendationByEventId(eventId) {
    if (!state.data) {
      return null;
    }

    return state.data.recommendations.find(function (recommendation) {
      return recommendation.eventId === eventId;
    }) || null;
  }

  function renderSummary(filteredEvents) {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      summaryTotal.textContent = "...";
      summaryOpen.textContent = "...";
      summaryLimited.textContent = "...";
      summaryRecommended.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      summaryTotal.textContent = "0";
      summaryOpen.textContent = "0";
      summaryLimited.textContent = "0";
      summaryRecommended.textContent = "0";
      return;
    }

    if (state.previewMode === "error") {
      summaryTotal.textContent = "--";
      summaryOpen.textContent = "--";
      summaryLimited.textContent = "--";
      summaryRecommended.textContent = "--";
      return;
    }

    summaryTotal.textContent = String(filteredEvents.length);
    summaryOpen.textContent = String(filteredEvents.filter(function (eventItem) {
      return eventItem.registrationStatus === "OPEN";
    }).length);
    summaryLimited.textContent = String(filteredEvents.filter(function (eventItem) {
      return eventItem.capacityState !== "AVAILABLE";
    }).length);
    summaryRecommended.textContent = String(filteredEvents.filter(function (eventItem) {
      return !!getRecommendationByEventId(eventItem.eventId);
    }).length);
  }

  function renderFilterSummary(filteredEvents) {
    if (!filterSummary || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      filterSummary.textContent = "Loading student event filters.";
      return;
    }

    if (state.previewMode === "empty") {
      filterSummary.textContent = "No events are visible in this preview state.";
      return;
    }

    if (state.previewMode === "error") {
      filterSummary.textContent = "Student event filters are unavailable because the preview is simulating a failed request.";
      return;
    }

    filterSummary.textContent = "Showing " + filteredEvents.length + " of " + state.data.events.length + " student discovery events.";
  }

  function renderCards(filteredEvents) {
    if (!cardList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      cardList.innerHTML = '<article class="detail-summary-card"><strong>Loading events</strong><span class="text-muted">Student discovery cards are being prepared.</span></article>';
      emptyState.hidden = true;
      return;
    }

    if (state.previewMode === "empty") {
      cardList.innerHTML = '<article class="detail-summary-card"><strong>No events available</strong><span class="text-muted">This preview state simulates an empty event discovery response.</span></article>';
      emptyState.hidden = true;
      return;
    }

    if (state.previewMode === "error") {
      cardList.innerHTML = '<article class="detail-summary-card"><strong>Discovery unavailable</strong><span class="text-muted">The preview is simulating a failed event discovery request.</span></article>';
      emptyState.hidden = true;
      return;
    }

    if (!filteredEvents.length) {
      cardList.innerHTML = "";
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    cardList.innerHTML = filteredEvents
      .map(function (eventItem) {
        var registrationVariant = eventItem.registrationStatus === "REGISTERED" ? "success" : (eventItem.registrationStatus === "WAITLISTED" ? "warning" : "info");
        var capacityVariant = eventItem.capacityState === "FULL" ? "danger" : (eventItem.capacityState === "LIMITED" ? "warning" : "success");
        var recommendation = getRecommendationByEventId(eventItem.eventId);
        var detailHref = contextPath + "/student/events/" + eventItem.eventId;
        var recommendationBlock = recommendation
          ? ('<p class="task-card-copy">' + escapeHtml(recommendation.headline) + '</p><div class="button-row">' + recommendation.reasonTags.map(function (tag) {
              return '<span class="badge badge-neutral">' + escapeHtml(tag) + '</span>';
            }).join("") + '</div>')
          : '<p class="task-card-copy">Open event detail for live schedule, registration, health data, and recommendation cues. Discovery-page recommendation summaries will widen later.</p>';

        return [
          '<article class="detail-summary-card">',
          '<div class="task-meta-row"><strong>' + escapeHtml(eventItem.name) + '</strong><span class="badge badge-info">' + escapeHtml(eventItem.highlightBadge) + '</span></div>',
          '<span class="text-muted">' + escapeHtml(eventItem.category) + ' • ' + escapeHtml(eventItem.venue) + '</span>',
          '<span class="text-muted">' + formatDateTime(eventItem.startAt) + ' to ' + formatDateTime(eventItem.endAt) + '</span>',
          recommendationBlock,
          '<div class="task-meta-row"><span class="badge badge-' + registrationVariant + '">' + formatLabel(eventItem.registrationStatus) + '</span><span class="badge badge-' + capacityVariant + '">' + formatLabel(eventItem.capacityState) + '</span></div>',
          '<div class="table-actions"><a class="button button-secondary" href="' + detailHref + '">Open event detail</a></div>',
          '</article>'
        ].join("");
      })
      .join("");
  }

  function renderRecommendations(filteredEvents) {
    if (!recommendationList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      recommendationList.innerHTML = '<li class="suggestion-item"><strong>Loading recommendation cues</strong><span class="suggestion-copy">Discovery recommendation context is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      recommendationList.innerHTML = '<li class="suggestion-item"><strong>No recommendation cues yet</strong><span class="suggestion-copy">This preview state simulates an empty recommendation response.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      recommendationList.innerHTML = '<li class="suggestion-item"><strong>Recommendation cues unavailable</strong><span class="suggestion-copy">The preview is simulating a failed student event discovery request.</span></li>';
      return;
    }

    var visibleRecommendations = filteredEvents
      .map(function (eventItem) {
        return getRecommendationByEventId(eventItem.eventId);
      })
      .filter(Boolean);

    if (!visibleRecommendations.length) {
      recommendationList.innerHTML = '<li class="suggestion-item"><strong>Open event detail for recommendation cues</strong><span class="suggestion-copy">Matching recommendation summaries now render on the live event detail route. This discovery sidebar will widen later.</span></li>';
      return;
    }

    recommendationList.innerHTML = visibleRecommendations
      .map(function (recommendation) {
        return '<li class="suggestion-item"><div class="suggestion-score-row"><strong>' + recommendation.name + '</strong><span class="suggestion-score">' + formatPercent(recommendation.score) + '</span></div><span class="suggestion-copy">' + recommendation.headline + '</span></li>';
      })
      .join("");
  }

  function renderEvents() {
    var filteredEvents = state.previewMode === "ready" ? getFilteredEvents() : [];

    renderSummary(filteredEvents);
    renderFilterSummary(filteredEvents);
    renderCards(filteredEvents);
    renderRecommendations(filteredEvents);
    syncPreviewPanel();
  }

  function bindEvents() {
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.searchTerm = event.target.value.trim().toLowerCase();
        renderEvents();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", function (event) {
        state.category = event.target.value;
        renderEvents();
      });
    }

    if (registrationFilter) {
      registrationFilter.addEventListener("change", function (event) {
        state.registrationStatus = event.target.value;
        renderEvents();
      });
    }

    if (capacityFilter) {
      capacityFilter.addEventListener("change", function (event) {
        state.capacityState = event.target.value;
        renderEvents();
      });
    }

    if (resetFiltersButton) {
      resetFiltersButton.addEventListener("click", function () {
        state.searchTerm = "";
        state.category = "ALL";
        state.registrationStatus = "ALL";
        state.capacityState = "ALL";

        if (searchInput) {
          searchInput.value = "";
        }

        if (categoryFilter) {
          categoryFilter.value = "ALL";
        }

        if (registrationFilter) {
          registrationFilter.value = "ALL";
        }

        if (capacityFilter) {
          capacityFilter.value = "ALL";
        }

        renderEvents();
      });
    }
  }

  function hydrateEvents() {
    if (!pageApi || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Student",
        blockedTitle: "Student event discovery blocked",
        phaseTitle: "Phase 6 preview is gated.",
        phaseCopy: "Student pages should only render for student sessions while frontend flows remain mocked.",
        missingSessionMessage: "Open the login preview first and sign in with the student demo account to view event discovery."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 10 discovery is active.",
        phaseCopy: "Student event discovery now loads from persisted backend data while event detail is live and recommendations remain a later slice.",
        topbarEyebrow: "Student events",
        topbarTitle: "Student event discovery"
      }
    });

    state.data = normalizeData(parseBootstrapData());
    populateSelect(categoryFilter, state.data.filterOptions.categories);
    populateSelect(registrationFilter, state.data.filterOptions.registrationStates);
    populateSelect(capacityFilter, state.data.filterOptions.capacityStates);

    pageApi.bindLogout(logoutButtons, "/login");
    bindEvents();

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          renderEvents();
        }
      });
      state.previewMode = previewController.getState();
    }

    renderEvents();
  }

  hydrateEvents();
})();