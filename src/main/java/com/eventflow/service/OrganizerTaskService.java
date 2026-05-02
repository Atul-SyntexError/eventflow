package com.eventflow.service;

import com.eventflow.dao.AdminUserDao;
import com.eventflow.dao.AuditLogDao;
import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.TaskDao;
import com.eventflow.dto.ActivityFeedItemDto;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.TaskAssignmentRequestDto;
import com.eventflow.dto.TaskAssignmentSuggestionDto;
import com.eventflow.dto.TaskDetailDto;
import com.eventflow.dto.TaskFormRequestDto;
import com.eventflow.dto.TaskSummaryDto;
import com.eventflow.mapper.OrganizerDtoMapper;
import com.eventflow.model.AuditLog;
import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.Event;
import com.eventflow.model.Task;
import com.eventflow.model.TaskAssignment;
import com.eventflow.model.TaskStatus;
import com.eventflow.model.User;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.validation.TaskFormValidator;
import com.eventflow.validation.ValidationException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class OrganizerTaskService {

  private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ISO_INSTANT;

  private final ConnectionManager connectionManager;
  private final TaskDao taskDao;
  private final EventDao eventDao;
  private final AdminUserDao adminUserDao;
  private final NotificationDeliveryService notificationDeliveryService;
  private final AuditLogDao auditLogDao;
  private final OrganizerDtoMapper organizerDtoMapper;
  private final TaskFormValidator taskFormValidator;
  private final JsonPayloadMapper jsonPayloadMapper;
  private final VolunteerAssignmentIntelligenceService volunteerAssignmentIntelligenceService;

  public OrganizerTaskService(
      ConnectionManager connectionManager,
      TaskDao taskDao,
      EventDao eventDao,
      AdminUserDao adminUserDao,
      NotificationDeliveryService notificationDeliveryService,
      AuditLogDao auditLogDao,
      OrganizerDtoMapper organizerDtoMapper,
      TaskFormValidator taskFormValidator,
      JsonPayloadMapper jsonPayloadMapper,
      VolunteerAssignmentIntelligenceService volunteerAssignmentIntelligenceService) {
    this.connectionManager = connectionManager;
    this.taskDao = taskDao;
    this.eventDao = eventDao;
    this.adminUserDao = adminUserDao;
    this.notificationDeliveryService = notificationDeliveryService;
    this.auditLogDao = auditLogDao;
    this.organizerDtoMapper = organizerDtoMapper;
    this.taskFormValidator = taskFormValidator;
    this.jsonPayloadMapper = jsonPayloadMapper;
    this.volunteerAssignmentIntelligenceService = volunteerAssignmentIntelligenceService;
  }

  public List<TaskSummaryDto> listTasks() {
    return withConnection("list organizer tasks", connection -> taskDao.findTaskSummaryRows(connection).stream()
        .map(row -> organizerDtoMapper.toTaskSummaryDto(
            row.task(),
            row.eventName(),
            row.assignedVolunteerName() == null ? "Unassigned" : row.assignedVolunteerName(),
            isDelayed(row.task())))
        .toList());
  }

  public TaskDetailDto getTaskDetail(long taskId) {
    return withConnection("load organizer task detail", connection -> loadTaskDetail(connection, taskId));
  }

  public TaskEditorState getTaskEditorState(long taskId) {
    return withConnection("load organizer task editor state", connection -> {
      Task task = requireTask(connection, taskId);
      TaskDetailDto detail = loadTaskDetail(connection, taskId, task);
      List<Long> dependencyTaskIds = taskDao.findDependencyIdsByTaskIds(connection, List.of(taskId))
          .getOrDefault(taskId, List.of());
      return new TaskEditorState(detail, task.requiredStartAt(), dependencyTaskIds);
    });
  }

  public List<TaskAssignmentSuggestionDto> listAssignmentSuggestions(long taskId) {
    return withConnection("list task assignment suggestions", connection -> {
      Task task = requireTask(connection, taskId);
      List<String> requiredSkills = taskDao.findRequiredSkillsByTaskIds(connection, List.of(taskId))
          .getOrDefault(taskId, List.of());
      return volunteerAssignmentIntelligenceService.listSuggestions(connection, task, requiredSkills);
    });
  }

  public TaskDetailDto createTask(TaskFormRequestDto request, long actorUserId) {
    TaskFormRequestDto validated = taskFormValidator.validateForCreate(request);
    return withConnection("create task", connection -> {
      Event event = requireEvent(connection, validated.eventId());
      validateTaskWindow(event, validated.requiredStartAt(), validated.deadlineAt());
      Map<String, Long> skillIdsByName = resolveSkillIds(connection, validated.requiredSkills());
      Map<Long, Task> dependencyTasks = resolveDependencies(connection, validated.eventId(), validated.dependencyTaskIds(), null);

      Instant now = Instant.now();
      Task task = new Task(
          null,
          validated.eventId(),
          validated.title(),
          validated.description(),
          validated.priority(),
          validated.status(),
          validated.requiredStartAt(),
          validated.deadlineAt(),
          1,
          actorUserId,
          actorUserId,
          now,
          now);

      long taskId = taskDao.insertTask(connection, task);
      taskDao.replaceRequiredSkills(connection, taskId, skillIdsByName.values());
      taskDao.replaceDependencies(connection, taskId, dependencyTasks.keySet());

      TaskDetailDto created = loadTaskDetail(connection, taskId);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "TASK",
              taskId,
              "CREATE",
              null,
              jsonPayloadMapper.write(created),
              Instant.now()));
      return created;
    });
  }

  public TaskDetailDto updateTask(long taskId, TaskFormRequestDto request, long actorUserId) {
    return withConnection("update task", connection -> {
      Task current = requireTask(connection, taskId);
      TaskFormRequestDto validated = taskFormValidator.validateForUpdate(request, current.taskStatus());
      Event event = requireEvent(connection, validated.eventId());
      validateTaskWindow(event, validated.requiredStartAt(), validated.deadlineAt());
      Map<String, Long> skillIdsByName = resolveSkillIds(connection, validated.requiredSkills());
      Map<Long, Task> dependencyTasks = resolveDependencies(connection, validated.eventId(), validated.dependencyTaskIds(), taskId);
      validateNoDependencyCycle(connection, taskId, dependencyTasks.keySet());
      validateCompletionDependencies(validated.status(), dependencyTasks.values());

      TaskDetailDto before = loadTaskDetail(connection, taskId, current);
      Task updatedTask = new Task(
          taskId,
          validated.eventId(),
          validated.title(),
          validated.description(),
          validated.priority(),
          validated.status(),
          validated.requiredStartAt(),
          validated.deadlineAt(),
          current.requiredVolunteers(),
          current.createdBy(),
          actorUserId,
          current.createdAt(),
          Instant.now());

      taskDao.updateTask(connection, updatedTask);
      taskDao.replaceRequiredSkills(connection, taskId, skillIdsByName.values());
      taskDao.replaceDependencies(connection, taskId, dependencyTasks.keySet());

      TaskDao.TaskAssignmentRow activeAssignment = taskDao.findActiveAssignmentsByTaskIds(connection, List.of(taskId))
          .get(taskId);
      if (activeAssignment != null) {
        createTaskUpdateNotification(connection, updatedTask, activeAssignment.volunteerId());
      }

      TaskDetailDto updated = loadTaskDetail(connection, taskId, updatedTask);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "TASK",
              taskId,
              "UPDATE",
              jsonPayloadMapper.write(before),
              jsonPayloadMapper.write(updated),
              Instant.now()));
      return updated;
    });
  }

  public void deleteTask(long taskId, long actorUserId) {
    withConnection("delete task", connection -> {
      TaskDetailDto before = loadTaskDetail(connection, taskId);
      if (taskDao.hasDependentTasks(connection, taskId)) {
        throw new ApplicationException(
            "This task cannot be deleted while other tasks still depend on it.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      taskDao.deleteAssignments(connection, taskId);
      taskDao.replaceDependencies(connection, taskId, List.of());
      taskDao.replaceRequiredSkills(connection, taskId, List.of());
      taskDao.deleteTask(connection, taskId);

      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "TASK",
              taskId,
              "DELETE",
              jsonPayloadMapper.write(before),
              null,
              Instant.now()));
      return null;
    });
  }

  public TaskDetailDto assignTask(long taskId, TaskAssignmentRequestDto request, long actorUserId) {
    return withConnection("assign task", connection -> {
      Task task = requireTask(connection, taskId);
      TaskAssignmentRequestDto validated = validateAssignmentRequest(request);
      if (task.taskStatus().isTerminal()) {
        throw new ApplicationException(
            "Terminal tasks cannot receive new assignments.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      User volunteer = requireAssignableVolunteer(connection, validated.volunteerId());
      List<String> requiredSkills = taskDao.findRequiredSkillsByTaskIds(connection, List.of(taskId))
          .getOrDefault(taskId, List.of());
        TaskAssignmentSuggestionDto selectedSuggestion = volunteerAssignmentIntelligenceService
          .listSuggestions(connection, task, requiredSkills)
          .stream()
          .filter(suggestion -> suggestion.volunteerId().equals(validated.volunteerId()))
          .findFirst()
          .orElseThrow(() -> new ValidationException(
              "Validation failed",
              List.of(FieldErrorDto.of(
                  "volunteerId",
                  ErrorCode.TASK_ASSIGNMENT_INVALID.name(),
                  "The selected volunteer is not currently assignable for this task."))));

      TaskDetailDto before = loadTaskDetail(connection, taskId, task);
      taskDao.deactivateAssignments(connection, taskId);
      taskDao.insertAssignment(
          connection,
          new TaskAssignment(
              null,
              taskId,
              volunteer.userId(),
              actorUserId,
              selectedSuggestion.totalScore().multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP),
              resolveAssignmentReason(validated, selectedSuggestion),
              true,
              Instant.now()));

      Task updatedTask = task;
      if (task.taskStatus() == TaskStatus.TODO) {
        updatedTask = new Task(
            task.taskId(),
            task.eventId(),
            task.title(),
            task.description(),
            task.taskPriority(),
            TaskStatus.ASSIGNED,
            task.requiredStartAt(),
            task.deadlineAt(),
            task.requiredVolunteers(),
            task.createdBy(),
            actorUserId,
            task.createdAt(),
            Instant.now());
        taskDao.updateTask(connection, updatedTask);
      }

      createAssignmentNotification(connection, updatedTask, volunteer);

      TaskDetailDto after = loadTaskDetail(connection, taskId, updatedTask);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "TASK",
              taskId,
              "ASSIGN",
              jsonPayloadMapper.write(before),
              jsonPayloadMapper.write(after),
              Instant.now()));
      return after;
    });
  }

  private void createAssignmentNotification(Connection connection, Task task, User volunteer)
      throws SQLException {
    notificationDeliveryService.deliverTaskAssigned(connection, volunteer, task);
  }

  private void createTaskUpdateNotification(Connection connection, Task task, long volunteerId)
      throws SQLException {
    User volunteer = adminUserDao.findUserById(connection, volunteerId).orElse(null);
    if (volunteer != null) {
      notificationDeliveryService.deliverTaskUpdated(connection, volunteer, task);
    }
  }

  public List<String> listSkillCatalog() {
    return withConnection("list task skill catalog", adminUserDao::findSkillCatalog);
  }

  public List<EventOption> listEventOptions() {
    return withConnection("list task event options", connection -> taskDao.findEventOptions(connection).stream()
        .map(option -> new EventOption(option.eventId(), option.eventName()))
        .toList());
  }

  private TaskDetailDto loadTaskDetail(Connection connection, long taskId) throws SQLException {
    return loadTaskDetail(connection, taskId, requireTask(connection, taskId));
  }

  private TaskDetailDto loadTaskDetail(Connection connection, long taskId, Task task) throws SQLException {
    Map<Long, List<String>> requiredSkillsByTaskId = taskDao.findRequiredSkillsByTaskIds(connection, List.of(taskId));
    Map<Long, List<TaskDao.DependencyLabelRow>> dependencyLabelsByTaskId =
        taskDao.findDependencyLabelsByTaskIds(connection, List.of(taskId));
    Map<Long, TaskDao.TaskAssignmentRow> assignmentsByTaskId =
        taskDao.findActiveAssignmentsByTaskIds(connection, List.of(taskId));

    TaskDao.TaskAssignmentRow assignment = assignmentsByTaskId.get(taskId);
    return organizerDtoMapper.toTaskDetailDto(
        task,
        requiredSkillsByTaskId.getOrDefault(taskId, List.of()),
        dependencyLabelsByTaskId.getOrDefault(taskId, List.of()).stream().map(TaskDao.DependencyLabelRow::title).toList(),
        assignment == null ? "Unassigned" : assignment.volunteerName(),
        buildActivityFeed(task, assignment));
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
      activity.add(new ActivityFeedItemDto("No recent activity", "Task activity will appear here once changes are recorded."));
    }
    return activity;
  }

  private Event requireEvent(Connection connection, long eventId) throws SQLException {
    return eventDao.findById(connection, eventId)
        .orElseThrow(() -> new ValidationException(
            "Validation failed",
            List.of(FieldErrorDto.of(
                "eventId",
                ErrorCode.RESOURCE_NOT_FOUND.name(),
                "The selected event does not exist."))));
  }

  private Task requireTask(Connection connection, long taskId) throws SQLException {
    return taskDao.findTaskById(connection, taskId)
        .orElseThrow(() -> new ApplicationException(
            "Task was not found.",
            404,
            ErrorCode.RESOURCE_NOT_FOUND,
            false,
            null));
  }

  private User requireAssignableVolunteer(Connection connection, long volunteerId) throws SQLException {
    User volunteer = adminUserDao.findUserById(connection, volunteerId)
        .orElseThrow(() -> new ValidationException(
            "Validation failed",
            List.of(FieldErrorDto.of(
                "volunteerId",
                ErrorCode.TASK_ASSIGNMENT_INVALID.name(),
                "The selected volunteer does not exist."))));

    boolean invalidVolunteer = !volunteer.isActive()
        || volunteer.role() != com.eventflow.model.RoleType.VOLUNTEER
        || volunteer.availabilityStatus() != AvailabilityStatus.AVAILABLE;
    if (invalidVolunteer) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "volunteerId",
              ErrorCode.TASK_ASSIGNMENT_INVALID.name(),
              "Assignments require an active available volunteer account.")));
    }
    return volunteer;
  }

  private Map<String, Long> resolveSkillIds(Connection connection, List<String> skillNames) throws SQLException {
    Map<String, Long> skillIds = adminUserDao.findSkillIdsByNames(connection, skillNames);
    if (skillIds.size() != skillNames.size()) {
      Set<String> missingSkills = new LinkedHashSet<>(skillNames);
      missingSkills.removeAll(skillIds.keySet());
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "requiredSkills",
              ErrorCode.INVALID_FORMAT.name(),
              "Unknown required skills: " + String.join(", ", missingSkills) + ".")));
    }
    return skillIds;
  }

  private Map<Long, Task> resolveDependencies(
      Connection connection,
      long eventId,
      List<Long> dependencyTaskIds,
      Long currentTaskId) throws SQLException {
    if (dependencyTaskIds == null || dependencyTaskIds.isEmpty()) {
      return Map.of();
    }

    if (currentTaskId != null && dependencyTaskIds.contains(currentTaskId)) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "dependencyTaskIds",
              ErrorCode.TASK_DEPENDENCY_CYCLE.name(),
              "A task cannot depend on itself.")));
    }

    Map<Long, Task> dependencyTasks = taskDao.findTasksByIds(connection, dependencyTaskIds);
    if (dependencyTasks.size() != dependencyTaskIds.size()) {
      Set<Long> missingIds = new LinkedHashSet<>(dependencyTaskIds);
      missingIds.removeAll(dependencyTasks.keySet());
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "dependencyTaskIds",
              ErrorCode.RESOURCE_NOT_FOUND.name(),
              "Unknown dependency task ids: " + missingIds + ".")));
    }

    for (Task dependencyTask : dependencyTasks.values()) {
      if (dependencyTask.eventId() != eventId) {
        throw new ValidationException(
            "Validation failed",
            List.of(FieldErrorDto.of(
                "dependencyTaskIds",
                ErrorCode.RESOURCE_CONFLICT.name(),
                "Dependencies must belong to the same event as the task.")));
      }
    }
    return dependencyTasks;
  }

  private void validateNoDependencyCycle(Connection connection, long taskId, Collection<Long> dependencyTaskIds)
      throws SQLException {
    if (dependencyTaskIds == null || dependencyTaskIds.isEmpty()) {
      return;
    }

    ArrayDeque<Long> frontier = new ArrayDeque<>(dependencyTaskIds);
    Set<Long> visited = new LinkedHashSet<>();
    while (!frontier.isEmpty()) {
      List<Long> batch = new ArrayList<>();
      while (!frontier.isEmpty()) {
        Long currentId = frontier.removeFirst();
        if (visited.add(currentId)) {
          batch.add(currentId);
        }
      }

      Map<Long, List<Long>> dependencyMap = taskDao.findDependencyIdsByTaskIds(connection, batch);
      for (Long currentId : batch) {
        for (Long nextId : dependencyMap.getOrDefault(currentId, List.of())) {
          if (nextId == taskId) {
            throw new ValidationException(
                "Validation failed",
                List.of(FieldErrorDto.of(
                    "dependencyTaskIds",
                    ErrorCode.TASK_DEPENDENCY_CYCLE.name(),
                    "The selected dependencies would create a cycle.")));
          }
          if (!visited.contains(nextId)) {
            frontier.addLast(nextId);
          }
        }
      }
    }
  }

  private void validateCompletionDependencies(TaskStatus targetStatus, Collection<Task> dependencyTasks) {
    if (targetStatus != TaskStatus.COMPLETED || dependencyTasks == null || dependencyTasks.isEmpty()) {
      return;
    }

    boolean hasIncompleteDependency = dependencyTasks.stream()
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

  private void validateTaskWindow(Event event, Instant requiredStartAt, Instant deadlineAt) {
    List<FieldErrorDto> errors = new ArrayList<>();
    if (deadlineAt != null && deadlineAt.isBefore(event.startAt())) {
      errors.add(FieldErrorDto.of(
          "deadlineAt",
          ErrorCode.DATE_RANGE_INVALID.name(),
          "Task deadlines must fall within the selected event timeline."));
    }
    if (deadlineAt != null && deadlineAt.isAfter(event.endAt())) {
      errors.add(FieldErrorDto.of(
          "deadlineAt",
          ErrorCode.DATE_RANGE_INVALID.name(),
          "Task deadlines must fall within the selected event timeline."));
    }
    if (requiredStartAt != null && requiredStartAt.isBefore(event.startAt())) {
      errors.add(FieldErrorDto.of(
          "requiredStartAt",
          ErrorCode.DATE_RANGE_INVALID.name(),
          "Required start must fall within the selected event timeline."));
    }
    if (requiredStartAt != null && requiredStartAt.isAfter(event.endAt())) {
      errors.add(FieldErrorDto.of(
          "requiredStartAt",
          ErrorCode.DATE_RANGE_INVALID.name(),
          "Required start must fall within the selected event timeline."));
    }
    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }
  }

  private TaskAssignmentRequestDto validateAssignmentRequest(TaskAssignmentRequestDto request) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    Long volunteerId = request.volunteerId();
    String assignmentMode = trimToNull(request.assignmentMode());
    String assignmentReason = trimToNull(request.assignmentReason());
    if (volunteerId == null || volunteerId <= 0) {
      errors.add(FieldErrorDto.of(
          "volunteerId",
          ErrorCode.FIELD_REQUIRED.name(),
          "A volunteer must be selected before assignment."));
    }
    if (assignmentMode != null && assignmentMode.length() > 40) {
      errors.add(FieldErrorDto.of(
          "assignmentMode",
          ErrorCode.INVALID_FORMAT.name(),
          "Assignment mode must be 40 characters or fewer."));
    }
    if (assignmentReason != null && assignmentReason.length() > 255) {
      errors.add(FieldErrorDto.of(
          "assignmentReason",
          ErrorCode.INVALID_FORMAT.name(),
          "Assignment reason must be 255 characters or fewer."));
    }
    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }
    return new TaskAssignmentRequestDto(volunteerId, assignmentMode, assignmentReason);
  }

  private String resolveAssignmentReason(TaskAssignmentRequestDto request, TaskAssignmentSuggestionDto suggestion) {
    if (request.assignmentReason() != null && !request.assignmentReason().isBlank()) {
      return request.assignmentReason().trim();
    }
    if (request.assignmentMode() != null && !request.assignmentMode().isBlank()) {
      return request.assignmentMode().trim();
    }
    return suggestion.explanation().isEmpty() ? "Organizer assignment" : suggestion.explanation().get(0);
  }

  private boolean isDelayed(Task task) {
    if (task.deadlineAt() == null || task.taskStatus().isTerminal()) {
      return false;
    }
    return Instant.now().isAfter(task.deadlineAt());
  }

  public TaskBootstrapData buildBootstrapData() {
    List<TaskSummaryDto> tasks = listTasks();
    List<TaskEditorState> details = tasks.stream()
        .map(task -> getTaskEditorState(task.taskId()))
        .toList();
    List<SuggestionGroup> suggestionGroups = tasks.stream()
        .map(task -> new SuggestionGroup(task.taskId(), listAssignmentSuggestions(task.taskId())))
        .toList();
    List<String> skillCatalog = listSkillCatalog();
    List<EventOption> eventOptions = listEventOptions();

    return new TaskBootstrapData(
        buildSummary(tasks),
        buildFilterOptions(tasks),
        tasks,
        details,
        suggestionGroups,
        eventOptions,
        skillCatalog,
        new TaskFormRequestDto(
            eventOptions.isEmpty() ? null : eventOptions.get(0).eventId(),
            "",
            "",
            com.eventflow.model.TaskPriority.MEDIUM,
            skillCatalog.isEmpty() ? List.of() : List.of(skillCatalog.get(0)),
            List.of(),
            null,
            null,
            TaskStatus.TODO));
  }

  private TaskSummarySummary buildSummary(List<TaskSummaryDto> tasks) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    long dueToday = tasks.stream()
        .filter(task -> task.deadlineAt() != null && LocalDate.ofInstant(task.deadlineAt(), ZoneId.systemDefault()).isEqual(today))
        .count();
    long blockedTasks = tasks.stream().filter(task -> task.status() == TaskStatus.BLOCKED).count();
    long unassignedTasks = tasks.stream().filter(task -> "Unassigned".equals(task.assignedVolunteerName())).count();
    return new TaskSummarySummary(tasks.size(), dueToday, blockedTasks, unassignedTasks);
  }

  private TaskFilterOptions buildFilterOptions(List<TaskSummaryDto> tasks) {
    List<String> statuses = new ArrayList<>();
    statuses.add("ALL");
    for (TaskStatus taskStatus : TaskStatus.values()) {
      statuses.add(taskStatus.name());
    }

    List<String> priorities = new ArrayList<>();
    priorities.add("ALL");
    for (com.eventflow.model.TaskPriority priority : com.eventflow.model.TaskPriority.values()) {
      priorities.add(priority.name());
    }

    List<String> events = new ArrayList<>();
    events.add("ALL");
    tasks.stream().map(TaskSummaryDto::eventName).distinct().forEach(events::add);
    return new TaskFilterOptions(statuses, priorities, events);
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

  public record EventOption(Long eventId, String eventName) {
  }

  public record TaskEditorState(TaskDetailDto detail, Instant requiredStartAt, List<Long> dependencyTaskIds) {
  }

  public record SuggestionGroup(Long taskId, List<TaskAssignmentSuggestionDto> suggestions) {
  }

  public record TaskSummarySummary(long totalTasks, long dueToday, long blockedTasks, long unassignedTasks) {
  }

  public record TaskFilterOptions(List<String> statuses, List<String> priorities, List<String> events) {
  }

  public record TaskBootstrapData(
      TaskSummarySummary summary,
      TaskFilterOptions filterOptions,
      List<TaskSummaryDto> tasks,
      List<TaskEditorState> details,
      List<SuggestionGroup> suggestionGroups,
      List<EventOption> eventOptions,
      List<String> skillCatalog,
      TaskFormRequestDto createTemplate) {
  }
}