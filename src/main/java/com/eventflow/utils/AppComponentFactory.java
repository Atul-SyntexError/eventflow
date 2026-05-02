package com.eventflow.utils;

import com.eventflow.config.AppConfig;
import com.eventflow.config.ConfigurationException;
import com.eventflow.dao.AdminEventDao;
import com.eventflow.dao.AdminUserDao;
import com.eventflow.dao.AuthUserDao;
import com.eventflow.dao.AuditLogDao;
import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dao.EventScheduleAdjustmentDao;
import com.eventflow.dao.EventResourceDao;
import com.eventflow.dao.NotificationDao;
import com.eventflow.dao.NotificationLogDao;
import com.eventflow.dao.RegistrationDao;
import com.eventflow.dao.RiskPredictionDao;
import com.eventflow.dao.StudentFeedbackDao;
import com.eventflow.dao.StudentRecommendationSnapshotDao;
import com.eventflow.dao.TaskDao;
import com.eventflow.dao.VolunteerPerformanceDao;
import com.eventflow.mapper.AdminDtoMapper;
import com.eventflow.mapper.NotificationMapper;
import com.eventflow.mapper.OrganizerDtoMapper;
import com.eventflow.mapper.ReportingDtoMapper;
import com.eventflow.mapper.StudentDtoMapper;
import com.eventflow.mapper.VolunteerDtoMapper;
import com.eventflow.service.AdminEventService;
import com.eventflow.service.AdminReportService;
import com.eventflow.service.AdminUserService;
import com.eventflow.service.AuthService;
import com.eventflow.service.EventIntelligenceService;
import com.eventflow.service.NotificationService;
import com.eventflow.service.NotificationDeliveryService;
import com.eventflow.service.OrganizerTaskService;
import com.eventflow.service.RegistrationService;
import com.eventflow.service.RiskPredictionService;
import com.eventflow.service.ScheduleAdjustmentService;
import com.eventflow.service.StudentEventDetailService;
import com.eventflow.service.StudentEventDiscoveryService;
import com.eventflow.service.StudentDashboardService;
import com.eventflow.service.StudentFeedbackService;
import com.eventflow.service.StudentRecommendationService;
import com.eventflow.service.VolunteerPerformanceService;
import com.eventflow.service.VolunteerTaskService;
import com.eventflow.service.VolunteerAssignmentIntelligenceService;
import com.eventflow.validation.CheckInValidator;
import com.eventflow.validation.EventFormValidator;
import com.eventflow.validation.FeedbackSubmissionValidator;
import com.eventflow.validation.RegistrationValidator;
import com.eventflow.validation.TaskFormValidator;
import com.eventflow.validation.UserFormValidator;
import jakarta.servlet.ServletContext;

public final class AppComponentFactory {

  private static final PasswordHasher PASSWORD_HASHER = new PasswordHasher();
  private static final RolePermissionRegistry ROLE_PERMISSION_REGISTRY = new RolePermissionRegistry();
  private static final SessionContextHelper SESSION_CONTEXT_HELPER = new SessionContextHelper();
  private static final JsonResponseWriter JSON_RESPONSE_WRITER = new JsonResponseWriter();
  private static final JsonPayloadMapper JSON_PAYLOAD_MAPPER = new JsonPayloadMapper();
  private static final AdminDtoMapper ADMIN_DTO_MAPPER = new AdminDtoMapper();
  private static final NotificationMapper NOTIFICATION_MAPPER = new NotificationMapper();
  private static final OrganizerDtoMapper ORGANIZER_DTO_MAPPER = new OrganizerDtoMapper();
  private static final StudentDtoMapper STUDENT_DTO_MAPPER = new StudentDtoMapper();
  private static final VolunteerDtoMapper VOLUNTEER_DTO_MAPPER = new VolunteerDtoMapper();
  private static final ReportingDtoMapper REPORTING_DTO_MAPPER = new ReportingDtoMapper();
  private static final UserFormValidator USER_FORM_VALIDATOR = new UserFormValidator();
  private static final CheckInValidator CHECK_IN_VALIDATOR = new CheckInValidator();
  private static final FeedbackSubmissionValidator FEEDBACK_SUBMISSION_VALIDATOR = new FeedbackSubmissionValidator();
  private static final RegistrationValidator REGISTRATION_VALIDATOR = new RegistrationValidator();
  private static final EventFormValidator EVENT_FORM_VALIDATOR = new EventFormValidator();
  private static final TaskFormValidator TASK_FORM_VALIDATOR = new TaskFormValidator();

  private AppComponentFactory() {
  }

  public static AuthService authService(ServletContext servletContext) {
    return new AuthService(
        new AuthUserDao(requireConnectionManager(servletContext)),
        PASSWORD_HASHER,
        ROLE_PERMISSION_REGISTRY);
  }

  public static RolePermissionRegistry rolePermissionRegistry() {
    return ROLE_PERMISSION_REGISTRY;
  }

  public static AdminUserService adminUserService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new AdminUserService(
        connectionManager,
        new AdminUserDao(connectionManager),
        new AuditLogDao(),
        ADMIN_DTO_MAPPER,
        PASSWORD_HASHER,
        USER_FORM_VALIDATOR,
        JSON_PAYLOAD_MAPPER);
  }

  public static AdminEventService adminEventService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new AdminEventService(
        connectionManager,
        new AdminEventDao(),
        new EventDao(),
        new EventResourceDao(),
        new EventIntelligenceDao(),
        eventIntelligenceService(servletContext),
      new AdminUserDao(connectionManager),
      new TaskDao(),
        new RegistrationDao(),
      notificationDeliveryService(servletContext),
        new RiskPredictionDao(),
        new RiskPredictionService(new EventIntelligenceDao(), new RiskPredictionDao()),
        new AuditLogDao(),
        ADMIN_DTO_MAPPER,
        EVENT_FORM_VALIDATOR,
        JSON_PAYLOAD_MAPPER);
  }

        public static AdminReportService adminReportService(ServletContext servletContext) {
          ConnectionManager connectionManager = requireConnectionManager(servletContext);
          return new AdminReportService(
          connectionManager,
          new EventDao(),
          new EventIntelligenceDao(),
          eventIntelligenceService(servletContext),
          REPORTING_DTO_MAPPER);
        }

  public static OrganizerTaskService organizerTaskService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    TaskDao taskDao = new TaskDao();
    AdminUserDao adminUserDao = new AdminUserDao(connectionManager);
    return new OrganizerTaskService(
        connectionManager,
        taskDao,
        new EventDao(),
        adminUserDao,
        notificationDeliveryService(servletContext),
        new AuditLogDao(),
        ORGANIZER_DTO_MAPPER,
        TASK_FORM_VALIDATOR,
        JSON_PAYLOAD_MAPPER,
        new VolunteerAssignmentIntelligenceService(taskDao, adminUserDao, ORGANIZER_DTO_MAPPER));
  }

        public static ScheduleAdjustmentService scheduleAdjustmentService(ServletContext servletContext) {
          ConnectionManager connectionManager = requireConnectionManager(servletContext);
          return new ScheduleAdjustmentService(
          connectionManager,
          new EventDao(),
          new TaskDao(),
          new EventIntelligenceDao(),
          new EventScheduleAdjustmentDao(),
          ORGANIZER_DTO_MAPPER);
        }

  public static StudentFeedbackService studentFeedbackService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new StudentFeedbackService(
        connectionManager,
        new StudentFeedbackDao(),
        STUDENT_DTO_MAPPER,
        FEEDBACK_SUBMISSION_VALIDATOR,
        eventIntelligenceService(servletContext));
  }

  public static RegistrationService registrationService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new RegistrationService(
        connectionManager,
        new RegistrationDao(),
        new EventDao(),
        STUDENT_DTO_MAPPER,
        REGISTRATION_VALIDATOR,
        CHECK_IN_VALIDATOR,
        eventIntelligenceService(servletContext));
  }

  public static StudentEventDiscoveryService studentEventDiscoveryService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new StudentEventDiscoveryService(connectionManager, new EventDao(), STUDENT_DTO_MAPPER);
  }

  public static StudentEventDetailService studentEventDetailService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new StudentEventDetailService(
        connectionManager,
        new EventDao(),
        new EventResourceDao(),
        eventIntelligenceService(servletContext),
        ADMIN_DTO_MAPPER);
  }

  public static StudentRecommendationService studentRecommendationService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new StudentRecommendationService(
        connectionManager,
        new EventDao(),
        new EventIntelligenceDao(),
        new StudentRecommendationSnapshotDao(),
        STUDENT_DTO_MAPPER);
  }

  public static StudentDashboardService studentDashboardService(ServletContext servletContext) {
    return new StudentDashboardService(
        studentRecommendationService(servletContext),
        registrationService(servletContext),
        notificationService(servletContext),
        STUDENT_DTO_MAPPER);
  }

        public static VolunteerPerformanceService volunteerPerformanceService(ServletContext servletContext) {
          ConnectionManager connectionManager = requireConnectionManager(servletContext);
          return new VolunteerPerformanceService(
          connectionManager,
          new VolunteerPerformanceDao(),
          VOLUNTEER_DTO_MAPPER);
        }

  public static VolunteerTaskService volunteerTaskService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new VolunteerTaskService(
        connectionManager,
        new TaskDao(),
        new AuditLogDao(),
        ORGANIZER_DTO_MAPPER,
        JSON_PAYLOAD_MAPPER);
  }

  public static NotificationService notificationService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new NotificationService(
        connectionManager,
        new NotificationDao(),
        NOTIFICATION_MAPPER);
  }

  public static NotificationDeliveryService notificationDeliveryService(ServletContext servletContext) {
    return new NotificationDeliveryService(
        requireAppConfig(servletContext),
        new NotificationDao(),
        new NotificationLogDao());
  }

  public static EventIntelligenceService eventIntelligenceService(ServletContext servletContext) {
    ConnectionManager connectionManager = requireConnectionManager(servletContext);
    return new EventIntelligenceService(
        connectionManager,
        new EventIntelligenceDao(),
        REPORTING_DTO_MAPPER,
        ADMIN_DTO_MAPPER);
  }

  public static SessionContextHelper sessionContextHelper() {
    return SESSION_CONTEXT_HELPER;
  }

  public static JsonResponseWriter jsonResponseWriter() {
    return JSON_RESPONSE_WRITER;
  }

  public static JsonPayloadMapper jsonPayloadMapper() {
    return JSON_PAYLOAD_MAPPER;
  }

  private static ConnectionManager requireConnectionManager(ServletContext servletContext) {
    Object value = servletContext.getAttribute(ConnectionManager.CONTEXT_ATTRIBUTE);
    if (value instanceof ConnectionManager connectionManager) {
      return connectionManager;
    }

    throw new ConfigurationException("EventFlow database connection manager is not available.");
  }

  private static AppConfig requireAppConfig(ServletContext servletContext) {
    Object value = servletContext.getAttribute(AppConfig.CONTEXT_ATTRIBUTE);
    if (value instanceof AppConfig appConfig) {
      return appConfig;
    }

    throw new ConfigurationException("EventFlow application configuration is not available.");
  }
}