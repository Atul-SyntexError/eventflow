(function () {
  function create(options) {
    var contextPath = options.contextPath || "";
    var requiredRole = options.requiredRole || "";
    var shellApi = window.EventFlowMockSessionShell
      ? window.EventFlowMockSessionShell.create({ contextPath: contextPath })
      : null;
    var mockData = window.EventFlowMockData || null;
    var serverHydrationRequested = false;
    var gatePanel = options.gatePanel || null;
    var gateTitle = options.gateTitle || null;
    var gateMessage = options.gateMessage || null;
    var gatedContent = options.gatedContent || null;
    var accessBanner = options.accessBanner || null;
    var accessBannerTitle = options.accessBannerTitle || null;
    var accessBannerMessage = options.accessBannerMessage || null;

    function getFallbackSession(session) {
      return session || { fullName: "Guest preview", email: "Sign in required" };
    }

    function getRoleUiConfig(role) {
      return mockData ? mockData.getRoleUiConfig(role) : null;
    }

    function getRedirectPath(role) {
      switch (role) {
        case "ADMIN":
          return "/admin/dashboard.jsp";
        case "ORGANIZER":
          return "/organizer/dashboard.jsp";
        case "VOLUNTEER":
          return "/volunteer/dashboard.jsp";
        case "STUDENT":
          return "/student/dashboard";
        default:
          return "/dashboard";
      }
    }

    function storeSessionPayload(payload) {
      if (mockData && mockData.storeSession) {
        mockData.storeSession(payload);
        return;
      }

      sessionStorage.setItem("eventflowMockSession", JSON.stringify(payload));
    }

    function hydrateSessionFromServer(copyByState) {
      if (serverHydrationRequested || !window.fetch) {
        return;
      }

      serverHydrationRequested = true;

      window.fetch(contextPath + "/api/session", {
        headers: {
          Accept: "application/json"
        }
      }).then(function (response) {
        if (!response.ok) {
          return null;
        }

        return response.json();
      }).then(function (payload) {
        var sessionPayload;

        if (!payload || !payload.authenticated || !payload.session) {
          return;
        }

        sessionPayload = {
          session: payload.session,
          redirectPath: getRedirectPath(payload.session.role)
        };

        storeSessionPayload(sessionPayload);

        if (requiredRole && payload.session.role !== requiredRole) {
          showGate(copyByState.wrongRole, payload.session);
          return;
        }

        window.location.reload();
      }).catch(function () {
        return null;
      });
    }

    function applyBanner(copy) {
      if (!accessBanner) {
        return;
      }

      if (!copy) {
        accessBanner.hidden = true;
        return;
      }

      accessBanner.hidden = false;

      if (accessBannerTitle && copy.title) {
        accessBannerTitle.textContent = copy.title;
      }

      if (accessBannerMessage && copy.message) {
        accessBannerMessage.textContent = copy.message;
      }
    }

    function applyShell(session, uiConfig, shellCopy) {
      var shellConfig = shellCopy || {};

      if (!shellApi) {
        return;
      }

      shellApi.applyShellState(
        {
          phaseTitle: shellConfig.phaseTitle,
          phaseCopy: shellConfig.phaseCopy,
          topbarEyebrow: shellConfig.topbarEyebrow,
          topbarTitle: shellConfig.topbarTitle || (uiConfig ? uiConfig.label : "Restricted preview"),
          userMenuRoleLabel: shellConfig.userMenuRoleLabel || (uiConfig ? uiConfig.label : "No active session"),
          routes: shellConfig.routes || (uiConfig ? uiConfig.routes : ["/dashboard"]),
          navLabel: shellConfig.navLabel || (uiConfig ? uiConfig.badge + " navigation" : "Shared navigation"),
          notifications: shellConfig.notifications || (uiConfig ? uiConfig.notifications : [])
        },
        getFallbackSession(session)
      );
    }

    function showGate(copy, session) {
      var fallbackConfig = session && mockData ? getRoleUiConfig(session.role) : null;

      if (gatedContent) {
        gatedContent.hidden = true;
      }

      if (gatePanel) {
        gatePanel.hidden = false;
      }

      if (gateTitle && copy && copy.title) {
        gateTitle.textContent = copy.title;
      }

      if (gateMessage && copy && copy.message) {
        gateMessage.textContent = copy.message;
      }

      applyBanner(copy ? copy.banner : null);
      applyShell(session, fallbackConfig, copy ? copy.shell : null);
    }

    function showReady(roleContext, copy) {
      if (gatedContent) {
        gatedContent.hidden = false;
      }

      if (gatePanel) {
        gatePanel.hidden = true;
      }

      applyBanner(copy ? copy.banner : null);
      applyShell(roleContext.session, roleContext.uiConfig, copy ? copy.shell : null);
    }

    function requireRole(copyByState) {
      if (!mockData) {
        showGate(copyByState.missingData, null);
        return null;
      }

      var sessionPayload = mockData.getStoredSession();

      if (!sessionPayload || !sessionPayload.session) {
        hydrateSessionFromServer(copyByState);
        showGate(copyByState.missingSession, null);
        return null;
      }

      if (requiredRole && sessionPayload.session.role !== requiredRole) {
        showGate(copyByState.wrongRole, sessionPayload.session);
        return null;
      }

      return {
        sessionPayload: sessionPayload,
        session: sessionPayload.session,
        uiConfig: getRoleUiConfig(requiredRole || sessionPayload.session.role)
      };
    }

    function bindLogout(buttons, redirectPath) {
      Array.prototype.forEach.call(buttons, function (button) {
        button.addEventListener("click", function () {
          if (shellApi) {
            shellApi.clearSession(redirectPath);
            return;
          }

          sessionStorage.removeItem("eventflowMockSession");
          window.location.href = contextPath + redirectPath;
        });
      });
    }

    return {
      mockData: mockData,
      requireRole: requireRole,
      showGate: showGate,
      showReady: showReady,
      bindLogout: bindLogout
    };
  }

  window.EventFlowMockRolePage = {
    create: create
  };
})();