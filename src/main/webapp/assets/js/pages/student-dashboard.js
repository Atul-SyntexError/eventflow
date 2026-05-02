(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-dashboard-content]");
  var summaryRecommended = document.querySelector("[data-student-recommended-count]");
  var summaryRegistrations = document.querySelector("[data-student-registration-count]");
  var summaryLiveUpdates = document.querySelector("[data-student-live-update-count]");
  var summaryCheckedIn = document.querySelector("[data-student-checked-in-count]");
  var recommendationList = document.querySelector("[data-student-recommendation-list]");
  var registrationBody = document.querySelector("[data-student-registration-body]");
  var liveUpdateList = document.querySelector("[data-student-live-update-list]");
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
  var state = {
    loadStatus: "loading",
    dashboard: {
      recommendedEvents: [],
      liveUpdates: []
    },
    registrations: [],
    errorMessage: ""
  };

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

  function formatPercent(value) {
    var number = Number(value);
    if (Number.isNaN(number)) {
      return "--";
    }
    return Math.round(number * 100) + "%";
  }

  function formatDateTime(value) {
    if (!value) {
      return "TBD";
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getNotificationVariant(type) {
    if (type === "SCHEDULE_CHANGED") {
      return "warning";
    }
    if (type === "CHECKIN_REMINDER") {
      return "info";
    }
    if (type === "GENERAL_ANNOUNCEMENT") {
      return "neutral";
    }
    return "success";
  }

  function normalizeDashboardData(payload) {
    return {
      recommendedEvents: payload && Array.isArray(payload.recommendedEvents) ? payload.recommendedEvents : [],
      liveUpdates: payload && Array.isArray(payload.liveUpdates) ? payload.liveUpdates : []
    };
  }

  function resolveUpdateHref(update) {
    if (update && update.eventId) {
      return contextPath + "/student/events/" + update.eventId;
    }
    return contextPath + "/student/notifications";
  }

  function renderSummary() {
    if (state.loadStatus === "loading") {
      summaryRecommended.textContent = "...";
      summaryRegistrations.textContent = "...";
      summaryLiveUpdates.textContent = "...";
      summaryCheckedIn.textContent = "...";
      return;
    }

    if (state.loadStatus === "error") {
      summaryRecommended.textContent = "--";
      summaryRegistrations.textContent = "--";
      summaryLiveUpdates.textContent = "--";
      summaryCheckedIn.textContent = "--";
      return;
    }

    summaryRecommended.textContent = String(state.dashboard.recommendedEvents.length);
    summaryRegistrations.textContent = String(state.registrations.length);
    summaryLiveUpdates.textContent = String(state.dashboard.liveUpdates.length);
    summaryCheckedIn.textContent = String(state.registrations.filter(function (registration) {
      return !!registration.checkedInAt;
    }).length);
  }

  function renderRecommendations() {
    if (state.loadStatus === "loading") {
      recommendationList.innerHTML = '<article class="detail-summary-card"><strong>Loading recommendations</strong><span class="text-muted">Recommendation cards are being prepared.</span></article>';
      return;
    }

    if (state.loadStatus === "error") {
      recommendationList.innerHTML = '<article class="detail-summary-card"><strong>Recommendations unavailable</strong><span class="text-muted">' + escapeHtml(state.errorMessage || "The student dashboard request failed.") + '</span></article>';
      return;
    }

    if (!state.dashboard.recommendedEvents.length) {
      recommendationList.innerHTML = '<article class="detail-summary-card"><strong>No recommendations yet</strong><span class="text-muted">Recommended event cards will render here when open matches exist.</span></article>';
      return;
    }

    recommendationList.innerHTML = state.dashboard.recommendedEvents.map(function (eventItem) {
      var badges = (eventItem.reasonTags || []).map(function (tag) {
        return '<span class="badge badge-neutral">' + escapeHtml(tag) + '</span>';
      }).join("");

      return [
        '<article class="detail-summary-card">',
        '<div class="task-meta-row"><strong>' + escapeHtml(eventItem.name) + '</strong><span class="badge badge-success">Score ' + escapeHtml(formatPercent(eventItem.score)) + '</span></div>',
        '<p class="task-card-copy">' + escapeHtml(eventItem.headline) + '</p>',
        '<div class="button-row">' + badges + '</div>',
        '<div class="table-actions"><a class="button button-secondary" href="' + escapeHtml(contextPath + '/student/events/' + eventItem.eventId) + '">Open event detail</a></div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderRegistrations() {
    if (state.loadStatus === "loading") {
      registrationBody.innerHTML = '<tr><td colspan="3">Registration data is loading.</td></tr>';
      return;
    }

    if (state.loadStatus === "error") {
      registrationBody.innerHTML = '<tr><td colspan="3">' + escapeHtml(state.errorMessage || "Registration data is unavailable.") + '</td></tr>';
      return;
    }

    if (!state.registrations.length) {
      registrationBody.innerHTML = '<tr><td colspan="3">No registrations are visible for this student account.</td></tr>';
      return;
    }

    registrationBody.innerHTML = state.registrations.map(function (registration) {
      var variant = registration.checkedInAt ? "success" : (registration.status === "WAITLISTED" ? "warning" : "info");

      return [
        '<tr>',
        '<td><strong>' + escapeHtml(registration.eventName) + '</strong><div class="text-muted">' + escapeHtml(registration.venue) + '</div></td>',
        '<td><span class="badge badge-' + variant + '">' + escapeHtml(formatLabel(registration.status)) + '</span></td>',
        '<td>' + escapeHtml(formatDateTime(registration.startAt)) + '</td>',
        '</tr>'
      ].join("");
    }).join("");
  }

  function renderLiveUpdates() {
    if (state.loadStatus === "loading") {
      liveUpdateList.innerHTML = '<li class="activity-item"><strong>Loading live notices</strong><span class="activity-meta">Student live updates are being prepared.</span></li>';
      return;
    }

    if (state.loadStatus === "error") {
      liveUpdateList.innerHTML = '<li class="activity-item"><strong>Live notices unavailable</strong><span class="activity-meta">' + escapeHtml(state.errorMessage || "The student dashboard request failed.") + '</span></li>';
      return;
    }

    if (!state.dashboard.liveUpdates.length) {
      liveUpdateList.innerHTML = '<li class="activity-item"><strong>No live notices yet</strong><span class="activity-meta">Student live notices will render here when updates are available.</span></li>';
      return;
    }

    liveUpdateList.innerHTML = state.dashboard.liveUpdates.map(function (update) {
      return [
        '<li class="activity-item">',
        '<div class="task-meta-row"><strong>' + escapeHtml(update.title) + '</strong><span class="badge badge-' + getNotificationVariant(update.type) + '">' + escapeHtml(formatLabel(update.type)) + '</span></div>',
        '<span class="activity-meta">' + escapeHtml(update.meta) + ' • ' + escapeHtml(formatDateTime(update.occurredAt)) + '</span>',
        '<div class="table-actions"><a class="button button-ghost" href="' + escapeHtml(resolveUpdateHref(update)) + '">Open</a></div>',
        '</li>'
      ].join("");
    }).join("");
  }

  function renderDashboard() {
    renderSummary();
    renderRecommendations();
    renderRegistrations();
    renderLiveUpdates();
  }

  function loadDashboard() {
    if (previewStateShell) {
      previewStateShell.hidden = true;
    }

    if (!apiClient) {
      state.loadStatus = "error";
      state.errorMessage = "The live student API client is unavailable.";
      renderDashboard();
      return;
    }

    state.loadStatus = "loading";
    state.errorMessage = "";
    renderDashboard();

    Promise.all([
      apiClient.get("/api/student/dashboard", { retries: 1 }),
      apiClient.get("/api/student/registrations", { retries: 1 })
    ]).then(function (responses) {
      var dashboardResponse = responses[0];
      var registrationsResponse = responses[1];

      if (!dashboardResponse || !dashboardResponse.ok || !dashboardResponse.data) {
        state.loadStatus = "error";
        state.errorMessage = dashboardResponse && dashboardResponse.message
          ? dashboardResponse.message
          : "The student dashboard request failed.";
        renderDashboard();
        return;
      }

      if (!registrationsResponse || !registrationsResponse.ok || !Array.isArray(registrationsResponse.data)) {
        state.loadStatus = "error";
        state.errorMessage = registrationsResponse && registrationsResponse.message
          ? registrationsResponse.message
          : "The student registration request failed.";
        renderDashboard();
        return;
      }

      state.dashboard = normalizeDashboardData(dashboardResponse.data);
      state.registrations = registrationsResponse.data;
      state.loadStatus = "ready";
      renderDashboard();
    }).catch(function () {
      state.loadStatus = "error";
      state.errorMessage = "The student dashboard request failed.";
      renderDashboard();
    });
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Student dashboard unavailable",
        message: "Student dashboard needs the shared shell bootstrap before the live route can render.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Student dashboard only renders for student sessions with the shared shell loaded.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Student dashboard blocked"
        }
      },
      missingSession: {
        title: "Student dashboard needs a session",
        message: "Open the login page and sign in with the student account before loading the dashboard.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Student dashboard only renders for authenticated student sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Student dashboard blocked"
        }
      },
      wrongRole: {
        title: "This route is student-only",
        message: "The current session belongs to another role, so the student dashboard remains hidden.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Student dashboard stays scoped to the student role.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Student dashboard blocked"
        }
      }
    };
  }

  function hydrateDashboard() {
    if (!pageApi) {
      return;
    }

    var roleContext = pageApi.requireRole(getGateConfig());
    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 14 hardening is active.",
        phaseCopy: "Student dashboard now loads live recommendations, registration context, and update activity through the contracted student APIs.",
        topbarEyebrow: "Student journey",
        topbarTitle: "Student dashboard"
      }
    });

    pageApi.bindLogout(logoutButtons, "/login.jsp");
    loadDashboard();
  }

  hydrateDashboard();
})();