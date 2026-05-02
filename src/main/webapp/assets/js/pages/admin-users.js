(function () {
  var body = document.body;
  var contextPath = body.getAttribute("data-context-path") || "";
  var initialMode = body.getAttribute("data-user-initial-mode") || "list";
  var selectedUserIdValue = body.getAttribute("data-user-selected-id") || "";
  var initialSelectedUserId = selectedUserIdValue ? Number(selectedUserIdValue) : null;
  var mockData = window.EventFlowMockData || null;
  var apiClient = window.EventFlowApi ? window.EventFlowApi.create({ contextPath: contextPath }) : null;
  var bootstrapScript = document.getElementById("admin-user-bootstrap");
  var gatePanel = document.querySelector("[data-admin-gate]");
  var gateTitle = document.querySelector("[data-admin-gate-title]");
  var gateMessage = document.querySelector("[data-admin-gate-message]");
  var content = document.querySelector("[data-admin-users-content]");
  var summaryTotal = document.querySelector("[data-users-total]");
  var summaryActive = document.querySelector("[data-users-active]");
  var summaryVolunteers = document.querySelector("[data-users-volunteers]");
  var summaryOrganizers = document.querySelector("[data-users-organizers]");
  var searchInput = document.querySelector("[data-user-search]");
  var roleFilter = document.querySelector("[data-user-role-filter]");
  var availabilityFilter = document.querySelector("[data-user-availability-filter]");
  var activeFilter = document.querySelector("[data-user-active-filter]");
  var filterSummary = document.querySelector("[data-user-filter-summary]");
  var selectedSummary = document.querySelector("[data-user-selected-summary]");
  var tableBody = document.querySelector("[data-user-table-body]");
  var emptyState = document.querySelector("[data-user-empty-state]");
  var detailRole = document.querySelector("[data-user-detail-role]");
  var detailName = document.querySelector("[data-user-detail-name]");
  var detailMeta = document.querySelector("[data-user-detail-meta]");
  var detailAvailability = document.querySelector("[data-user-detail-availability]");
  var detailStatus = document.querySelector("[data-user-detail-status]");
  var detailPerformance = document.querySelector("[data-user-detail-performance]");
  var skillList = document.querySelector("[data-user-skill-list]");
  var assignmentList = document.querySelector("[data-user-assignment-list]");
  var registrationList = document.querySelector("[data-user-registration-list]");
  var formCaption = document.querySelector("[data-user-form-caption]");
  var modeButtons = document.querySelectorAll("[data-user-mode-button]");
  var createButtons = document.querySelectorAll("[data-user-create-button]");
  var resetFiltersButton = document.querySelector("[data-user-reset-filters]");
  var focusSelectedButton = document.querySelector("[data-user-focus-selected]");
  var formFirstName = document.querySelector("[data-user-form-first-name]");
  var formLastName = document.querySelector("[data-user-form-last-name]");
  var formEmail = document.querySelector("[data-user-form-email]");
  var formRole = document.querySelector("[data-user-form-role]");
  var formAvailability = document.querySelector("[data-user-form-availability]");
  var formPassword = document.querySelector("[data-user-form-password]");
  var formActive = document.querySelector("[data-user-form-active]");
  var formSkillList = document.querySelector("[data-user-form-skill-list]");
  var formNote = document.querySelector("[data-user-form-note]");
  var formFeedback = document.querySelector("[data-user-form-feedback]");
  var formFeedbackTitle = document.querySelector("[data-user-form-feedback-title]");
  var formFeedbackMessage = document.querySelector("[data-user-form-feedback-message]");
  var saveButton = document.querySelector("[data-user-save-button]");
  var deactivateButton = document.querySelector("[data-user-deactivate-button]");
  var fieldErrorNodes = {
    firstName: document.querySelector("[data-user-form-first-name-error]"),
    lastName: document.querySelector("[data-user-form-last-name-error]"),
    email: document.querySelector("[data-user-form-email-error]"),
    role: document.querySelector("[data-user-form-role-error]"),
    availabilityStatus: document.querySelector("[data-user-form-availability-error]"),
    password: document.querySelector("[data-user-form-password-error]"),
    skills: document.querySelector("[data-user-form-skills-error]")
  };
  var logoutButtons = document.querySelectorAll("[data-logout-preview]");
  var previewStateShell = document.querySelector("[data-preview-state-shell]");
  var pageApi = window.EventFlowMockRolePage
    ? window.EventFlowMockRolePage.create({
        contextPath: contextPath,
        requiredRole: "ADMIN",
        gatedContent: content,
        gatePanel: gatePanel,
        gateTitle: gateTitle,
        gateMessage: gateMessage
      })
    : null;
  var state = {
    searchTerm: "",
    role: "ALL",
    availability: "ALL",
    activeState: "ALL",
    selectedUserId: null,
    previewMode: "ready",
    formMode: "create",
    data: null
  };
  var previewController = null;

  if (pageApi && pageApi.mockData) {
    mockData = pageApi.mockData;
  }

  function setBadgeClass(node, variant) {
    if (!node) {
      return;
    }

    node.className = "badge badge-" + variant;
  }

  function getRoleBadgeVariant(role) {
    if (role === "ADMIN") {
      return "danger";
    }

    if (role === "ORGANIZER") {
      return "info";
    }

    if (role === "VOLUNTEER") {
      return "success";
    }

    return "neutral";
  }

  function getStatusBadgeVariant(active) {
    return active ? "success" : "warning";
  }

  function getGateConfig() {
    return {
      missingData: {
        title: "Mock data unavailable",
        message: "Shared mock data must load before the admin user preview can render.",
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin user management should only render for admin sessions while frontend flows remain mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin user management blocked"
        }
      },
      missingSession: {
        title: "Admin preview needs a session",
        message: "Open the login preview first and sign in with the admin demo account to view user management.",
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin user management should only render for admin sessions while frontend flows remain mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin user management blocked"
        }
      },
      wrongRole: {
        title: "This preview is admin-only",
        message: "The stored session belongs to another role, so the admin user management content is intentionally hidden.",
        shell: {
          phaseTitle: "Phase 3 preview is gated.",
          phaseCopy: "Admin user management should only render for admin sessions while frontend flows remain mocked.",
          topbarEyebrow: "Restricted route",
          topbarTitle: "Admin user management blocked"
        }
      }
    };
  }

  function syncPreviewPanel() {
    if (!previewController) {
      return;
    }

    if (state.previewMode === "loading") {
      previewController.setPanel({
        title: "Loading preview state",
        message: "Skeleton placeholders simulate the user roster, detail panel, and account form while data is still loading."
      });
      return;
    }

    if (state.previewMode === "empty") {
      previewController.setPanel({
        title: "Empty preview state",
        message: "This simulates a successful user-management response with no matching accounts, so the empty paths can be reviewed."
      });
      return;
    }

    if (state.previewMode === "error") {
      previewController.setPanel({
        title: "Error preview state",
        message: "This simulates a failed user-management request while keeping safe fallback copy and account-form surfaces visible."
      });
      return;
    }

    previewController.setPanel(null);
  }

  function populateSelect(selectNode, options) {
    if (!selectNode) {
      return;
    }

    selectNode.innerHTML = options
      .map(function (option) {
        return '<option value="' + option + '">' + option.replace(/_/g, ' ') + '</option>';
      })
      .join("");
  }

  function createDefaultTemplate(skillCatalog) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "VOLUNTEER",
      active: true,
      availabilityStatus: "AVAILABLE",
      skills: skillCatalog.length ? [skillCatalog[0]] : []
    };
  }

  function createDefaultData() {
    return {
      summary: {
        totalUsers: 0,
        activeUsers: 0,
        availableVolunteers: 0,
        organizers: 0
      },
      filterOptions: {
        roles: ["ALL", "ADMIN", "ORGANIZER", "VOLUNTEER", "STUDENT"],
        availability: ["ALL", "AVAILABLE", "LIMITED", "UNAVAILABLE"],
        activeState: ["ALL", "ACTIVE", "INACTIVE"]
      },
      skillCatalog: [],
      users: [],
      details: [],
      createTemplate: createDefaultTemplate([])
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

  function buildSummary(users) {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(function (user) {
        return !!user.active;
      }).length,
      availableVolunteers: users.filter(function (user) {
        return !!user.active && user.role === "VOLUNTEER" && user.availabilityStatus === "AVAILABLE";
      }).length,
      organizers: users.filter(function (user) {
        return user.role === "ORGANIZER";
      }).length
    };
  }

  function normalizeData(rawData) {
    var fallback = createDefaultData();
    var dataset = rawData && typeof rawData === "object" ? rawData : {};
    var skillCatalog = Array.isArray(dataset.skillCatalog) ? dataset.skillCatalog : fallback.skillCatalog;
    var users = Array.isArray(dataset.users) ? dataset.users.slice() : fallback.users.slice();
    var details = Array.isArray(dataset.details) ? dataset.details.slice() : fallback.details.slice();

    return {
      summary: buildSummary(users),
      filterOptions: dataset.filterOptions || fallback.filterOptions,
      skillCatalog: skillCatalog,
      users: sortUsers(users),
      details: details,
      createTemplate: Object.assign(createDefaultTemplate(skillCatalog), dataset.createTemplate || {})
    };
  }

  function sortUsers(users) {
    return users.slice().sort(function (left, right) {
      var leftName = (left.fullName || "").toLowerCase();
      var rightName = (right.fullName || "").toLowerCase();
      if (leftName === rightName) {
        return Number(left.userId) - Number(right.userId);
      }
      return leftName.localeCompare(rightName);
    });
  }

  function clearFieldErrors() {
    Object.keys(fieldErrorNodes).forEach(function (field) {
      var node = fieldErrorNodes[field];
      if (node) {
        node.hidden = true;
        node.textContent = "";
      }
    });
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
      formFeedbackTitle.textContent = "Unable to save user";
    }

    if (formFeedbackMessage) {
      formFeedbackMessage.textContent = "Fix the highlighted issues and try again.";
    }
  }

  function applyFieldErrors(errors) {
    var globalMessage = null;

    errors.forEach(function (error) {
      if (!error) {
        return;
      }

      if (!error.field) {
        globalMessage = globalMessage || error.message;
        return;
      }

      var node = fieldErrorNodes[error.field];
      if (!node) {
        globalMessage = globalMessage || error.message;
        return;
      }

      node.hidden = false;
      node.textContent = error.message;
    });

    if (globalMessage) {
      showFormFeedback("error", "Unable to save user", globalMessage);
    }
  }

  function collectSelectedSkills() {
    if (!formSkillList) {
      return [];
    }

    return Array.prototype.slice.call(formSkillList.querySelectorAll(".tag-chip.is-selected"))
      .map(function (node) {
        return node.getAttribute("data-skill-name") || node.textContent.trim();
      });
  }

  function collectFormPayload() {
    var role = formRole ? formRole.value : "VOLUNTEER";
    var selectedSkills = collectSelectedSkills();

    return {
      firstName: formFirstName ? formFirstName.value.trim() : "",
      lastName: formLastName ? formLastName.value.trim() : "",
      email: formEmail ? formEmail.value.trim() : "",
      password: formPassword ? formPassword.value : "",
      role: role,
      active: formActive ? !!formActive.checked : true,
      availabilityStatus: role === "VOLUNTEER" && formAvailability ? formAvailability.value : null,
      skills: role === "VOLUNTEER" ? selectedSkills : []
    };
  }

  function toUserSummary(detail) {
    return {
      userId: detail.userId,
      fullName: detail.fullName,
      email: detail.email,
      role: detail.role,
      availabilityStatus: detail.availabilityStatus,
      performanceScore: detail.performanceScore,
      active: detail.active,
      skills: Array.isArray(detail.skills) ? detail.skills.slice() : []
    };
  }

  function upsertUserSummary(summary) {
    var replaced = false;
    state.data.users = state.data.users.map(function (user) {
      if (user.userId !== summary.userId) {
        return user;
      }

      replaced = true;
      return summary;
    });

    if (!replaced) {
      state.data.users = state.data.users.concat(summary);
    }

    state.data.users = sortUsers(state.data.users);
    state.data.summary = buildSummary(state.data.users);
  }

  function upsertUserDetail(detail) {
    var replaced = false;
    state.data.details = state.data.details.map(function (item) {
      if (item.userId !== detail.userId) {
        return item;
      }

      replaced = true;
      return detail;
    });

    if (!replaced) {
      state.data.details = state.data.details.concat(detail);
    }
  }

  function removeUser(userId) {
    state.data.users = state.data.users.filter(function (user) {
      return user.userId !== userId;
    });
    state.data.details = state.data.details.filter(function (detail) {
      return detail.userId !== userId;
    });
    state.data.summary = buildSummary(state.data.users);
  }

  async function submitUser(forceDeactivate) {
    if (!apiClient) {
      showFormFeedback("error", "User API unavailable", "The live admin user API client did not load.");
      return;
    }

    if (state.previewMode !== "ready") {
      showFormFeedback("error", "Preview state is not editable", "Reset the preview state to ready before saving or deactivating users.");
      return;
    }

    if (forceDeactivate && (state.formMode !== "edit" || !state.selectedUserId)) {
      showFormFeedback("error", "No editable user selected", "Select an existing user before sending a deactivate request.");
      return;
    }

    clearFieldErrors();
    hideFormFeedback();

    var payload = collectFormPayload();
    if (forceDeactivate) {
      payload.active = false;
    }

    var response;
    if (state.formMode === "edit" && state.selectedUserId) {
      response = await apiClient.put("/api/admin/users/" + state.selectedUserId, payload, { retries: 1 });
    } else {
      response = await apiClient.post("/api/admin/users", payload, { retries: 1 });
    }

    if (!response.ok || !response.data) {
      if (Array.isArray(response.errors) && response.errors.length) {
        applyFieldErrors(response.errors);
      }

      if (!Array.isArray(response.errors) || !response.errors.length) {
        showFormFeedback(
          "error",
          "Unable to save user",
          response.message || "The user request failed before a valid response was returned."
        );
      }
      return;
    }

    upsertUserDetail(response.data);
    upsertUserSummary(toUserSummary(response.data));
    state.selectedUserId = response.data.userId;
    state.formMode = "edit";
    renderAll();

    showFormFeedback(
      "success",
      forceDeactivate ? "User deactivated" : "User saved",
      response.message || (forceDeactivate ? "The selected account is now inactive." : "The user record was saved successfully.")
    );
  }

  function getSelectedDetail() {
    if (!state.data) {
      return null;
    }

    return state.data.details.find(function (detail) {
      return detail.userId === state.selectedUserId;
    }) || null;
  }

  function getFilteredUsers() {
    if (!state.data) {
      return [];
    }

    return state.data.users.filter(function (user) {
      var haystack = [user.fullName, user.email].join(" ").toLowerCase();
      var matchesSearch = !state.searchTerm || haystack.indexOf(state.searchTerm) !== -1;
      var matchesRole = state.role === "ALL" || user.role === state.role;
      var matchesAvailability = state.availability === "ALL" || user.availabilityStatus === state.availability;
      var matchesActive = state.activeState === "ALL" || (state.activeState === "ACTIVE" ? user.active : !user.active);

      return matchesSearch && matchesRole && matchesAvailability && matchesActive;
    });
  }

  function renderSummary() {
    if (!state.data) {
      return;
    }

    if (state.previewMode === "loading") {
      if (summaryTotal) {
        summaryTotal.textContent = "...";
      }

      if (summaryActive) {
        summaryActive.textContent = "...";
      }

      if (summaryVolunteers) {
        summaryVolunteers.textContent = "...";
      }

      if (summaryOrganizers) {
        summaryOrganizers.textContent = "...";
      }

      return;
    }

    if (state.previewMode === "empty") {
      if (summaryTotal) {
        summaryTotal.textContent = "0";
      }

      if (summaryActive) {
        summaryActive.textContent = "0";
      }

      if (summaryVolunteers) {
        summaryVolunteers.textContent = "0";
      }

      if (summaryOrganizers) {
        summaryOrganizers.textContent = "0";
      }

      return;
    }

    if (state.previewMode === "error") {
      if (summaryTotal) {
        summaryTotal.textContent = "--";
      }

      if (summaryActive) {
        summaryActive.textContent = "--";
      }

      if (summaryVolunteers) {
        summaryVolunteers.textContent = "--";
      }

      if (summaryOrganizers) {
        summaryOrganizers.textContent = "--";
      }

      return;
    }

    if (summaryTotal) {
      summaryTotal.textContent = String(state.data.summary.totalUsers);
    }

    if (summaryActive) {
      summaryActive.textContent = String(state.data.summary.activeUsers);
    }

    if (summaryVolunteers) {
      summaryVolunteers.textContent = String(state.data.summary.availableVolunteers);
    }

    if (summaryOrganizers) {
      summaryOrganizers.textContent = String(state.data.summary.organizers);
    }
  }

  function renderDetail(detail) {
    if (state.previewMode === "loading") {
      if (detailRole) {
        setBadgeClass(detailRole, "neutral");
        detailRole.textContent = "Loading";
      }

      if (detailName) {
        detailName.textContent = "Loading user detail";
      }

      if (detailMeta) {
        detailMeta.textContent = "Waiting for the selected user detail response.";
      }

      if (detailAvailability) {
        detailAvailability.textContent = "...";
      }

      if (detailStatus) {
        detailStatus.textContent = "Account summary is loading.";
      }

      if (detailPerformance) {
        detailPerformance.textContent = "...";
      }

      if (skillList) {
        skillList.innerHTML = '<li class="tag-chip">Skills are loading</li>';
      }

      if (assignmentList) {
        assignmentList.innerHTML = "<li>User assignments are loading.</li>";
      }

      if (registrationList) {
        registrationList.innerHTML = "<li>User registrations are loading.</li>";
      }

      return;
    }

    if (state.previewMode === "empty") {
      if (detailRole) {
        setBadgeClass(detailRole, "neutral");
        detailRole.textContent = "Empty";
      }

      if (detailName) {
        detailName.textContent = "No user available";
      }

      if (detailMeta) {
        detailMeta.textContent = "The empty state is simulating a successful request with no user records.";
      }

      if (detailAvailability) {
        detailAvailability.textContent = "Not available";
      }

      if (detailStatus) {
        detailStatus.textContent = "No account state is available in the empty preview.";
      }

      if (detailPerformance) {
        detailPerformance.textContent = "0";
      }

      if (skillList) {
        skillList.innerHTML = '<li class="tag-chip">No skills available</li>';
      }

      if (assignmentList) {
        assignmentList.innerHTML = '<li>No assignments are available in the empty preview state.</li>';
      }

      if (registrationList) {
        registrationList.innerHTML = '<li>No registrations are available in the empty preview state.</li>';
      }

      return;
    }

    if (state.previewMode === "error") {
      if (detailRole) {
        setBadgeClass(detailRole, "danger");
        detailRole.textContent = "Error";
      }

      if (detailName) {
        detailName.textContent = "User detail unavailable";
      }

      if (detailMeta) {
        detailMeta.textContent = "The preview is simulating a failed user detail request.";
      }

      if (detailAvailability) {
        detailAvailability.textContent = "--";
      }

      if (detailStatus) {
        detailStatus.textContent = "Account summary is unavailable in the error preview state.";
      }

      if (detailPerformance) {
        detailPerformance.textContent = "--";
      }

      if (skillList) {
        skillList.innerHTML = '<li class="tag-chip">Skills unavailable</li>';
      }

      if (assignmentList) {
        assignmentList.innerHTML = '<li>User assignments are unavailable because the detail request failed.</li>';
      }

      if (registrationList) {
        registrationList.innerHTML = '<li>User registrations are unavailable because the detail request failed.</li>';
      }

      return;
    }

    if (!detail) {
      if (detailRole) {
        setBadgeClass(detailRole, "neutral");
        detailRole.textContent = "Pending";
      }

      if (detailName) {
        detailName.textContent = "No user selected";
      }

      if (detailMeta) {
        detailMeta.textContent = "Select a row to inspect the detail and edit states.";
      }

      if (detailAvailability) {
        detailAvailability.textContent = "Pending";
      }

      if (detailStatus) {
        detailStatus.textContent = "Account state unavailable";
      }

      if (detailPerformance) {
        detailPerformance.textContent = "0";
      }

      if (skillList) {
        skillList.innerHTML = '<li class="tag-chip">No skill data loaded</li>';
      }

      if (assignmentList) {
        assignmentList.innerHTML = "<li>No assignments loaded.</li>";
      }

      if (registrationList) {
        registrationList.innerHTML = "<li>No registration data loaded.</li>";
      }

      return;
    }

    if (detailRole) {
      setBadgeClass(detailRole, getRoleBadgeVariant(detail.role));
      detailRole.textContent = detail.role;
    }

    if (detailName) {
      detailName.textContent = detail.fullName;
    }

    if (detailMeta) {
      detailMeta.textContent = detail.email;
    }

    if (detailAvailability) {
      detailAvailability.textContent = detail.availabilityStatus;
    }

    if (detailStatus) {
      detailStatus.textContent = detail.active ? "Account is active" : "Account is inactive";
    }

    if (detailPerformance) {
      detailPerformance.textContent = String(detail.performanceScore);
    }

    if (skillList) {
      skillList.innerHTML = detail.skills
        .map(function (skill) {
          return '<li class="tag-chip is-selected">' + skill + '</li>';
        })
        .join("");
    }

    if (assignmentList) {
      assignmentList.innerHTML = detail.recentAssignments.length
        ? detail.recentAssignments.map(function (item) {
          return "<li>" + item + "</li>";
        }).join("")
        : "<li>No recent assignments for this user.</li>";
    }

    if (registrationList) {
      registrationList.innerHTML = detail.registeredEvents.length
        ? detail.registeredEvents.map(function (item) {
          return "<li>" + item + "</li>";
        }).join("")
        : "<li>No registered events for this user.</li>";
    }
  }

  function renderTable() {
    var filteredUsers = getFilteredUsers();

    if (state.previewMode === "loading") {
      if (filterSummary) {
        filterSummary.textContent = "Loading user roster preview.";
      }

      if (selectedSummary) {
        selectedSummary.textContent = "Loading current user selection.";
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7"><span class="skeleton"></span></td></tr><tr><td colspan="7"><span class="skeleton"></span></td></tr>';
      }

      return;
    }

    if (state.previewMode === "empty") {
      if (filterSummary) {
        filterSummary.textContent = "Showing 0 of " + state.data.users.length + " users for the empty preview state.";
      }

      if (selectedSummary) {
        selectedSummary.textContent = "No user available in the empty preview state.";
      }

      if (tableBody) {
        tableBody.innerHTML = "";
      }

      if (emptyState) {
        emptyState.hidden = false;
      }

      return;
    }

    if (state.previewMode === "error") {
      if (filterSummary) {
        filterSummary.textContent = "The user roster failed to load in the error preview state.";
      }

      if (selectedSummary) {
        selectedSummary.textContent = "User selection is unavailable during the error preview state.";
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7">The user listing request failed. Use the preview-state reset button to return to ready data.</td></tr>';
      }

      return;
    }

    if (filterSummary) {
      filterSummary.textContent = "Showing " + filteredUsers.length + " of " + state.data.users.length + " users for the current filters.";
    }

    if (emptyState) {
      emptyState.hidden = filteredUsers.length !== 0;
    }

    if (!tableBody) {
      return;
    }

    if (!filteredUsers.length) {
      tableBody.innerHTML = "";
      return;
    }

    tableBody.innerHTML = filteredUsers
      .map(function (user) {
        return '<tr><td><strong>' + user.fullName + '</strong><br /><span class="signal-meta">' + user.skills.join(', ') + '</span></td><td><span class="badge badge-' + getRoleBadgeVariant(user.role) + '">' + user.role + '</span></td><td>' + user.email + '</td><td>' + user.availabilityStatus + '</td><td>' + user.performanceScore + '</td><td><span class="badge badge-' + getStatusBadgeVariant(user.active) + '">' + (user.active ? 'ACTIVE' : 'INACTIVE') + '</span></td><td><div class="table-actions"><button class="button button-ghost" type="button" data-user-action="detail" data-user-id="' + user.userId + '">Detail</button><button class="button button-secondary" type="button" data-user-action="edit" data-user-id="' + user.userId + '">Edit</button></div></td></tr>';
      })
      .join("");
  }

  function splitName(fullName) {
    var parts = fullName.split(" ");
    return {
      firstName: parts.shift() || "",
      lastName: parts.join(" ")
    };
  }

  function transformDetailToForm(detail) {
    if (!detail) {
      return state.data.createTemplate;
    }

    var nameParts = splitName(detail.fullName);

    return {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      email: detail.email,
      password: "",
      role: detail.role,
      active: detail.active,
      availabilityStatus: detail.availabilityStatus,
      skills: detail.skills
    };
  }

  function renderSkillOptions(selectedSkills) {
    if (!formSkillList) {
      return;
    }

    formSkillList.innerHTML = state.data.skillCatalog
      .map(function (skill) {
        var selected = selectedSkills.indexOf(skill) !== -1;
        return '<li class="tag-chip' + (selected ? ' is-selected' : '') + '" data-skill-name="' + skill + '">' + skill + '</li>';
      })
      .join("");
  }

  function renderSelectedSummary(detail) {
    if (!selectedSummary) {
      return;
    }

    if (state.previewMode === "loading") {
      selectedSummary.textContent = "Loading current user selection.";
      return;
    }

    if (state.previewMode === "empty") {
      selectedSummary.textContent = "No user available in the empty preview state.";
      return;
    }

    if (state.previewMode === "error") {
      selectedSummary.textContent = "User selection is unavailable during the error preview state.";
      return;
    }

    if (!detail) {
      selectedSummary.textContent = "No user selected.";
      return;
    }

    selectedSummary.textContent = "Selected " + detail.fullName + " in " + state.formMode + " mode.";
  }

  function renderForm(detail) {
    var formData = state.formMode === "edit" && detail ? transformDetailToForm(detail) : state.data.createTemplate;

    modeButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-mode") === state.formMode);
    });

    if (formCaption) {
      if (state.previewMode === "loading") {
        formCaption.textContent = "Loading the account create and edit surface so pending states can be reviewed.";
      } else if (state.previewMode === "empty") {
        formCaption.textContent = "The empty preview keeps the account form available even when no user records match the current filters.";
      } else if (state.previewMode === "error") {
        formCaption.textContent = "The error preview keeps a safe account-form fallback visible while list and detail requests are unavailable.";
      } else {
        formCaption.textContent = state.formMode === "edit" && detail
          ? "Editing " + detail.fullName + " while keeping skill assignment and account status on the same screen."
          : "Create mode starts from a clean user form while preserving the same role, availability, and skill assignment surface.";
      }
    }

    if (formFirstName) {
      formFirstName.value = formData.firstName;
    }

    if (formLastName) {
      formLastName.value = formData.lastName;
    }

    if (formEmail) {
      formEmail.value = formData.email;
    }

    if (formRole) {
      formRole.value = formData.role;
    }

    if (formAvailability) {
      formAvailability.value = formData.availabilityStatus;
      formAvailability.disabled = formData.role !== "VOLUNTEER";
    }

    if (formPassword) {
      formPassword.value = formData.password;
      formPassword.placeholder = state.formMode === "edit" ? "Leave blank to keep current password" : "Temporary password";
    }

    if (formActive) {
      formActive.checked = !!formData.active;
    }

    if (formNote) {
      if (state.previewMode === "loading") {
        formNote.textContent = "The account form is showing a loading preview state.";
      } else if (state.previewMode === "empty") {
        formNote.textContent = "The account form remains available as a safe empty-state fallback.";
      } else if (state.previewMode === "error") {
        formNote.textContent = "The account form is showing a safe fallback because the error preview state is active.";
      } else {
        formNote.textContent = state.formMode === "edit"
          ? "The current edit surface saves role changes, availability, and skills through the Phase 10 backend user service."
          : "The create surface provisions new staff, volunteer, and student accounts through the live user API.";
      }
    }

    if (saveButton) {
      saveButton.textContent = state.formMode === "edit" ? "Save changes" : "Create user";
      saveButton.disabled = state.previewMode !== "ready";
    }

    if (deactivateButton) {
      deactivateButton.disabled = state.previewMode !== "ready" || state.formMode !== "edit" || !detail || !detail.active;
      deactivateButton.textContent = detail && !detail.active ? "User already inactive" : "Deactivate selected";
    }

    renderSkillOptions(formData.skills);
  }

  function renderAll() {
    var detail = state.previewMode === "ready" ? getSelectedDetail() : null;

    syncPreviewPanel();
    renderSummary();
    renderTable();
    renderDetail(detail);
    renderForm(detail);
    renderSelectedSummary(detail);
  }

  function focusPreview(targetId) {
    var target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function bindInteractions() {
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.searchTerm = event.target.value.trim().toLowerCase();
        renderAll();
      });
    }

    if (roleFilter) {
      roleFilter.addEventListener("change", function (event) {
        state.role = event.target.value;
        renderAll();
      });
    }

    if (availabilityFilter) {
      availabilityFilter.addEventListener("change", function (event) {
        state.availability = event.target.value;
        renderAll();
      });
    }

    if (activeFilter) {
      activeFilter.addEventListener("change", function (event) {
        state.activeState = event.target.value;
        renderAll();
      });
    }

    if (resetFiltersButton) {
      resetFiltersButton.addEventListener("click", function () {
        state.searchTerm = "";
        state.role = "ALL";
        state.availability = "ALL";
        state.activeState = "ALL";

        if (searchInput) {
          searchInput.value = "";
        }

        if (roleFilter) {
          roleFilter.value = "ALL";
        }

        if (availabilityFilter) {
          availabilityFilter.value = "ALL";
        }

        if (activeFilter) {
          activeFilter.value = "ALL";
        }

        renderAll();
      });
    }

    createButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.formMode = "create";
        clearFieldErrors();
        hideFormFeedback();
        renderForm(getSelectedDetail());
        renderSelectedSummary(getSelectedDetail());
        focusPreview("user-form-preview");
      });
    });

    if (focusSelectedButton) {
      focusSelectedButton.addEventListener("click", function () {
        focusPreview("user-detail-preview");
      });
    }

    modeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var nextMode = button.getAttribute("data-mode");

        if (nextMode === "edit" && !state.selectedUserId && state.data.details.length) {
          state.selectedUserId = state.data.details[0].userId;
        }

        state.formMode = nextMode;
        clearFieldErrors();
        hideFormFeedback();
        renderForm(getSelectedDetail());
        renderSelectedSummary(getSelectedDetail());
      });
    });

    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var actionButton = event.target.closest("[data-user-action]");

        if (!actionButton) {
          return;
        }

        state.selectedUserId = Number(actionButton.getAttribute("data-user-id"));
        clearFieldErrors();
        hideFormFeedback();

        if (actionButton.getAttribute("data-user-action") === "edit") {
          state.formMode = "edit";
          focusPreview("user-form-preview");
        } else {
          focusPreview("user-detail-preview");
        }

        renderAll();
      });
    }

    if (formSkillList) {
      formSkillList.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-skill-name]");

        if (!chip || state.previewMode !== "ready") {
          return;
        }

        chip.classList.toggle("is-selected");
      });
    }

    if (saveButton) {
      saveButton.addEventListener("click", function () {
        void submitUser(false);
      });
    }

    if (deactivateButton) {
      deactivateButton.addEventListener("click", function () {
        void submitUser(true);
      });
    }

    if (formRole) {
      formRole.addEventListener("change", function () {
        if (formAvailability) {
          formAvailability.disabled = formRole.value !== "VOLUNTEER";
        }
      });
    }

  }

  if (window.EventFlowMockPreviewState && previewStateShell) {
    previewController = window.EventFlowMockPreviewState.create({
      shell: previewStateShell,
      onChange: function (nextState) {
        state.previewMode = nextState;

        if (nextState !== "ready") {
          state.selectedUserId = null;
          state.formMode = "create";
        } else if (!state.selectedUserId && state.data && state.data.details.length) {
          state.selectedUserId = initialSelectedUserId || state.data.details[0].userId;
        }

        renderAll();
      }
    });
    state.previewMode = previewController.getState();
  }

  function hydratePage() {
    if (!pageApi || !mockData) {
      return;
    }

    var roleContext = pageApi.requireRole(getGateConfig());

    if (!roleContext) {
      return;
    }

    state.data = normalizeData(parseBootstrapData());
    state.formMode = initialMode === "edit" ? "edit" : "create";
    state.selectedUserId = initialSelectedUserId || (state.data.details.length ? state.data.details[0].userId : null);

    populateSelect(roleFilter, state.data.filterOptions.roles);
    populateSelect(availabilityFilter, state.data.filterOptions.availability);
    populateSelect(activeFilter, state.data.filterOptions.activeState);

    pageApi.showReady(roleContext, {
      shell: {
          phaseTitle: "Phase 10 is active.",
          phaseCopy: "Admin user management is now wired to the live backend CRUD slice while preserving the frozen UI contracts.",
          topbarEyebrow: "Admin user management",
          topbarTitle: roleContext.uiConfig ? roleContext.uiConfig.label : "Admin workspace"
      }
    });

    renderAll();
    bindInteractions();
  }

  if (pageApi) {
    pageApi.bindLogout(logoutButtons, "/login");
  }

  hydratePage();
})();