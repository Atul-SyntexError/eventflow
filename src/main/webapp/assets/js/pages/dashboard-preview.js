(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var sessionBannerTitle = document.querySelector("[data-session-banner-title]");
  var sessionBannerMessage = document.querySelector("[data-session-banner-message]");
  var roleBadge = document.querySelector("[data-role-badge]");
  var routeList = document.querySelector("[data-route-list]");
  var sessionName = document.querySelector("[data-session-name]");
  var sessionEmail = document.querySelector("[data-session-email]");
  var sessionRole = document.querySelector("[data-session-role]");
  var sessionUnread = document.querySelector("[data-session-unread]");
  var sessionLastLogin = document.querySelector("[data-session-last-login]");
  var sessionPermissions = document.querySelector("[data-session-permissions]");
  var sessionAvatar = document.querySelector("[data-session-avatar]");
  var noSessionPanel = document.querySelector("[data-no-session-panel]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var refreshPreview = document.querySelector("[data-refresh-preview]");
  var mockData = window.EventFlowMockData || null;
  var shellApi = window.EventFlowMockSessionShell
    ? window.EventFlowMockSessionShell.create({ contextPath: contextPath })
    : null;

  function clearSession() {
    if (shellApi) {
      shellApi.clearSession("/login.jsp");
      return;
    }

    sessionStorage.removeItem("eventflowMockSession");
    window.location.href = contextPath + "/login.jsp";
  }

  function renderRouteList(routes) {
    if (!routeList) {
      return;
    }

    routeList.innerHTML = routes
      .map(function (route, index) {
        return '<li class="route-item"><span>' + (index === 0 ? 'Resolved landing path' : 'Next route') + '</span><span class="mono-copy">' + route + '</span></li>';
      })
      .join("");
  }

  function hydrateSession(sessionPayload) {
    if (!sessionPayload || !sessionPayload.session) {
      if (noSessionPanel) {
        noSessionPanel.hidden = false;
      }

      if (sessionBannerTitle) {
        sessionBannerTitle.textContent = 'No active mock session';
      }

      if (sessionBannerMessage) {
        sessionBannerMessage.textContent = 'Return to the login preview to generate a mock session and role-aware redirect.';
      }

      return;
    }

    var session = sessionPayload.session;
    var config = mockData ? mockData.getRoleUiConfig(session.role) : null;

    if (!config) {
      return;
    }
    var initials = session.fullName
      .split(' ')
      .map(function (part) {
        return part.charAt(0);
      })
      .join('')
      .slice(0, 2)
      .toUpperCase();

    if (noSessionPanel) {
      noSessionPanel.hidden = true;
    }

    if (sessionName) {
      sessionName.textContent = session.fullName;
    }

    if (sessionEmail) {
      sessionEmail.textContent = session.email;
    }

    if (sessionRole) {
      sessionRole.textContent = session.role;
    }

    if (sessionUnread) {
      sessionUnread.textContent = String(session.unreadNotificationCount);
    }

    if (sessionLastLogin) {
      sessionLastLogin.textContent = session.lastLoginAt;
    }

    if (sessionPermissions) {
      sessionPermissions.textContent = session.permissions.join(', ');
    }

    if (sessionAvatar) {
      sessionAvatar.textContent = initials;
    }

    if (roleBadge) {
      roleBadge.textContent = config.badge;
    }

    renderRouteList([sessionPayload.redirectPath].concat(config.routes.slice(1)));
    if (shellApi) {
      shellApi.applyShellState(
        {
          phaseTitle: "Phase 2 is active.",
          phaseCopy: "Shared auth flow, notification shell, session controls, and async state patterns are being stabilized before role-specific modules expand.",
          topbarEyebrow: session.role + " mock session",
          topbarTitle: config.label,
          userMenuRoleLabel: config.label,
          routes: config.routes,
          navLabel: config.badge + " navigation",
          notifications: config.notifications
        },
        session
      );
    }
  }

  logoutButtons.forEach(function (button) {
    button.addEventListener('click', clearSession);
  });

  if (refreshPreview) {
    refreshPreview.addEventListener('click', function () {
      if (sessionBannerTitle) {
        sessionBannerTitle.textContent = 'Mock refresh complete';
      }

      if (sessionBannerMessage) {
        sessionBannerMessage.textContent = 'Shared retry and loading behavior is ready to back future AJAX session checks.';
      }
    });
  }

  hydrateSession(mockData ? mockData.getStoredSession() : JSON.parse(sessionStorage.getItem('eventflowMockSession') || 'null'));
})();