package com.eventflow.service;

import com.eventflow.dao.AuditLogDao;
import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.TaskDao;
import com.eventflow.dto.ActivityFeedItemDto;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.TaskDetailDto;
import com.eventflow.dto.TaskSummaryDto;
import com.eventflow.dto.VolunteerTaskStatusUpdateRequestDto;
import com.eventflow.mapper.OrganizerDtoMapper;
import com.eventflow.model.AuditLog;
import com.eventflow.model.Task;
import com.eventflow.model.TaskStatus;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.validation.ValidationException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class VolunteerTaskService {

  private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ISO_INSTANT;

  private final ConnectionManager connectionManager;
  private final TaskDao taskDao;
  private final AuditLogDao auditLogDao;
  private final OrganizerDtoMapper organizerDtoMapper;
  private final JsonPayloadMapper jsonPayloadMapper;

  public VolunteerTaskService(
      ConnectionManager connectionManager,
      TaskDao taskDao,
      AuditLogDao auditLogDao,
      OrganizerDtoMapper organizerDtoMapper,
      JsonPayloadMapper jsonPayloadMapper) {
    this.connectionManager = connectionManager;
    this.taskDao = taskDao;
    this.auditLogDao = auditLogDao;
    this.organizerDtoMapper = organizerDtoMapper;
    this.jsonPayloadMapper = jsonPayloadMapper;
  }

  public List<TaskSummaryDto> listTasks(long volunteerUserId) {
    return withConnection("list volunteer tasks", connection -> taskDao.findTaskSummaryRows(connection).stream()
        .filter(row -> row.assignedVolunteerId() != null && row.assignedVolunteerId().equals(volunteerUserId))
        .map(row -> organizerDtoMapper.toTaskSummaryDto(
            row.task(),
            row.eventName(),
            row.assignedVolunteerName() == null ? "Unassigned" : row.assignedVolunteerName(),
            isDelayed(row.task())))
        .toList());
  }

  public TaskDetailDto getTaskDetail(long taskId, long volunteerUserId) {
    return withConnection("load volunteer task detail", connection -> loadTaskDetail(connection, taskId, volunteerUserId));
  }

  public TaskDetailDto updateTaskStatus(long taskId, VolunteerTaskStatusUpdateRequestDto request, long actorUserId) {
    VolunteerTaskStatusUpdateRequestDto validated = validateStatusUpdateRequest(request);
    return withConnection("update volunteer task status", connection -> {
      AssignedTaskContext context = requireAssignedTask(connection, taskId, actorUserId);
      Task task = context.task();

      if (validated.status() != task.taskStatus() && !task.taskStatus().canTransitionTo(validated.status())) {
        throw new ValidationException(
            "Validation failed",
            List.of(FieldErrorDto.of(
                "status",
                ErrorCode.RESOURCE_CONFLICT.name(),
                "The requested task status transition is not allowed.")));
      }

      validateCompletionDependencies(connection, taskId, validated.status());

      TaskDetailDto before = toTaskDetail(connection, context);
      if (validated.status() == task.taskStatus()) {
        return before;
      }

      Task updatedTask = new Task(
          task.taskId(),
          task.eventId(),
          task.title(),
          task.description(),
          task.taskPriority(),
          validated.status(),
          task.requiredStartAt(),
          task.deadlineAt(),
          task.requiredVolunteers(),
          task.createdBy(),
          actorUserId,
          task.createdAt(),
          Instant.now());
      taskDao.updateTask(connection, updatedTask);

      TaskDetailDto after = loadTaskDetail(connection, taskId, actorUserId);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "TASK",
              taskId,
              "VOLUNTEER_STATUS_UPDATE",
              jsonPayloadMapper.write(before),
              jsonPayloadMapper.write(buildAuditPayload(after, validated.blockerNote())),
              Instant.now()));
      return after;
    });
  }

  private Map<String, Object> buildAuditPayload(TaskDetailDto detail, String blockerNote) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("detail", detail);
    payload.put("blockerNote", blockerNote);
    return payload;
  }

  private VolunteerTaskStatusUpdateRequestDto validateStatusUpdateRequest(VolunteerTaskStatusUpdateRequestDto request) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    TaskStatus status = request.status();
    String blockerNote = trimToNull(request.blockerNote());

    if (status == null) {
      errors.add(FieldErrorDto.of("status", ErrorCode.FIELD_REQUIRED.name(), "Task status is required."));
    } else if (status == TaskStatus.TODO || status == TaskStatus.CANCELLED) {
      errors.add(FieldErrorDto.of(
          "status",
          ErrorCode.RESOURCE_CONFLICT.name(),
          "Volunteer updates can only use assigned, in progress, blocked, or completed statuses."));
    }

    if (status == TaskStatus.BLOCKED && blockerNote == null) {
      errors.add(FieldErrorDto.of(
          "blockerNote",
          ErrorCode.FIELD_REQUIRED.name(),
          "A blocker note is required when a task is marked blocked."));
    }

    if (blockerNote != null && blockerNote.length() > 255) {
      errors.add(FieldErrorDto.of(
          "blockerNote",
          ErrorCode.INVALID_FORMAT.name(),
          "Blocker note must be 255 characters or fewer."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new VolunteerTaskStatusUpdateRequestDto(status, blockerNote);
  }

  private void validateCompletionDependencies(Connection connection, long taskId, TaskStatus targetStatus)
      throws SQLException {
    if (targetStatus != TaskStatus.COMPLETED) {
      return;
    }

    List<Long> dependencyTaskIds = taskDao.findDependencyIdsByTaskIds(connection, List.of(taskId))
        .getOrDefault(taskId, List.of());
    if (dependencyTaskIds.isEmpty()) {
      return;
    }

    boolean hasIncompleteDependency = taskDao.findTasksByIds(connection, dependencyTaskIds).values().stream()
        .anyMatch(dependencyTask -> dependencyTask.taskStatus() != TaskStatus.COMPLETED);
    if (hasIncompleteDependency) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "status",
              ErrorCode.RESOURCE_CONFLICT.name(),
              "Dependency tasks must be completed before this task can be completed.")));
    }
  }

  private TaskDetailDto loadTaskDetail(Connection connection, long taskId, long volunteerUserId) throws SQLException {
    return toTaskDetail(connection, requireAssignedTask(connection, taskId, volunteerUserId));
  }

  private TaskDetailDto toTaskDetail(Connection connection, AssignedTaskContext context) throws SQLException {
    long taskId = context.task().taskId();
    List<String> requiredSkills = taskDao.findRequiredSkillsByTaskIds(connection, List.of(taskId))
        .getOrDefault(taskId, List.of());
    List<String> dependencies = taskDao.findDependencyLabelsByTaskIds(connection, List.of(taskId))
        .getOrDefault(taskId, List.of())
        .stream()
        .map(TaskDao.DependencyLabelRow::title)
        .toList();
    return organizerDtoMapper.toTaskDetailDto(
        context.task(),
        requiredSkills,
        dependencies,
        context.assignment().volunteerName(),
        buildActivityFeed(context.task(), context.assignment()));
  }

  private AssignedTaskContext requireAssignedTask(Connection connection, long taskId, long volunteerUserId)
      throws SQLException {
    Task task = taskDao.findTaskById(connection, taskId)
        .orElseThrow(() -> new ApplicationException(
            "Task was not found.",
            404,
            ErrorCode.RESOURCE_NOT_FOUND,
            false,
            null));
    TaskDao.TaskAssignmentRow assignment = taskDao.findActiveAssignmentsByTaskIds(connection, List.of(taskId)).get(taskId);
    if (assignment == null || !assignment.volunteerId().equals(volunteerUserId)) {
      throw new ApplicationException(
          "Task was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    }
    return new AssignedTaskContext(task, assignment);
  }

  private List<ActivityFeedItemDto> buildActivityFeed(Task task, TaskDao.TaskAssignmentRow assignment) {
    List<ActivityFeedItemDto> activity = new ArrayList<>();
    if (task.createdAt() != null) {
      activity.add(new ActivityFeedItemDto(
          "Task created",
          "Created at " + TIMESTAMP_FORMATTER.format(task.createdAt()) + "."));
    }
    if (assignment != null) {
      String meta = assignment.volunteerName()
          + " assigned at "
          + TIMESTAMP_FORMATTER.format(assignment.assignedAt())
          + (assignment.assignmentReason() == null || assignment.assignmentReason().isBlank()
              ? "."
              : " · " + assignment.assignmentReason());
      activity.add(new ActivityFeedItemDto("Active assignment", meta));
    }
    if (task.updatedAt() != null && task.createdAt() != null && !task.updatedAt().equals(task.createdAt())) {
      activity.add(new ActivityFeedItemDto(
          "Task updated",
          "Most recent task update at " + TIMESTAMP_FORMATTER.format(task.updatedAt()) + "."));
    }
    if (activity.isEmpty()) {
      activity.add(new ActivityFeedItemDto(
          "No recent activity",
          "Task activity will appear here once changes are recorded."));
    }
    return activity;
  }

  private boolean isDelayed(Task task) {
    if (task.deadlineAt() == null || task.taskStatus().isTerminal()) {
      return false;
    }
    return Instant.now().isAfter(task.deadlineAt());
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
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

  private record AssignedTaskContext(Task task, TaskDao.TaskAssignmentRow assignment) {
  }
}