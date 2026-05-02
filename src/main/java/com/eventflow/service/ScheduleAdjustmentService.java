package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dao.EventScheduleAdjustmentDao;
import com.eventflow.dao.TaskDao;
import com.eventflow.dto.ScheduleAdjustmentSuggestionDto;
import com.eventflow.dto.TimelineItemDto;
import com.eventflow.mapper.OrganizerDtoMapper;
import com.eventflow.model.AdjustmentStatus;
import com.eventflow.model.Event;
import com.eventflow.model.EventScheduleAdjustment;
import com.eventflow.model.TaskStatus;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class ScheduleAdjustmentService {

  private static final DateTimeFormatter WINDOW_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'").withZone(ZoneOffset.UTC);

  private final ConnectionManager connectionManager;
  private final EventDao eventDao;
  private final TaskDao taskDao;
  private final EventIntelligenceDao eventIntelligenceDao;
  private final EventScheduleAdjustmentDao eventScheduleAdjustmentDao;
  private final OrganizerDtoMapper organizerDtoMapper;

  public ScheduleAdjustmentService(
      ConnectionManager connectionManager,
      EventDao eventDao,
      TaskDao taskDao,
      EventIntelligenceDao eventIntelligenceDao,
      EventScheduleAdjustmentDao eventScheduleAdjustmentDao,
      OrganizerDtoMapper organizerDtoMapper) {
    this.connectionManager = connectionManager;
    this.eventDao = eventDao;
    this.taskDao = taskDao;
    this.eventIntelligenceDao = eventIntelligenceDao;
    this.eventScheduleAdjustmentDao = eventScheduleAdjustmentDao;
    this.organizerDtoMapper = organizerDtoMapper;
  }

  public ScheduleAdjustmentSuggestionDto suggestForEvent(long eventId, long actorUserId) {
    return withConnection("load schedule adjustment suggestion", connection -> {
      Event event = requireEvent(connection, eventId);
      if (event.startAt() == null || event.endAt() == null) {
        eventScheduleAdjustmentDao.replaceSuggestedForEvent(connection, eventId, null);
        return null;
      }

      EventIntelligenceDao.HealthInputs inputs = eventIntelligenceDao.findHealthInputs(connection, eventId)
          .orElseThrow(() -> new SQLException("Health inputs were not found for event " + eventId));
      List<TaskDao.TaskSummaryRow> taskRows = taskDao.findTaskSummaryRows(connection).stream()
          .filter(row -> row.task().eventId() == eventId)
          .sorted(Comparator.comparing(
              row -> row.task().deadlineAt(),
              Comparator.nullsLast(Comparator.naturalOrder())))
          .toList();

      SuggestionPlan plan = buildPlan(event, actorUserId, inputs, taskRows);
      eventScheduleAdjustmentDao.replaceSuggestedForEvent(connection, eventId, plan == null ? null : plan.adjustment());
      if (plan == null) {
        return null;
      }

      return organizerDtoMapper.toScheduleAdjustmentSuggestionDto(
          eventId,
          plan.adjustment().reasonCode(),
          plan.headline(),
          plan.adjustment().description(),
          formatWindow(plan.adjustment().currentStartAt(), plan.adjustment().currentEndAt()),
          formatWindow(plan.adjustment().suggestedStartAt(), plan.adjustment().suggestedEndAt()),
          plan.impactedTaskIds());
    });
  }

  public List<TimelineItemDto> loadTimeline(long eventId) {
    return withConnection("load organizer event timeline", connection -> buildTimeline(requireEvent(connection, eventId)));
  }

  private SuggestionPlan buildPlan(
      Event event,
      long actorUserId,
      EventIntelligenceDao.HealthInputs inputs,
      List<TaskDao.TaskSummaryRow> taskRows) {
    int requiredVolunteers = defaultZero(inputs.requiredVolunteers());
    int activeAssignments = defaultZero(inputs.activeAssignments());
    List<Long> activeTaskIds = taskRows.stream()
        .map(TaskDao.TaskSummaryRow::task)
        .filter(task -> !task.taskStatus().isTerminal())
        .map(task -> task.taskId())
        .toList();
    if (requiredVolunteers > 0 && activeAssignments < requiredVolunteers) {
      long uncoveredSlots = requiredVolunteers - activeAssignments;
      long shiftMinutes = uncoveredSlots >= 2 ? 30L : 15L;
      EventScheduleAdjustment adjustment = new EventScheduleAdjustment(
          null,
          event.eventId(),
          actorUserId,
          "VOLUNTEER_COVERAGE",
          "Delay the live event window by " + shiftMinutes + " minutes so organizer staffing can close the current volunteer coverage gap of "
              + uncoveredSlots + " slot(s).",
          event.startAt(),
          event.endAt(),
          event.startAt().plusSeconds(shiftMinutes * 60L),
          event.endAt().plusSeconds(shiftMinutes * 60L),
          AdjustmentStatus.SUGGESTED,
          null);
      return new SuggestionPlan(
          adjustment,
          "Volunteer coverage is below the event plan",
          activeTaskIds);
    }

    Instant now = Instant.now();
    List<Long> delayedTaskIds = taskRows.stream()
        .map(TaskDao.TaskSummaryRow::task)
        .filter(task -> !task.taskStatus().isTerminal())
        .filter(task -> task.taskStatus() == TaskStatus.BLOCKED
            || (task.deadlineAt() != null && task.deadlineAt().isBefore(now)))
        .map(task -> task.taskId())
        .toList();
    if (!delayedTaskIds.isEmpty()) {
      long shiftMinutes = delayedTaskIds.size() >= 2 ? 30L : 15L;
      EventScheduleAdjustment adjustment = new EventScheduleAdjustment(
          null,
          event.eventId(),
          actorUserId,
          "TASK_DELAY",
          "Delay the live event window by " + shiftMinutes + " minutes so blocked or overdue organizer work can be recovered before the main handoff.",
          event.startAt(),
          event.endAt(),
          event.startAt().plusSeconds(shiftMinutes * 60L),
          event.endAt().plusSeconds(shiftMinutes * 60L),
          AdjustmentStatus.SUGGESTED,
          null);
      return new SuggestionPlan(
          adjustment,
          "Organizer task delays are pushing the event window",
          delayedTaskIds);
    }

    return null;
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

  private int defaultZero(Integer value) {
    return value == null ? 0 : value;
  }

  private String formatWindow(Instant startAt, Instant endAt) {
    return WINDOW_FORMATTER.format(startAt) + " to " + WINDOW_FORMATTER.format(endAt);
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

  private record SuggestionPlan(
      EventScheduleAdjustment adjustment,
      String headline,
      List<Long> impactedTaskIds) {
  }
}