(function () {
  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function stripContextPath(path, contextPath) {
    if (!contextPath) {
      return path;
    }

    return path.indexOf(contextPath) === 0 ? path.slice(contextPath.length) || "/" : path;
  }

  function createRoute(method, template, access, responseDto, handler) {
    var paramNames = [];
    var pattern = new RegExp(
      "^" + template.replace(/\{([^}]+)\}/g, function (_, name) {
        paramNames.push(name);
        return "([^/]+)";
      }) + "$"
    );

    return {
      method: method,
      template: template,
      access: access,
      responseDto: responseDto,
      match: function (requestPath) {
        var matches = requestPath.match(pattern);

        if (!matches) {
          return null;
        }

        return paramNames.reduce(function (params, name, index) {
          params[name] = matches[index + 1];
          return params;
        }, {});
      },
      handler: handler
    };
  }

  function withApiResponse(payload, message) {
    return {
      message: message || "Mock API response generated from frozen frontend fixtures.",
      data: cloneValue(payload)
    };
  }

  function findById(items, key, targetId) {
    return items.find(function (item) {
      return Number(item[key]) === Number(targetId);
    }) || null;
  }

  function getCurrentSession(mockData) {
    var stored = mockData ? mockData.getStoredSession() : null;
    return stored && stored.session ? stored.session : null;
  }

  function getSharedNotifications(mockData, session) {
    if (!mockData || !session) {
      return {
        generatedAt: new Date().toISOString(),
        unreadCount: 0,
        notifications: []
      };
    }

    if (session.role === "VOLUNTEER") {
      var volunteerNotifications = mockData.getVolunteerNotificationData();
      return {
        generatedAt: new Date().toISOString(),
        unreadCount: volunteerNotifications.summary.unreadCount,
        notifications: volunteerNotifications.notifications
      };
    }

    if (session.role === "STUDENT") {
      var studentNotifications = mockData.getStudentNotificationData();
      return {
        generatedAt: new Date().toISOString(),
        unreadCount: studentNotifications.summary.unreadCount,
        notifications: studentNotifications.notifications
      };
    }

    var roleUiConfig = mockData.getRoleUiConfig(session.role);

    return {
      generatedAt: new Date().toISOString(),
      unreadCount: roleUiConfig && roleUiConfig.notifications ? roleUiConfig.notifications.length : 0,
      notifications: roleUiConfig && roleUiConfig.notifications ? roleUiConfig.notifications : []
    };
  }

  function getLiveUpdateFeed(mockData, eventId) {
    var studentDetail = mockData.getStudentEventDetailData();
    var feed = studentDetail.liveFeeds.find(function (item) {
      return Number(item.eventId) === Number(eventId);
    });

    if (feed) {
      return cloneValue(feed);
    }

    return {
      eventId: Number(eventId),
      generatedAt: new Date().toISOString(),
      updates: []
    };
  }

  function getEventHealthSnapshot(mockData, eventId) {
    var adminEvents = mockData.getAdminEventManagementData();
    var adminDetail = adminEvents.details.find(function (item) {
      return Number(item.eventId) === Number(eventId);
    });

    if (adminDetail && adminDetail.healthSnapshot) {
      return cloneValue(adminDetail.healthSnapshot);
    }

    var studentDetail = mockData.getStudentEventDetailData();
    var studentEvent = studentDetail.details.find(function (item) {
      return Number(item.eventId) === Number(eventId);
    });

    return studentEvent && studentEvent.healthSnapshot
      ? cloneValue(studentEvent.healthSnapshot)
      : {
          eventId: Number(eventId),
          healthScore: 0,
          attendanceRatio: 0,
          engagementScore: 0,
          volunteerEfficiencyScore: 0,
          trend: "STABLE",
          snapshotAt: new Date().toISOString()
        };
  }

  function getRoutes() {
    return [
      createRoute("GET", "/api/session", "authenticated", "SessionStatusDto", function (context) {
        return {
          status: 200,
          body: cloneValue(context.session)
        };
      }),
      createRoute("GET", "/api/notifications", "authenticated", "NotificationFeedDto", function (context) {
        return {
          status: 200,
          body: getSharedNotifications(context.mockData, context.session)
        };
      }),
      createRoute("POST", "/api/notifications/{notificationId}/read", "authenticated", "ApiResponse<Void>", function () {
        return {
          status: 200,
          body: withApiResponse(null, "Notification marked as read in the preview fixture layer.")
        };
      }),
      createRoute("GET", "/api/live/events/{eventId}/health", ["ADMIN", "ORGANIZER"], "EventHealthSnapshotDto", function (context) {
        return {
          status: 200,
          body: getEventHealthSnapshot(context.mockData, context.params.eventId)
        };
      }),
      createRoute("GET", "/api/live/events/{eventId}/updates", ["ORGANIZER", "VOLUNTEER", "STUDENT"], "LiveUpdateFeedDto", function (context) {
        return {
          status: 200,
          body: getLiveUpdateFeed(context.mockData, context.params.eventId)
        };
      }),
      createRoute("GET", "/api/admin/dashboard", ["ADMIN"], "AdminDashboardDto", function (context) {
        return {
          status: 200,
          body: context.mockData.getAdminDashboardData()
        };
      }),
      createRoute("GET", "/api/admin/events", ["ADMIN"], "ApiResponse<EventSummaryDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getAdminEventManagementData().events)
        };
      }),
      createRoute("POST", "/api/admin/events", ["ADMIN"], "ApiResponse<EventDetailDto>", function (context) {
        var dataset = context.mockData.getAdminEventManagementData();
        var payload = context.body || {};

        return {
          status: 201,
          body: withApiResponse(
            Object.assign({}, dataset.createTemplate, payload, {
              eventId: 999,
              code: "EVT-999"
            }),
            "Admin event create preview accepted the EventFormRequestDto payload."
          )
        };
      }),
      createRoute("GET", "/api/admin/events/{eventId}", ["ADMIN"], "ApiResponse<EventDetailDto>", function (context) {
        var dataset = context.mockData.getAdminEventManagementData();
        return {
          status: 200,
          body: withApiResponse(findById(dataset.details, "eventId", context.params.eventId))
        };
      }),
      createRoute("PUT", "/api/admin/events/{eventId}", ["ADMIN"], "ApiResponse<EventDetailDto>", function (context) {
        var dataset = context.mockData.getAdminEventManagementData();
        var detail = findById(dataset.details, "eventId", context.params.eventId) || {};
        return {
          status: 200,
          body: withApiResponse(Object.assign({}, detail, context.body || {}), "Admin event update preview accepted the EventFormRequestDto payload.")
        };
      }),
      createRoute("DELETE", "/api/admin/events/{eventId}", ["ADMIN"], "ApiResponse<Void>", function () {
        return {
          status: 200,
          body: withApiResponse(null, "Admin event delete preview acknowledged the request.")
        };
      }),
      createRoute("GET", "/api/admin/events/{eventId}/risks", ["ADMIN"], "ApiResponse<RiskPredictionDto[]>", function (context) {
        var dataset = context.mockData.getAdminEventManagementData();
        var detail = findById(dataset.details, "eventId", context.params.eventId);
        return {
          status: 200,
          body: withApiResponse(detail ? detail.riskPredictions : [])
        };
      }),
      createRoute("GET", "/api/admin/users", ["ADMIN"], "ApiResponse<UserSummaryDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getAdminUserManagementData().users)
        };
      }),
      createRoute("POST", "/api/admin/users", ["ADMIN"], "ApiResponse<UserDetailDto>", function (context) {
        var dataset = context.mockData.getAdminUserManagementData();
        return {
          status: 201,
          body: withApiResponse(Object.assign({}, dataset.createTemplate, context.body || {}, { userId: 999 }))
        };
      }),
      createRoute("GET", "/api/admin/users/{userId}", ["ADMIN"], "ApiResponse<UserDetailDto>", function (context) {
        var dataset = context.mockData.getAdminUserManagementData();
        return {
          status: 200,
          body: withApiResponse(findById(dataset.details, "userId", context.params.userId))
        };
      }),
      createRoute("PUT", "/api/admin/users/{userId}", ["ADMIN"], "ApiResponse<UserDetailDto>", function (context) {
        var dataset = context.mockData.getAdminUserManagementData();
        var detail = findById(dataset.details, "userId", context.params.userId) || {};
        return {
          status: 200,
          body: withApiResponse(Object.assign({}, detail, context.body || {}))
        };
      }),
      createRoute("DELETE", "/api/admin/users/{userId}", ["ADMIN"], "ApiResponse<Void>", function () {
        return {
          status: 200,
          body: withApiResponse(null, "Admin user delete preview acknowledged the request.")
        };
      }),
      createRoute("GET", "/api/admin/reports/{eventId}", ["ADMIN"], "ApiResponse<ReportSummaryDto>", function (context) {
        var dashboard = context.mockData.getAdminDashboardData();
        var detail = context.mockData.getAdminEventManagementData().details.find(function (item) {
          return Number(item.eventId) === Number(context.params.eventId);
        });
        return {
          status: 200,
          body: withApiResponse({
            eventId: Number(context.params.eventId),
            attendanceSummary: detail ? detail.attendancePlan : null,
            feedbackSummary: dashboard.reports.find(function (report) {
              return report.title === "Feedback sentiment";
            }) || null,
            volunteerSummary: dashboard.reports.find(function (report) {
              return report.title === "Volunteer performance";
            }) || null,
            healthSummary: detail ? detail.healthSnapshot : null
          })
        };
      }),
      createRoute("GET", "/api/organizer/dashboard", ["ORGANIZER"], "OrganizerDashboardDto", function (context) {
        return {
          status: 200,
          body: context.mockData.getOrganizerDashboardData()
        };
      }),
      createRoute("GET", "/api/organizer/tasks", ["ORGANIZER"], "ApiResponse<TaskSummaryDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getOrganizerTaskManagementData().tasks)
        };
      }),
      createRoute("POST", "/api/organizer/tasks", ["ORGANIZER"], "ApiResponse<TaskDetailDto>", function (context) {
        var dataset = context.mockData.getOrganizerTaskManagementData();
        return {
          status: 201,
          body: withApiResponse(Object.assign({}, dataset.createTemplate, context.body || {}, { taskId: 999 }))
        };
      }),
      createRoute("GET", "/api/organizer/tasks/{taskId}", ["ORGANIZER"], "ApiResponse<TaskDetailDto>", function (context) {
        var dataset = context.mockData.getOrganizerTaskManagementData();
        return {
          status: 200,
          body: withApiResponse(findById(dataset.details, "taskId", context.params.taskId))
        };
      }),
      createRoute("PUT", "/api/organizer/tasks/{taskId}", ["ORGANIZER"], "ApiResponse<TaskDetailDto>", function (context) {
        var dataset = context.mockData.getOrganizerTaskManagementData();
        var detail = findById(dataset.details, "taskId", context.params.taskId) || {};
        return {
          status: 200,
          body: withApiResponse(Object.assign({}, detail, context.body || {}))
        };
      }),
      createRoute("DELETE", "/api/organizer/tasks/{taskId}", ["ORGANIZER"], "ApiResponse<Void>", function () {
        return {
          status: 200,
          body: withApiResponse(null, "Organizer task delete preview acknowledged the request.")
        };
      }),
      createRoute("GET", "/api/organizer/tasks/{taskId}/assignment-suggestions", ["ORGANIZER"], "ApiResponse<TaskAssignmentSuggestionDto[]>", function (context) {
        var dataset = context.mockData.getOrganizerTaskManagementData();
        var suggestionGroup = dataset.suggestionGroups.find(function (group) {
          return Number(group.taskId) === Number(context.params.taskId);
        });
        return {
          status: 200,
          body: withApiResponse(suggestionGroup ? suggestionGroup.suggestions : [])
        };
      }),
      createRoute("POST", "/api/organizer/tasks/{taskId}/assign", ["ORGANIZER"], "ApiResponse<TaskDetailDto>", function (context) {
        var dataset = context.mockData.getOrganizerTaskManagementData();
        var detail = findById(dataset.details, "taskId", context.params.taskId) || {};
        return {
          status: 200,
          body: withApiResponse(
            Object.assign({}, detail, {
              assignedVolunteer: (context.body && context.body.volunteerId) ? "Assigned in preview" : detail.assignedVolunteer
            }),
            "Organizer assignment preview accepted the TaskAssignmentRequestDto payload."
          )
        };
      }),
      createRoute("GET", "/api/organizer/events/{eventId}/timeline", ["ORGANIZER"], "ApiResponse<TimelineItemDto[]>", function (context) {
        var dataset = context.mockData.getOrganizerOperationsData();
        return {
          status: 200,
          body: withApiResponse(Number(dataset.eventId) === Number(context.params.eventId) ? dataset.timeline : [])
        };
      }),
      createRoute("GET", "/api/organizer/events/{eventId}/schedule-adjustments/suggestion", ["ORGANIZER"], "ApiResponse<ScheduleAdjustmentSuggestionDto>", function (context) {
        var dataset = context.mockData.getOrganizerOperationsData();
        return {
          status: 200,
          body: withApiResponse(Number(dataset.eventId) === Number(context.params.eventId) ? dataset.scheduleAdjustments[0] || null : null)
        };
      }),
      createRoute("POST", "/api/organizer/events/{eventId}/schedule-adjustments", ["ORGANIZER"], "ApiResponse<TimelineItemDto[]>", function (context) {
        var dataset = context.mockData.getOrganizerOperationsData();
        return {
          status: 200,
          body: withApiResponse(Number(dataset.eventId) === Number(context.params.eventId) ? dataset.timeline : [], "Organizer schedule adjustment preview accepted the suggestion payload.")
        };
      }),
      createRoute("GET", "/api/volunteer/dashboard", ["VOLUNTEER"], "VolunteerDashboardDto", function (context) {
        return {
          status: 200,
          body: context.mockData.getVolunteerDashboardData()
        };
      }),
      createRoute("GET", "/api/volunteer/tasks", ["VOLUNTEER"], "ApiResponse<TaskSummaryDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getVolunteerTaskData().tasks)
        };
      }),
      createRoute("GET", "/api/volunteer/tasks/{taskId}", ["VOLUNTEER"], "ApiResponse<TaskDetailDto>", function (context) {
        var dataset = context.mockData.getVolunteerTaskData();
        return {
          status: 200,
          body: withApiResponse(findById(dataset.details, "taskId", context.params.taskId))
        };
      }),
      createRoute("PATCH", "/api/volunteer/tasks/{taskId}/status", ["VOLUNTEER"], "ApiResponse<TaskDetailDto>", function (context) {
        var dataset = context.mockData.getVolunteerTaskData();
        var detail = findById(dataset.details, "taskId", context.params.taskId) || {};
        return {
          status: 200,
          body: withApiResponse(Object.assign({}, detail, context.body || {}), "Volunteer task status preview accepted the VolunteerTaskStatusUpdateRequestDto payload.")
        };
      }),
      createRoute("GET", "/api/volunteer/performance", ["VOLUNTEER"], "ApiResponse<VolunteerPerformanceDto>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getVolunteerPerformanceData())
        };
      }),
      createRoute("GET", "/api/student/dashboard", ["STUDENT"], "StudentDashboardDto", function (context) {
        return {
          status: 200,
          body: context.mockData.getStudentDashboardData()
        };
      }),
      createRoute("GET", "/api/student/events", ["STUDENT"], "ApiResponse<StudentEventCardDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getStudentEventDiscoveryData().events)
        };
      }),
      createRoute("GET", "/api/student/events/{eventId}", ["STUDENT"], "ApiResponse<EventDetailDto>", function (context) {
        var dataset = context.mockData.getStudentEventDetailData();
        return {
          status: 200,
          body: withApiResponse(findById(dataset.details, "eventId", context.params.eventId))
        };
      }),
      createRoute("POST", "/api/student/events/{eventId}/registrations", ["STUDENT"], "ApiResponse<RegistrationStatusDto>", function (context) {
        return {
          status: 200,
          body: withApiResponse({
            eventId: Number(context.params.eventId),
            studentId: context.session.userId,
            status: "REGISTERED",
            registeredAt: new Date().toISOString(),
            checkedInAt: null
          }, "Student registration preview accepted the RegistrationRequestDto payload.")
        };
      }),
      createRoute("GET", "/api/student/registrations", ["STUDENT"], "ApiResponse<RegistrationStatusDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getStudentRegistrationData().registrations)
        };
      }),
      createRoute("POST", "/api/student/events/{eventId}/check-in", ["STUDENT"], "ApiResponse<RegistrationStatusDto>", function (context) {
        return {
          status: 200,
          body: withApiResponse({
            eventId: Number(context.params.eventId),
            studentId: context.session.userId,
            status: "CHECKED_IN",
            registeredAt: new Date().toISOString(),
            checkedInAt: new Date().toISOString()
          }, "Student check-in preview accepted the CheckInRequestDto payload.")
        };
      }),
      createRoute("POST", "/api/student/events/{eventId}/feedback", ["STUDENT"], "ApiResponse<Void>", function () {
        return {
          status: 200,
          body: withApiResponse(null, "Student feedback preview accepted the FeedbackSubmissionRequestDto payload.")
        };
      }),
      createRoute("GET", "/api/student/recommendations", ["STUDENT"], "ApiResponse<EventRecommendationDto[]>", function (context) {
        return {
          status: 200,
          body: withApiResponse(context.mockData.getStudentEventDiscoveryData().recommendations)
        };
      })
    ];
  }

  function normalizeFixtureBody(body) {
    if (body && typeof body === "object" && Object.prototype.hasOwnProperty.call(body, "data") && Object.prototype.hasOwnProperty.call(body, "message")) {
      return {
        message: body.message,
        data: cloneValue(body.data)
      };
    }

    return {
      message: null,
      data: cloneValue(body)
    };
  }

  function resolve(request) {
    var mockData = window.EventFlowMockData || null;
    var requestPath = stripContextPath(request.path || "/", request.contextPath || "");
    var method = (request.method || "GET").toUpperCase();
    var route = getRoutes().find(function (candidate) {
      return candidate.method === method && candidate.match(requestPath);
    });

    if (!mockData) {
      return {
        ok: false,
        status: 503,
        message: "Shared mock data is unavailable.",
        errorCode: "MOCK_DATA_UNAVAILABLE"
      };
    }

    if (!route) {
      return {
        ok: false,
        status: 404,
        message: "No mock fixture is registered for this endpoint.",
        errorCode: "FIXTURE_NOT_FOUND"
      };
    }

    var params = route.match(requestPath) || {};
    var session = getCurrentSession(mockData);
    var access = route.access;
    var allowedRoles = Array.isArray(access) ? access : null;

    if (access === "authenticated" && !session) {
      return {
        ok: false,
        status: 401,
        message: "The mock fixture requires an authenticated session.",
        errorCode: "AUTH_REQUIRED"
      };
    }

    if (allowedRoles && (!session || allowedRoles.indexOf(session.role) === -1)) {
      return {
        ok: false,
        status: session ? 403 : 401,
        message: "The stored session does not have access to this mock fixture.",
        errorCode: session ? "FORBIDDEN" : "AUTH_REQUIRED"
      };
    }

    var result = route.handler({
      params: params,
      query: request.query || {},
      body: request.body || null,
      mockData: mockData,
      session: session
    });
    var normalized = normalizeFixtureBody(result.body);

    return {
      ok: true,
      status: result.status || 200,
      data: normalized.data,
      message: normalized.message,
      responseDto: route.responseDto,
      endpoint: route.template
    };
  }

  function listRoutes() {
    return getRoutes().map(function (route) {
      return {
        method: route.method,
        path: route.template,
        access: route.access,
        responseDto: route.responseDto
      };
    });
  }

  window.EventFlowMockApiFixtures = {
    resolve: resolve,
    listRoutes: listRoutes
  };
})();