(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var mockData = window.EventFlowMockData || null;
  var apiClient = window.EventFlowMockApi ? window.EventFlowMockApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-volunteer-gate]");
  var gateTitle = document.querySelector("[data-volunteer-gate-title]");
  var gateMessage = document.querySelector("[data-volunteer-gate-message]");
  var content = document.querySelector("[data-volunteer-notifications-content]");
  var unreadValue = document.querySelector("[data-volunteer-notification-unread]");
  var assignmentValue = document.querySelector("[data-volunteer-notification-assignments]");
  var eventValue = document.querySelector("[data-volunteer-notification-events]");
  var totalValue = document.querySelector("[data-volunteer-notification-total]");
  var filterButtons = document.querySelectorAll("[data-volunteer-notification-filter]");
  var resetButton = document.querySelector("[data-volunteer-notification-reset]");
  var filterSummary = document.querySelector("[data-volunteer-notification-filter-summary]");
  var feedList = document.querySelector("[data-volunteer-notification-feed-list]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
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
  var previewController = null;
  var refreshController = null;
  var state = {
    filterMode: "ALL",
    previewMode: "ready",
    data: null
  };

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function formatLabel(value) {
    return value.replace(/_/g, " ");
  }
(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var gatePanel = document.querySelector("[data-volunteer-gate]");
  var gateTitle = document.querySelector("[data-volunteer-gate-title]");
  var gateMessage = document.querySelector("[data-volunteer-gate-message]");
  var content = document.querySelector("[data-volunteer-notifications-content]");
  var unreadValue = document.querySelector("[data-volunteer-notification-unread]");
  var assignmentValue = document.querySelector("[data-volunteer-notification-assignments]");
  var eventValue = document.querySelector("[data-volunteer-notification-events]");
  var totalValue = document.querySelector("[data-volunteer-notification-total]");
  var filterButtons = document.querySelectorAll("[data-volunteer-notification-filter]");
  var resetButton = document.querySelector("[data-volunteer-notification-reset]");
  var filterSummary = document.querySelector("[data-volunteer-notification-filter-summary]");
  var feedList = document.querySelector("[data-volunteer-notification-feed-list]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
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
    filterMode: "ALL",
    loadStatus: "loading",
    notifications: [],
    summary: {
      unreadCount: 0,
      assignmentUpdates: 0,
      eventChanges: 0
    },
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

  function formatTimestamp(value) {
    if (!value) {
      return "Unknown time";
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
    if (type === "RISK_ALERT") {
      return "danger";
    }
    if (type === "EVENT_UPDATED" || type === "SCHEDULE_CHANGED") {
      return "warning";
    }
    if (type === "TASK_ASSIGNED" || type === "TASK_UPDATED" || type === "CHECKIN_REMINDER") {
      return "info";
    }
    return "neutral";
  }

  function normalizeNotificationData(payload) {
    var items = payload && Array.isArray(payload.items) ? payload.items : [];
    var notifications = items.map(function (item) {
      return {
        notificationId: item.notificationId,
        type: item.type,
        title: item.title,
        body: item.body,
        route: item.link,
        occurredAt: formatTimestamp(item.createdAt),
        isUnread: !item.read
      };
    });

    return {
      summary: {
        unreadCount: typeof payload.unreadCount === "number"
          ? payload.unreadCount
          : notifications.filter(function (notification) {
              return notification.isUnread;
            }).length,
        assignmentUpdates: notifications.filter(function (notification) {
          return notification.type === "TASK_ASSIGNED" || notification.type === "TASK_UPDATED";
        }).length,
        eventChanges: notifications.filter(function (notification) {
          return notification.type === "EVENT_UPDATED" || notification.type === "SCHEDULE_CHANGED";
        }).length
      },
      notifications: notifications
    };
  }

  function resolveNotificationHref(notification) {
    if (!notification.route) {
      return contextPath + "/volunteer/dashboard.jsp";
    }

    if (notification.route === "/volunteer/performance") {
      return contextPath + "/volunteer/performance";
    }

    if (notification.route.charAt(0) === "/") {
      return contextPath + notification.route;
    }

    return contextPath + "/volunteer/dashboard.jsp";
  }

  function getFilteredNotifications() {
    return state.notifications.filter(function (notification) {
      if (state.filterMode === "UNREAD") {
        return notification.isUnread;
      }

      if (state.filterMode === "BLOCKER") {
        return notification.type === "RISK_ALERT" || notification.type === "TASK_UPDATED";
      }

      return true;
    });
  }

  function syncFilterButtons() {
    Array.prototype.forEach.call(filterButtons, function (button) {
      var isActive = button.getAttribute("data-filter") === state.filterMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function renderMetrics() {
    if (state.loadStatus === "loading") {
      unreadValue.textContent = "...";
      assignmentValue.textContent = "...";
      eventValue.textContent = "...";
      totalValue.textContent = "...";
      return;
    }

    if (state.loadStatus === "error") {
      unreadValue.textContent = "--";
      assignmentValue.textContent = "--";
      eventValue.textContent = "--";
      totalValue.textContent = "--";
      return;
    }

    unreadValue.textContent = String(state.summary.unreadCount);
    assignmentValue.textContent = String(state.summary.assignmentUpdates);
    eventValue.textContent = String(state.summary.eventChanges);
    totalValue.textContent = String(state.notifications.length);
  }

  function renderFeed() {
    syncFilterButtons();

    if (state.loadStatus === "loading") {
      filterSummary.textContent = "Loading volunteer notifications.";
      feedList.innerHTML = '<li class="suggestion-item"><strong>Loading notifications</strong><span class="suggestion-copy">Volunteer updates are being prepared.</span></li>';
      return;
    }

    if (state.loadStatus === "error") {
      filterSummary.textContent = state.errorMessage || "Volunteer notifications are unavailable.";
      feedList.innerHTML = '<li class="suggestion-item"><strong>Notifications unavailable</strong><span class="suggestion-copy">' + escapeHtml(state.errorMessage || "The volunteer notification request failed.") + '</span></li>';
      return;
    }

    var notifications = getFilteredNotifications();
    filterSummary.textContent = "Showing " + notifications.length + " of " + state.notifications.length + " volunteer notifications.";

    if (!notifications.length) {
      feedList.innerHTML = '<li class="suggestion-item"><strong>No notifications match this filter</strong><span class="suggestion-copy">Change the filter to restore the full volunteer feed.</span></li>';
      return;
    }

    feedList.innerHTML = notifications.map(function (notification) {
      var variant = getNotificationVariant(notification.type);
      var unreadLabel = notification.isUnread ? "Unread" : "Read";
      var actions = [
        '<a class="button button-ghost" href="' + escapeHtml(resolveNotificationHref(notification)) + '">Open</a>'
      ];

      if (notification.isUnread) {
        actions.unshift('<button class="button button-secondary" type="button" data-volunteer-mark-read="' + escapeHtml(notification.notificationId) + '">Mark read</button>');
      }

      return [
        '<li class="suggestion-item">',
        '<div class="task-meta-row"><strong>' + escapeHtml(notification.title) + '</strong><span class="badge badge-' + variant + '">' + escapeHtml(formatLabel(notification.type)) + '</span></div>',
        '<span class="suggestion-copy">' + escapeHtml(notification.body) + '</span>',
        '<div class="task-meta-row"><span class="text-muted">' + escapeHtml(unreadLabel) + ' • ' + escapeHtml(notification.occurredAt) + '</span><span class="button-row">' + actions.join("") + '</span></div>',
        '</li>'
      ].join("");
    }).join("");
  }

  function renderNotifications() {
    renderMetrics();
    renderFeed();
  }

  function markNotificationRead(notificationId) {
    if (!apiClient) {
      return;
    }

    apiClient.post("/api/notifications/" + notificationId + "/read", null).then(function (response) {
      if (!response || !response.ok) {
        state.errorMessage = response && response.message ? response.message : "The notification could not be marked as read.";
        renderNotifications();
        return;
      }

      state.notifications = state.notifications.map(function (notification) {
        if (notification.notificationId === notificationId) {
          notification.isUnread = false;
        }
        return notification;
      });
      state.summary.unreadCount = state.notifications.filter(function (notification) {
        return notification.isUnread;
      }).length;
      state.errorMessage = "";
      renderNotifications();
    }).catch(function () {
      state.errorMessage = "The notification could not be marked as read.";
      renderNotifications();
    });
  }

  function loadNotifications() {
    if (previewStateShell) {
      previewStateShell.hidden = true;
    }

    if (!apiClient) {
      state.loadStatus = "error";
      state.errorMessage = "The live notification client is unavailable.";
      renderNotifications();
      return;
    }

    state.loadStatus = "loading";
    state.errorMessage = "";
    renderNotifications();

    apiClient.get("/api/notifications", { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !response.data) {
        state.notifications = [];
        state.summary = { unreadCount: 0, assignmentUpdates: 0, eventChanges: 0 };
        state.loadStatus = "error";
        state.errorMessage = response && response.message ? response.message : "The volunteer notification request failed.";
        renderNotifications();
        return;
      }

      var normalized = normalizeNotificationData(response.data);
      state.notifications = normalized.notifications;
      state.summary = normalized.summary;
      state.loadStatus = state.notifications.length ? "ready" : "empty";
      state.errorMessage = "";
      renderNotifications();
    }).catch(function () {
      state.notifications = [];
      state.summary = { unreadCount: 0, assignmentUpdates: 0, eventChanges: 0 };
      state.loadStatus = "error";
      state.errorMessage = "The volunteer notification request failed.";
      renderNotifications();
    });
  }

  function bindEvents() {
    Array.prototype.forEach.call(filterButtons, function (button) {
      button.addEventListener("click", function () {
        state.filterMode = button.getAttribute("data-filter");
        renderNotifications();
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        state.filterMode = "ALL";
        renderNotifications();
      });
    }

    if (feedList) {
      feedList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-volunteer-mark-read]");
        if (!button) {
          return;
        }

        markNotificationRead(Number(button.getAttribute("data-volunteer-mark-read")));
      });
    }
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Volunteer notifications unavailable",
        message: "Volunteer notifications need the shared shell bootstrap before the live route can render.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer notifications only render for volunteer sessions with the shared shell loaded.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer notifications blocked"
        }
      },
      missingSession: {
        title: "Volunteer notifications need a session",
        message: "Open the login page and sign in with the volunteer account before loading notifications.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer notifications only render for authenticated volunteer sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer notifications blocked"
        }
      },
      wrongRole: {
        title: "This route is volunteer-only",
        message: "The current session belongs to another role, so the volunteer notification feed remains hidden.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer notifications stay scoped to the volunteer role.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer notifications blocked"
        }
      }
    };
  }

  function hydrateNotifications() {
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
        phaseCopy: "Volunteer notifications now load live updates and support in-app read acknowledgements.",
        topbarEyebrow: "Volunteer operations",
        topbarTitle: "Volunteer notifications"
      }
    });

    pageApi.bindLogout(logoutButtons, "/login.jsp");
    bindEvents();
    loadNotifications();
  }

  hydrateNotifications();
})();