(function () {
  var demoAccounts = {
    ADMIN: {
      email: "admin@eventflow.demo",
      password: "Admin123!",
      redirectPath: "/admin/dashboard",
      session: {
        userId: 101,
        fullName: "Aarav Kapoor",
        email: "admin@eventflow.demo",
        role: "ADMIN",
        permissions: ["EVENT_MANAGE", "USER_MANAGE", "REPORT_VIEW"],
        unreadNotificationCount: 3,
        lastLoginAt: "2026-04-26T09:00:00Z"
      }
    },
    ORGANIZER: {
      email: "organizer@eventflow.demo",
      password: "Organizer123!",
      redirectPath: "/organizer/dashboard",
      session: {
        userId: 202,
        fullName: "Maya Fernandes",
        email: "organizer@eventflow.demo",
        role: "ORGANIZER",
        permissions: ["TASK_MANAGE", "TASK_ASSIGN", "EVENT_OPERATIONS"],
        unreadNotificationCount: 5,
        lastLoginAt: "2026-04-26T09:06:00Z"
      }
    },
    VOLUNTEER: {
      email: "volunteer@eventflow.demo",
      password: "Volunteer123!",
      redirectPath: "/volunteer/dashboard",
      session: {
        userId: 303,
        fullName: "Neel Sharma",
        email: "volunteer@eventflow.demo",
        role: "VOLUNTEER",
        permissions: ["TASK_VIEW", "TASK_UPDATE", "PERFORMANCE_VIEW"],
        unreadNotificationCount: 2,
        lastLoginAt: "2026-04-26T09:10:00Z"
      }
    },
    STUDENT: {
      email: "student@eventflow.demo",
      password: "Student123!",
      redirectPath: "/student/dashboard",
      session: {
        userId: 404,
        fullName: "Ishita Rao",
        email: "student@eventflow.demo",
        role: "STUDENT",
        permissions: ["EVENT_REGISTER", "CHECKIN", "FEEDBACK_SUBMIT"],
        unreadNotificationCount: 4,
        lastLoginAt: "2026-04-26T09:15:00Z"
      }
    }
  };

  var roleUiConfig = {
    ADMIN: {
      label: "Admin workspace",
      badge: "Admin",
      routes: ["/admin/dashboard", "/admin/events", "/admin/users", "/admin/reports", "/admin/notifications"],
      notifications: [
        { title: "Risk summary refreshed", meta: "Low attendance risk dropped after new registrations" },
        { title: "Volunteer pool updated", meta: "Two inactive volunteer accounts were reactivated" },
        { title: "Health score snapshot ready", meta: "Latest event score moved from 78 to 84" }
      ]
    },
    ORGANIZER: {
      label: "Organizer operations",
      badge: "Organizer",
      routes: ["/organizer/dashboard", "/organizer/tasks", "/organizer/tasks/board", "/organizer/events/{eventId}/operations", "/organizer/notifications"],
      notifications: [
        { title: "Assignment suggestion ready", meta: "Skill-fit ranking generated for stage crew" },
        { title: "Delay warning", meta: "Registration desk setup may slip by 12 minutes" },
        { title: "Schedule adjustment draft", meta: "Hall B timeline update is ready for review" }
      ]
    },
    VOLUNTEER: {
      label: "Volunteer task flow",
      badge: "Volunteer",
      routes: ["/volunteer/dashboard", "/volunteer/tasks", "/volunteer/performance", "/volunteer/notifications"],
      notifications: [
        { title: "New task assigned", meta: "Main hall setup starts at 09:15" },
        { title: "Task updated", meta: "Your deadline moved to 10:30" }
      ]
    },
    STUDENT: {
      label: "Student participation flow",
      badge: "Student",
      routes: ["/student/dashboard", "/student/events", "/student/registrations", "/student/check-in", "/student/feedback", "/student/notifications"],
      notifications: [
        { title: "Recommended event added", meta: "Innovation workshop matches your interests" },
        { title: "Check-in reminder", meta: "Doors open in 20 minutes" },
        { title: "Schedule update", meta: "Keynote shifted to 10:15" }
      ]
    }
  };

  var adminDashboardData = {
    activeEvents: 8,
    liveEvents: 2,
    totalUsers: 124,
    volunteerCoverage: "92%",
    healthOverview: [
      {
        eventName: "City Innovation Summit",
        healthScore: 84,
        attendanceRatio: 0.81,
        engagementScore: 0.74,
        volunteerEfficiencyScore: 0.88,
        trend: "UP",
        snapshotAt: "2026-04-26T09:24:00Z"
      },
      {
        eventName: "Community Builder Expo",
        healthScore: 78,
        attendanceRatio: 0.76,
        engagementScore: 0.71,
        volunteerEfficiencyScore: 0.82,
        trend: "STABLE",
        snapshotAt: "2026-04-26T09:24:00Z"
      }
    ],
    riskAlerts: [
      {
        riskType: "VOLUNTEER_SHORTAGE",
        riskLevel: "MEDIUM",
        score: 0.63,
        headline: "Hall B setup may lose one skilled volunteer during overlap.",
        description: "Two high-priority setup tasks share the same AV skill requirement between 10:00 and 10:30.",
        recommendedAction: "Reassign one backup volunteer before the keynote turnover begins."
      },
      {
        riskType: "LOW_ATTENDANCE",
        riskLevel: "LOW",
        score: 0.31,
        headline: "Workshop room C is slightly under expected registration.",
        description: "Registrations are 9% under forecast but still within the acceptable buffer.",
        recommendedAction: "Promote the workshop inside student recommendations and on the check-in desk screen."
      }
    ],
    recentNotifications: [
      { title: "Resource plan updated", meta: "Projection equipment allocation now covers all live rooms." },
      { title: "Event status changed", meta: "Community Builder Expo moved from REGISTRATION_OPEN to LIVE." },
      { title: "Risk review requested", meta: "Organizer asked for admin approval on a schedule shift." }
    ],
    events: [
      {
        name: "City Innovation Summit",
        status: "LIVE",
        venue: "Main Convention Hall",
        expectedAttendance: 240,
        registeredCount: 228,
        checkedInCount: 194,
        healthScore: 84,
        riskLevel: "MEDIUM"
      },
      {
        name: "Community Builder Expo",
        status: "LIVE",
        venue: "Civic Center North Wing",
        expectedAttendance: 180,
        registeredCount: 171,
        checkedInCount: 143,
        healthScore: 78,
        riskLevel: "LOW"
      },
      {
        name: "Research Futures Meetup",
        status: "REGISTRATION_OPEN",
        venue: "Innovation Lab Auditorium",
        expectedAttendance: 120,
        registeredCount: 97,
        checkedInCount: 0,
        healthScore: 0,
        riskLevel: "LOW"
      }
    ],
    users: [
      {
        fullName: "Maya Fernandes",
        role: "ORGANIZER",
        availabilityStatus: "AVAILABLE",
        performanceScore: 93,
        skills: ["Planning", "Live Ops"]
      },
      {
        fullName: "Neel Sharma",
        role: "VOLUNTEER",
        availabilityStatus: "LIMITED",
        performanceScore: 88,
        skills: ["AV", "Check-In"]
      },
      {
        fullName: "Ishita Rao",
        role: "STUDENT",
        availabilityStatus: "AVAILABLE",
        performanceScore: 0,
        skills: ["Member"]
      }
    ],
    reports: [
      {
        title: "Attendance variance",
        summary: "Registrations are currently 4.6% below total forecast across active events.",
        trend: "+2.1% since yesterday"
      },
      {
        title: "Volunteer performance",
        summary: "Average on-time completion is 89% across the live task pool.",
        trend: "+4.3% this week"
      },
      {
        title: "Feedback sentiment",
        summary: "Early sentiment remains positive with stable neutral responses during check-in.",
        trend: "Negative feedback below alert threshold"
      }
    ]
  };

  var adminEventManagementData = {
    summary: {
      totalEvents: 8,
      draftEvents: 1,
      liveEvents: 2,
      attentionRequired: 2
    },
    filterOptions: {
      statuses: ["ALL", "DRAFT", "REGISTRATION_OPEN", "LIVE", "COMPLETED"],
      categories: ["ALL", "Conference", "Expo", "Workshop", "Meetup"],
      riskLevels: ["ALL", "LOW", "MEDIUM", "HIGH"]
    },
    events: [
      {
        eventId: 501,
        code: "EVT-501",
        name: "City Innovation Summit",
        category: "Conference",
        status: "LIVE",
        venue: "Main Convention Hall",
        startAt: "2026-04-27 09:00",
        endAt: "2026-04-27 18:00",
        expectedAttendance: 240,
        registeredCount: 228,
        checkedInCount: 194,
        healthScore: 84,
        riskLevel: "MEDIUM",
        ownerName: "Maya Fernandes"
      },
      {
        eventId: 502,
        code: "EVT-502",
        name: "Community Builder Expo",
        category: "Expo",
        status: "LIVE",
        venue: "Civic Center North Wing",
        startAt: "2026-04-29 10:00",
        endAt: "2026-04-29 17:30",
        expectedAttendance: 180,
        registeredCount: 171,
        checkedInCount: 143,
        healthScore: 78,
        riskLevel: "LOW",
        ownerName: "Nikhil Mehta"
      },
      {
        eventId: 503,
        code: "EVT-503",
        name: "Research Futures Meetup",
        category: "Meetup",
        status: "REGISTRATION_OPEN",
        venue: "Innovation Lab Auditorium",
        startAt: "2026-05-03 16:00",
        endAt: "2026-05-03 20:00",
        expectedAttendance: 120,
        registeredCount: 97,
        checkedInCount: 0,
        healthScore: 72,
        riskLevel: "LOW",
        ownerName: "Maya Fernandes"
      },
      {
        eventId: 504,
        code: "EVT-504",
        name: "Campus Launch Lab",
        category: "Workshop",
        status: "DRAFT",
        venue: "Startup Studio",
        startAt: "2026-05-08 11:00",
        endAt: "2026-05-08 15:30",
        expectedAttendance: 90,
        registeredCount: 0,
        checkedInCount: 0,
        healthScore: 0,
        riskLevel: "MEDIUM",
        ownerName: "Aarav Kapoor"
      }
    ],
    details: [
      {
        eventId: 501,
        code: "EVT-501",
        name: "City Innovation Summit",
        description: "A flagship public innovation forum with keynote sessions, startup showcases, and volunteer-led wayfinding across three halls.",
        category: "Conference",
        status: "LIVE",
        venue: "Main Convention Hall",
        startAt: "2026-04-27 09:00",
        endAt: "2026-04-27 18:00",
        registrationOpenAt: "2026-04-01 08:00",
        registrationCloseAt: "2026-04-27 08:30",
        expectedAttendance: 240,
        resourcePlan: [
          {
            resourceName: "Stage volunteers",
            quantityRequired: 10,
            quantityAllocated: 9,
            notes: "One AV-capable backup volunteer still needed for the afternoon swap."
          },
          {
            resourceName: "Check-in desks",
            quantityRequired: 4,
            quantityAllocated: 4,
            notes: "Queue lengths remain within target during the morning arrival window."
          },
          {
            resourceName: "Projection kits",
            quantityRequired: 3,
            quantityAllocated: 3,
            notes: "All rooms covered after the latest inventory update."
          }
        ],
        healthSnapshot: {
          eventId: 501,
          healthScore: 84,
          attendanceRatio: 0.81,
          engagementScore: 0.74,
          volunteerEfficiencyScore: 0.88,
          trend: "UP",
          snapshotAt: "2026-04-26T09:24:00Z"
        },
        riskPredictions: [
          {
            riskType: "VOLUNTEER_SHORTAGE",
            riskLevel: "MEDIUM",
            score: 0.63,
            headline: "Hall B setup may lose one skilled volunteer during overlap.",
            description: "Two high-priority setup tasks share the same AV skill requirement between 10:00 and 10:30.",
            recommendedAction: "Reassign one backup volunteer before the keynote turnover begins."
          },
          {
            riskType: "ENTRY_CONGESTION",
            riskLevel: "LOW",
            score: 0.28,
            headline: "North gate check-in queues may briefly exceed the preferred threshold.",
            description: "The main arrival wave is compressed into a 20 minute window.",
            recommendedAction: "Open the overflow desk at 08:50 and shift one volunteer to scanning."
          }
        ],
        timeline: [
          {
            label: "Registration window opens",
            startAt: "2026-04-27 08:15",
            endAt: "2026-04-27 09:00",
            status: "READY"
          },
          {
            label: "Keynote and live stream",
            startAt: "2026-04-27 09:30",
            endAt: "2026-04-27 10:30",
            status: "LIVE"
          },
          {
            label: "Expo floor rotation",
            startAt: "2026-04-27 11:00",
            endAt: "2026-04-27 16:30",
            status: "UPCOMING"
          }
        ],
        attendancePlan: {
          forecastFillRate: "95%",
          projectedWalkIns: 18,
          noShowBuffer: "8%",
          volunteerCoverage: "92%",
          note: "The current attendance forecast stays inside the safe staffing buffer if one backup AV volunteer is added."
        }
      },
      {
        eventId: 504,
        code: "EVT-504",
        name: "Campus Launch Lab",
        description: "A hands-on workshop for student founders with mentor clinics, registration cap controls, and resource-heavy breakout zones.",
        category: "Workshop",
        status: "DRAFT",
        venue: "Startup Studio",
        startAt: "2026-05-08 11:00",
        endAt: "2026-05-08 15:30",
        registrationOpenAt: "2026-04-30 09:00",
        registrationCloseAt: "2026-05-08 09:30",
        expectedAttendance: 90,
        resourcePlan: [
          {
            resourceName: "Mentor pods",
            quantityRequired: 6,
            quantityAllocated: 4,
            notes: "Two external mentors still need to be confirmed."
          },
          {
            resourceName: "Workshop kits",
            quantityRequired: 90,
            quantityAllocated: 72,
            notes: "Procurement order is pending approval."
          },
          {
            resourceName: "Welcome desk volunteers",
            quantityRequired: 4,
            quantityAllocated: 3,
            notes: "One morning shift gap remains."
          }
        ],
        healthSnapshot: {
          eventId: 504,
          healthScore: 68,
          attendanceRatio: 0.52,
          engagementScore: 0.7,
          volunteerEfficiencyScore: 0.76,
          trend: "STABLE",
          snapshotAt: "2026-04-26T09:28:00Z"
        },
        riskPredictions: [
          {
            riskType: "RESOURCE_GAP",
            riskLevel: "MEDIUM",
            score: 0.58,
            headline: "Resource allocation is behind the target for workshop kits.",
            description: "Only 80% of the required materials are currently available against the draft plan.",
            recommendedAction: "Approve the pending procurement order before publishing the event."
          }
        ],
        timeline: [
          {
            label: "Draft review",
            startAt: "2026-04-29 15:00",
            endAt: "2026-04-29 15:45",
            status: "PLANNED"
          },
          {
            label: "Open registrations",
            startAt: "2026-04-30 09:00",
            endAt: "2026-05-08 09:30",
            status: "PLANNED"
          },
          {
            label: "Mentor clinic blocks",
            startAt: "2026-05-08 12:00",
            endAt: "2026-05-08 15:00",
            status: "PLANNED"
          }
        ],
        attendancePlan: {
          forecastFillRate: "73%",
          projectedWalkIns: 9,
          noShowBuffer: "11%",
          volunteerCoverage: "75%",
          note: "Publishing should wait until mentor and materials coverage move above the minimum threshold."
        }
      }
    ],
    createTemplate: {
      name: "",
      description: "",
      category: "Workshop",
      venue: "",
      startAt: "",
      endAt: "",
      registrationOpenAt: "",
      registrationCloseAt: "",
      expectedAttendance: 120,
      status: "DRAFT",
      resourcePlan: [
        {
          resourceName: "Welcome desk volunteers",
          quantityRequired: 4,
          quantityAllocated: 0,
          notes: ""
        },
        {
          resourceName: "Wayfinding signage",
          quantityRequired: 12,
          quantityAllocated: 0,
          notes: ""
        }
      ],
      attendancePlan: {
        forecastFillRate: "0%",
        projectedWalkIns: 0,
        noShowBuffer: "10%",
        volunteerCoverage: "0%",
        note: "Draft attendance planning will update after registrations start."
      }
    }
  };

  var adminUserManagementData = {
    summary: {
      totalUsers: 124,
      activeUsers: 118,
      availableVolunteers: 34,
      organizers: 9
    },
    filterOptions: {
      roles: ["ALL", "ADMIN", "ORGANIZER", "VOLUNTEER", "STUDENT"],
      availability: ["ALL", "AVAILABLE", "LIMITED", "UNAVAILABLE"],
      activeState: ["ALL", "ACTIVE", "INACTIVE"]
    },
    skillCatalog: ["Planning", "Live Ops", "AV", "Check-In", "Safety", "Hospitality", "Crowd Support", "Mentoring"],
    users: [
      {
        userId: 202,
        fullName: "Maya Fernandes",
        email: "organizer@eventflow.demo",
        role: "ORGANIZER",
        active: true,
        availabilityStatus: "AVAILABLE",
        performanceScore: 93,
        skills: ["Planning", "Live Ops"]
      },
      {
        userId: 303,
        fullName: "Neel Sharma",
        email: "volunteer@eventflow.demo",
        role: "VOLUNTEER",
        active: true,
        availabilityStatus: "LIMITED",
        performanceScore: 88,
        skills: ["AV", "Check-In", "Safety"]
      },
      {
        userId: 404,
        fullName: "Ishita Rao",
        email: "student@eventflow.demo",
        role: "STUDENT",
        active: true,
        availabilityStatus: "AVAILABLE",
        performanceScore: 0,
        skills: ["Member"]
      },
      {
        userId: 118,
        fullName: "Sana Qureshi",
        email: "sana.qureshi@eventflow.demo",
        role: "VOLUNTEER",
        active: false,
        availabilityStatus: "UNAVAILABLE",
        performanceScore: 81,
        skills: ["Hospitality", "Crowd Support"]
      }
    ],
    details: [
      {
        userId: 202,
        fullName: "Maya Fernandes",
        email: "organizer@eventflow.demo",
        role: "ORGANIZER",
        active: true,
        availabilityStatus: "AVAILABLE",
        performanceScore: 93,
        skills: ["Planning", "Live Ops"],
        recentAssignments: [
          "City Innovation Summit live operations lead",
          "Research Futures Meetup floor plan approval"
        ],
        registeredEvents: []
      },
      {
        userId: 303,
        fullName: "Neel Sharma",
        email: "volunteer@eventflow.demo",
        role: "VOLUNTEER",
        active: true,
        availabilityStatus: "LIMITED",
        performanceScore: 88,
        skills: ["AV", "Check-In", "Safety"],
        recentAssignments: [
          "Main hall AV desk",
          "North gate check-in fallback shift"
        ],
        registeredEvents: []
      },
      {
        userId: 404,
        fullName: "Ishita Rao",
        email: "student@eventflow.demo",
        role: "STUDENT",
        active: true,
        availabilityStatus: "AVAILABLE",
        performanceScore: 0,
        skills: ["Member"],
        recentAssignments: [],
        registeredEvents: [
          "City Innovation Summit",
          "Community Builder Expo"
        ]
      },
      {
        userId: 118,
        fullName: "Sana Qureshi",
        email: "sana.qureshi@eventflow.demo",
        role: "VOLUNTEER",
        active: false,
        availabilityStatus: "UNAVAILABLE",
        performanceScore: 81,
        skills: ["Hospitality", "Crowd Support"],
        recentAssignments: [
          "Welcome desk coordination"
        ],
        registeredEvents: []
      }
    ],
    createTemplate: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "VOLUNTEER",
      active: true,
      availabilityStatus: "AVAILABLE",
      skills: ["Check-In"]
    }
  };

  var organizerDashboardData = {
    openTasks: 5,
    inProgressTasks: 6,
    blockedTasks: 2,
    availableVolunteers: 18,
    delayAlerts: [
      {
        taskId: 901,
        eventId: 501,
        severity: "MEDIUM",
        message: "Registration desk readiness may slip by 12 minutes during the first arrival wave.",
        suggestedAction: "Move one floating volunteer from signage deployment to badge scanning before 08:35."
      },
      {
        taskId: 904,
        eventId: 501,
        severity: "LOW",
        message: "Workshop room reset is compressing the AV handoff buffer.",
        suggestedAction: "Advance microphone check by 10 minutes and confirm spare batteries in the prep bay."
      }
    ],
    recentAssignments: [
      {
        taskId: 901,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Registration desk readiness",
        priority: "HIGH",
        status: "IN_PROGRESS",
        deadlineAt: "2026-04-27 08:45",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: true
      },
      {
        taskId: 906,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Overflow queue signage deployment",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        deadlineAt: "2026-04-27 08:30",
        assignedVolunteerName: "Ritika Malhotra",
        delayFlag: false
      },
      {
        taskId: 912,
        eventId: 502,
        eventName: "Community Builder Expo",
        title: "Sponsor booth power check",
        priority: "MEDIUM",
        status: "OPEN",
        deadlineAt: "2026-04-29 09:15",
        assignedVolunteerName: "Unassigned",
        delayFlag: false
      }
    ],
    volunteerSuggestions: [
      {
        volunteerId: 303,
        volunteerName: "Neel Sharma",
        skillMatchScore: 0.93,
        availabilityScore: 0.74,
        performanceScore: 0.88,
        totalScore: 0.87,
        explanation: [
          "Strong AV and check-in overlap for the registration desk.",
          "Has recent success on high-traffic entry tasks."
        ]
      },
      {
        volunteerId: 118,
        volunteerName: "Sana Qureshi",
        skillMatchScore: 0.81,
        availabilityScore: 0.48,
        performanceScore: 0.81,
        totalScore: 0.7,
        explanation: [
          "Good hospitality fit for guest-facing tasks.",
          "Currently inactive, so confirmation is still required before assignment."
        ]
      }
    ]
  };

  var organizerTaskManagementData = {
    summary: {
      totalTasks: 13,
      dueToday: 7,
      blockedTasks: 2,
      unassignedTasks: 3
    },
    filterOptions: {
      statuses: ["ALL", "OPEN", "IN_PROGRESS", "BLOCKED", "COMPLETED"],
      priorities: ["ALL", "HIGH", "MEDIUM", "LOW"],
      events: ["ALL", "City Innovation Summit", "Community Builder Expo", "Research Futures Meetup"]
    },
    tasks: [
      {
        taskId: 901,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Registration desk readiness",
        priority: "HIGH",
        status: "IN_PROGRESS",
        deadlineAt: "2026-04-27 08:45",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: true
      },
      {
        taskId: 902,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Badge printer calibration",
        priority: "HIGH",
        status: "OPEN",
        deadlineAt: "2026-04-27 08:20",
        assignedVolunteerName: "Unassigned",
        delayFlag: false
      },
      {
        taskId: 904,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Workshop room reset and microphone handoff",
        priority: "MEDIUM",
        status: "BLOCKED",
        deadlineAt: "2026-04-27 10:40",
        assignedVolunteerName: "Priya Nair",
        delayFlag: true
      },
      {
        taskId: 906,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Overflow queue signage deployment",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        deadlineAt: "2026-04-27 08:30",
        assignedVolunteerName: "Ritika Malhotra",
        delayFlag: false
      },
      {
        taskId: 912,
        eventId: 502,
        eventName: "Community Builder Expo",
        title: "Sponsor booth power check",
        priority: "MEDIUM",
        status: "OPEN",
        deadlineAt: "2026-04-29 09:15",
        assignedVolunteerName: "Unassigned",
        delayFlag: false
      },
      {
        taskId: 915,
        eventId: 503,
        eventName: "Research Futures Meetup",
        title: "Speaker prep room hospitality",
        priority: "LOW",
        status: "COMPLETED",
        deadlineAt: "2026-05-03 15:20",
        assignedVolunteerName: "Aditya Sen",
        delayFlag: false
      }
    ],
    details: [
      {
        taskId: 901,
        eventId: 501,
        title: "Registration desk readiness",
        description: "Open the front desk lanes, confirm badge scanning, and keep entry flow under the target queue threshold before the keynote arrival wave.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        requiredSkills: ["Check-In", "Crowd Support"],
        dependencies: ["Badge printer calibration"],
        assignedVolunteer: "Neel Sharma",
        deadlineAt: "2026-04-27 08:45",
        activityFeed: [
          { title: "Assignment confirmed", meta: "Neel Sharma accepted the task at 08:02." },
          { title: "Queue threshold warning", meta: "Entry queue forecast climbed above the preferred buffer at 08:14." }
        ]
      },
      {
        taskId: 902,
        eventId: 501,
        title: "Badge printer calibration",
        description: "Run the badge printer test cycle, confirm spare media, and sign off before the first attendee arrival window.",
        priority: "HIGH",
        status: "OPEN",
        requiredSkills: ["AV", "Check-In"],
        dependencies: ["Power strip routing"],
        assignedVolunteer: "Unassigned",
        deadlineAt: "2026-04-27 08:20",
        activityFeed: [
          { title: "Awaiting assignment", meta: "Organizer requested a volunteer with AV familiarity." }
        ]
      },
      {
        taskId: 904,
        eventId: 501,
        title: "Workshop room reset and microphone handoff",
        description: "Reset the workshop room after the morning clinic and complete the microphone handoff for the panel session.",
        priority: "MEDIUM",
        status: "BLOCKED",
        requiredSkills: ["AV", "Live Ops"],
        dependencies: ["Panel agenda confirmation", "Spare battery delivery"],
        assignedVolunteer: "Priya Nair",
        deadlineAt: "2026-04-27 10:40",
        activityFeed: [
          { title: "Blocked by missing battery pack", meta: "The reset cannot complete until the spare pack arrives from storage." }
        ]
      },
      {
        taskId: 906,
        eventId: 501,
        title: "Overflow queue signage deployment",
        description: "Place directional signage and volunteer markers for the overflow queue near the north gate entrance.",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        requiredSkills: ["Crowd Support", "Hospitality"],
        dependencies: ["Final venue layout approval"],
        assignedVolunteer: "Ritika Malhotra",
        deadlineAt: "2026-04-27 08:30",
        activityFeed: [
          { title: "Signage kits staged", meta: "All directional kits were staged near the north gate at 08:05." }
        ]
      },
      {
        taskId: 912,
        eventId: 502,
        title: "Sponsor booth power check",
        description: "Verify booth power strips, extension safety, and monitor boot sequence before the expo floor opens.",
        priority: "MEDIUM",
        status: "OPEN",
        requiredSkills: ["AV", "Safety"],
        dependencies: ["Sponsor booth layout sign-off"],
        assignedVolunteer: "Unassigned",
        deadlineAt: "2026-04-29 09:15",
        activityFeed: [
          { title: "Pending setup window", meta: "The sponsor zone becomes available for setup at 08:40." }
        ]
      },
      {
        taskId: 915,
        eventId: 503,
        title: "Speaker prep room hospitality",
        description: "Restock the prep room, confirm signage, and keep the speaker lounge ready before check-in closes.",
        priority: "LOW",
        status: "COMPLETED",
        requiredSkills: ["Hospitality"],
        dependencies: [],
        assignedVolunteer: "Aditya Sen",
        deadlineAt: "2026-05-03 15:20",
        activityFeed: [
          { title: "Task completed", meta: "Hospitality prep was completed ahead of schedule at 15:05." }
        ]
      }
    ],
    suggestionGroups: [
      {
        taskId: 902,
        suggestions: [
          {
            volunteerId: 303,
            volunteerName: "Neel Sharma",
            skillMatchScore: 0.95,
            availabilityScore: 0.7,
            performanceScore: 0.88,
            totalScore: 0.88,
            explanation: [
              "Strong AV overlap with printer calibration needs.",
              "Already active on adjacent check-in workflows, so handoff cost is low."
            ]
          },
          {
            volunteerId: 118,
            volunteerName: "Sana Qureshi",
            skillMatchScore: 0.68,
            availabilityScore: 0.48,
            performanceScore: 0.81,
            totalScore: 0.63,
            explanation: [
              "Moderate fit on guest-facing setup tasks.",
              "Availability still needs confirmation before reassignment."
            ]
          }
        ]
      },
      {
        taskId: 904,
        suggestions: [
          {
            volunteerId: 303,
            volunteerName: "Neel Sharma",
            skillMatchScore: 0.92,
            availabilityScore: 0.61,
            performanceScore: 0.88,
            totalScore: 0.83,
            explanation: [
              "AV handoff is strongly aligned to his recent task history.",
              "Can resolve the blocker quickly if the spare battery pack is staged nearby."
            ]
          }
        ]
      }
    ],
    createTemplate: {
      eventId: 501,
      title: "",
      description: "",
      priority: "MEDIUM",
      requiredSkills: ["Check-In"],
      dependencyTaskIds: [],
      requiredStartAt: "",
      deadlineAt: "",
      status: "OPEN"
    }
  };

  var organizerOperationsData = {
    eventId: 501,
    eventName: "City Innovation Summit",
    eventWindow: "2026-04-27 08:15 to 18:00",
    timeline: [
      {
        timelineItemId: 1,
        label: "Registration desks active",
        startAt: "2026-04-27 08:15",
        endAt: "2026-04-27 09:00",
        status: "LIVE",
        relatedTaskIds: [901, 902, 906]
      },
      {
        timelineItemId: 2,
        label: "Keynote room turnover",
        startAt: "2026-04-27 09:05",
        endAt: "2026-04-27 09:35",
        status: "UPCOMING",
        relatedTaskIds: [904]
      },
      {
        timelineItemId: 3,
        label: "Workshop room reset",
        startAt: "2026-04-27 10:10",
        endAt: "2026-04-27 10:45",
        status: "PLANNED",
        relatedTaskIds: [904]
      },
      {
        timelineItemId: 4,
        label: "Expo floor volunteer rotation",
        startAt: "2026-04-27 11:00",
        endAt: "2026-04-27 16:00",
        status: "PLANNED",
        relatedTaskIds: [906]
      }
    ],
    delayAlerts: [
      {
        taskId: 901,
        eventId: 501,
        severity: "MEDIUM",
        message: "Registration desk readiness may slip by 12 minutes during the first arrival wave.",
        suggestedAction: "Move one floating volunteer from signage deployment to badge scanning before 08:35."
      },
      {
        taskId: 904,
        eventId: 501,
        severity: "LOW",
        message: "Workshop room reset is compressing the AV handoff buffer.",
        suggestedAction: "Advance microphone check by 10 minutes and confirm spare batteries in the prep bay."
      }
    ],
    scheduleAdjustments: [
      {
        eventId: 501,
        reasonCode: "ENTRY_FLOW",
        headline: "Open the overflow check-in lane earlier",
        description: "Expected attendee arrival is clustering around the keynote start, increasing pressure on the north gate.",
        currentWindow: "08:45 to 09:00",
        suggestedWindow: "08:35 to 09:00",
        impactedTaskIds: [901, 906]
      },
      {
        eventId: 501,
        reasonCode: "ROOM_RESET",
        headline: "Pull forward the workshop microphone handoff",
        description: "The room reset and mic handoff are sharing a narrow buffer that could affect panel start time.",
        currentWindow: "10:25 to 10:40",
        suggestedWindow: "10:15 to 10:35",
        impactedTaskIds: [904]
      }
    ],
    workloadLanes: [
      {
        label: "North gate",
        activeVolunteers: 4,
        taskLoad: "High",
        note: "Entry queue pressure is concentrated here during the keynote arrival wave."
      },
      {
        label: "Main hall AV",
        activeVolunteers: 3,
        taskLoad: "Moderate",
        note: "Coverage is healthy, but the spare battery dependency is still open."
      },
      {
        label: "Workshop rooms",
        activeVolunteers: 2,
        taskLoad: "High",
        note: "Reset windows are tight around the panel session handoff."
      }
    ]
  };

  var volunteerDashboardData = {
    assignedTasks: [
      {
        taskId: 901,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Registration desk readiness",
        priority: "HIGH",
        status: "IN_PROGRESS",
        deadlineAt: "2026-04-27 08:45",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: true
      },
      {
        taskId: 918,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Keynote speaker check-in materials",
        priority: "MEDIUM",
        status: "OPEN",
        deadlineAt: "2026-04-27 09:05",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: false
      },
      {
        taskId: 920,
        eventId: 503,
        eventName: "Research Futures Meetup",
        title: "Emergency exit signage sweep",
        priority: "HIGH",
        status: "BLOCKED",
        deadlineAt: "2026-04-26 08:40",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: true
      }
    ],
    dueSoonCount: 2,
    overdueCount: 1,
    performanceSummary: {
      completionRate: 0.92,
      onTimeRate: 0.87,
      activeTaskCount: 3,
      completedTaskCount: 18,
      recentEvents: [
        {
          eventId: 501,
          eventName: "City Innovation Summit",
          roleLabel: "Check-in and AV support",
          completedTasks: 6,
          onTimeRate: 0.91,
          highlight: "Handled queue pressure cleanly during the morning arrival wave."
        },
        {
          eventId: 498,
          eventName: "Startup Mentor Circle",
          roleLabel: "Floor support",
          completedTasks: 4,
          onTimeRate: 0.84,
          highlight: "Recovered a room change without missing the speaker handoff window."
        },
        {
          eventId: 494,
          eventName: "Community Builder Expo",
          roleLabel: "Expo check-in",
          completedTasks: 5,
          onTimeRate: 0.88,
          highlight: "Stayed above the target throughput during the midday rush."
        }
      ]
    },
    recentNotifications: [
      {
        notificationId: 1,
        title: "Registration queue forecast updated",
        meta: "Badge scanning support is needed 10 minutes earlier for City Innovation Summit.",
        type: "TASK_UPDATE",
        occurredAt: "2026-04-26T09:18:00Z",
        isUnread: true
      },
      {
        notificationId: 2,
        title: "Workshop signage sweep blocked",
        meta: "The exit signage check is waiting on the revised room map from live ops.",
        type: "BLOCKER",
        occurredAt: "2026-04-26T08:44:00Z",
        isUnread: true
      },
      {
        notificationId: 3,
        title: "Yesterday's hospitality task closed",
        meta: "Your prep-room support was marked complete ahead of schedule.",
        type: "COMPLETED",
        occurredAt: "2026-04-25T18:10:00Z",
        isUnread: false
      }
    ]
  };

  var volunteerTaskData = {
    summary: {
      assignedCount: 4,
      dueSoonCount: 2,
      overdueCount: 1,
      completedCount: 1
    },
    filterOptions: {
      statuses: ["ALL", "OPEN", "IN_PROGRESS", "BLOCKED", "COMPLETED"],
      priorities: ["ALL", "HIGH", "MEDIUM", "LOW"],
      events: ["ALL", "City Innovation Summit", "Research Futures Meetup", "Startup Mentor Circle"]
    },
    statusOptions: ["OPEN", "IN_PROGRESS", "BLOCKED", "COMPLETED"],
    tasks: [
      {
        taskId: 901,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Registration desk readiness",
        priority: "HIGH",
        status: "IN_PROGRESS",
        deadlineAt: "2026-04-27 08:45",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: true
      },
      {
        taskId: 918,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Keynote speaker check-in materials",
        priority: "MEDIUM",
        status: "OPEN",
        deadlineAt: "2026-04-27 09:05",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: false
      },
      {
        taskId: 920,
        eventId: 503,
        eventName: "Research Futures Meetup",
        title: "Emergency exit signage sweep",
        priority: "HIGH",
        status: "BLOCKED",
        deadlineAt: "2026-04-26 08:40",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: true
      },
      {
        taskId: 914,
        eventId: 498,
        eventName: "Startup Mentor Circle",
        title: "Speaker lounge hospitality reset",
        priority: "LOW",
        status: "COMPLETED",
        deadlineAt: "2026-04-25 17:20",
        assignedVolunteerName: "Neel Sharma",
        delayFlag: false
      }
    ],
    details: [
      {
        taskId: 901,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Registration desk readiness",
        description: "Open the front desk lanes, confirm badge scanning, and keep entry flow under the target queue threshold before the keynote arrival wave.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        instructions: [
          "Confirm both badge scanners are active before 08:30.",
          "Keep the overflow queue cones staged near the north gate.",
          "Escalate to the organizer if the queue exceeds the marked threshold for more than five minutes."
        ],
        dependencies: ["Badge printer calibration", "North gate signage placement"],
        location: "North gate registration hall",
        assignedVolunteer: "Neel Sharma",
        deadlineAt: "2026-04-27 08:45",
        blockerNote: "",
        activityFeed: [
          { title: "Shift started", meta: "You checked in for the registration support shift at 08:02." },
          { title: "Queue threshold warning", meta: "Organizer flagged an early arrival spike at 08:14." }
        ]
      },
      {
        taskId: 918,
        eventId: 501,
        eventName: "City Innovation Summit",
        title: "Keynote speaker check-in materials",
        description: "Prepare the speaker packets, confirm the name cards, and stage the welcome materials before the keynote green room opens.",
        priority: "MEDIUM",
        status: "OPEN",
        instructions: [
          "Collect the latest speaker packet from the organizer desk.",
          "Verify the green room welcome cards match the final keynote roster.",
          "Stage backup markers and badge sleeves before 08:55."
        ],
        dependencies: ["Final keynote roster approval"],
        location: "Speaker welcome desk",
        assignedVolunteer: "Neel Sharma",
        deadlineAt: "2026-04-27 09:05",
        blockerNote: "",
        activityFeed: [
          { title: "Task assigned", meta: "The organizer assigned this task after the welcome desk walkthrough." }
        ]
      },
      {
        taskId: 920,
        eventId: 503,
        eventName: "Research Futures Meetup",
        title: "Emergency exit signage sweep",
        description: "Verify that updated directional signage is in place across the workshop corridor and mark any missing panels before doors reopen.",
        priority: "HIGH",
        status: "BLOCKED",
        instructions: [
          "Walk the corridor in order from room A to room D.",
          "Photograph any missing or damaged exit signage panels.",
          "Wait for the revised room map before placing replacement arrows."
        ],
        dependencies: ["Revised room map"],
        location: "Workshop corridor",
        assignedVolunteer: "Neel Sharma",
        deadlineAt: "2026-04-26 08:40",
        blockerNote: "Waiting on the revised room map from live operations.",
        activityFeed: [
          { title: "Task blocked", meta: "Live ops paused the signage sweep until the revised map is approved." },
          { title: "Overdue warning", meta: "The task missed its first review window at 08:40." }
        ]
      },
      {
        taskId: 914,
        eventId: 498,
        eventName: "Startup Mentor Circle",
        title: "Speaker lounge hospitality reset",
        description: "Restock the lounge, refresh the speaker welcome table, and confirm signage before the mentor circle breakout begins.",
        priority: "LOW",
        status: "COMPLETED",
        instructions: [
          "Replace used table cards and water service.",
          "Confirm the lounge signage reflects the latest breakout room names."
        ],
        dependencies: [],
        location: "Speaker lounge",
        assignedVolunteer: "Neel Sharma",
        deadlineAt: "2026-04-25 17:20",
        blockerNote: "",
        activityFeed: [
          { title: "Task completed", meta: "Hospitality reset finished ahead of schedule at 17:04." }
        ]
      }
    ],
    statusUpdateTemplate: {
      status: "IN_PROGRESS",
      blockerNote: ""
    }
  };

  var volunteerPerformanceData = {
    completionRate: 0.92,
    onTimeRate: 0.87,
    activeTaskCount: 3,
    completedTaskCount: 18,
    recentEvents: [
      {
        eventId: 501,
        eventName: "City Innovation Summit",
        roleLabel: "Check-in and AV support",
        completedTasks: 6,
        onTimeRate: 0.91,
        completionRate: 0.95,
        highlight: "Recovered the badge scanning queue without escalation."
      },
      {
        eventId: 498,
        eventName: "Startup Mentor Circle",
        roleLabel: "Floor support",
        completedTasks: 4,
        onTimeRate: 0.84,
        completionRate: 0.89,
        highlight: "Maintained room turnover timing across two breakout changes."
      },
      {
        eventId: 494,
        eventName: "Community Builder Expo",
        roleLabel: "Expo check-in",
        completedTasks: 5,
        onTimeRate: 0.88,
        completionRate: 0.93,
        highlight: "Supported the welcome desk during the peak midday arrival window."
      }
    ]
  };

  var volunteerNotificationData = {
    summary: {
      unreadCount: 2,
      assignmentUpdates: 2,
      eventChanges: 1
    },
    notifications: [
      {
        notificationId: 1,
        title: "Registration queue forecast updated",
        meta: "Badge scanning support is needed 10 minutes earlier for City Innovation Summit.",
        type: "TASK_UPDATE",
        occurredAt: "2026-04-26T09:18:00Z",
        isUnread: true,
        route: "/volunteer/tasks/{taskId}"
      },
      {
        notificationId: 2,
        title: "Workshop signage sweep blocked",
        meta: "The exit signage check is waiting on the revised room map from live ops.",
        type: "BLOCKER",
        occurredAt: "2026-04-26T08:44:00Z",
        isUnread: true,
        route: "/volunteer/tasks/{taskId}"
      },
      {
        notificationId: 3,
        title: "Green room timing shifted by 15 minutes",
        meta: "Speaker check-in materials can now be staged after 08:50 instead of 08:35.",
        type: "EVENT_CHANGE",
        occurredAt: "2026-04-26T08:10:00Z",
        isUnread: false,
        route: "/volunteer/dashboard"
      },
      {
        notificationId: 4,
        title: "Yesterday's hospitality task closed",
        meta: "Your prep-room support was marked complete ahead of schedule.",
        type: "COMPLETED",
        occurredAt: "2026-04-25T18:10:00Z",
        isUnread: false,
        route: "/volunteer/performance"
      }
    ]
  };

  var studentDashboardData = {
    recommendedEvents: [
      {
        eventId: 501,
        name: "City Innovation Summit",
        score: 0.94,
        reasonTags: ["AI systems", "startup demos", "networking"],
        headline: "Strong fit for your product, innovation, and founder-network interests.",
        category: "Innovation",
        venue: "Main Convention Hall",
        startAt: "2026-04-27 09:00",
        endAt: "2026-04-27 18:00",
        registrationStatus: "OPEN",
        capacityState: "LIMITED",
        highlightBadge: "Trending"
      },
      {
        eventId: 503,
        name: "Research Futures Meetup",
        score: 0.89,
        reasonTags: ["research talks", "mentoring", "grad prep"],
        headline: "High overlap with your research club activity and mentorship interests.",
        category: "Research",
        venue: "Innovation Lab",
        startAt: "2026-05-03 14:00",
        endAt: "2026-05-03 18:30",
        registrationStatus: "OPEN",
        capacityState: "AVAILABLE",
        highlightBadge: "Recommended"
      },
      {
        eventId: 507,
        name: "Design Systems Studio",
        score: 0.82,
        reasonTags: ["UI craft", "portfolio", "hands-on"],
        headline: "A practical studio session that complements your current frontend work interests.",
        category: "Workshop",
        venue: "Studio 4",
        startAt: "2026-05-06 16:00",
        endAt: "2026-05-06 18:00",
        registrationStatus: "OPEN",
        capacityState: "AVAILABLE",
        highlightBadge: "Hands-on"
      }
    ],
    upcomingRegistrations: [
      {
        eventId: 503,
        studentId: 404,
        eventName: "Research Futures Meetup",
        venue: "Innovation Lab",
        startAt: "2026-05-03 14:00",
        endAt: "2026-05-03 18:30",
        status: "REGISTERED",
        registeredAt: "2026-04-25T16:40:00Z",
        checkedInAt: null
      },
      {
        eventId: 509,
        studentId: 404,
        eventName: "Campus Builders Mixer",
        venue: "Student Commons",
        startAt: "2026-04-29 17:30",
        endAt: "2026-04-29 20:00",
        status: "REGISTERED",
        registeredAt: "2026-04-24T12:05:00Z",
        checkedInAt: null
      },
      {
        eventId: 490,
        studentId: 404,
        eventName: "Spring Innovation Forum",
        venue: "Auditorium A",
        startAt: "2026-04-18 10:00",
        endAt: "2026-04-18 15:30",
        status: "CHECKED_IN",
        registeredAt: "2026-04-11T09:20:00Z",
        checkedInAt: "2026-04-18T09:42:00Z"
      }
    ],
    liveUpdates: [
      {
        eventId: 503,
        title: "Research Futures meetup room updated",
        type: "SCHEDULE_CHANGE",
        meta: "The keynote panel has moved from Lab 2 to the Innovation Auditorium.",
        occurredAt: "2026-04-26T09:14:00Z"
      },
      {
        eventId: 509,
        title: "Mixer reminder",
        type: "REMINDER",
        meta: "Check-in opens 20 minutes before the Campus Builders Mixer starts.",
        occurredAt: "2026-04-26T08:45:00Z"
      },
      {
        eventId: 501,
        title: "Innovation Summit registration nearly full",
        type: "ANNOUNCEMENT",
        meta: "Recommendation ranking is high for you, but remaining seats are limited.",
        occurredAt: "2026-04-26T08:10:00Z"
      }
    ]
  };

  var studentEventDiscoveryData = {
    summary: {
      totalEvents: 6,
      openRegistrations: 5,
      limitedCapacityEvents: 2,
      recommendedMatches: 3
    },
    filterOptions: {
      categories: ["ALL", "Innovation", "Research", "Workshop", "Networking", "Career"],
      registrationStates: ["ALL", "OPEN", "REGISTERED", "WAITLISTED", "CLOSED"],
      capacityStates: ["ALL", "AVAILABLE", "LIMITED", "FULL"]
    },
    events: [
      {
        eventId: 501,
        name: "City Innovation Summit",
        category: "Innovation",
        venue: "Main Convention Hall",
        startAt: "2026-04-27 09:00",
        endAt: "2026-04-27 18:00",
        registrationStatus: "OPEN",
        capacityState: "LIMITED",
        highlightBadge: "Trending"
      },
      {
        eventId: 503,
        name: "Research Futures Meetup",
        category: "Research",
        venue: "Innovation Auditorium",
        startAt: "2026-05-03 14:00",
        endAt: "2026-05-03 18:30",
        registrationStatus: "REGISTERED",
        capacityState: "AVAILABLE",
        highlightBadge: "Recommended"
      },
      {
        eventId: 507,
        name: "Design Systems Studio",
        category: "Workshop",
        venue: "Studio 4",
        startAt: "2026-05-06 16:00",
        endAt: "2026-05-06 18:00",
        registrationStatus: "OPEN",
        capacityState: "AVAILABLE",
        highlightBadge: "Hands-on"
      },
      {
        eventId: 509,
        name: "Campus Builders Mixer",
        category: "Networking",
        venue: "Student Commons",
        startAt: "2026-04-29 17:30",
        endAt: "2026-04-29 20:00",
        registrationStatus: "REGISTERED",
        capacityState: "LIMITED",
        highlightBadge: "Popular"
      },
      {
        eventId: 512,
        name: "Career Stories Panel",
        category: "Career",
        venue: "Hall C",
        startAt: "2026-05-08 11:00",
        endAt: "2026-05-08 13:00",
        registrationStatus: "OPEN",
        capacityState: "AVAILABLE",
        highlightBadge: "Career"
      },
      {
        eventId: 515,
        name: "Product Sprint Demo Night",
        category: "Innovation",
        venue: "Startup Garage",
        startAt: "2026-05-10 18:00",
        endAt: "2026-05-10 20:30",
        registrationStatus: "WAITLISTED",
        capacityState: "FULL",
        highlightBadge: "Waitlist"
      }
    ],
    recommendations: [
      {
        eventId: 501,
        name: "City Innovation Summit",
        score: 0.94,
        reasonTags: ["AI systems", "startup demos", "networking"],
        headline: "Strong fit for your product, innovation, and founder-network interests."
      },
      {
        eventId: 503,
        name: "Research Futures Meetup",
        score: 0.89,
        reasonTags: ["research talks", "mentoring", "grad prep"],
        headline: "High overlap with your research club activity and mentorship interests."
      },
      {
        eventId: 507,
        name: "Design Systems Studio",
        score: 0.82,
        reasonTags: ["UI craft", "portfolio", "hands-on"],
        headline: "A practical studio session that complements your current frontend work interests."
      }
    ]
  };

  var studentEventDetailData = {
    details: [
      {
        eventId: 501,
        code: "EVT-501",
        name: "City Innovation Summit",
        description: "A flagship innovation forum with founder talks, live demos, mentoring pods, and student networking tracks across three halls.",
        category: "Innovation",
        status: "REGISTRATION_OPEN",
        venue: "Main Convention Hall",
        startAt: "2026-04-27 09:00",
        endAt: "2026-04-27 18:00",
        registrationOpenAt: "2026-04-15 09:00",
        registrationCloseAt: "2026-04-27 08:15",
        expectedAttendance: 220,
        resourcePlan: [
          {
            resourceName: "Check-in desks",
            quantityRequired: 4,
            quantityAllocated: 4,
            notes: "Student-facing entry support is fully staffed for the opening window."
          },
          {
            resourceName: "Mentor lounges",
            quantityRequired: 2,
            quantityAllocated: 2,
            notes: "Mentor Q&A slots remain on time with no space changes expected."
          }
        ],
        healthSnapshot: {
          eventId: 501,
          healthScore: 84,
          attendanceRatio: 0.81,
          engagementScore: 0.74,
          volunteerEfficiencyScore: 0.88,
          trend: "UP",
          snapshotAt: "2026-04-26T09:24:00Z"
        },
        riskPredictions: [
          {
            riskType: "ENTRY_CONGESTION",
            riskLevel: "LOW",
            score: 0.28,
            headline: "Early arrival traffic may spike during the keynote window.",
            description: "Expect the main check-in line to move slower during the first fifteen minutes.",
            recommendedAction: "Arrive before 08:45 if you want extra time before the keynote begins."
          }
        ],
        timeline: [
          {
            label: "Doors open and check-in",
            startAt: "2026-04-27 08:15",
            endAt: "2026-04-27 09:00",
            status: "READY"
          },
          {
            label: "Opening keynote",
            startAt: "2026-04-27 09:30",
            endAt: "2026-04-27 10:30",
            status: "UPCOMING"
          },
          {
            label: "Founder demo sessions",
            startAt: "2026-04-27 11:15",
            endAt: "2026-04-27 16:30",
            status: "UPCOMING"
          }
        ]
      },
      {
        eventId: 503,
        code: "EVT-503",
        name: "Research Futures Meetup",
        description: "A research-focused meetup with lightning talks, mentor networking, and grad school preparation sessions.",
        category: "Research",
        status: "REGISTRATION_OPEN",
        venue: "Innovation Auditorium",
        startAt: "2026-05-03 14:00",
        endAt: "2026-05-03 18:30",
        registrationOpenAt: "2026-04-19 10:00",
        registrationCloseAt: "2026-05-03 13:15",
        expectedAttendance: 140,
        resourcePlan: [
          {
            resourceName: "Discussion rooms",
            quantityRequired: 3,
            quantityAllocated: 3,
            notes: "Breakout room allocation is complete after the latest room swap."
          }
        ],
        healthSnapshot: {
          eventId: 503,
          healthScore: 79,
          attendanceRatio: 0.69,
          engagementScore: 0.77,
          volunteerEfficiencyScore: 0.86,
          trend: "STABLE",
          snapshotAt: "2026-04-26T09:30:00Z"
        },
        riskPredictions: [
          {
            riskType: "ROOM_CHANGE",
            riskLevel: "LOW",
            score: 0.21,
            headline: "Room guidance must reflect the updated auditorium change.",
            description: "Students who saved the earlier room location may need a reminder before arrival.",
            recommendedAction: "Review live updates before departure and arrive ten minutes early."
          }
        ],
        timeline: [
          {
            label: "Welcome and mentor introductions",
            startAt: "2026-05-03 14:00",
            endAt: "2026-05-03 14:30",
            status: "UPCOMING"
          },
          {
            label: "Lightning talks",
            startAt: "2026-05-03 14:45",
            endAt: "2026-05-03 16:00",
            status: "UPCOMING"
          },
          {
            label: "Networking and grad prep clinics",
            startAt: "2026-05-03 16:15",
            endAt: "2026-05-03 18:30",
            status: "UPCOMING"
          }
        ]
      }
    ],
    registrations: [
      {
        eventId: 501,
        studentId: 404,
        status: "OPEN",
        registeredAt: null,
        checkedInAt: null
      },
      {
        eventId: 503,
        studentId: 404,
        status: "REGISTERED",
        registeredAt: "2026-04-25T16:40:00Z",
        checkedInAt: null
      },
      {
        eventId: 509,
        studentId: 404,
        status: "REGISTERED",
        registeredAt: "2026-04-24T12:05:00Z",
        checkedInAt: null
      }
    ],
    liveFeeds: [
      {
        eventId: 501,
        generatedAt: "2026-04-26T09:45:00Z",
        updates: [
          {
            title: "Networking lounge added to the afternoon track",
            type: "ANNOUNCEMENT",
            meta: "Students can now join founder office hours in the east lounge after 15:00.",
            occurredAt: "2026-04-26T09:20:00Z"
          },
          {
            title: "Registration nearing capacity",
            type: "REMINDER",
            meta: "Seats remain limited, so the registration preview should be completed before arrival.",
            occurredAt: "2026-04-26T08:55:00Z"
          }
        ]
      },
      {
        eventId: 503,
        generatedAt: "2026-04-26T09:38:00Z",
        updates: [
          {
            title: "Room updated to Innovation Auditorium",
            type: "SCHEDULE_CHANGE",
            meta: "The keynote panel moved from Lab 2 and the revised room is now final.",
            occurredAt: "2026-04-26T09:14:00Z"
          },
          {
            title: "Mentor clinic sign-ups open on arrival",
            type: "ANNOUNCEMENT",
            meta: "You can choose a research mentoring table after check-in.",
            occurredAt: "2026-04-26T08:34:00Z"
          }
        ]
      }
    ],
    recommendations: [
      {
        eventId: 501,
        name: "City Innovation Summit",
        score: 0.94,
        reasonTags: ["AI systems", "startup demos", "networking"],
        headline: "Strong fit for your product, innovation, and founder-network interests."
      },
      {
        eventId: 503,
        name: "Research Futures Meetup",
        score: 0.89,
        reasonTags: ["research talks", "mentoring", "grad prep"],
        headline: "High overlap with your research club activity and mentorship interests."
      }
    ]
  };

  var studentRegistrationData = {
    summary: {
      total: 4,
      registered: 2,
      checkedIn: 1,
      waitlisted: 1
    },
    registrations: [
      {
        eventId: 503,
        studentId: 404,
        eventName: "Research Futures Meetup",
        venue: "Innovation Auditorium",
        startAt: "2026-05-03 14:00",
        endAt: "2026-05-03 18:30",
        status: "REGISTERED",
        registeredAt: "2026-04-25T16:40:00Z",
        checkedInAt: null,
        quickAction: "CHECK_IN"
      },
      {
        eventId: 509,
        studentId: 404,
        eventName: "Campus Builders Mixer",
        venue: "Student Commons",
        startAt: "2026-04-29 17:30",
        endAt: "2026-04-29 20:00",
        status: "REGISTERED",
        registeredAt: "2026-04-24T12:05:00Z",
        checkedInAt: null,
        quickAction: "CHECK_IN"
      },
      {
        eventId: 490,
        studentId: 404,
        eventName: "Spring Innovation Forum",
        venue: "Auditorium A",
        startAt: "2026-04-18 10:00",
        endAt: "2026-04-18 15:30",
        status: "CHECKED_IN",
        registeredAt: "2026-04-11T09:20:00Z",
        checkedInAt: "2026-04-18T09:42:00Z",
        quickAction: "FEEDBACK"
      },
      {
        eventId: 515,
        studentId: 404,
        eventName: "Product Sprint Demo Night",
        venue: "Startup Garage",
        startAt: "2026-05-10 18:00",
        endAt: "2026-05-10 20:30",
        status: "WAITLISTED",
        registeredAt: "2026-04-22T11:10:00Z",
        checkedInAt: null,
        quickAction: "DETAIL"
      }
    ]
  };

  var studentCheckInData = {
    eligibleEvents: [
      {
        eventId: 509,
        eventName: "Campus Builders Mixer",
        venue: "Student Commons",
        startAt: "2026-04-29 17:30",
        endAt: "2026-04-29 20:00",
        status: "REGISTERED",
        confirmationCodeHint: "MIXER-404"
      },
      {
        eventId: 503,
        eventName: "Research Futures Meetup",
        venue: "Innovation Auditorium",
        startAt: "2026-05-03 14:00",
        endAt: "2026-05-03 18:30",
        status: "REGISTERED",
        confirmationCodeHint: "RFM-404"
      }
    ],
    recentResults: [
      {
        eventId: 490,
        eventName: "Spring Innovation Forum",
        status: "CHECKED_IN",
        checkedInAt: "2026-04-18T09:42:00Z",
        note: "Check-in completed from the QR confirmation desk."
      }
    ]
  };

  var studentFeedbackData = {
    moodOptions: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
    eligibleEvents: [
      {
        eventId: 490,
        eventName: "Spring Innovation Forum",
        checkedInAt: "2026-04-18T09:42:00Z",
        prompt: "Share a quick sentiment and note while the event is still fresh."
      },
      {
        eventId: 480,
        eventName: "Design Critique Circle",
        checkedInAt: "2026-04-14T15:05:00Z",
        prompt: "The team is collecting fast student feedback on the mentoring session quality."
      }
    ],
    submissions: [
      {
        eventId: 480,
        eventName: "Design Critique Circle",
        mood: "POSITIVE",
        comment: "The mentor feedback was practical and the critique rounds stayed focused.",
        submittedAt: "2026-04-14T18:10:00Z"
      }
    ]
  };

  var studentNotificationData = {
    summary: {
      unreadCount: 4,
      scheduleChanges: 1,
      reminders: 2,
      announcements: 2
    },
    notifications: [
      {
        notificationId: 1,
        eventId: 503,
        title: "Research Futures room updated",
        meta: "The keynote panel has moved to the Innovation Auditorium. Your registration remains active.",
        type: "SCHEDULE_CHANGE",
        occurredAt: "2026-04-26T09:14:00Z",
        isUnread: true,
        route: "/student/events/{eventId}"
      },
      {
        notificationId: 2,
        eventId: 509,
        title: "Mixer check-in opens soon",
        meta: "Check-in opens 20 minutes before the Campus Builders Mixer starts.",
        type: "REMINDER",
        occurredAt: "2026-04-26T08:45:00Z",
        isUnread: true,
        route: "/student/check-in"
      },
      {
        notificationId: 3,
        eventId: 501,
        title: "Innovation Summit is nearly full",
        meta: "Your recommendation score is high, but remaining seats are limited.",
        type: "ANNOUNCEMENT",
        occurredAt: "2026-04-26T08:10:00Z",
        isUnread: true,
        route: "/student/events/{eventId}"
      },
      {
        notificationId: 4,
        eventId: 490,
        title: "Feedback is still open",
        meta: "Share quick event feedback from your recent Spring Innovation Forum attendance.",
        type: "REMINDER",
        occurredAt: "2026-04-25T18:05:00Z",
        isUnread: false,
        route: "/student/feedback"
      },
      {
        notificationId: 5,
        eventId: 515,
        title: "Waitlist position updated",
        meta: "Product Sprint Demo Night is still full, but your waitlist position improved.",
        type: "TASK_UPDATE",
        occurredAt: "2026-04-25T14:20:00Z",
        isUnread: false,
        route: "/student/registrations"
      }
    ]
  };

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getDemoAccount(role) {
    return demoAccounts[role] || null;
  }

  function findDemoAccountByEmail(email) {
    return Object.keys(demoAccounts)
      .map(function (key) {
        return demoAccounts[key];
      })
      .find(function (account) {
        return account.email === email;
      }) || null;
  }

  function getRoleUiConfig(role) {
    return roleUiConfig[role] ? cloneValue(roleUiConfig[role]) : null;
  }

  function getStoredSession() {
    return JSON.parse(sessionStorage.getItem("eventflowMockSession") || "null");
  }

  function storeSession(payload) {
    sessionStorage.setItem("eventflowMockSession", JSON.stringify(payload));
  }

  function clearStoredSession() {
    sessionStorage.removeItem("eventflowMockSession");
  }

  function getAdminDashboardData() {
    return cloneValue(adminDashboardData);
  }

  function getAdminEventManagementData() {
    return cloneValue(adminEventManagementData);
  }

  function getAdminUserManagementData() {
    return cloneValue(adminUserManagementData);
  }

  function getOrganizerDashboardData() {
    return cloneValue(organizerDashboardData);
  }

  function getOrganizerTaskManagementData() {
    return cloneValue(organizerTaskManagementData);
  }

  function getOrganizerOperationsData() {
    return cloneValue(organizerOperationsData);
  }

  function getVolunteerDashboardData() {
    return cloneValue(volunteerDashboardData);
  }

  function getVolunteerTaskData() {
    return cloneValue(volunteerTaskData);
  }

  function getVolunteerPerformanceData() {
    return cloneValue(volunteerPerformanceData);
  }

  function getVolunteerNotificationData() {
    return cloneValue(volunteerNotificationData);
  }

  function getStudentDashboardData() {
    return cloneValue(studentDashboardData);
  }

  function getStudentEventDiscoveryData() {
    return cloneValue(studentEventDiscoveryData);
  }

  function getStudentEventDetailData() {
    return cloneValue(studentEventDetailData);
  }

  function getStudentRegistrationData() {
    return cloneValue(studentRegistrationData);
  }

  function getStudentCheckInData() {
    return cloneValue(studentCheckInData);
  }

  function getStudentFeedbackData() {
    return cloneValue(studentFeedbackData);
  }

  function getStudentNotificationData() {
    return cloneValue(studentNotificationData);
  }

  window.EventFlowMockData = {
    getDemoAccount: getDemoAccount,
    findDemoAccountByEmail: findDemoAccountByEmail,
    getRoleUiConfig: getRoleUiConfig,
    getStoredSession: getStoredSession,
    storeSession: storeSession,
    clearStoredSession: clearStoredSession,
    getAdminDashboardData: getAdminDashboardData,
    getAdminEventManagementData: getAdminEventManagementData,
    getAdminUserManagementData: getAdminUserManagementData,
    getOrganizerDashboardData: getOrganizerDashboardData,
    getOrganizerTaskManagementData: getOrganizerTaskManagementData,
    getOrganizerOperationsData: getOrganizerOperationsData,
    getVolunteerDashboardData: getVolunteerDashboardData,
    getVolunteerTaskData: getVolunteerTaskData,
    getVolunteerPerformanceData: getVolunteerPerformanceData,
    getVolunteerNotificationData: getVolunteerNotificationData,
    getStudentDashboardData: getStudentDashboardData,
    getStudentEventDiscoveryData: getStudentEventDiscoveryData,
    getStudentEventDetailData: getStudentEventDetailData,
    getStudentRegistrationData: getStudentRegistrationData,
    getStudentCheckInData: getStudentCheckInData,
    getStudentFeedbackData: getStudentFeedbackData,
    getStudentNotificationData: getStudentNotificationData
  };
})();