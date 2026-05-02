(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var bootstrapScript = document.getElementById("student-registrations-bootstrap");
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-registrations-content]");
  var totalValue = document.querySelector("[data-student-registrations-total]");
  var registeredValue = document.querySelector("[data-student-registrations-registered]");
  var checkedInValue = document.querySelector("[data-student-registrations-checked-in]");
  var waitlistedValue = document.querySelector("[data-student-registrations-waitlisted]");
  var summary = document.querySelector("[data-student-registrations-summary]");
  var bodyRows = document.querySelector("[data-student-registrations-body]");
  var filterButtons = document.querySelectorAll("[data-student-registrations-filter]");
  var resetButton = document.querySelector("[data-student-registrations-reset]");
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
    filterMode: "ALL",
    previewMode: "ready",
    data: null
  };

  function parseBootstrapData() {
    if (!bootstrapScript) {
      return [];
    }

    try {
      var parsed = JSON.parse(bootstrapScript.textContent || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function createSummary(registrations) {
    return registrations.reduce(
      function (summaryState, registration) {
        summaryState.total += 1;

        if (registration.status === "REGISTERED") {
          summaryState.registered += 1;
        } else if (registration.status === "CHECKED_IN") {
          summaryState.checkedIn += 1;
        } else if (registration.status === "WAITLISTED") {
          summaryState.waitlisted += 1;
        }

        return summaryState;
      },
      {
        total: 0,
        registered: 0,
        checkedIn: 0,
        waitlisted: 0
      }
    );
  }

  function normalizeData(registrations) {
    var normalizedRegistrations = Array.isArray(registrations) ? registrations : [];
    return {
      registrations: normalizedRegistrations,
      summary: createSummary(normalizedRegistrations)
    };
  }

  function formatLabel(value) {
    return value.replace(/_/g, " ");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getStatusVariant(value) {
    if (value === "REGISTERED" || value === "CHECKED_IN") {
      return "success";
    }

    if (value === "WAITLISTED") {
      return "warning";
    }

    return "neutral";
  }

  function getFilteredRegistrations() {
    if (!state.data) {
      return [];
    }

    return state.data.registrations.filter(function (registration) {
      return state.filterMode === "ALL" || registration.status === state.filterMode;
    });
  }

  function resolveAction(registration) {
    if (registration.status === "REGISTERED") {
      return {
        label: "Open check-in",
        href: contextPath + "/student/check-in?eventId=" + registration.eventId
      };
    }

    if (registration.status === "CHECKED_IN") {
      return {
        label: "Open feedback",
        href: contextPath + "/student/feedback?eventId=" + registration.eventId
      };
    }

    return {
      label: "View detail",
      href: contextPath + "/student/events/" + registration.eventId
    };
  }

  function syncFilterButtons() {
    Array.prototype.forEach.call(filterButtons, function (button) {
      var isActive = button.getAttribute("data-filter") === state.filterMode;
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
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the student registrations list while route data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful student registrations response with no records yet."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed student registrations request while keeping safe fallback copy visible."
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
      totalValue.textContent = "...";
      registeredValue.textContent = "...";
      checkedInValue.textContent = "...";
      waitlistedValue.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      totalValue.textContent = "0";
      registeredValue.textContent = "0";
      checkedInValue.textContent = "0";
      waitlistedValue.textContent = "0";
      return;
    }

    if (state.previewMode === "error") {
      totalValue.textContent = "--";
      registeredValue.textContent = "--";
      checkedInValue.textContent = "--";
      waitlistedValue.textContent = "--";
      return;
    }

    totalValue.textContent = String(state.data.summary.total);
    registeredValue.textContent = String(state.data.summary.registered);
    checkedInValue.textContent = String(state.data.summary.checkedIn);
    waitlistedValue.textContent = String(state.data.summary.waitlisted);
  }

  function renderTable() {
    syncFilterButtons();

    if (state.previewMode === "loading") {
      summary.textContent = "Loading student registrations.";
      bodyRows.innerHTML = '<tr><td colspan="4">Registration rows are being prepared.</td></tr>';
      return;
    }

    if (state.previewMode === "empty") {
      summary.textContent = "No registrations are visible in this preview state.";
      bodyRows.innerHTML = '<tr><td colspan="4">No registration rows are visible in this preview state.</td></tr>';
      return;
    }

    if (state.previewMode === "error") {
      summary.textContent = "Registrations are unavailable because this preview is simulating a failed request.";
      bodyRows.innerHTML = '<tr><td colspan="4">Registration data is unavailable in this preview state.</td></tr>';
      return;
    }

    var registrations = getFilteredRegistrations();
    summary.textContent = "Showing " + registrations.length + " of " + state.data.registrations.length + " student registration records.";

    if (!registrations.length) {
      bodyRows.innerHTML = '<tr><td colspan="4">No registration rows match the current filter.</td></tr>';
      return;
    }

    bodyRows.innerHTML = registrations
      .map(function (registration) {
        var action = resolveAction(registration);
        var variant = getStatusVariant(registration.status);
        var startLabel = escapeHtml(registration.startAt || "TBD");
        var endLabel = escapeHtml(registration.endAt || "TBD");

        return [
          '<tr>',
          '<td><strong>' + escapeHtml(registration.eventName) + '</strong><div class="text-muted">' + escapeHtml(registration.venue) + '</div></td>',
          '<td><span class="badge badge-' + variant + '">' + formatLabel(registration.status) + '</span></td>',
          '<td><strong>' + startLabel + '</strong><div class="text-muted">Ends ' + endLabel + '</div></td>',
          '<td><a class="button button-ghost" href="' + action.href + '">' + action.label + '</a></td>',
          '</tr>'
        ].join('');
      })
      .join('');
  }

  function renderRegistrationsPage() {
    renderMetrics();
    renderTable();
    syncPreviewPanel();
  }

  function bindEvents() {
    Array.prototype.forEach.call(filterButtons, function (button) {
      button.addEventListener("click", function () {
        state.filterMode = button.getAttribute("data-filter");
        renderRegistrationsPage();
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        state.filterMode = "ALL";
        renderRegistrationsPage();
      });
    }
  }

  function hydrateRegistrationsPage() {
    if (!pageApi || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Student",
        blockedTitle: "Student registrations blocked",
        phaseTitle: "Phase 6 preview is gated.",
        phaseCopy: "Student pages should only render for student sessions while frontend flows remain mocked.",
        missingSessionMessage: "Open the login preview first and sign in with the student demo account to view registrations."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 10 registrations are active.",
        phaseCopy: "Student registrations now load from persisted backend data while adjacent participation flows are still landing.",
        topbarEyebrow: "Student registrations",
        topbarTitle: "Student registrations"
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
          renderRegistrationsPage();
        }
      });
      state.previewMode = previewController.getState();
    }

    renderRegistrationsPage();
  }

  hydrateRegistrationsPage();
})();