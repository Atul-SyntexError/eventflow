(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-volunteer-gate]");
  var gateTitle = document.querySelector("[data-volunteer-gate-title]");
  var gateMessage = document.querySelector("[data-volunteer-gate-message]");
  var content = document.querySelector("[data-volunteer-detail-content]");
  var statusValue = document.querySelector("[data-volunteer-detail-status-value]");
  var priorityValue = document.querySelector("[data-volunteer-detail-priority-value]");
  var deadlineValue = document.querySelector("[data-volunteer-detail-deadline-value]");
  var eventValue = document.querySelector("[data-volunteer-detail-event-value]");
  var statusBadge = document.querySelector("[data-volunteer-detail-status-badge]");
  var detailTitle = document.querySelector("[data-volunteer-detail-title]");
  var detailMeta = document.querySelector("[data-volunteer-detail-meta]");
  var detailDescription = document.querySelector("[data-volunteer-detail-description]");
  var instructionList = document.querySelector("[data-volunteer-detail-instruction-list]");
  var dependencyList = document.querySelector("[data-volunteer-detail-dependency-list]");
  var activityList = document.querySelector("[data-volunteer-detail-activity-list]");
  var currentStatus = document.querySelector("[data-volunteer-current-status]");
  var statusButtons = document.querySelectorAll("[data-volunteer-status-button]");
  var blockerNote = document.querySelector("[data-volunteer-blocker-note]");
  var saveStatusButton = document.querySelector("[data-volunteer-save-status]");
  var resetStatusButton = document.querySelector("[data-volunteer-reset-status]");
  var statusSummary = document.querySelector("[data-volunteer-status-summary]");
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
    tasks: [],
    taskId: null,
    summary: null,
    detail: null,
    loadStatus: "loading",
    saving: false,
    draftStatus: "ASSIGNED",
    draftBlockerNote: "",
    message: ""
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
      return "No deadline";
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

  function setBadgeClass(node, variant) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + variant;
  }

  function renderChipList(target, items, emptyCopy) {
    if (!target) {
      return;
    }

    if (!items.length) {
      target.innerHTML = '<li class="task-chip">' + escapeHtml(emptyCopy) + '</li>';
      return;
    }

    target.innerHTML = items.map(function (item) {
      return '<li class="task-chip">' + escapeHtml(item) + '</li>';
    }).join("");
  }

  function resolveTaskId() {
    var pathName = window.location.pathname || "";
    var normalizedPath = contextPath && pathName.indexOf(contextPath) === 0
      ? pathName.substring(contextPath.length)
      : pathName;
    var pathMatch = normalizedPath.match(/^\/volunteer\/tasks\/(\d+)\/?$/);

    if (pathMatch) {
      return Number(pathMatch[1]);
    }

    var params = new URLSearchParams(window.location.search);
    var queryTaskId = Number(params.get("taskId"));
    return Number.isFinite(queryTaskId) && queryTaskId > 0 ? queryTaskId : null;
  }

  function syncStatusButtons() {
    Array.prototype.forEach.call(statusButtons, function (button) {
      var isActive = button.getAttribute("data-status") === state.draftStatus;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.disabled = state.saving || !state.detail;
    });
  }

  function renderMetrics() {
    if (state.loadStatus === "loading") {
      statusValue.textContent = "...";
      priorityValue.textContent = "...";
      deadlineValue.textContent = "...";
      eventValue.textContent = "...";
      return;
    }

    if (state.loadStatus === "error") {
      statusValue.textContent = "Unavailable";
      priorityValue.textContent = "Unavailable";
      deadlineValue.textContent = "Unavailable";
      eventValue.textContent = "Unavailable";
      return;
    }

    if (state.loadStatus === "empty" || !state.summary || !state.detail) {
      statusValue.textContent = "No task";
      priorityValue.textContent = "No task";
      deadlineValue.textContent = "No deadline";
      eventValue.textContent = "No event";
      return;
    }

    statusValue.textContent = formatLabel(state.draftStatus);
    priorityValue.textContent = formatLabel(state.detail.priority);
    deadlineValue.textContent = formatTimestamp(state.detail.deadlineAt);
    eventValue.textContent = state.summary.eventName;
  }

  function renderDetail() {
    syncStatusButtons();

    if (blockerNote) {
      blockerNote.value = state.draftBlockerNote;
      blockerNote.disabled = state.saving || !state.detail;
    }
    if (saveStatusButton) {
      saveStatusButton.disabled = state.saving || !state.detail;
    }
    if (resetStatusButton) {
      resetStatusButton.disabled = state.saving || !state.detail;
    }

    if (state.loadStatus === "loading") {
      setBadgeClass(statusBadge, "neutral");
      setBadgeClass(currentStatus, "neutral");
      statusBadge.textContent = "Loading";
      currentStatus.textContent = "Loading";
      detailTitle.textContent = "Loading task detail";
      detailMeta.textContent = "Selected task data is being prepared.";
      detailDescription.textContent = "Volunteer task detail will render here once the selected assignment loads.";
      instructionList.innerHTML = '<li class="activity-item"><strong>Loading instructions</strong><span class="activity-meta">Task guidance is being prepared.</span></li>';
      renderChipList(dependencyList, [], "Loading dependencies");
      activityList.innerHTML = '<li class="activity-item"><strong>Loading activity</strong><span class="activity-meta">Task activity is being prepared.</span></li>';
      statusSummary.textContent = "Status updates will render here.";
      return;
    }

    if (state.loadStatus === "error") {
      setBadgeClass(statusBadge, "danger");
      setBadgeClass(currentStatus, "danger");
      statusBadge.textContent = "Unavailable";
      currentStatus.textContent = "Unavailable";
      detailTitle.textContent = "Task detail unavailable";
      detailMeta.textContent = state.message || "The volunteer task detail request failed.";
      detailDescription.textContent = "Retry after the volunteer task route loads successfully.";
      instructionList.innerHTML = '<li class="activity-item"><strong>Instructions unavailable</strong><span class="activity-meta">Task guidance could not be loaded.</span></li>';
      renderChipList(dependencyList, [], "Task detail unavailable");
      activityList.innerHTML = '<li class="activity-item"><strong>Activity unavailable</strong><span class="activity-meta">Task activity could not be loaded.</span></li>';
      statusSummary.textContent = state.message || "Status updates are unavailable.";
      return;
    }

    if (state.loadStatus === "empty" || !state.summary || !state.detail) {
      setBadgeClass(statusBadge, "neutral");
      setBadgeClass(currentStatus, "neutral");
      statusBadge.textContent = "No task";
      currentStatus.textContent = "No task";
      detailTitle.textContent = "No task selected";
      detailMeta.textContent = "No volunteer assignment is available right now.";
      detailDescription.textContent = "Task instructions and dependencies will render here once an assignment exists.";
      instructionList.innerHTML = '<li class="activity-item"><strong>No instructions yet</strong><span class="activity-meta">No task is active for this volunteer.</span></li>';
      renderChipList(dependencyList, [], "No dependencies loaded");
      activityList.innerHTML = '<li class="activity-item"><strong>No activity yet</strong><span class="activity-meta">Task activity will render here once an assignment exists.</span></li>';
      statusSummary.textContent = "Status updates will render here.";
      return;
    }

    setBadgeClass(statusBadge, taskUiUtils ? taskUiUtils.getTaskStatusVariant(state.draftStatus) : "neutral");
    setBadgeClass(currentStatus, taskUiUtils ? taskUiUtils.getTaskStatusVariant(state.draftStatus) : "neutral");
    statusBadge.textContent = formatLabel(state.draftStatus);
    currentStatus.textContent = formatLabel(state.draftStatus);
    detailTitle.textContent = state.detail.title;
    detailMeta.textContent = state.summary.eventName + " • Assigned to " + state.detail.assignedVolunteer + " • Deadline " + formatTimestamp(state.detail.deadlineAt);
    detailDescription.textContent = state.detail.description;

    var instructionItems = [
      { title: "Task brief", meta: state.detail.description }
    ];
    if (state.detail.requiredSkills && state.detail.requiredSkills.length) {
      instructionItems.push({
        title: "Required skills",
        meta: state.detail.requiredSkills.join(", ")
      });
    }
    instructionList.innerHTML = instructionItems.map(function (instruction) {
      return '<li class="activity-item"><strong>' + escapeHtml(instruction.title) + '</strong><span class="activity-meta">' + escapeHtml(instruction.meta) + '</span></li>';
    }).join("");

    renderChipList(dependencyList, state.detail.dependencies || [], "No dependencies loaded");
    activityList.innerHTML = (state.detail.activityFeed || []).map(function (activity) {
      return '<li class="activity-item"><strong>' + escapeHtml(activity.title) + '</strong><span class="activity-meta">' + escapeHtml(activity.meta) + '</span></li>';
    }).join("") || '<li class="activity-item"><strong>No activity yet</strong><span class="activity-meta">Task activity will render here once updates are recorded.</span></li>';
    statusSummary.textContent = state.message || (state.saving
      ? "Saving status update..."
      : ('Current draft: { status: "' + state.draftStatus + '", blockerNote: "' + state.draftBlockerNote + '" }'));
  }

  function renderTaskDetail() {
    renderMetrics();
    renderDetail();
  }

  function loadTaskDetail(taskId) {
    if (!apiClient || !taskId) {
      state.loadStatus = "empty";
      renderTaskDetail();
      return;
    }

    state.taskId = taskId;
    state.summary = state.tasks.find(function (task) {
      return task.taskId === taskId;
    }) || null;
    state.detail = null;
    state.loadStatus = "loading";
    state.message = "";
    renderTaskDetail();

    apiClient.get("/api/volunteer/tasks/" + taskId, { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !response.data) {
        state.detail = null;
        state.loadStatus = "error";
        state.message = response && response.message ? response.message : "The volunteer task detail request failed.";
        renderTaskDetail();
        return;
      }

      state.detail = response.data;
      state.loadStatus = "ready";
      state.draftStatus = response.data.status;
      state.draftBlockerNote = "";
      state.message = "";
      renderTaskDetail();
    }).catch(function () {
      state.detail = null;
      state.loadStatus = "error";
      state.message = "The volunteer task detail request failed.";
      renderTaskDetail();
    });
  }

  function loadTaskIndex() {
    if (previewStateShell) {
      previewStateShell.hidden = true;
    }

    if (!apiClient) {
      state.loadStatus = "error";
      state.message = "The live volunteer task client is unavailable.";
      renderTaskDetail();
      return;
    }

    state.loadStatus = "loading";
    state.message = "";
    renderTaskDetail();

    apiClient.get("/api/volunteer/tasks", { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !Array.isArray(response.data)) {
        state.tasks = [];
        state.loadStatus = "error";
        state.message = response && response.message ? response.message : "The volunteer task request failed.";
        renderTaskDetail();
        return;
      }

      state.tasks = response.data;
      if (!state.tasks.length) {
        state.summary = null;
        state.detail = null;
        state.loadStatus = "empty";
        renderTaskDetail();
        return;
      }

      var resolvedTaskId = resolveTaskId();
      var matchingTask = state.tasks.find(function (task) {
        return task.taskId === resolvedTaskId;
      });
      if (!matchingTask) {
        matchingTask = state.tasks[0];
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", contextPath + "/volunteer/tasks/" + matchingTask.taskId);
        }
      }

      loadTaskDetail(matchingTask.taskId);
    }).catch(function () {
      state.tasks = [];
      state.loadStatus = "error";
      state.message = "The volunteer task request failed.";
      renderTaskDetail();
    });
  }

  function saveStatusUpdate() {
    if (!apiClient || !state.detail || !state.taskId) {
      return;
    }

    state.saving = true;
    state.message = "Saving status update...";
    renderTaskDetail();

    apiClient.request({
      method: "PATCH",
      path: "/api/volunteer/tasks/" + state.taskId + "/status",
      body: {
        status: state.draftStatus,
        blockerNote: state.draftBlockerNote
      }
    }).then(function (response) {
      state.saving = false;

      if (!response || !response.ok || !response.data) {
        state.message = response && response.errors && response.errors.length
          ? response.errors[0].message
          : (response && response.message ? response.message : "The volunteer task update failed.");
        renderTaskDetail();
        return;
      }

      state.detail = response.data;
      if (state.summary) {
        state.summary.status = response.data.status;
      }
      state.draftStatus = response.data.status;
      state.draftBlockerNote = "";
      state.message = "Status updated successfully.";
      renderTaskDetail();
    }).catch(function () {
      state.saving = false;
      state.message = "The volunteer task update failed.";
      renderTaskDetail();
    });
  }

  function bindEvents() {
    Array.prototype.forEach.call(statusButtons, function (button) {
      button.addEventListener("click", function () {
        state.draftStatus = button.getAttribute("data-status");
        state.message = "";
        renderTaskDetail();
      });
    });

    if (blockerNote) {
      blockerNote.addEventListener("input", function (event) {
        state.draftBlockerNote = event.target.value;
        state.message = "";
        renderTaskDetail();
      });
    }

    if (saveStatusButton) {
      saveStatusButton.addEventListener("click", saveStatusUpdate);
    }

    if (resetStatusButton) {
      resetStatusButton.addEventListener("click", function () {
        state.draftStatus = state.detail ? state.detail.status : "ASSIGNED";
        state.draftBlockerNote = "";
        state.message = "";
        renderTaskDetail();
      });
    }
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Volunteer task detail unavailable",
        message: "Volunteer task detail needs the shared shell bootstrap before the live route can render.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer task detail only renders for volunteer sessions with the shared shell loaded.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer task detail blocked"
        }
      },
      missingSession: {
        title: "Volunteer task detail needs a session",
        message: "Open the login page and sign in with the volunteer account before loading task detail.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer task detail only renders for authenticated volunteer sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer task detail blocked"
        }
      },
      wrongRole: {
        title: "This route is volunteer-only",
        message: "The current session belongs to another role, so the volunteer task detail remains hidden.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer task detail stays scoped to the volunteer role.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer task detail blocked"
        }
      }
    };
  }

  function hydrateTaskDetail() {
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
        phaseCopy: "Volunteer task detail now loads live assignment context and submits real status updates through the volunteer task APIs.",
        topbarEyebrow: "Volunteer operations",
        topbarTitle: "Volunteer task detail"
      }
    });

    pageApi.bindLogout(logoutButtons, "/login.jsp");
    bindEvents();
    loadTaskIndex();
  }

  hydrateTaskDetail();
})();