(function () {
  function getRoleGateConfig(options) {
    var roleLabel = options.roleLabel || "Restricted";
    var roleKey = roleLabel.toLowerCase();
    var blockedTitle = options.blockedTitle || roleLabel + " preview blocked";
    var phaseTitle = options.phaseTitle || "Phase preview is gated.";
    var phaseCopy = options.phaseCopy || (roleLabel + " pages should only render for matching sessions while frontend flows remain mocked.");

    return {
      missingData: {
        title: "Mock data unavailable",
        message: options.missingDataMessage || ("Shared mock data must load before the " + roleKey + " preview can render."),
        shell: {
          phaseTitle: phaseTitle,
          phaseCopy: phaseCopy,
          topbarEyebrow: "Restricted route",
          topbarTitle: blockedTitle
        }
      },
      missingSession: {
        title: roleLabel + " preview needs a session",
        message: options.missingSessionMessage || ("Open the login preview first and sign in with the " + roleKey + " demo account to view this page."),
        shell: {
          phaseTitle: phaseTitle,
          phaseCopy: phaseCopy,
          topbarEyebrow: "Restricted route",
          topbarTitle: blockedTitle
        }
      },
      wrongRole: {
        title: "This preview is " + roleKey + "-only",
        message: options.wrongRoleMessage || ("The stored session belongs to another role, so the " + roleKey + " content is intentionally hidden."),
        shell: {
          phaseTitle: phaseTitle,
          phaseCopy: phaseCopy,
          topbarEyebrow: "Restricted route",
          topbarTitle: blockedTitle
        }
      }
    };
  }

  function getTaskStatusVariant(status) {
    if (status === "BLOCKED") {
      return "danger";
    }

    if (status === "IN_PROGRESS") {
      return "success";
    }

    if (status === "TODO" || status === "OPEN") {
      return "info";
    }

    if (status === "ASSIGNED") {
      return "warning";
    }

    if (status === "COMPLETED") {
      return "success";
    }

    if (status === "CANCELLED") {
      return "danger";
    }

    return "neutral";
  }

  function getPriorityVariant(priority) {
    if (priority === "HIGH") {
      return "danger";
    }

    if (priority === "MEDIUM") {
      return "warning";
    }

    return "info";
  }

  function getDelaySeverityVariant(severity) {
    if (severity === "HIGH") {
      return "danger";
    }

    if (severity === "MEDIUM") {
      return "warning";
    }

    return "info";
  }

  function getNotificationVariant(type) {
    if (type === "BLOCKER") {
      return "danger";
    }

    if (type === "EVENT_CHANGE" || type === "SCHEDULE_CHANGE") {
      return "warning";
    }

    if (type === "TASK_UPDATE" || type === "REMINDER") {
      return "info";
    }

    if (type === "COMPLETED") {
      return "success";
    }

    return "neutral";
  }

  function groupTasksByStatus(tasks) {
    return tasks.reduce(function (groups, task) {
      if (!groups[task.status]) {
        groups[task.status] = [];
      }

      groups[task.status].push(task);
      return groups;
    }, {
      TODO: [],
      ASSIGNED: [],
      OPEN: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      COMPLETED: [],
      CANCELLED: []
    });
  }

  window.EventFlowMockTaskUiUtils = {
    getRoleGateConfig: getRoleGateConfig,
    getTaskStatusVariant: getTaskStatusVariant,
    getPriorityVariant: getPriorityVariant,
    getDelaySeverityVariant: getDelaySeverityVariant,
    getNotificationVariant: getNotificationVariant,
    groupTasksByStatus: groupTasksByStatus
  };
})();