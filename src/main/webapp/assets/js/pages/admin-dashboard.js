(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var mockData = window.EventFlowMockData || null;
  var apiClient = window.EventFlowMockApi ? window.EventFlowMockApi.create({ contextPath: contextPath }) : null;
  var accessBanner = document.querySelector("[data-admin-access-banner]");
  var accessBannerTitle = document.querySelector("[data-admin-access-banner-title]");
  var accessBannerMessage = document.querySelector("[data-admin-access-banner-message]");
  var gatePanel = document.querySelector("[data-admin-gate]");
  var gateTitle = document.querySelector("[data-admin-gate-title]");
  var gateMessage = document.querySelector("[data-admin-gate-message]");
  var dashboardContent = document.querySelector("[data-admin-dashboard-content]");
  var kpiActiveEvents = document.querySelector("[data-kpi-active-events]");
  var kpiLiveEvents = document.querySelector("[data-kpi-live-events]");
  var kpiTotalUsers = document.querySelector("[data-kpi-total-users]");
  var kpiVolunteerCoverage = document.querySelector("[data-kpi-volunteer-coverage]");
  var healthEventName = document.querySelector("[data-health-event-name]");
  var healthScore = document.querySelector("[data-health-score]");
  var healthSnapshot = document.querySelector("[data-health-snapshot]");
  var healthSignalList = document.querySelector("[data-health-signal-list]");
  var riskList = document.querySelector("[data-risk-list]");
  var eventTableBody = document.querySelector("[data-event-table-body]");
  var userList = document.querySelector("[data-admin-user-list]");
  var reportList = document.querySelector("[data-report-preview-list]");
  var adminFeedList = document.querySelector("[data-admin-feed-list]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "ADMIN",
        gatedContent: dashboardContent,
        gatePanel: gatePanel,
        gateTitle: gateTitle,
        gateMessage: gateMessage,
        accessBanner: accessBanner,
        accessBannerTitle: accessBannerTitle,
        accessBannerMessage: accessBannerMessage
      })
    : null;
  var previewMode = "ready";
  var dashboardData = null;
  var previewController = null;
  var refreshController = null;

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Mock data unavailable",
        message: "Shared mock data must load before the admin dashboard preview can render.",
        banner: {
          title: "Restricted preview",
          message: "Phase 3 admin pages should only render meaningful admin data for admin sessions."
        },
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin pages should stay aligned to role boundaries even while frontend work is mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin preview blocked"
        }
      },
      missingSession: {
        title: "Admin preview needs a session",
        message: "Open the login preview first and sign in with the admin demo account to view this page.",
        banner: {
          title: "Restricted preview",
          message: "Phase 3 admin pages should only render meaningful admin data for admin sessions."
        },
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin pages should stay aligned to role boundaries even while frontend work is mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin preview blocked"
        }
      },
      wrongRole: {
        title: "This preview is admin-only",
        message: "The stored session belongs to another role, so the admin dashboard content is intentionally hidden.",
        banner: {
          title: "Restricted preview",
          message: "Phase 3 admin pages should only render meaningful admin data for admin sessions."
        },
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin pages should stay aligned to role boundaries even while frontend work is mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin preview blocked"
        }
      }
    };
  }

  function loadDashboardData(reason) {
    if (apiClient) {
      return apiClient.get("/api/admin/dashboard", { retries: 1 });
    }

    return Promise.resolve({
      ok: true,
      data: mockData.getAdminDashboardData(),
      meta: { reason: reason || "initial" }
    });
  }

  function syncPreviewStatePanel() {
    if (!previewController) {
      return;
    }

    if (previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the dashboard while admin metrics, risks, and reports are still loading."
      });
      return;
    }

    if (previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful dashboard response with no active admin records yet, so empty-state messaging can be reviewed."
      });
      return;
    }

    if (previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed admin dashboard request while keeping a safe fallback surface and recovery copy visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function renderHealth(overview) {
    if (previewMode === "loading") {
      if (healthEventName) {
        healthEventName.textContent = "Loading event health";
      }

      if (healthScore) {
        healthScore.textContent = "...";
      }

      if (healthSnapshot) {
        healthSnapshot.textContent = "Waiting for the admin dashboard response.";
      }

      if (healthSignalList) {
        healthSignalList.innerHTML = '<li class="health-signal"><span class="skeleton skeleton-sm"></span><span class="skeleton"></span></li><li class="health-signal"><span class="skeleton skeleton-sm"></span><span class="skeleton"></span></li><li class="health-signal"><span class="skeleton skeleton-sm"></span><span class="skeleton"></span></li>';
      }

      return;
    }

    if (previewMode === "empty") {
      if (healthEventName) {
        healthEventName.textContent = "No live event health yet";
      }

      if (healthScore) {
        healthScore.textContent = "0";
      }

      if (healthSnapshot) {
        healthSnapshot.textContent = "No active event snapshots are available in the empty preview state.";
      }

      if (healthSignalList) {
        healthSignalList.innerHTML = '<li class="health-signal"><strong>No health signals yet</strong><span class="signal-meta">The dashboard can safely render before live event metrics exist.</span></li>';
      }

      return;
    }

    if (previewMode === "error") {
      if (healthEventName) {
        healthEventName.textContent = "Health snapshot unavailable";
      }

      if (healthScore) {
        healthScore.textContent = "--";
      }

      if (healthSnapshot) {
        healthSnapshot.textContent = "The preview is simulating a failed health request.";
      }

      if (healthSignalList) {
        healthSignalList.innerHTML = '<li class="health-signal"><strong>Health data request failed</strong><span class="signal-meta">Switch back to ready state to restore the mocked health payload.</span></li>';
      }

      return;
    }

    if (!overview.length) {
      return;
    }

    var lead = overview[0];

    if (healthEventName) {
      healthEventName.textContent = lead.eventName;
    }

    if (healthScore) {
      healthScore.textContent = String(lead.healthScore);
    }

    if (healthSnapshot) {
      healthSnapshot.textContent = "Snapshot at " + lead.snapshotAt + " · trend " + lead.trend;
    }

    if (healthSignalList) {
      healthSignalList.innerHTML = [
        { label: "Attendance ratio", value: lead.attendanceRatio },
        { label: "Engagement score", value: lead.engagementScore },
        { label: "Volunteer efficiency", value: lead.volunteerEfficiencyScore }
      ]
        .map(function (item) {
          return '<li class="health-signal"><strong>' + item.label + '</strong><span class="signal-meta">' + item.value + '</span></li>';
        })
        .join("");
    }
  }

  function renderRisks(risks) {
    if (!riskList) {
      return;
    }

    if (previewMode === "loading") {
      riskList.innerHTML = '<li class="risk-item"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton skeleton-sm"></span></li><li class="risk-item"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton skeleton-sm"></span></li>';
      return;
    }

    if (previewMode === "empty") {
      riskList.innerHTML = '<li class="risk-item"><strong>No risk alerts yet</strong><span class="risk-meta">The empty dashboard keeps the risk panel stable when no predictions are returned.</span></li>';
      return;
    }

    if (previewMode === "error") {
      riskList.innerHTML = '<li class="risk-item"><strong>Risk predictions unavailable</strong><span class="risk-meta">The preview is simulating a failed risk request so fallback copy can be reviewed.</span></li>';
      return;
    }

    riskList.innerHTML = risks
      .map(function (risk) {
        return '<li class="risk-item"><div class="split"><strong>' + risk.headline + '</strong><span class="badge badge-' + (risk.riskLevel === 'MEDIUM' ? 'warning' : 'neutral') + '">' + risk.riskLevel + '</span></div><span class="risk-meta">' + risk.description + '</span><span class="risk-meta">Recommended action: ' + risk.recommendedAction + '</span></li>';
      })
      .join("");
  }

  function renderEvents(events) {
    if (!eventTableBody) {
      return;
    }

    if (previewMode === "loading") {
      eventTableBody.innerHTML = '<tr><td colspan="7"><span class="skeleton"></span></td></tr><tr><td colspan="7"><span class="skeleton"></span></td></tr>';
      return;
    }

    if (previewMode === "empty") {
      eventTableBody.innerHTML = '<tr><td colspan="7">No admin events are available in this preview state.</td></tr>';
      return;
    }

    if (previewMode === "error") {
      eventTableBody.innerHTML = '<tr><td colspan="7">The event watchlist could not load. Review the recovery messaging above and switch back to ready state.</td></tr>';
      return;
    }

    eventTableBody.innerHTML = events
      .map(function (event) {
        return '<tr><td>' + event.name + '</td><td><span class="badge badge-info">' + event.status + '</span></td><td>' + event.venue + '</td><td>' + event.registeredCount + ' / ' + event.expectedAttendance + '</td><td>' + event.checkedInCount + '</td><td>' + (event.healthScore || 'Pending') + '</td><td><span class="badge badge-' + (event.riskLevel === 'MEDIUM' ? 'warning' : 'neutral') + '">' + event.riskLevel + '</span></td></tr>';
      })
      .join("");
  }

  function renderUsers(users) {
    if (!userList) {
      return;
    }

    if (previewMode === "loading") {
      userList.innerHTML = '<li class="admin-user-item"><span class="skeleton"></span><span class="skeleton"></span></li><li class="admin-user-item"><span class="skeleton"></span><span class="skeleton"></span></li>';
      return;
    }

    if (previewMode === "empty") {
      userList.innerHTML = '<li class="admin-user-item"><strong>No user snapshot yet</strong><span class="user-meta-row">The admin dashboard can render safely before role summaries are populated.</span></li>';
      return;
    }

    if (previewMode === "error") {
      userList.innerHTML = '<li class="admin-user-item"><strong>User snapshot unavailable</strong><span class="user-meta-row">The preview is simulating a failed user-summary request.</span></li>';
      return;
    }

    userList.innerHTML = users
      .map(function (user) {
        return '<li class="admin-user-item"><div class="split"><strong>' + user.fullName + '</strong><span class="badge badge-neutral">' + user.role + '</span></div><span class="user-meta-row">Availability: ' + user.availabilityStatus + ' · Performance: ' + user.performanceScore + '</span><span class="user-meta-row">Skills: ' + user.skills.join(', ') + '</span></li>';
      })
      .join("");
  }

  function renderReports(reports) {
    if (!reportList) {
      return;
    }

    if (previewMode === "loading") {
      reportList.innerHTML = '<li class="report-card"><span class="skeleton"></span><span class="skeleton"></span></li><li class="report-card"><span class="skeleton"></span><span class="skeleton"></span></li>';
      return;
    }

    if (previewMode === "empty") {
      reportList.innerHTML = '<li class="report-card"><strong>No report previews yet</strong><span class="report-meta">The empty state keeps reporting surfaces stable before aggregation data exists.</span></li>';
      return;
    }

    if (previewMode === "error") {
      reportList.innerHTML = '<li class="report-card"><strong>Report preview unavailable</strong><span class="report-meta">The preview is simulating a failed reporting request.</span></li>';
      return;
    }

    reportList.innerHTML = reports
      .map(function (report) {
        return '<li class="report-preview-item"><strong>' + report.title + '</strong><span class="report-meta">' + report.summary + '</span><span class="metric-trend">' + report.trend + '</span></li>';
      })
      .join("");
  }

  function renderFeed(items) {
    if (!adminFeedList) {
      return;
    }

    if (previewMode === "loading") {
      adminFeedList.innerHTML = '<li class="admin-feed-item"><span class="skeleton"></span><span class="skeleton"></span></li><li class="admin-feed-item"><span class="skeleton"></span><span class="skeleton"></span></li>';
      return;
    }

    if (previewMode === "empty") {
      adminFeedList.innerHTML = '<li class="admin-feed-item"><strong>No feed items yet</strong><span class="feed-meta">The empty state keeps the feed stable before notifications are produced.</span></li>';
      return;
    }

    if (previewMode === "error") {
      adminFeedList.innerHTML = '<li class="admin-feed-item"><strong>Feed unavailable</strong><span class="feed-meta">The preview is simulating a failed admin activity request.</span></li>';
      return;
    }

    adminFeedList.innerHTML = items
      .map(function (item) {
        return '<li class="admin-feed-item"><strong>' + item.title + '</strong><span class="feed-meta">' + item.meta + '</span></li>';
      })
      .join("");
  }

  function renderDashboard(data) {
    if (!data) {
      return;
    }

    syncPreviewStatePanel();

    if (previewMode === "loading") {
      if (kpiActiveEvents) {
        kpiActiveEvents.textContent = "...";
      }

      if (kpiLiveEvents) {
        kpiLiveEvents.textContent = "...";
      }

      if (kpiTotalUsers) {
        kpiTotalUsers.textContent = "...";
      }

      if (kpiVolunteerCoverage) {
        kpiVolunteerCoverage.textContent = "...";
      }
    } else if (previewMode === "empty") {
      if (kpiActiveEvents) {
        kpiActiveEvents.textContent = "0";
      }

      if (kpiLiveEvents) {
        kpiLiveEvents.textContent = "0";
      }

      if (kpiTotalUsers) {
        kpiTotalUsers.textContent = "0";
      }

      if (kpiVolunteerCoverage) {
        kpiVolunteerCoverage.textContent = "0%";
      }
    } else if (previewMode === "error") {
      if (kpiActiveEvents) {
        kpiActiveEvents.textContent = "--";
      }

      if (kpiLiveEvents) {
        kpiLiveEvents.textContent = "--";
      }

      if (kpiTotalUsers) {
        kpiTotalUsers.textContent = "--";
      }

      if (kpiVolunteerCoverage) {
        kpiVolunteerCoverage.textContent = "--";
      }
    } else {
      if (kpiActiveEvents) {
        kpiActiveEvents.textContent = String(data.activeEvents);
      }

      if (kpiLiveEvents) {
        kpiLiveEvents.textContent = String(data.liveEvents);
      }

      if (kpiTotalUsers) {
        kpiTotalUsers.textContent = String(data.totalUsers);
      }

      if (kpiVolunteerCoverage) {
        kpiVolunteerCoverage.textContent = data.volunteerCoverage;
      }
    }

    renderHealth(data.healthOverview);
    renderRisks(data.riskAlerts);
    renderEvents(data.events);
    renderUsers(data.users);
    renderReports(data.reports);
    renderFeed(data.recentNotifications);
  }

  function handlePreviewModeChange(nextState) {
    previewMode = nextState;

    if (refreshController) {
      if (nextState === "ready") {
        refreshController.refresh();
        refreshController.start();
        return;
      }

      refreshController.stop();
    }

    renderDashboard(dashboardData);
  }

  function hydrateDashboard() {
    if (!pageApi || !mockData) {
      return;
    }

    var roleContext = pageApi.requireRole(getGateConfig());

    if (!roleContext) {
      return;
    }

    dashboardData = mockData.getAdminDashboardData();

    pageApi.showReady(roleContext, {
      banner: {
        title: "Admin session ready",
        message: "This dashboard is rendering from a mock AdminDashboardDto-style payload while backend controllers are still pending."
      },
      shell: {
        phaseTitle: "Phase 7 frontend integration preview is active.",
        phaseCopy: "Admin dashboard metrics now sit on the shared mock API and polling layer ahead of backend implementation.",
        topbarEyebrow: "Admin live overview",
        topbarTitle: roleContext.uiConfig ? roleContext.uiConfig.label : "Admin workspace"
      }
    });

    refreshController = window.EventFlowMockRefreshController
      ? window.EventFlowMockRefreshController.create({
          intervalMs: 14000,
          shouldPoll: function () {
            return previewMode === "ready";
          },
          loader: loadDashboardData,
          onData: function (data) {
            dashboardData = data;
            renderDashboard(dashboardData);
          },
          onError: function () {
            renderDashboard(dashboardData);
          }
        })
      : null;

    if (window.EventFlowMockPreviewState && previewStateShell) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: handlePreviewModeChange
      });
      previewMode = previewController.getState();
    }

    if (previewMode === "ready" && refreshController) {
      refreshController.load("initial").then(function () {
        refreshController.start();
      });
      return;
    }

    renderDashboard(dashboardData);
  }

  if (pageApi) {
    pageApi.bindLogout(logoutButtons, "/login.jsp");
  }

  hydrateDashboard();
})();