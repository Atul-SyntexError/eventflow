(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var gatePanel = document.querySelector("[data-volunteer-gate]");
  var gateTitle = document.querySelector("[data-volunteer-gate-title]");
  var gateMessage = document.querySelector("[data-volunteer-gate-message]");
  var content = document.querySelector("[data-volunteer-performance-content]");
  var loadingState = document.querySelector("[data-volunteer-performance-loading-state]");
  var emptyState = document.querySelector("[data-volunteer-performance-empty-state]");
  var errorState = document.querySelector("[data-volunteer-performance-error-state]");
  var errorTitle = document.querySelector("[data-volunteer-performance-error-title]");
  var errorMessage = document.querySelector("[data-volunteer-performance-error-message]");
  var completionValue = document.querySelector("[data-volunteer-performance-completion]");
  var onTimeValue = document.querySelector("[data-volunteer-performance-on-time]");
  var activeValue = document.querySelector("[data-volunteer-performance-active]");
  var completedValue = document.querySelector("[data-volunteer-performance-completed]");
  var summaryList = document.querySelector("[data-volunteer-performance-summary-list]");
  var historyBody = document.querySelector("[data-volunteer-performance-history-body]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
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
  var state = {
    data: null,
    status: "loading",
    errorMessage: ""
  };

  function formatPercent(value) {
    if (typeof value !== "number") {
      return "0%";
    }

    var percentage = (value * 100).toFixed(1);
    return percentage.replace(/\.0$/, "") + "%";
  }

  function setState(status, errorText) {
    state.status = status;
    state.errorMessage = errorText || "";

    if (loadingState) {
      loadingState.hidden = status !== "loading";
    }
    if (emptyState) {
      emptyState.hidden = status !== "empty";
    }
    if (errorState) {
      errorState.hidden = status !== "error";
    }
    if (content) {
      content.hidden = false;
    }

    if (errorTitle) {
      errorTitle.textContent = "Performance unavailable";
    }
    if (errorMessage) {
      errorMessage.textContent = state.errorMessage || "The volunteer performance request failed.";
    }
  }

  function renderMetrics() {
    if (state.status === "loading") {
      completionValue.textContent = "...";
      onTimeValue.textContent = "...";
      activeValue.textContent = "...";
      completedValue.textContent = "...";
      return;
    }

    if (state.status === "empty") {
      completionValue.textContent = "0%";
      onTimeValue.textContent = "0%";
      activeValue.textContent = "0";
      completedValue.textContent = "0";
      return;
    }

    if (state.status === "error") {
      completionValue.textContent = "--";
      onTimeValue.textContent = "--";
      activeValue.textContent = "--";
      completedValue.textContent = "--";
      return;
    }

    if (!state.data) {
      return;
    }

    completionValue.textContent = formatPercent(state.data.completionRate);
    onTimeValue.textContent = formatPercent(state.data.onTimeRate);
    activeValue.textContent = String(state.data.activeTaskCount);
    completedValue.textContent = String(state.data.completedTaskCount);
  }

  function renderSummary() {
    if (!summaryList) {
      return;
    }

    if (state.status === "loading") {
      summaryList.innerHTML = '<li class="suggestion-item"><strong>Loading summary</strong><span class="suggestion-copy">Volunteer performance summary is being prepared.</span></li>';
      return;
    }

    if (state.status === "empty") {
      summaryList.innerHTML = '<li class="suggestion-item"><strong>No performance history yet</strong><span class="suggestion-copy">Summary cues will render here once assignments have been completed.</span></li>';
      return;
    }

    if (state.status === "error") {
      summaryList.innerHTML = '<li class="suggestion-item"><strong>Performance summary unavailable</strong><span class="suggestion-copy">The preview is simulating a failed performance request.</span></li>';
      return;
    }

    if (!state.data) {
      return;
    }

    var strongestEvent = state.data.recentEvents.reduce(function (best, current) {
      if (!best || current.onTimeRate > best.onTimeRate) {
        return current;
      }

      return best;
    }, null);

    summaryList.innerHTML = [
      '<li class="suggestion-item"><strong>' + formatPercent(state.data.completionRate) + ' completion rate</strong><span class="suggestion-copy">You are closing most assigned work inside the planned volunteer flow.</span></li>',
      '<li class="suggestion-item"><strong>' + formatPercent(state.data.onTimeRate) + ' on-time rate</strong><span class="suggestion-copy">Timeliness remains the clearest indicator for live operations reliability.</span></li>',
      '<li class="suggestion-item"><strong>Best recent event: ' + strongestEvent.eventName + '</strong><span class="suggestion-copy">' + strongestEvent.highlight + '</span></li>'
    ].join("");
  }

  function renderHistory() {
    if (!historyBody) {
      return;
    }

    if (state.status === "loading") {
      historyBody.innerHTML = '<tr><td colspan="6">Volunteer performance history is loading.</td></tr>';
      return;
    }

    if (state.status === "empty") {
      historyBody.innerHTML = '<tr><td colspan="6">No volunteer performance history is visible in this preview state.</td></tr>';
      return;
    }

    if (state.status === "error") {
      historyBody.innerHTML = '<tr><td colspan="6">Volunteer performance history is unavailable in this preview state.</td></tr>';
      return;
    }

    if (!state.data) {
      return;
    }

    historyBody.innerHTML = state.data.recentEvents
      .map(function (eventItem) {
        return [
          '<tr>',
          '<td><strong>' + eventItem.eventName + '</strong></td>',
          '<td>' + eventItem.roleLabel + '</td>',
          '<td>' + eventItem.completedTasks + '</td>',
          '<td>' + formatPercent(eventItem.completionRate) + '</td>',
          '<td>' + formatPercent(eventItem.onTimeRate) + '</td>',
          '<td>' + eventItem.highlight + '</td>',
          '</tr>'
        ].join("");
      })
      .join("");
  }

  function renderPerformance() {
    renderMetrics();
    renderSummary();
    renderHistory();
  }

  function loadPerformance() {
    if (!apiClient) {
      setState("error", "The live volunteer performance client is unavailable.");
      renderPerformance();
      return;
    }

    setState("loading", "");
    renderPerformance();

    apiClient.get("/api/volunteer/performance", { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !response.data) {
        state.data = null;
        setState("error", response && response.message ? response.message : "The volunteer performance request failed.");
        renderPerformance();
        return;
      }

      state.data = response.data;
      if (!state.data.recentEvents || !state.data.recentEvents.length) {
        setState("empty", "");
      } else {
        setState("ready", "");
      }
      renderPerformance();
    }).catch(function () {
      state.data = null;
      setState("error", "The volunteer performance request failed.");
      renderPerformance();
    });
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Volunteer reporting unavailable",
        message: "Volunteer performance needs the shared shell bootstrap before the reporting view can render.",
        shell: {
          phaseTitle: "Phase 13 reporting is gated.",
          phaseCopy: "Volunteer reporting should only render for volunteer sessions with the shared shell loaded.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer performance blocked"
        }
      },
      missingSession: {
        title: "Volunteer reporting needs a session",
        message: "Open the login page and sign in with the volunteer account before loading performance metrics.",
        shell: {
          phaseTitle: "Phase 13 reporting is gated.",
          phaseCopy: "Volunteer reporting should only render for authenticated volunteer sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer performance blocked"
        }
      },
      wrongRole: {
        title: "This route is volunteer-only",
        message: "The current session belongs to another role, so the volunteer performance page remains hidden.",
        shell: {
          phaseTitle: "Phase 13 reporting is gated.",
          phaseCopy: "Volunteer reporting should stay scoped to the volunteer role.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer performance blocked"
        }
      }
    };
  }

  function hydratePerformance() {
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
        phaseCopy: "Volunteer performance now loads live completion and timeliness history through the reporting API.",
        topbarEyebrow: "Volunteer reporting",
        topbarTitle: "Volunteer performance"
      }
    });

    pageApi.bindLogout(logoutButtons, "/login.jsp");
    loadPerformance();
  }

  hydratePerformance();
})();