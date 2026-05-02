(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var initialMode = body.getAttribute("data-task-initial-mode") || "list";
  var selectedTaskIdValue = body.getAttribute("data-task-selected-id") || "";
  var initialSelectedTaskId = selectedTaskIdValue ? Number(selectedTaskIdValue) : null;
  var mockData = window.EventFlowMockData || null;
  var taskUiUtils = window.EventFlowMockTaskUiUtils || null;
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var bootstrapScript = document.getElementById("organizer-task-bootstrap");
  var gatePanel = document.querySelector("[data-organizer-gate]");
  var gateTitle = document.querySelector("[data-organizer-gate-title]");
  var gateMessage = document.querySelector("[data-organizer-gate-message]");
  var content = document.querySelector("[data-organizer-tasks-content]");
  var summaryTotal = document.querySelector("[data-task-total-count]");
  var summaryDueToday = document.querySelector("[data-task-due-today]");
  var summaryBlocked = document.querySelector("[data-task-blocked-count]");
  var summaryUnassigned = document.querySelector("[data-task-unassigned-count]");
  var searchInput = document.querySelector("[data-task-search]");
  var statusFilter = document.querySelector("[data-task-status-filter]");
  var priorityFilter = document.querySelector("[data-task-priority-filter]");
  var eventFilter = document.querySelector("[data-task-event-filter]");
  var filterSummary = document.querySelector("[data-task-filter-summary]");
  var selectedSummary = document.querySelector("[data-task-selected-summary]");
  var tableBody = document.querySelector("[data-task-table-body]");
  var emptyState = document.querySelector("[data-task-empty-state]");
  var detailStatus = document.querySelector("[data-task-detail-status]");
  var detailTitle = document.querySelector("[data-task-detail-title]");
  var detailMeta = document.querySelector("[data-task-detail-meta]");
  var detailDescription = document.querySelector("[data-task-detail-description]");
  var skillChipList = document.querySelector("[data-task-skill-chip-list]");
  var dependencyChipList = document.querySelector("[data-task-dependency-chip-list]");
  var activityList = document.querySelector("[data-task-activity-list]");
  var formCaption = document.querySelector("[data-task-form-caption]");
  var modeButtons = document.querySelectorAll("[data-task-mode-button]");
  var createButtons = document.querySelectorAll("[data-task-create-button]");
  var resetFiltersButton = document.querySelector("[data-task-reset-filters]");
  var formEvent = document.querySelector("[data-task-form-event]");
  var formTitle = document.querySelector("[data-task-form-title]");
  var formPriority = document.querySelector("[data-task-form-priority]");
  var formStatus = document.querySelector("[data-task-form-status]");
  var formStart = document.querySelector("[data-task-form-start]");
  var formDeadline = document.querySelector("[data-task-form-deadline]");
  var formDescription = document.querySelector("[data-task-form-description]");
  var formSkillList = document.querySelector("[data-task-form-skill-list]");
  var formDependencyList = document.querySelector("[data-task-form-dependency-list]");
  var suggestionList = document.querySelector("[data-task-suggestion-list]");
  var formFeedback = document.querySelector("[data-task-form-feedback]");
  var formFeedbackTitle = document.querySelector("[data-task-form-feedback-title]");
  var formFeedbackMessage = document.querySelector("[data-task-form-feedback-message]");
  var saveButton = document.querySelector("[data-task-save-button]");
  var assignButton = document.querySelector("[data-task-assign-button]");
  var deleteButton = document.querySelector("[data-task-delete-button]");
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "ORGANIZER",
        gatedContent: content,
        gatePanel: gatePanel,
        gateTitle: gateTitle,
        gateMessage: gateMessage
      })
    : null;
  var previewController = null;
  var state = {
    searchTerm: "",
    status: "ALL",
    priority: "ALL",
    eventName: "ALL",
    selectedTaskId: null,
    selectedSuggestionVolunteerId: null,
    formMode: "create",
    previewMode: "ready",
    data: null
  };

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function setBadgeClass(node, variant) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + variant;
  }

  function formatLabel(value) {
    return String(value || "").replace(/_/g, " ");
  }

  function formatStatusLabel(value) {
    if (value === "TODO") {
      return "TO DO";
    }

    return formatLabel(value);
  }

  function formatScore(score) {
    return Math.round(Number(score || 0) * 100) + "%";
  }

  function isTerminalStatus(status) {
    return status === "COMPLETED" || status === "CANCELLED";
  }

  function isDelayedTask(task) {
    if (!task || !task.deadlineAt || isTerminalStatus(task.status)) {
      return false;
    }

    var deadline = Date.parse(task.deadlineAt);
    return !isNaN(deadline) && deadline < Date.now();
  }

  function populateSelect(selectNode, options, formatter) {
    if (!selectNode) {
      return;
    }

    var labelFormatter = formatter || formatLabel;
    selectNode.innerHTML = options
      .map(function (option) {
        return '<option value="' + option + '">' + labelFormatter(option) + '</option>';
      })
      .join("");
  }

  function createDefaultTemplate() {
    return {
      eventId: null,
      title: "",
      description: "",
      priority: "MEDIUM",
      requiredSkills: [],
      dependencyTaskIds: [],
      requiredStartAt: "",
      deadlineAt: "",
      status: "TODO"
    };
  }

  function createDefaultData() {
    return {
      summary: {
        totalTasks: 0,
        dueToday: 0,
        blockedTasks: 0,
        unassignedTasks: 0
      },
      filterOptions: {
        statuses: ["ALL", "TODO", "ASSIGNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"],
        priorities: ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"],
        events: ["ALL"]
      },
      tasks: [],
      details: [],
      suggestionGroups: [],
      eventOptions: [],
      skillCatalog: [],
      createTemplate: createDefaultTemplate()
    };
  }

  function parseBootstrapData() {
    if (!bootstrapScript) {
      return null;
    }

    try {
      return JSON.parse(bootstrapScript.textContent || "null");
    } catch (error) {
      return null;
    }
  }

  function sortTasks(tasks) {
    return tasks.slice().sort(function (left, right) {
      var leftDeadline = left && left.deadlineAt ? String(left.deadlineAt) : "";
      var rightDeadline = right && right.deadlineAt ? String(right.deadlineAt) : "";
      if (leftDeadline === rightDeadline) {
        return Number(left.taskId || 0) - Number(right.taskId || 0);
      }
      return leftDeadline.localeCompare(rightDeadline);
    });
  }

  function buildSummary(tasks) {
    var today = new Date();
    var todayKey = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    return {
      totalTasks: tasks.length,
      dueToday: tasks.filter(function (task) {
        return task.deadlineAt && String(task.deadlineAt).slice(0, 10) === todayKey;
      }).length,
      blockedTasks: tasks.filter(function (task) {
        return task.status === "BLOCKED";
      }).length,
      unassignedTasks: tasks.filter(function (task) {
        return !task.assignedVolunteerName || task.assignedVolunteerName === "Unassigned";
      }).length
    };
  }

  function buildFilterOptions(tasks) {
    var events = ["ALL"];
    tasks.forEach(function (task) {
      if (task.eventName && events.indexOf(task.eventName) === -1) {
        events.push(task.eventName);
      }
    });

    return {
      statuses: ["ALL", "TODO", "ASSIGNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"],
      priorities: ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"],
      events: events
    };
  }

  function normalizeTask(task) {
    if (!task || typeof task !== "object") {
      return null;
    }

    return {
      taskId: Number(task.taskId),
      eventId: Number(task.eventId),
      eventName: task.eventName || resolveEventName(Number(task.eventId)) || "Unknown event",
      title: task.title || "",
      priority: task.priority || "MEDIUM",
      status: task.status || "TODO",
      deadlineAt: task.deadlineAt || "",
      assignedVolunteerName: task.assignedVolunteerName || "Unassigned",
      delayFlag: typeof task.delayFlag === "boolean" ? task.delayFlag : isDelayedTask(task)
    };
  }

  function normalizeDetail(detail) {
    if (!detail || typeof detail !== "object") {
      return null;
    }

    return {
      taskId: Number(detail.taskId),
      eventId: Number(detail.eventId),
      title: detail.title || "",
      description: detail.description || "",
      priority: detail.priority || "MEDIUM",
      status: detail.status || "TODO",
      requiredSkills: Array.isArray(detail.requiredSkills) ? detail.requiredSkills.slice() : [],
      dependencies: Array.isArray(detail.dependencies) ? detail.dependencies.slice() : [],
      dependencyTaskIds: Array.isArray(detail.dependencyTaskIds) ? detail.dependencyTaskIds.map(Number) : [],
      assignedVolunteer: detail.assignedVolunteer || "Unassigned",
      requiredStartAt: detail.requiredStartAt || "",
      deadlineAt: detail.deadlineAt || "",
      activityFeed: Array.isArray(detail.activityFeed) ? detail.activityFeed.slice() : []
    };
  }

  function normalizeSuggestionGroup(group) {
    if (!group || typeof group !== "object") {
      return null;
    }

    return {
      taskId: Number(group.taskId),
      suggestions: Array.isArray(group.suggestions) ? group.suggestions.slice() : []
    };
  }

  function normalizeEventOption(option) {
    if (!option || typeof option !== "object") {
      return null;
    }

    return {
      eventId: Number(option.eventId),
      eventName: option.eventName || ""
    };
  }

  function normalizeData(rawData) {
    var fallback = createDefaultData();
    var dataset = rawData && typeof rawData === "object" ? rawData : {};
    var eventOptions = Array.isArray(dataset.eventOptions)
      ? dataset.eventOptions.map(normalizeEventOption).filter(Boolean)
      : fallback.eventOptions.slice();
    var skillCatalog = Array.isArray(dataset.skillCatalog) ? dataset.skillCatalog.slice() : fallback.skillCatalog.slice();
    var tasks = Array.isArray(dataset.tasks)
      ? sortTasks(dataset.tasks.map(normalizeTask).filter(Boolean))
      : fallback.tasks.slice();
    var details = Array.isArray(dataset.details)
      ? dataset.details.map(normalizeDetail).filter(Boolean)
      : fallback.details.slice();
    var suggestionGroups = Array.isArray(dataset.suggestionGroups)
      ? dataset.suggestionGroups.map(normalizeSuggestionGroup).filter(Boolean)
      : fallback.suggestionGroups.slice();
    var createTemplate = Object.assign(createDefaultTemplate(), dataset.createTemplate || {});

    if (!createTemplate.eventId && eventOptions.length) {
      createTemplate.eventId = eventOptions[0].eventId;
    }

    return {
      summary: buildSummary(tasks),
      filterOptions: buildFilterOptions(tasks),
      tasks: tasks,
      details: details,
      suggestionGroups: suggestionGroups,
      eventOptions: eventOptions,
      skillCatalog: skillCatalog,
      createTemplate: createTemplate
    };
  }

  function syncFilterControls() {
    if (!state.data) {
      return;
    }

    populateSelect(statusFilter, state.data.filterOptions.statuses, function (value) {
      return value === "ALL" ? value : formatStatusLabel(value);
    });
    populateSelect(priorityFilter, state.data.filterOptions.priorities, formatLabel);
    populateSelect(eventFilter, state.data.filterOptions.events, function (value) {
      return value;
    });

    if (statusFilter) {
      if (state.data.filterOptions.statuses.indexOf(state.status) === -1) {
        state.status = "ALL";
      }
      statusFilter.value = state.status;
    }

    if (priorityFilter) {
      if (state.data.filterOptions.priorities.indexOf(state.priority) === -1) {
        state.priority = "ALL";
      }
      priorityFilter.value = state.priority;
    }

    if (eventFilter) {
      if (state.data.filterOptions.events.indexOf(state.eventName) === -1) {
        state.eventName = "ALL";
      }
      eventFilter.value = state.eventName;
    }
  }

  function populateFormEvents() {
    if (!formEvent || !state.data) {
      return;
    }

    formEvent.innerHTML = state.data.eventOptions
      .map(function (option) {
        return '<option value="' + option.eventId + '">' + option.eventName + '</option>';
      })
      .join("");
  }

  function rebuildDerivedData() {
    if (!state.data) {
      return;
    }

    state.data.tasks = sortTasks(state.data.tasks.map(normalizeTask).filter(Boolean));
    state.data.details = state.data.details.map(normalizeDetail).filter(Boolean);
    state.data.summary = buildSummary(state.data.tasks);
    state.data.filterOptions = buildFilterOptions(state.data.tasks);
    syncFilterControls();
    populateFormEvents();
  }

  function getSelectedSummary() {
    if (!state.data) {
      return null;
    }

    return state.data.tasks.find(function (task) {
      return task.taskId === state.selectedTaskId;
    }) || null;
  }

  function getSelectedDetail() {
    if (!state.data) {
      return null;
    }

    return state.data.details.find(function (detail) {
      return detail.taskId === state.selectedTaskId;
    }) || null;
  }

  function getSelectedSuggestions() {
    if (!state.data) {
      return [];
    }

    var group = state.data.suggestionGroups.find(function (suggestionGroup) {
      return suggestionGroup.taskId === state.selectedTaskId;
    });

    return group ? group.suggestions : [];
  }

  function getFilteredTasks() {
    if (!state.data) {
      return [];
    }

    return state.data.tasks.filter(function (task) {
      var haystack = [task.title, task.eventName, task.assignedVolunteerName].join(" ").toLowerCase();
      var matchesSearch = !state.searchTerm || haystack.indexOf(state.searchTerm) !== -1;
      var matchesStatus = state.status === "ALL" || task.status === state.status;
      var matchesPriority = state.priority === "ALL" || task.priority === state.priority;
      var matchesEvent = state.eventName === "ALL" || task.eventName === state.eventName;

      return matchesSearch && matchesStatus && matchesPriority && matchesEvent;
    });
  }

  function ensureSelectedTask(filteredTasks) {
    if (state.previewMode !== "ready") {
      return;
    }

    var stillVisible = filteredTasks.some(function (task) {
      return task.taskId === state.selectedTaskId;
    });

    if (stillVisible) {
      return;
    }

    state.selectedTaskId = filteredTasks.length ? filteredTasks[0].taskId : null;
    state.selectedSuggestionVolunteerId = null;
    if (!state.selectedTaskId && state.formMode === "edit") {
      state.formMode = "create";
    }
  }

  function syncModeButtons() {
    Array.prototype.forEach.call(modeButtons, function (button) {
      var isActive = button.getAttribute("data-mode") === state.formMode;
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
        message: "Skeleton placeholders simulate the organizer task table, detail panel, and assignment form while task data loads."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful organizer task response with no visible task records."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed organizer task request while preserving safe form and navigation copy."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function showFormFeedback(variant, title, message) {
    if (!formFeedback) {
      return;
    }

    formFeedback.hidden = false;
    formFeedback.className = "alert " + (variant === "success" ? "alert-info" : "alert-danger");
    if (formFeedbackTitle) {
      formFeedbackTitle.textContent = title;
    }
    if (formFeedbackMessage) {
      formFeedbackMessage.textContent = message;
    }
  }

  function hideFormFeedback() {
    if (!formFeedback) {
      return;
    }

    formFeedback.hidden = true;
    formFeedback.className = "alert alert-danger";
    if (formFeedbackTitle) {
      formFeedbackTitle.textContent = "Unable to save task";
    }
    if (formFeedbackMessage) {
      formFeedbackMessage.textContent = "Fix the current organizer task request and try again.";
    }
  }

  function applyApiErrors(response, title) {
    var firstError = Array.isArray(response && response.errors) && response.errors.length ? response.errors[0] : null;
    showFormFeedback(
      "error",
      title,
      firstError && firstError.message ? firstError.message : response && response.message ? response.message : "The organizer task request failed before a valid response was returned."
    );
  }

  function renderSummary() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      summaryTotal.textContent = "...";
      summaryDueToday.textContent = "...";
      summaryBlocked.textContent = "...";
      summaryUnassigned.textContent = "...";
      return;
    }

    if (state.previewMode === "empty") {
      summaryTotal.textContent = "0";
      summaryDueToday.textContent = "0";
      summaryBlocked.textContent = "0";
      summaryUnassigned.textContent = "0";
      return;
    }

    if (state.previewMode === "error") {
      summaryTotal.textContent = "--";
      summaryDueToday.textContent = "--";
      summaryBlocked.textContent = "--";
      summaryUnassigned.textContent = "--";
      return;
    }

    summaryTotal.textContent = String(state.data.summary.totalTasks);
    summaryDueToday.textContent = String(state.data.summary.dueToday);
    summaryBlocked.textContent = String(state.data.summary.blockedTasks);
    summaryUnassigned.textContent = String(state.data.summary.unassignedTasks);
  }

  function renderFilterSummary(filteredTasks) {
    if (!filterSummary || !selectedSummary || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      filterSummary.textContent = "Loading organizer task filters.";
      selectedSummary.textContent = "Awaiting task data.";
      return;
    }

    if (state.previewMode === "empty") {
      filterSummary.textContent = "No organizer tasks are available in this preview state.";
      selectedSummary.textContent = "No task selected.";
      return;
    }

    if (state.previewMode === "error") {
      filterSummary.textContent = "Organizer task filters are unavailable because the preview is simulating a failed request.";
      selectedSummary.textContent = "Selection unavailable.";
      return;
    }

    filterSummary.textContent = "Showing " + filteredTasks.length + " of " + state.data.tasks.length + " organizer tasks.";
    var selectedTask = getSelectedSummary();
    selectedSummary.textContent = selectedTask
      ? "Selected task #" + selectedTask.taskId + " • " + selectedTask.title + " • " + state.formMode + " flow"
      : "No task selected.";
  }

  function renderTable(filteredTasks) {
    if (!tableBody || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      tableBody.innerHTML = '<tr><td colspan="7">Organizer task data is loading.</td></tr>';
      emptyState.hidden = true;
      return;
    }

    if (state.previewMode === "empty") {
      tableBody.innerHTML = '<tr><td colspan="7">No tasks are available in this preview state.</td></tr>';
      emptyState.hidden = false;
      return;
    }

    if (state.previewMode === "error") {
      tableBody.innerHTML = '<tr><td colspan="7">Organizer task data is unavailable in this preview state.</td></tr>';
      emptyState.hidden = true;
      return;
    }

    if (!filteredTasks.length) {
      tableBody.innerHTML = '<tr><td colspan="7">No tasks match the current filters.</td></tr>';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tableBody.innerHTML = filteredTasks
      .map(function (task) {
        var statusVariant = taskUiUtils ? taskUiUtils.getTaskStatusVariant(task.status) : "neutral";
        var priorityVariant = taskUiUtils ? taskUiUtils.getPriorityVariant(task.priority) : "neutral";
        var isSelected = task.taskId === state.selectedTaskId;

        return [
          '<tr' + (isSelected ? ' class="is-selected"' : "") + '>',
          '<td><strong>' + task.title + '</strong></td>',
          '<td>' + task.eventName + '</td>',
          '<td><span class="badge badge-' + priorityVariant + '">' + formatLabel(task.priority) + '</span></td>',
          '<td><span class="badge badge-' + statusVariant + '">' + formatStatusLabel(task.status) + '</span></td>',
          '<td>' + (task.assignedVolunteerName || "Unassigned") + '</td>',
          '<td>' + (task.deadlineAt || "Pending") + '</td>',
          '<td class="button-row"><button class="button button-ghost" type="button" data-task-select="' + task.taskId + '">View</button><button class="button button-secondary" type="button" data-task-edit="' + task.taskId + '">Edit</button></td>',
          '</tr>'
        ].join("");
      })
      .join("");
  }

  function renderTaskChips(target, items, emptyCopy) {
    if (!target) {
      return;
    }

    if (!items || !items.length) {
      target.innerHTML = '<li class="task-chip">' + emptyCopy + '</li>';
      return;
    }

    target.innerHTML = items
      .map(function (item) {
        return '<li class="task-chip">' + item + '</li>';
      })
      .join("");
  }

  function renderSelectableChips(target, options, selectedValues, attributeName, emptyCopy) {
    if (!target) {
      return;
    }

    if (!options.length) {
      target.innerHTML = '<li class="task-chip">' + emptyCopy + '</li>';
      return;
    }

    var selectedLookup = {};
    (selectedValues || []).forEach(function (value) {
      selectedLookup[String(value)] = true;
    });

    target.innerHTML = options
      .map(function (option) {
        var value = String(option.value);
        var selectedClass = selectedLookup[value] ? ' is-selected' : '';
        return '<li class="task-chip is-selectable' + selectedClass + '" ' + attributeName + '="' + value + '">' + option.label + '</li>';
      })
      .join("");
  }

  function getSkillOptions() {
    return (state.data && Array.isArray(state.data.skillCatalog) ? state.data.skillCatalog : []).map(function (skillName) {
      return {
        value: skillName,
        label: skillName
      };
    });
  }

  function getDependencyOptions() {
    if (!state.data) {
      return [];
    }

    return state.data.tasks
      .filter(function (task) {
        return task.taskId !== state.selectedTaskId;
      })
      .map(function (task) {
        return {
          value: task.taskId,
          label: "Task #" + task.taskId + " · " + task.title
        };
      });
  }

  function renderDetail() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      setBadgeClass(detailStatus, "neutral");
      detailStatus.textContent = "Loading";
      detailTitle.textContent = "Loading task detail";
      detailMeta.textContent = "Detail data is being prepared.";
      detailDescription.textContent = "Task detail placeholders are visible while the organizer preview loads.";
      renderTaskChips(skillChipList, [], "Loading skills");
      renderTaskChips(dependencyChipList, [], "Loading dependencies");
      activityList.innerHTML = '<li class="activity-item"><strong>Loading activity</strong><span class="activity-meta">Task activity is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      setBadgeClass(detailStatus, "neutral");
      detailStatus.textContent = "No task";
      detailTitle.textContent = "No task selected";
      detailMeta.textContent = "There are no task details to show in this preview state.";
      detailDescription.textContent = "Select a task once records exist to inspect skills, dependencies, and activity.";
      renderTaskChips(skillChipList, [], "No skills loaded");
      renderTaskChips(dependencyChipList, [], "No dependencies loaded");
      activityList.innerHTML = '<li class="activity-item"><strong>No activity yet</strong><span class="activity-meta">Task activity will appear here when records exist.</span></li>';
      return;
    }

    if (state.previewMode === "error") {
      setBadgeClass(detailStatus, "danger");
      detailStatus.textContent = "Unavailable";
      detailTitle.textContent = "Task detail unavailable";
      detailMeta.textContent = "The preview is simulating a failed organizer task request.";
      detailDescription.textContent = "Safe fallback copy remains visible even when the task detail request fails.";
      renderTaskChips(skillChipList, [], "Task detail unavailable");
      renderTaskChips(dependencyChipList, [], "Task detail unavailable");
      activityList.innerHTML = '<li class="activity-item"><strong>Activity unavailable</strong><span class="activity-meta">The preview is simulating a failed task detail request.</span></li>';
      return;
    }

    var summary = getSelectedSummary();
    var detail = getSelectedDetail();
    if (!summary || !detail) {
      setBadgeClass(detailStatus, "neutral");
      detailStatus.textContent = "Pending";
      detailTitle.textContent = "No task selected";
      detailMeta.textContent = "Select a task row to inspect organizer detail data.";
      detailDescription.textContent = "Task detail, required skills, and activity history will render here once a task is selected.";
      renderTaskChips(skillChipList, [], "No skills loaded");
      renderTaskChips(dependencyChipList, [], "No dependencies loaded");
      activityList.innerHTML = '<li class="activity-item"><strong>No activity yet</strong><span class="activity-meta">Select a task to inspect recent activity.</span></li>';
      return;
    }

    setBadgeClass(detailStatus, taskUiUtils ? taskUiUtils.getTaskStatusVariant(detail.status) : "neutral");
    detailStatus.textContent = formatStatusLabel(detail.status);
    detailTitle.textContent = detail.title;
    detailMeta.textContent = summary.eventName + " • Assigned to " + (detail.assignedVolunteer || "Unassigned") + " • Deadline " + (detail.deadlineAt || "Pending");
    detailDescription.textContent = detail.description || "No task description recorded.";
    renderTaskChips(skillChipList, detail.requiredSkills, "No skills loaded");
    renderTaskChips(dependencyChipList, detail.dependencies, "No dependencies loaded");
    activityList.innerHTML = detail.activityFeed.length
      ? detail.activityFeed
          .map(function (activity) {
            return '<li class="activity-item"><strong>' + activity.title + '</strong><span class="activity-meta">' + activity.meta + '</span></li>';
          })
          .join("")
      : '<li class="activity-item"><strong>No activity yet</strong><span class="activity-meta">Task activity will appear here once changes are recorded.</span></li>';
  }

  function getFormModel() {
    if (!state.data) {
      return null;
    }

    if (state.formMode === "edit") {
      var summary = getSelectedSummary();
      var detail = getSelectedDetail();
      if (summary && detail) {
        return {
          eventId: summary.eventId,
          title: detail.title,
          description: detail.description,
          priority: detail.priority,
          status: detail.status,
          requiredSkills: detail.requiredSkills,
          dependencyTaskIds: detail.dependencyTaskIds,
          requiredStartAt: detail.requiredStartAt,
          deadlineAt: detail.deadlineAt,
          caption: "Editing task #" + detail.taskId + " for " + summary.eventName + "."
        };
      }
    }

    return {
      eventId: state.data.createTemplate.eventId,
      title: state.data.createTemplate.title,
      description: state.data.createTemplate.description,
      priority: state.data.createTemplate.priority,
      status: state.data.createTemplate.status,
      requiredSkills: state.data.createTemplate.requiredSkills,
      dependencyTaskIds: state.data.createTemplate.dependencyTaskIds,
      requiredStartAt: state.data.createTemplate.requiredStartAt,
      deadlineAt: state.data.createTemplate.deadlineAt,
      caption: "Use create mode for a fresh organizer task draft while saving through the live backend."
    };
  }

  function renderSuggestions() {
    if (!suggestionList || !state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>Loading suggestions</strong><span class="suggestion-copy">Volunteer ranking is being prepared.</span></li>';
      return;
    }

    if (state.previewMode === "empty") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>No suggestions needed</strong><span class="suggestion-copy">No task suggestions are required in this preview state.</span></li>';
      state.selectedSuggestionVolunteerId = null;
      return;
    }

    if (state.previewMode === "error") {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>Suggestions unavailable</strong><span class="suggestion-copy">The preview is simulating a failed suggestion request.</span></li>';
      state.selectedSuggestionVolunteerId = null;
      return;
    }

    var suggestions = getSelectedSuggestions();
    if (!suggestions.length) {
      suggestionList.innerHTML = '<li class="suggestion-item"><strong>No suggestions for this task</strong><span class="suggestion-copy">This task does not currently have active assignment candidates.</span></li>';
      state.selectedSuggestionVolunteerId = null;
      return;
    }

    if (!state.selectedSuggestionVolunteerId || !suggestions.some(function (suggestion) {
      return Number(suggestion.volunteerId) === Number(state.selectedSuggestionVolunteerId);
    })) {
      state.selectedSuggestionVolunteerId = Number(suggestions[0].volunteerId);
    }

    suggestionList.innerHTML = suggestions
      .map(function (suggestion) {
        var isSelected = Number(suggestion.volunteerId) === Number(state.selectedSuggestionVolunteerId);
        return [
          '<li class="suggestion-item' + (isSelected ? ' is-selected' : '') + '" data-task-suggestion-volunteer="' + suggestion.volunteerId + '">',
          '<div class="suggestion-score-row"><strong>' + suggestion.volunteerName + '</strong><span class="suggestion-score">' + formatScore(suggestion.totalScore) + '</span></div>',
          '<span class="suggestion-copy">Skill match ' + formatScore(suggestion.skillMatchScore) + ' • Availability ' + formatScore(suggestion.availabilityScore) + ' • Performance ' + formatScore(suggestion.performanceScore) + '</span>',
          '<ul class="task-chip-list">',
          suggestion.explanation.map(function (line) {
            return '<li class="task-chip">' + line + '</li>';
          }).join(""),
          '</ul>',
          '</li>'
        ].join("");
      })
      .join("");
  }

  function renderForm() {
    if (!state.data) {
      return;
    }

    syncModeButtons();

    if (state.previewMode === "loading") {
      formCaption.textContent = "Loading organizer task form preview.";
      formTitle.value = "Loading task";
      formDescription.value = "Task form fields are being prepared.";
      formStart.value = "--";
      formDeadline.value = "--";
      renderTaskChips(formSkillList, [], "Loading skills");
      renderTaskChips(formDependencyList, [], "Loading dependencies");
    } else if (state.previewMode === "empty") {
      formCaption.textContent = "No task records are available, so the create template is shown in its empty state.";
      formTitle.value = "";
      formDescription.value = "";
      formStart.value = "";
      formDeadline.value = "";
      renderSelectableChips(formSkillList, getSkillOptions(), [], "data-task-skill-name", "No skills available");
      renderSelectableChips(formDependencyList, [], [], "data-task-dependency-id", "No dependencies available");
    } else if (state.previewMode === "error") {
      formCaption.textContent = "The preview is simulating a failed organizer request while the form remains safely visible.";
      formTitle.value = "Preview unavailable";
      formDescription.value = "Form submission is not active because this screen is simulating an error path.";
      formStart.value = "--";
      formDeadline.value = "--";
      renderTaskChips(formSkillList, [], "Suggestions unavailable");
      renderTaskChips(formDependencyList, [], "Dependencies unavailable");
    } else {
      var model = getFormModel();
      if (model) {
        formCaption.textContent = model.caption;
        if (formEvent) {
          formEvent.value = model.eventId != null ? String(model.eventId) : "";
        }
        formTitle.value = model.title || "";
        formPriority.value = model.priority || "MEDIUM";
        formStatus.value = model.status || "TODO";
        formStart.value = model.requiredStartAt || "";
        formDeadline.value = model.deadlineAt || "";
        formDescription.value = model.description || "";
        renderSelectableChips(formSkillList, getSkillOptions(), model.requiredSkills || [], "data-task-skill-name", "No skills available");
        renderSelectableChips(formDependencyList, getDependencyOptions(), model.dependencyTaskIds || [], "data-task-dependency-id", "No dependencies available");
      }
    }

    if (saveButton) {
      saveButton.textContent = state.formMode === "edit" ? "Save changes" : "Create task";
      saveButton.disabled = state.previewMode !== "ready";
    }

    if (deleteButton) {
      deleteButton.disabled = state.previewMode !== "ready" || state.formMode !== "edit" || !state.selectedTaskId;
    }

    if (assignButton) {
      assignButton.disabled = state.previewMode !== "ready"
        || !state.selectedTaskId
        || !state.selectedSuggestionVolunteerId
        || !getSelectedSuggestions().length;
    }
  }

  function renderTasks() {
    var filteredTasks = state.previewMode === "ready" ? getFilteredTasks() : [];

    ensureSelectedTask(filteredTasks);
    renderSummary();
    renderFilterSummary(filteredTasks);
    renderTable(filteredTasks);
    renderDetail();
    renderSuggestions();
    renderForm();
    syncPreviewPanel();
  }

  function resolveEventName(eventId) {
    if (!state.data) {
      return "Unknown event";
    }

    var option = state.data.eventOptions.find(function (eventOption) {
      return Number(eventOption.eventId) === Number(eventId);
    });
    return option ? option.eventName : "Unknown event";
  }

  function collectSelectedSkills() {
    if (!formSkillList) {
      return [];
    }

    return Array.prototype.slice.call(formSkillList.querySelectorAll("[data-task-skill-name].is-selected"))
      .map(function (node) {
        return node.getAttribute("data-task-skill-name");
      });
  }

  function collectSelectedDependencyIds() {
    if (!formDependencyList) {
      return [];
    }

    return Array.prototype.slice.call(formDependencyList.querySelectorAll("[data-task-dependency-id].is-selected"))
      .map(function (node) {
        return Number(node.getAttribute("data-task-dependency-id"));
      });
  }

  function collectFormPayload() {
    var eventIdValue = formEvent ? Number(formEvent.value) : NaN;
    var startValue = formStart ? formStart.value.trim() : "";
    var deadlineValue = formDeadline ? formDeadline.value.trim() : "";

    return {
      eventId: isNaN(eventIdValue) ? null : eventIdValue,
      title: formTitle ? formTitle.value.trim() : "",
      description: formDescription ? formDescription.value.trim() : "",
      priority: formPriority ? formPriority.value : "MEDIUM",
      requiredSkills: collectSelectedSkills(),
      dependencyTaskIds: collectSelectedDependencyIds(),
      requiredStartAt: startValue ? startValue : null,
      deadlineAt: deadlineValue ? deadlineValue : null,
      status: formStatus ? formStatus.value : "TODO"
    };
  }

  function toTaskSummary(detail, fallbackEventId, fallbackEventName) {
    var eventId = detail && detail.eventId != null ? Number(detail.eventId) : fallbackEventId;
    var eventName = fallbackEventName || resolveEventName(eventId);
    var summary = {
      taskId: Number(detail.taskId),
      eventId: eventId,
      eventName: eventName,
      title: detail.title || "",
      priority: detail.priority || "MEDIUM",
      status: detail.status || "TODO",
      deadlineAt: detail.deadlineAt || "",
      assignedVolunteerName: detail.assignedVolunteer || "Unassigned"
    };
    summary.delayFlag = isDelayedTask(summary);
    return summary;
  }

  function normalizeDetailFromApi(detail, extra) {
    var previous = getSelectedDetail() || {};
    return normalizeDetail(Object.assign({}, previous, detail || {}, {
      dependencyTaskIds: extra && extra.dependencyTaskIds ? extra.dependencyTaskIds : previous.dependencyTaskIds || [],
      requiredStartAt: extra && Object.prototype.hasOwnProperty.call(extra, "requiredStartAt") ? extra.requiredStartAt : previous.requiredStartAt || ""
    }));
  }

  function upsertTaskSummary(summary) {
    var replaced = false;
    state.data.tasks = state.data.tasks.map(function (task) {
      if (task.taskId !== summary.taskId) {
        return task;
      }
      replaced = true;
      return normalizeTask(summary);
    });

    if (!replaced) {
      state.data.tasks = state.data.tasks.concat(normalizeTask(summary));
    }

    rebuildDerivedData();
  }

  function upsertTaskDetail(detail, extra) {
    var normalized = normalizeDetailFromApi(detail, extra);
    var replaced = false;
    state.data.details = state.data.details.map(function (item) {
      if (item.taskId !== normalized.taskId) {
        return item;
      }
      replaced = true;
      return normalized;
    });

    if (!replaced) {
      state.data.details = state.data.details.concat(normalized);
    }
  }

  function upsertSuggestionGroup(taskId, suggestions) {
    var group = normalizeSuggestionGroup({ taskId: taskId, suggestions: suggestions || [] });
    var replaced = false;
    state.data.suggestionGroups = state.data.suggestionGroups.map(function (item) {
      if (item.taskId !== group.taskId) {
        return item;
      }
      replaced = true;
      return group;
    });

    if (!replaced) {
      state.data.suggestionGroups = state.data.suggestionGroups.concat(group);
    }
  }

  function removeTask(taskId) {
    state.data.tasks = state.data.tasks.filter(function (task) {
      return task.taskId !== taskId;
    });
    state.data.details = state.data.details.filter(function (detail) {
      return detail.taskId !== taskId;
    });
    state.data.suggestionGroups = state.data.suggestionGroups.filter(function (group) {
      return group.taskId !== taskId;
    });
    rebuildDerivedData();
  }

  async function refreshSuggestions(taskId) {
    if (!apiClient || !taskId) {
      return;
    }

    var response = await apiClient.get("/api/organizer/tasks/" + taskId + "/assignment-suggestions", { retries: 1 });
    if (!response.ok || !Array.isArray(response.data)) {
      return;
    }

    upsertSuggestionGroup(taskId, response.data);
  }

  async function submitTask() {
    if (!apiClient) {
      showFormFeedback("error", "Task API unavailable", "The live organizer task API client did not load.");
      return;
    }

    if (state.previewMode !== "ready") {
      showFormFeedback("error", "Preview state is not editable", "Reset the preview state to ready before saving organizer tasks.");
      return;
    }

    hideFormFeedback();
    var payload = collectFormPayload();
    var response;

    if (state.formMode === "edit" && state.selectedTaskId) {
      response = await apiClient.put("/api/organizer/tasks/" + state.selectedTaskId, payload, { retries: 1 });
    } else {
      response = await apiClient.post("/api/organizer/tasks", payload, { retries: 1 });
    }

    if (!response.ok || !response.data) {
      applyApiErrors(response, "Unable to save task");
      return;
    }

    upsertTaskDetail(response.data, {
      requiredStartAt: payload.requiredStartAt,
      dependencyTaskIds: payload.dependencyTaskIds
    });
    upsertTaskSummary(toTaskSummary(response.data, payload.eventId, resolveEventName(payload.eventId)));
    state.selectedTaskId = Number(response.data.taskId);
    state.formMode = "edit";
    await refreshSuggestions(state.selectedTaskId);
    renderTasks();
    showFormFeedback("success", "Task saved", response.message || "The organizer task was saved successfully.");
  }

  async function deleteSelectedTask() {
    if (!apiClient) {
      showFormFeedback("error", "Task API unavailable", "The live organizer task API client did not load.");
      return;
    }

    if (state.previewMode !== "ready") {
      showFormFeedback("error", "Preview state is not editable", "Reset the preview state to ready before deleting organizer tasks.");
      return;
    }

    if (state.formMode !== "edit" || !state.selectedTaskId) {
      showFormFeedback("error", "No editable task selected", "Select an existing task before sending a delete request.");
      return;
    }

    hideFormFeedback();
    var deletedTaskId = state.selectedTaskId;
    var response = await apiClient.delete("/api/organizer/tasks/" + deletedTaskId, { retries: 1 });
    if (!response.ok) {
      applyApiErrors(response, "Unable to delete task");
      return;
    }

    removeTask(deletedTaskId);
    state.selectedTaskId = state.data.tasks.length ? state.data.tasks[0].taskId : null;
    state.selectedSuggestionVolunteerId = null;
    state.formMode = "create";
    renderTasks();
    showFormFeedback("success", "Task deleted", response.message || "The selected organizer task was deleted successfully.");
  }

  async function assignSelectedVolunteer() {
    if (!apiClient) {
      showFormFeedback("error", "Task API unavailable", "The live organizer task API client did not load.");
      return;
    }

    if (state.previewMode !== "ready") {
      showFormFeedback("error", "Preview state is not editable", "Reset the preview state to ready before assigning volunteers.");
      return;
    }

    if (!state.selectedTaskId || !state.selectedSuggestionVolunteerId) {
      showFormFeedback("error", "No suggestion selected", "Select a live assignment suggestion before assigning a volunteer.");
      return;
    }

    var selectedSuggestion = getSelectedSuggestions().find(function (suggestion) {
      return Number(suggestion.volunteerId) === Number(state.selectedSuggestionVolunteerId);
    });

    hideFormFeedback();
    var response = await apiClient.post(
      "/api/organizer/tasks/" + state.selectedTaskId + "/assign",
      {
        volunteerId: state.selectedSuggestionVolunteerId,
        assignmentMode: "MANUAL",
        assignmentReason: selectedSuggestion && selectedSuggestion.explanation && selectedSuggestion.explanation.length
          ? selectedSuggestion.explanation[0]
          : "Assigned from organizer task management."
      },
      { retries: 1 }
    );

    if (!response.ok || !response.data) {
      applyApiErrors(response, "Unable to assign volunteer");
      return;
    }

    upsertTaskDetail(response.data);
    var selectedSummary = getSelectedSummary();
    upsertTaskSummary(toTaskSummary(
      response.data,
      selectedSummary ? selectedSummary.eventId : response.data.eventId,
      selectedSummary ? selectedSummary.eventName : resolveEventName(response.data.eventId)
    ));
    await refreshSuggestions(state.selectedTaskId);
    renderTasks();
    showFormFeedback("success", "Volunteer assigned", response.message || "The selected volunteer was assigned successfully.");
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
        syncFilterControls();
        renderTasks();
      });
    }

    Array.prototype.forEach.call(modeButtons, function (button) {
      button.addEventListener("click", function () {
        var nextMode = button.getAttribute("data-mode");
        if (nextMode === "edit" && !state.selectedTaskId) {
          return;
        }

        state.formMode = nextMode;
        hideFormFeedback();
        renderTasks();
      });
    });

    Array.prototype.forEach.call(createButtons, function (button) {
      button.addEventListener("click", function () {
        state.formMode = "create";
        state.selectedSuggestionVolunteerId = null;
        hideFormFeedback();
        renderTasks();
      });
    });

    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var selectButton = event.target.closest("[data-task-select]");
        var editButton = event.target.closest("[data-task-edit]");
        if (selectButton) {
          state.selectedTaskId = Number(selectButton.getAttribute("data-task-select"));
          state.selectedSuggestionVolunteerId = null;
          hideFormFeedback();
          void refreshSuggestions(state.selectedTaskId).then(renderTasks);
          renderTasks();
          return;
        }

        if (editButton) {
          state.selectedTaskId = Number(editButton.getAttribute("data-task-edit"));
          state.selectedSuggestionVolunteerId = null;
          state.formMode = "edit";
          hideFormFeedback();
          void refreshSuggestions(state.selectedTaskId).then(renderTasks);
          renderTasks();
        }
      });
    }

    if (formSkillList) {
      formSkillList.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-task-skill-name]");
        if (!chip || state.previewMode !== "ready") {
          return;
        }
        chip.classList.toggle("is-selected");
      });
    }

    if (formDependencyList) {
      formDependencyList.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-task-dependency-id]");
        if (!chip || state.previewMode !== "ready") {
          return;
        }
        chip.classList.toggle("is-selected");
      });
    }

    if (suggestionList) {
      suggestionList.addEventListener("click", function (event) {
        var suggestionItem = event.target.closest("[data-task-suggestion-volunteer]");
        if (!suggestionItem || state.previewMode !== "ready") {
          return;
        }
        state.selectedSuggestionVolunteerId = Number(suggestionItem.getAttribute("data-task-suggestion-volunteer"));
        renderSuggestions();
        renderForm();
      });
    }

    if (saveButton) {
      saveButton.addEventListener("click", function () {
        void submitTask();
      });
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", function () {
        void deleteSelectedTask();
      });
    }

    if (assignButton) {
      assignButton.addEventListener("click", function () {
        void assignSelectedVolunteer();
      });
    }
  }

  function hydrateTasks() {
    if (!pageApi || !mockData || !taskUiUtils) {
      return;
    }

    var roleContext = pageApi.requireRole(
      taskUiUtils.getRoleGateConfig({
        roleLabel: "Organizer",
        blockedTitle: "Organizer task management blocked",
        phaseTitle: "Phase 10 route is gated.",
        phaseCopy: "Organizer task pages should only render for organizer sessions while the live backend enforces the saved CRUD flow.",
        missingSessionMessage: "Open the login page first and sign in with the organizer account to view task management."
      })
    );

    if (!roleContext) {
      return;
    }

    pageApi.showReady(roleContext, {
      shell: {
        phaseTitle: "Phase 10 is active.",
        phaseCopy: "Organizer task management is now wired to the live backend CRUD and assignment slice while preserving the frozen UI contracts.",
        topbarEyebrow: "Organizer task management",
        topbarTitle: roleContext.uiConfig ? roleContext.uiConfig.label : "Organizer workspace"
      }
    });

    state.data = normalizeData(parseBootstrapData());
    state.formMode = initialMode === "edit" ? "edit" : "create";
    state.selectedTaskId = initialSelectedTaskId || (state.data.tasks.length ? state.data.tasks[0].taskId : null);
    state.selectedSuggestionVolunteerId = null;

    syncFilterControls();
    populateFormEvents();
    pageApi.bindLogout(logoutButtons, "/login");
    bindEvents();

    if (previewStateShell && window.EventFlowMockPreviewState) {
      previewController = window.EventFlowMockPreviewState.create({
        shell: previewStateShell,
        onChange: function (nextState) {
          state.previewMode = nextState;
          if (nextState !== "ready") {
            state.selectedTaskId = null;
            state.selectedSuggestionVolunteerId = null;
            state.formMode = "create";
          } else if (!state.selectedTaskId && state.data && state.data.tasks.length) {
            state.selectedTaskId = initialSelectedTaskId || state.data.tasks[0].taskId;
          }
          renderTasks();
        }
      });
      state.previewMode = previewController.getState();
    }

    void refreshSuggestions(state.selectedTaskId).then(renderTasks);
    renderTasks();
  }

  hydrateTasks();
})();