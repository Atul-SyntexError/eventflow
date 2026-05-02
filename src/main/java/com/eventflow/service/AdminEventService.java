package com.eventflow.service;

import com.eventflow.dao.AdminEventDao;
import com.eventflow.dao.AdminUserDao;
import com.eventflow.dao.AuditLogDao;
import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dao.EventResourceDao;
import com.eventflow.dao.RegistrationDao;
import com.eventflow.dao.RiskPredictionDao;
import com.eventflow.dao.TaskDao;
import com.eventflow.dto.EventDetailDto;
import com.eventflow.dto.EventFormRequestDto;
import com.eventflow.dto.EventHealthSnapshotDto;
import com.eventflow.dto.EventSummaryDto;
import com.eventflow.dto.ResourceRequirementDto;
import com.eventflow.dto.RiskPredictionDto;
import com.eventflow.dto.TimelineItemDto;
import com.eventflow.mapper.AdminDtoMapper;
import com.eventflow.model.AuditLog;
import com.eventflow.model.Event;
import com.eventflow.model.EventMetric;
import com.eventflow.model.EventResource;

import com.eventflow.model.HealthTrend;
import com.eventflow.model.RiskPrediction;
import com.eventflow.model.User;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.validation.EventFormValidator;
import java.math.BigDecimal;

import java.sql.Connection;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.SQLException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class AdminEventService {

  private static final BigDecimal ZERO_RATIO = new BigDecimal("0.00");
  private static final DateTimeFormatter EVENT_CODE_FORMATTER =
      DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").withZone(ZoneOffset.UTC);

  private final ConnectionManager connectionManager;
  private final AdminEventDao adminEventDao;
  private final EventDao eventDao;
  private final EventResourceDao eventResourceDao;
  private final EventIntelligenceDao eventIntelligenceDao;
  private final EventIntelligenceService eventIntelligenceService;
  private final AdminUserDao adminUserDao;
  private final TaskDao taskDao;
  private final RegistrationDao registrationDao;
  private final NotificationDeliveryService notificationDeliveryService;
  private final RiskPredictionDao riskPredictionDao;
  private final RiskPredictionService riskPredictionService;
  private final AuditLogDao auditLogDao;
  private final AdminDtoMapper adminDtoMapper;
  private final EventFormValidator eventFormValidator;
  private final JsonPayloadMapper jsonPayloadMapper;

  public AdminEventService(
      ConnectionManager connectionManager,
      AdminEventDao adminEventDao,
      EventDao eventDao,
      EventResourceDao eventResourceDao,
      EventIntelligenceDao eventIntelligenceDao,
      EventIntelligenceService eventIntelligenceService,
      AdminUserDao adminUserDao,
      TaskDao taskDao,
      RegistrationDao registrationDao,
      NotificationDeliveryService notificationDeliveryService,
      RiskPredictionDao riskPredictionDao,
      RiskPredictionService riskPredictionService,
      AuditLogDao auditLogDao,
      AdminDtoMapper adminDtoMapper,
      EventFormValidator eventFormValidator,
      JsonPayloadMapper jsonPayloadMapper) {
    this.connectionManager = connectionManager;
    this.adminEventDao = adminEventDao;
    this.eventDao = eventDao;
    this.eventResourceDao = eventResourceDao;
    this.eventIntelligenceDao = eventIntelligenceDao;
    this.eventIntelligenceService = eventIntelligenceService;
    this.adminUserDao = adminUserDao;
    this.taskDao = taskDao;
    this.registrationDao = registrationDao;
    this.notificationDeliveryService = notificationDeliveryService;
    this.riskPredictionDao = riskPredictionDao;
    this.riskPredictionService = riskPredictionService;
    this.auditLogDao = auditLogDao;
    this.adminDtoMapper = adminDtoMapper;
    this.eventFormValidator = eventFormValidator;
    this.jsonPayloadMapper = jsonPayloadMapper;
  }

  public List<EventSummaryDto> listEvents() {
    return withConnection("list admin events", connection -> adminEventDao.findEventSummaries(connection).stream()
        .map(row -> adminDtoMapper.toEventSummaryDto(
            row.event(),
            row.registeredCount(),
            row.checkedInCount(),
            row.healthScore(),
            row.riskLevel()))
        .toList());
  }

  public EventDetailDto getEventDetail(long eventId) {
    return withConnection("load admin event detail", connection -> loadEventDetail(connection, eventId));
  }

  public List<RiskPredictionDto> listEventRisks(long eventId) {
    return withConnection("list event risks", connection -> {
      Event event = requireEvent(connection, eventId);
      return riskPredictionService.refreshPredictions(connection, event).stream()
          .map(adminDtoMapper::toRiskPredictionDto)
          .toList();
    });
  }

  public EventDetailDto createEvent(EventFormRequestDto request, long actorUserId) {
    EventFormRequestDto validated = eventFormValidator.validateForCreate(request);
    return withConnection("create event", connection -> {
      Instant now = Instant.now();
      Event event = new Event(
          null,
          generateEventCode(actorUserId, now),
          validated.name(),
          validated.description(),
          validated.category(),
          validated.venue(),
          validated.startAt(),
          validated.endAt(),
          validated.registrationOpenAt(),
          validated.registrationCloseAt(),
          validated.expectedAttendance(),
          validated.status(),
          actorUserId,
          actorUserId,
          now,
          now);

      long eventId = adminEventDao.insertEvent(connection, event);
      eventResourceDao.replaceForEvent(connection, eventId, toEventResources(eventId, validated.resourcePlan()));
      eventIntelligenceService.refreshEventHealth(connection, eventId);

      EventDetailDto created = loadEventDetail(connection, eventId);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "EVENT",
              eventId,
              "CREATE",
              null,
              jsonPayloadMapper.write(created),
              Instant.now()));
      return created;
    });
  }

  public EventDetailDto updateEvent(long eventId, EventFormRequestDto request, long actorUserId) {
    return withConnection("update event", connection -> {
      Event current = requireEvent(connection, eventId);
      EventFormRequestDto validated = eventFormValidator.validateForUpdate(request, current.eventStatus());
      EventDetailDto before = loadEventDetail(connection, eventId);
      Instant now = Instant.now();

      Event updatedEvent = new Event(
          eventId,
          current.code(),
          validated.name(),
          validated.description(),
          validated.category(),
          validated.venue(),
          validated.startAt(),
          validated.endAt(),
          validated.registrationOpenAt(),
          validated.registrationCloseAt(),
          validated.expectedAttendance(),
          validated.status(),
          current.createdBy(),
          actorUserId,
          current.createdAt(),
          now);

      adminEventDao.updateEvent(connection, updatedEvent);
      eventResourceDao.replaceForEvent(connection, eventId, toEventResources(eventId, validated.resourcePlan()));
      eventIntelligenceService.refreshEventHealth(connection, eventId);
      createEventUpdateNotifications(connection, updatedEvent);
      createScheduleChangeNotifications(connection, current, updatedEvent);

      EventDetailDto updated = loadEventDetail(connection, eventId);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "EVENT",
              eventId,
              "UPDATE",
              jsonPayloadMapper.write(before),
              jsonPayloadMapper.write(updated),
              Instant.now()));
      return updated;
    });
  }

  private void createEventUpdateNotifications(Connection connection, Event event) throws SQLException {
    List<Long> volunteerIds = taskDao.findActiveVolunteerIdsByEventId(connection, event.eventId());
    if (volunteerIds.isEmpty()) {
      return;
    }

    Map<Long, User> volunteersById = adminUserDao.findUsersByIds(connection, volunteerIds);
    for (Long volunteerId : volunteerIds) {
      User volunteer = volunteersById.get(volunteerId);
      if (volunteer != null) {
        notificationDeliveryService.deliverEventUpdated(connection, volunteer, event);
      }
    }
  }

  private void createScheduleChangeNotifications(Connection connection, Event current, Event updatedEvent)
      throws SQLException {
    if (!hasScheduleChange(current, updatedEvent)) {
      return;
    }

    List<Long> studentIds = registrationDao.findConfirmedStudentIdsByEventId(connection, updatedEvent.eventId());
    if (studentIds.isEmpty()) {
      return;
    }

    Map<Long, User> studentsById = adminUserDao.findUsersByIds(connection, studentIds);
    for (Long studentId : studentIds) {
      User student = studentsById.get(studentId);
      if (student != null) {
        notificationDeliveryService.deliverScheduleChanged(connection, student, updatedEvent);
      }
    }
  }

  private boolean hasScheduleChange(Event current, Event updatedEvent) {
    return !current.startAt().equals(updatedEvent.startAt())
        || !current.endAt().equals(updatedEvent.endAt())
        || !current.venue().equals(updatedEvent.venue());
  }

  public void deleteEvent(long eventId, long actorUserId) {
    withConnection("delete event", connection -> {
      EventDetailDto before = loadEventDetail(connection, eventId);
      if (adminEventDao.hasBlockingDependencies(connection, eventId)) {
        throw new ApplicationException(
            "This event cannot be deleted while registrations, tasks, or feedback records still depend on it.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      eventResourceDao.deleteByEventId(connection, eventId);
      riskPredictionDao.deleteByEventId(connection, eventId);
      adminEventDao.deleteScheduleAdjustments(connection, eventId);
      adminEventDao.deleteEventMetrics(connection, eventId);

      try {
        adminEventDao.deleteEvent(connection, eventId);
      } catch (SQLIntegrityConstraintViolationException exception) {
        throw new ApplicationException(
            "This event cannot be deleted while related records still exist.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            exception);
      }

      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "EVENT",
              eventId,
              "DELETE",
              jsonPayloadMapper.write(before),
              null,
              Instant.now()));
      return null;
    });
  }

  private EventDetailDto loadEventDetail(Connection connection, long eventId) throws SQLException {
    Event event = requireEvent(connection, eventId);
    List<EventResource> resources = eventResourceDao.findByEventId(connection, eventId);
    List<RiskPrediction> risks = riskPredictionService.refreshPredictions(connection, event);

    return adminDtoMapper.toEventDetailDto(
        event,
        resources,
        resolveHealthSnapshot(connection, eventId),
        risks,
        buildTimeline(event));
  }

  private Event requireEvent(Connection connection, long eventId) throws SQLException {
    return eventDao.findById(connection, eventId)
        .orElseThrow(() -> new ApplicationException(
            "Event was not found.",
            404,
            ErrorCode.RESOURCE_NOT_FOUND,
            false,
            null));
  }

  private EventHealthSnapshotDto resolveHealthSnapshot(Connection connection, long eventId) throws SQLException {
    List<EventMetric> metrics = eventIntelligenceDao.findRecentMetrics(connection, eventId, 2);
    if (metrics.isEmpty()) {
      return new EventHealthSnapshotDto(eventId, ZERO_RATIO, ZERO_RATIO, ZERO_RATIO, ZERO_RATIO, HealthTrend.STABLE, null);
    }

    EventMetric currentMetric = metrics.get(0);
    EventMetric previousMetric = metrics.size() > 1 ? metrics.get(1) : null;
    return adminDtoMapper.toEventHealthSnapshotDto(currentMetric, deriveTrend(previousMetric, currentMetric));
  }

  private HealthTrend deriveTrend(EventMetric previousMetric, EventMetric currentMetric) {
    if (previousMetric == null || previousMetric.healthScore() == null || currentMetric.healthScore() == null) {
      return HealthTrend.STABLE;
    }

    int comparison = currentMetric.healthScore().compareTo(previousMetric.healthScore());
    if (comparison > 0) {
      return HealthTrend.UP;
    }
    if (comparison < 0) {
      return HealthTrend.DOWN;
    }
    return HealthTrend.STABLE;
  }

  private List<TimelineItemDto> buildTimeline(Event event) {
    List<TimelineItemDto> timeline = new ArrayList<>();
    if (event.registrationOpenAt() != null || event.registrationCloseAt() != null) {
      timeline.add(new TimelineItemDto(
          null,
          "Registration window",
          event.registrationOpenAt(),
          event.registrationCloseAt(),
          resolveWindowStatus(event.registrationOpenAt(), event.registrationCloseAt()),
          List.of()));
    }

    timeline.add(new TimelineItemDto(
        null,
        "Event window",
        event.startAt(),
        event.endAt(),
        resolveWindowStatus(event.startAt(), event.endAt()),
        List.of()));
    return timeline;
  }

  private String resolveWindowStatus(Instant startAt, Instant endAt) {
    Instant now = Instant.now();
    if (startAt != null && now.isBefore(startAt)) {
      return "UPCOMING";
    }
    if (endAt != null && now.isAfter(endAt)) {
      return "COMPLETED";
    }
    return "READY";
  }

  private List<EventResource> toEventResources(long eventId, List<ResourceRequirementDto> resourcePlan) {
    if (resourcePlan == null || resourcePlan.isEmpty()) {
      return List.of();
    }

    return resourcePlan.stream()
        .map(resource -> new EventResource(
            null,
            eventId,
            resource.resourceName(),
            resource.quantityRequired(),
            resource.quantityAllocated(),
            resource.notes()))
        .toList();
  }

  private String generateEventCode(long actorUserId, Instant now) {
    return "EVT-" + EVENT_CODE_FORMATTER.format(now) + "-" + actorUserId;
  }

  private <T> T withConnection(String operation, SqlWork<T> work) {
    try (Connection connection = connectionManager.getConnection()) {
      try {
        T result = work.execute(connection);
        connection.commit();
        return result;
      } catch (SQLException exception) {
        rollbackQuietly(connection);
        throw new DaoException("Failed to " + operation + ".", exception);
      } catch (RuntimeException exception) {
        rollbackQuietly(connection);
        throw exception;
      }
    } catch (SQLException exception) {
      throw new DaoException("Failed to open connection for " + operation + ".", exception);
    }
  }

  private void rollbackQuietly(Connection connection) {
    try {
      connection.rollback();
    } catch (SQLException ignored) {
      // Ignore rollback failures to preserve the original exception.
    }
  }

  @FunctionalInterface
  private interface SqlWork<T> {
    T execute(Connection connection) throws SQLException;
  }
}