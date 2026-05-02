(function () {
  function create(options) {
    var contextPath = options.contextPath || "";
    var currentRoute = document.body.getAttribute("data-current-route") || "";
    var apiClient = window.EventFlowMockApi ? window.EventFlowMockApi.create({ contextPath: contextPath }) : null;
    var roleNavHeading = document.querySelector("[data-role-nav-heading]");
    var roleNavList = document.querySelector("[data-role-nav-list]");
    var phaseStatusTitle = document.querySelector("[data-phase-status-title]");
    var phaseStatusCopy = document.querySelector("[data-phase-status-copy]");
    var topbarEyebrow = document.querySelector("[data-topbar-eyebrow]");
    var topbarTitle = document.querySelector("[data-topbar-title]");
    var notificationToggle = document.querySelector("[data-notification-toggle]");
    var notificationCount = document.querySelector("[data-notification-count]");
    var notificationPanelCount = document.querySelector("[data-notification-panel-count]");
    var notificationPanel = document.querySelector("[data-notification-panel]");
    var notificationList = document.querySelector("[data-notification-list]");
    var userMenuToggle = document.querySelector("[data-user-menu-toggle]");
    var userMenuPanel = document.querySelector("[data-user-menu-panel]");
    var sessionUserLabel = document.querySelector("[data-session-user-label]");
    var userSummaryName = document.querySelector("[data-user-summary-name]");
    var userSummaryRole = document.querySelector("[data-user-summary-role]");
    var userSummaryEmail = document.querySelector("[data-user-summary-email]");
    var activeSession = null;
    var notificationPoller = null;

    function closePanels() {
      if (notificationPanel) {
        notificationPanel.hidden = true;
      }

      if (userMenuPanel) {
        userMenuPanel.hidden = true;
      }

      if (notificationToggle) {
        notificationToggle.setAttribute("aria-expanded", "false");
      }

      if (userMenuToggle) {
        userMenuToggle.setAttribute("aria-expanded", "false");
      }
    }

    function isInsideTrigger(trigger, target) {
      return !!(trigger && target && (trigger === target || trigger.contains(target)));
    }

    function togglePanel(trigger, panel) {
      if (!trigger || !panel) {
        return;
      }

      var shouldOpen = panel.hidden;
      closePanels();
      panel.hidden = !shouldOpen;
      trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }

    function resolvePreviewHref(route) {
      var previewMap = {
        "/login": "/login.jsp",
        "/dashboard": "/dashboard.jsp",
        "/error/403": "/error/403.jsp",
        "/error/404": "/error/404.jsp",
        "/error/session-expired": "/error/session-expired.jsp",
        "/admin/dashboard": "/admin/dashboard.jsp",
        "/admin/events": "/admin/events.jsp",
        "/admin/users": "/admin/users.jsp",
        "/admin/reports": "/admin/reports.jsp",
        "/admin/notifications": "/admin/dashboard.jsp#notification-preview",
        "/organizer/dashboard": "/organizer/dashboard.jsp",
        "/organizer/tasks": "/organizer/tasks.jsp",
        "/organizer/tasks/board": "/organizer/tasks/board.jsp",
        "/organizer/events/{eventId}/operations": "/organizer/events/operations.jsp",
        "/organizer/notifications": "/organizer/dashboard.jsp#organizer-delay-alerts",
        "/volunteer/dashboard": "/volunteer/dashboard.jsp",
        "/volunteer/tasks": "/volunteer/tasks.jsp",
        "/volunteer/tasks/{taskId}": "/volunteer/tasks",
        "/volunteer/performance": "/volunteer/performance.jsp",
        "/volunteer/notifications": "/volunteer/notifications.jsp",
        "/student/dashboard": "/student/dashboard",
        "/student/events": "/student/events.jsp",
        "/student/events/{eventId}": "/student/events",
        "/student/registrations": "/student/registrations.jsp",
        "/student/check-in": "/student/check-in.jsp",
        "/student/feedback": "/student/feedback.jsp",
        "/student/notifications": "/student/notifications"
      };

      return contextPath + (previewMap[route] || "/dashboard.jsp");
    }

    function renderSidebarNav(routes, label) {
      if (!roleNavList || !roleNavHeading) {
        return;
      }

      roleNavHeading.textContent = label;
      roleNavList.innerHTML = routes
        .map(function (route, index) {
          var shortLabel = route.split("/").filter(Boolean).join(" ");
          var isActive = currentRoute ? route === currentRoute : index === 0;
          return '<li><a class="nav-link' + (isActive ? ' is-active' : '') + '" href="' + resolvePreviewHref(route) + '"><span>' + shortLabel + '</span><span class="badge badge-neutral">Mock</span></a></li>';
        })
        .join("");
    }

    function renderNotifications(items, unreadCount) {
      if (!notificationList || !notificationCount || !notificationPanelCount) {
        return;
      }

      var count = typeof unreadCount === "number" ? unreadCount : items.length;

      notificationCount.textContent = String(count);
      notificationPanelCount.textContent = count + " unread";
      notificationList.innerHTML = items
        .map(function (item) {
          return '<li class="notification-item"><strong>' + item.title + '</strong><span class="notification-meta">' + item.meta + '</span></li>';
        })
        .join("");
    }

    function loadNotifications(fallbackItems) {
      if (!apiClient || !activeSession) {
        renderNotifications(fallbackItems || []);
        return Promise.resolve(null);
      }

      return apiClient.get("/api/notifications", { retries: 1 }).then(function (response) {
        if (response.ok && response.data) {
          renderNotifications(response.data.notifications || [], response.data.unreadCount);
          return response;
        }

        renderNotifications(fallbackItems || []);
        return response;
      });
    }

    function syncNotificationPolling(session, fallbackItems) {
      activeSession = session || null;

      if (!activeSession) {
        if (notificationPoller) {
          notificationPoller.stop();
        }

        renderNotifications(fallbackItems || []);
        return;
      }

      if (!notificationPoller && window.EventFlowMockPolling) {
        notificationPoller = window.EventFlowMockPolling.create({
          intervalMs: 15000,
          shouldRun: function () {
            return !!activeSession;
          },
          run: function () {
            return loadNotifications(fallbackItems);
          }
        });
      }

      if (notificationPoller) {
        notificationPoller.start();
        notificationPoller.refresh();
        return;
      }

      loadNotifications(fallbackItems);
    }

    function applyShellState(config, session) {
      if (phaseStatusTitle && config.phaseTitle) {
        phaseStatusTitle.textContent = config.phaseTitle;
      }

      if (phaseStatusCopy && config.phaseCopy) {
        phaseStatusCopy.textContent = config.phaseCopy;
      }

      if (topbarEyebrow && config.topbarEyebrow) {
        topbarEyebrow.textContent = config.topbarEyebrow;
      }

      if (topbarTitle && config.topbarTitle) {
        topbarTitle.textContent = config.topbarTitle;
      }

      if (sessionUserLabel && session && session.fullName) {
        sessionUserLabel.textContent = session.fullName;
      }

      if (userSummaryName && session && session.fullName) {
        userSummaryName.textContent = session.fullName;
      }

      if (userSummaryRole && config.userMenuRoleLabel) {
        userSummaryRole.textContent = config.userMenuRoleLabel;
      }

      if (userSummaryEmail && session && session.email) {
        userSummaryEmail.textContent = session.email;
      }

      if (config.routes && config.navLabel) {
        renderSidebarNav(config.routes, config.navLabel);
      }

      if (config.notifications) {
        renderNotifications(config.notifications);
      }

      syncNotificationPolling(session, config.notifications || []);
    }

    function clearSession(redirectPath) {
      if (notificationPoller) {
        notificationPoller.stop();
      }

      var normalizedRedirectPath = redirectPath === "/login.jsp" ? "/login" : (redirectPath || "/login");

      function finishLogout() {
        sessionStorage.removeItem("eventflowMockSession");
        window.location.href = contextPath + normalizedRedirectPath;
      }

      if (!window.fetch) {
        finishLogout();
        return;
      }

      window.fetch(contextPath + "/logout", {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      }).catch(function () {
        return null;
      }).finally(finishLogout);
    }

    if (notificationToggle && notificationPanel) {
      notificationToggle.addEventListener("click", function () {
        togglePanel(notificationToggle, notificationPanel);
      });
    }

    if (userMenuToggle && userMenuPanel) {
      userMenuToggle.addEventListener("click", function () {
        togglePanel(userMenuToggle, userMenuPanel);
      });
    }

    document.addEventListener("click", function (event) {
      if (
        notificationPanel &&
        !notificationPanel.hidden &&
        !notificationPanel.contains(event.target) &&
        !isInsideTrigger(notificationToggle, event.target)
      ) {
        closePanels();
      }

      if (
        userMenuPanel &&
        !userMenuPanel.hidden &&
        !userMenuPanel.contains(event.target) &&
        !isInsideTrigger(userMenuToggle, event.target)
      ) {
        closePanels();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePanels();
      }
    });

    return {
      applyShellState: applyShellState,
      clearSession: clearSession,
      closePanels: closePanels,
      renderNotifications: renderNotifications,
      renderSidebarNav: renderSidebarNav
    };
  }

  window.EventFlowMockSessionShell = {
    create: create
  };
})();