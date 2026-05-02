(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var gatePanel = document.querySelector("[data-volunteer-gate]");
  var gateTitle = document.querySelector("[data-volunteer-gate-title]");
  var gateMessage = document.querySelector("[data-volunteer-gate-message]");
  var content = document.querySelector("[data-volunteer-tasks-content]");
  var summaryAssigned = document.querySelector("[data-volunteer-task-assigned-count]");
  var summaryDueSoon = document.querySelector("[data-volunteer-task-due-soon-count]");
  var summaryOverdue = document.querySelector("[data-volunteer-task-overdue-count]");
  var summaryCompleted = document.querySelector("[data-volunteer-task-completed-count]");
  var searchInput = document.querySelector("[data-volunteer-task-search]");
  var statusFilter = document.querySelector("[data-volunteer-task-status-filter]");
  var priorityFilter = document.querySelector("[data-volunteer-task-priority-filter]");
  var eventFilter = document.querySelector("[data-volunteer-task-event-filter]");
  var filterSummary = document.querySelector("[data-volunteer-task-filter-summary]");
  var selectedSummary = document.querySelector("[data-volunteer-selected-task-summary]");
  var tableBody = document.querySelector("[data-volunteer-task-table-body]");
  var emptyState = document.querySelector("[data-volunteer-task-empty-state]");
  var selectedStatus = document.querySelector("[data-volunteer-selected-task-status]");
  var selectedTitle = document.querySelector("[data-volunteer-selected-task-title]");
  var selectedMeta = document.querySelector("[data-volunteer-selected-task-meta]");
  var selectedCopy = document.querySelector("[data-volunteer-selected-task-copy]");
  var selectedChips = document.querySelector("[data-volunteer-selected-task-chips]");
  var detailLinks = document.querySelectorAll("[data-volunteer-open-detail-link], [data-volunteer-open-detail-link-secondary]");
  var resetFiltersButton = document.querySelector("[data-volunteer-task-reset-filters]");
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
    selectedTaskId: null,
    selectedDetail: null,
    loadStatus: "loading",
    detailStatus: "idle",
    searchTerm: "",
    status: "ALL",
    priority: "ALL",
    eventName: "ALL",
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

  function isTerminal(status) {
    return status === "COMPLETED" || status === "CANCELLED";
  }

  function setBadgeClass(node, variant) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + variant;
  }

  function populateSelect(selectNode, options) {
    if (!selectNode) {
      return;
    }

    selectNode.innerHTML = options
      .map(function (option) {
        return '<option value="' + escapeHtml(option) + '">' + escapeHtml(formatLabel(option)) + '</option>';
      })
      .join("");
  }

  function buildFilterOptions(tasks) {
    var statuses = ["ALL"];
    var priorities = ["ALL"];
    var events = ["ALL"];

    tasks.forEach(function (task) {
      if (statuses.indexOf(task.status) === -1) {
        statuses.push(task.status);
      }
      if (priorities.indexOf(task.priority) === -1) {
        priorities.push(task.priority);
      }
      if (events.indexOf(task.eventName) === -1) {
        events.push(task.eventName);
      }
    });

    return {
      statuses: statuses,
      priorities: priorities,
      events: events
    };
  }

  function getSelectedTask() {
    return state.tasks.find(function (task) {
      return task.taskId === state.selectedTaskId;
    }) || null;
  }

  function getFilteredTasks() {
    return state.tasks.filter(function (task) {
      var haystack = [task.title, task.eventName].join(" ").toLowerCase();
      var matchesSearch = !state.searchTerm || haystack.indexOf(state.searchTerm) !== -1;
      var matchesStatus = state.status === "ALL" || task.status === state.status;
      var matchesPriority = state.priority === "ALL" || task.priority === state.priority;
      var matchesEvent = state.eventName === "ALL" || task.eventName === state.eventName;

      return matchesSearch && matchesStatus && matchesPriority && matchesEvent;
    });
  }

  function syncDetailLinks() {
    var href = contextPath + "/volunteer/tasks" + (state.selectedTaskId ? ("/" + state.selectedTaskId) : "");

    Array.prototype.forEach.call(detailLinks, function (link) {
      link.setAttribute("href", href || (contextPath + "/volunteer/tasks"));
    });
  }

  function countDueSoon() {
    var now = Date.now();
    var nextDayMs = 24 * 60 * 60 * 1000;

    return state.tasks.filter(function (task) {
      if (!task.deadlineAt || isTerminal(task.status)) {
        return false;
      }

      var deadline = new Date(task.deadlineAt);
      if (Number.isNaN(deadline.getTime())) {
        return false;
      }

      var diff = deadline.getTime() - now;
      return diff >= 0 && diff <= nextDayMs;
    }).length;
  }

  function countOverdue() {
    var now = Date.now();

    return state.tasks.filter(function (task) {
      if (task.delayFlag) {
        return true;
      }
      if (!task.deadlineAt || isTerminal(task.status)) {
        return false;
      }

      var deadline = new Date(task.deadlineAt);
      return !Number.isNaN(deadline.getTime()) && deadline.getTime() < now;
    }).length;
  }

  function renderSummary() {
    if (state.loadStatus === "loading") {
      summaryAssigned.textContent = "...";
      summaryDueSoon.textContent = "...";
      summaryOverdue.textContent = "...";
      summaryCompleted.textContent = "...";
      return;
    }

    if (state.loadStatus === "error") {
      summaryAssigned.textContent = "--";
      summaryDueSoon.textContent = "--";
      summaryOverdue.textContent = "--";
      summaryCompleted.textContent = "--";
      return;
    }

    summaryAssigned.textContent = String(state.tasks.length);
    summaryDueSoon.textContent = String(countDueSoon());
    summaryOverdue.textContent = String(countOverdue());
    summaryCompleted.textContent = String(state.tasks.filter(function (task) {
      return task.status === "COMPLETED";
    }).length);
  }

  function renderFilterSummary(filteredTasks) {
    if (!filterSummary || !selectedSummary) {
      return;
    }

    if (state.loadStatus === "loading") {
      filterSummary.textContent = "Loading volunteer task filters.";
      selectedSummary.textContent = "Awaiting task data.";
      return;
    }

    if (state.loadStatus === "error") {
      filterSummary.textContent = state.errorMessage || "Volunteer tasks are unavailable.";
      selectedSummary.textContent = "Selection unavailable.";
      return;
    }

    if (!state.tasks.length) {
      filterSummary.textContent = "No assigned tasks are available right now.";
      selectedSummary.textContent = "No task selected.";
      return;
    }

    filterSummary.textContent = "Showing " + filteredTasks.length + " of " + state.tasks.length + " assigned tasks.";

    var selectedTask = getSelectedTask();
    selectedSummary.textContent = selectedTask
      ? ("Selected task #" + selectedTask.taskId + " • " + selectedTask.title)
      : "No task selected.";
  }

  function renderTable(filteredTasks) {
    if (!tableBody) {
      return;
    }

    if (state.loadStatus === "loading") {
      tableBody.innerHTML = '<tr><td colspan="6">Volunteer task data is loading.</td></tr>';
      emptyState.hidden = true;
      return;
    }

    if (state.loadStatus === "error") {
      tableBody.innerHTML = '<tr><td colspan="6">' + escapeHtml(state.errorMessage || "Volunteer tasks are unavailable.") + '</td></tr>';
      emptyState.hidden = true;
      return;
    }

    if (!filteredTasks.length) {
      tableBody.innerHTML = '<tr><td colspan="6">No tasks match the current filters.</td></tr>';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tableBody.innerHTML = filteredTasks
      .map(function (task) {
        var statusVariant = taskUiUtils ? taskUiUtils.getTaskStatusVariant(task.status) : "neutral";
        var priorityVariant = taskUiUtils ? taskUiUtils.getPriorityVariant(task.priority) : "neutral";
        var detailHref = contextPath + "/volunteer/tasks/" + task.taskId;
        var isSelected = task.taskId === state.selectedTaskId;

        return [
          '<tr' + (isSelected ? ' class="is-selected"' : "") + '>',
          '<td><strong>' + escapeHtml(task.title) + '</strong></td>',
          '<td>' + escapeHtml(task.eventName) + '</td>',
          '<td><span class="badge badge-' + priorityVariant + '">' + escapeHtml(formatLabel(task.priority)) + '</span></td>',
          '<td><span class="badge badge-' + statusVariant + '">' + escapeHtml(formatLabel(task.status)) + '</span></td>',
          '<td>' + escapeHtml(formatTimestamp(task.deadlineAt)) + '</td>',
          '<td class="button-row"><button class="button button-ghost" type="button" data-volunteer-select-task="' + escapeHtml(task.taskId) + '">Focus</button><a class="button button-secondary" href="' + escapeHtml(detailHref) + '">Detail</a></td>',
          '</tr>'
        ].join("");
      })
      .join("");
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

  function renderSelectedCard() {
    var summary = getSelectedTask();
    var detail = state.selectedDetail && summary && state.selectedDetail.taskId === summary.taskId
      ? state.selectedDetail
      : null;

    syncDetailLinks();

    if (state.loadStatus === "loading") {
      setBadgeClass(selectedStatus, "neutral");
      selectedStatus.textContent = "Loading";
      selectedTitle.textContent = "Loading task summary";
      selectedMeta.textContent = "Selected task data is being prepared.";
      selectedCopy.textContent = "The volunteer task summary will render here once data is available.";
      renderChipList(selectedChips, [], "Loading dependencies");
      return;
    }

    if (state.loadStatus === "error") {
      setBadgeClass(selectedStatus, "danger");
      selectedStatus.textContent = "Unavailable";
      selectedTitle.textContent = "Task summary unavailable";
      selectedMeta.textContent = state.errorMessage || "The volunteer task request failed.";
      selectedCopy.textContent = "Retry after the task list loads successfully.";
      renderChipList(selectedChips, [], "Task summary unavailable");
      return;
    }

    if (!summary) {
      setBadgeClass(selectedStatus, "neutral");
      selectedStatus.textContent = "No task";
      selectedTitle.textContent = "No task selected";
      selectedMeta.textContent = "No assigned task is available right now.";
      selectedCopy.textContent = "Assigned task details will render here after tasks are loaded.";
      renderChipList(selectedChips, [], "No dependencies loaded");
      return;
    }

    setBadgeClass(selectedStatus, taskUiUtils ? taskUiUtils.getTaskStatusVariant(summary.status) : "neutral");
    selectedStatus.textContent = formatLabel(summary.status);
    selectedTitle.textContent = summary.title;
    selectedMeta.textContent = summary.eventName + " • Deadline " + formatTimestamp(summary.deadlineAt);

    if (!detail && state.detailStatus === "loading") {
      selectedCopy.textContent = "Loading task detail for the selected assignment.";
      renderChipList(selectedChips, [], "Loading dependencies");
      return;
    }

    selectedCopy.textContent = detail ? detail.description : "Task detail is unavailable for the current selection.";
    renderChipList(selectedChips, detail ? (detail.dependencies || []) : [], detail ? "No dependencies loaded" : "Task detail unavailable");
  }

  function ensureSelectedTask(filteredTasks) {
    var stillVisible = filteredTasks.some(function (task) {
      return task.taskId === state.selectedTaskId;
    });

    if (stillVisible) {
      return false;
    }

    var nextTaskId = filteredTasks.length ? filteredTasks[0].taskId : null;
    var changed = nextTaskId !== state.selectedTaskId;
    state.selectedTaskId = nextTaskId;
    return changed;
  }

  function renderTasks() {
    var filteredTasks = state.loadStatus === "ready" ? getFilteredTasks() : [];
    var selectionChanged = ensureSelectedTask(filteredTasks);

    renderSummary();
    renderFilterSummary(filteredTasks);
    renderTable(filteredTasks);
    renderSelectedCard();

    if (selectionChanged && state.selectedTaskId) {
      loadSelectedDetail(state.selectedTaskId);
    }
  }

  function loadSelectedDetail(taskId) {
    if (!apiClient || !taskId) {
      state.selectedDetail = null;
      state.detailStatus = "idle";
      renderTasks();
      return;
    }

    state.detailStatus = "loading";
    if (!state.selectedDetail || state.selectedDetail.taskId !== taskId) {
      state.selectedDetail = null;
    }
    renderTasks();

    apiClient.get("/api/volunteer/tasks/" + taskId, { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !response.data) {
        state.selectedDetail = null;
        state.detailStatus = "error";
        renderTasks();
        return;
      }

      state.selectedDetail = response.data;
      state.detailStatus = "ready";
      renderTasks();
    }).catch(function () {
      state.selectedDetail = null;
      state.detailStatus = "error";
      renderTasks();
    });
  }

  function loadTasks() {
    if (previewStateShell) {
      previewStateShell.hidden = true;
    }

    if (!apiClient) {
      state.tasks = [];
      state.loadStatus = "error";
      state.errorMessage = "The live volunteer task client is unavailable.";
      renderTasks();
      return;
    }

    state.tasks = [];
    state.selectedDetail = null;
    state.detailStatus = "idle";
    state.loadStatus = "loading";
    state.errorMessage = "";
    renderTasks();

    apiClient.get("/api/volunteer/tasks", { retries: 1 }).then(function (response) {
      if (!response || !response.ok || !Array.isArray(response.data)) {
        state.tasks = [];
        state.loadStatus = "error";
        state.errorMessage = response && response.message ? response.message : "The volunteer task request failed.";
        renderTasks();
        return;
      }

      state.tasks = response.data;
      state.loadStatus = state.tasks.length ? "ready" : "empty";
      state.errorMessage = "";

      var filterOptions = buildFilterOptions(state.tasks);
      populateSelect(statusFilter, filterOptions.statuses);
      populateSelect(priorityFilter, filterOptions.priorities);
      populateSelect(eventFilter, filterOptions.events);

      if (!state.selectedTaskId && state.tasks.length) {
        state.selectedTaskId = state.tasks[0].taskId;
      }

      renderTasks();
      if (state.selectedTaskId) {
        loadSelectedDetail(state.selectedTaskId);
      }
    }).catch(function () {
      state.tasks = [];
      state.loadStatus = "error";
      state.errorMessage = "The volunteer task request failed.";
      renderTasks();
    });
  }

  function bindEvents() {
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.searchTerm = event.target.value.trim().toLowerCase();
        renderTasks();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", function (event) {
        state.status = event.target.value;
        renderTasks();
      });
    }

    if (priorityFilter) {
      priorityFilter.addEventListener("change", function (event) {
        state.priority = event.target.value;
        renderTasks();
      });
    }

    if (eventFilter) {
      eventFilter.addEventListener("change", function (event) {
        state.eventName = event.target.value;
        renderTasks();
      });
    }

    if (resetFiltersButton) {
      resetFiltersButton.addEventListener("click", function () {
        state.searchTerm = "";
        state.status = "ALL";
        state.priority = "ALL";
        state.eventName = "ALL";

        if (searchInput) {
          searchInput.value = "";
        }
        if (statusFilter) {
          statusFilter.value = "ALL";
        }
        if (priorityFilter) {
          priorityFilter.value = "ALL";
        }
        if (eventFilter) {
          eventFilter.value = "ALL";
        }

        renderTasks();
      });
    }

    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var button = event.target.closest("[data-volunteer-select-task]");

        if (!button) {
          return;
        }

        state.selectedTaskId = Number(button.getAttribute("data-volunteer-select-task"));
        loadSelectedDetail(state.selectedTaskId);
      });
    }
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Volunteer tasks unavailable",
        message: "Volunteer task routes need the shared shell bootstrap before the live task list can render.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer task routes only render for volunteer sessions with the shared shell loaded.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer tasks blocked"
        }
      },
      missingSession: {
        title: "Volunteer tasks need a session",
        message: "Open the login page and sign in with the volunteer account before loading assigned tasks.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer task routes only render for authenticated volunteer sessions.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer tasks blocked"
        }
      },
      wrongRole: {
        title: "This route is volunteer-only",
        message: "The current session belongs to another role, so the volunteer task list remains hidden.",
        shell: {
          phaseTitle: "Phase 14 hardening is gated.",
          phaseCopy: "Volunteer task routes stay scoped to the volunteer role.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Volunteer tasks blocked"
        }
      }
    };
  }

  function hydrateTasks() {
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
        phaseCopy: "Volunteer tasks now load live assigned work and selected task detail through the volunteer task APIs.",
        topbarEyebrow: "Volunteer operations",
        topbarTitle: "Volunteer tasks"
      }
    });

    pageApi.bindLogout(logoutButtons, "/login.jsp");
    bindEvents();
    loadTasks();
  }

  hydrateTasks();
})();