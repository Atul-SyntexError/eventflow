(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var gatePanel = document.querySelector("[data-student-gate]");
  var gateTitle = document.querySelector("[data-student-gate-title]");
  var gateMessage = document.querySelector("[data-student-gate-message]");
  var content = document.querySelector("[data-student-notifications-content]");
  var unreadValue = document.querySelector("[data-student-notification-unread]");
  var scheduleValue = document.querySelector("[data-student-notification-schedule]");
  var reminderValue = document.querySelector("[data-student-notification-reminders]");
  var totalValue = document.querySelector("[data-student-notification-total]");
  var filterButtons = document.querySelectorAll("[data-student-notification-filter]");
  var resetButton = document.querySelector("[data-student-notification-reset]");
  var summary = document.querySelector("[data-student-notification-summary]");
  var feed = document.querySelector("[data-student-notification-feed]");
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
    filterMode: "ALL",
    notifications: [],
    summary: {
      unreadCount: 0,
      scheduleChanges: 0,
      reminders: 0
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

  function formatDateTime(value) {
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

  function normalizeNotificationData(payload) {
    var items = payload && Array.isArray(payload.items) ? payload.items : [];
    var notifications = items.map(function (item) {
      return {
        notificationId: item.notificationId,
        type: item.type,
        title: item.title,
        body: item.body,
        route: item.link,
        occurredAt: formatDateTime(item.createdAt),
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
        scheduleChanges: notifications.filter(function (notification) {
          return notification.type === "SCHEDULE_CHANGED";
        }).length,
        reminders: notifications.filter(function (notification) {
          return notification.type === "CHECKIN_REMINDER";
        }).length
      },
      notifications: notifications
    };
  }

  function resolveNotificationHref(notification) {
    if (notification.route && notification.route.charAt(0) === "/") {
      return contextPath + notification.route;
    }
    return contextPath + "/student/dashboard";
  }

  function getFilteredNotifications() {
    return state.notifications.filter(function (notification) {
      if (state.filterMode === "UNREAD") {
        return notification.isUnread;
      }
      if (state.filterMode === "SCHEDULE_CHANGE") {
        return notification.type === "SCHEDULE_CHANGED";
      }
      if (state.filterMode === "REMINDER") {
        return notification.type === "CHECKIN_REMINDER";
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
      scheduleValue.textContent = "...";
      reminderValue.textContent = "...";
      totalValue.textContent = "...";
      return;
    }

    if (state.loadStatus === "error") {
      unreadValue.textContent = "--";
      scheduleValue.textContent = "--";
      reminderValue.textContent = "--";
      totalValue.textContent = "--";
      return;
    }

    unreadValue.textContent = String(state.summary.unreadCount);
    scheduleValue.textContent = String(state.summary.scheduleChanges);
    reminderValue.textContent = String(state.summary.reminders);
    totalValue.textContent = String(state.notifications.length);
  }

  function renderFeed() {
    syncFilterButtons();

    if (state.loadStatus === "loading") {
      summary.textContent = "Loading student notifications.";
      feed.innerHTML = '<li class="suggestion-item"><strong>Loading notifications</strong><span class="suggestion-copy">Student feed items are being prepared.</span></li>';
      return;
    }

    if (state.loadStatus === "error") {
      summary.textContent = state.errorMessage || "Notifications are unavailable.";
      feed.innerHTML = '<li class="suggestion-item"><strong>Notifications unavailable</strong><span class="suggestion-copy">' + escapeHtml(state.errorMessage || "The student notification request failed.") + '</span></li>';
      return;
    }

    var notifications = getFilteredNotifications();
    summary.textContent = "Showing " + notifications.length + " of " + state.notifications.length + " student notifications.";

    if (!notifications.length) {
      feed.innerHTML = '<li class="suggestion-item"><strong>No notifications match this filter</strong><span class="suggestion-copy">Change the filter to restore the full student feed.</span></li>';
      return;
    }

    feed.innerHTML = notifications.map(function (notification) {
      var unreadLabel = notification.isUnread ? "Unread" : "Read";
      var actions = [
        '<a class="button button-ghost" href="' + escapeHtml(resolveNotificationHref(notification)) + '">Open</a>'
      ];

      if (notification.isUnread) {
        actions.unshift('<button class="button button-secondary" type="button" data-student-mark-read="' + escapeHtml(notification.notificationId) + '">Mark read</button>');
      }

      return [
        '<li class="suggestion-item">',
        '<div class="task-meta-row"><strong>' + escapeHtml(notification.title) + '</strong><span class="badge badge-' + getNotificationVariant(notification.type) + '">' + escapeHtml(formatLabel(notification.type)) + '</span></div>',
        '<span class="suggestion-copy">' + escapeHtml(notification.body) + '</span>',
        '<div class="task-meta-row"><span class="text-muted">' + escapeHtml(unreadLabel) + ' • ' + escapeHtml(notification.occurredAt) + '</span><span class="button-row">' + actions.join("") + '</span></div>',
        '</li>'
      ].join("");
    }).join("");
  }

  function renderNotificationsPage() {
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
        renderNotificationsPage();
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
      renderNotificationsPage();
    }).catch(function () {
      state.errorMessage = "The notification could not be marked as read.";
      renderNotificationsPage();
    });
  }

  function loadNotifications() {
    if (previewStateShell) {
      previewStateShell.hidden = true;
    }

    if (!apiClient) {
      state.loadStatus = "error";
      state.errorMessage = "The live student API client is unavailable.";
      renderNotificationsPage();
      return;
    }

    state.loadStatus = "loading";
    state.errorMessage = "";
    renderNotificationsPage();

    apiClient.get("/api/notifications", { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !response.data) {
        state.notifications = [];
        state.summary = { unreadCount: 0, scheduleChanges: 0, reminders: 0 };
        state.loadStatus = "error";
        state.errorMessage = response && response.message ? response.message : "The student notification request failed.";
        renderNotificationsPage();
        return;
      }

      var normalized = normalizeNotificationData(response.data);
      state.notifications = normalized.notifications;
      state.summary = normalized.summary;
      state.loadStatus = "ready";
      renderNotificationsPage();
    }).catch(function () {
      state.notifications = [];
      state.summary = { unreadCount: 0, scheduleChanges: 0, reminders: 0 };
      state.loadStatus = "error";
      state.errorMessage = "The student notification request failed.";
      renderNotificationsPage();
    });
  }

  function bindEvents() {
    Array.prototype.forEach.call(filterButtons, function (button) {
      button.addEventListener("click", function () {
        state.filterMode = button.getAttribute("data-filter");
        renderNotificationsPage();
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        state.filterMode = "ALL";
        renderNotificationsPage();
      });
    }

    if (feed) {
      feed.addEventListener("click", function (event) {
        var button = event.target.closest("[data-student-mark-read]");
        if (!button) {
          return;
        }

        markNotificationRead(Number(button.getAttribute("data-student-mark-read")));
      });
    }
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Student notifications unavailable",
        message: "Student notifications need the shared shell bootstrap before the live route can render.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Student notifications only render for student sessions with the shared shell loaded.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Student notifications blocked"
        }
      },
      missingSession: {
        title: "Student notifications need a session",
        message: "Open the login page and sign in with the student account before loading notifications.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Student notifications only render for authenticated student sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Student notifications blocked"
        }
      },
      wrongRole: {
        title: "This route is student-only",
        message: "The current session belongs to another role, so the student notification feed remains hidden.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Student notifications stay scoped to the student role.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Student notifications blocked"
        }
      }
    };
  }

  function hydrateNotificationsPage() {
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
        phaseCopy: "Student notifications now load the live notification feed and support in-app read acknowledgements.",
        topbarEyebrow: "Student journey",
        topbarTitle: "Student notifications"
      }
    });

    pageApi.bindLogout(logoutButtons, "/login.jsp");
    bindEvents();
    loadNotifications();
  }

  hydrateNotificationsPage();
})();