package com.eventflow.dao;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.Task;
import com.eventflow.model.TaskAssignment;
import com.eventflow.model.TaskPriority;
import com.eventflow.model.TaskStatus;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class TaskDao {

  private static final String FIND_TASK_SUMMARY_ROWS_SQL = """
      SELECT
        t.task_id,
        t.event_id,
        t.title,
        t.description,
        t.task_priority,
        t.task_status,
        t.required_start_at,
        t.deadline_at,
        t.required_volunteers,
        t.created_by,
        t.updated_by,
        t.created_at,
        t.updated_at,
        e.name AS event_name,
        assignment.volunteer_id AS assigned_volunteer_id,
        assignment.volunteer_name AS assigned_volunteer_name
      FROM tasks t
      JOIN events e ON e.event_id = t.event_id
      LEFT JOIN (
        SELECT
          ta.task_id,
          ta.volunteer_id,
          CONCAT(u.first_name, ' ', u.last_name) AS volunteer_name
        FROM task_assignments ta
        JOIN users u ON u.user_id = ta.volunteer_id
        JOIN (
          SELECT task_id, MAX(assigned_at) AS latest_assigned_at
          FROM task_assignments
          WHERE is_active = TRUE
          GROUP BY task_id
        ) latest_assignment
          ON latest_assignment.task_id = ta.task_id
         AND latest_assignment.latest_assigned_at = ta.assigned_at
        WHERE ta.is_active = TRUE
      ) assignment ON assignment.task_id = t.task_id
      ORDER BY t.deadline_at ASC, t.task_id ASC
      """;

  private static final String FIND_TASK_BY_ID_SQL = """
      SELECT
        task_id,
        event_id,
        title,
        description,
        task_priority,
        task_status,
        required_start_at,
        deadline_at,
        required_volunteers,
        created_by,
        updated_by,
        created_at,
        updated_at
      FROM tasks
      WHERE task_id = ?
      """;

  private static final String FIND_TASKS_BY_IDS_SQL_PREFIX = """
      SELECT
        task_id,
        event_id,
        title,
        description,
        task_priority,
        task_status,
        required_start_at,
        deadline_at,
        required_volunteers,
        created_by,
        updated_by,
        created_at,
        updated_at
      FROM tasks
      WHERE task_id IN (
      """;

  private static final String FIND_REQUIRED_SKILLS_BY_TASK_IDS_SQL_PREFIX = """
      SELECT trs.task_id, s.name
      FROM task_required_skills trs
      JOIN skills s ON s.skill_id = trs.skill_id
      WHERE trs.task_id IN (
      """;

  private static final String FIND_DEPENDENCY_LABELS_BY_TASK_IDS_SQL_PREFIX = """
      SELECT td.task_id, td.depends_on_task_id, dependency.title
      FROM task_dependencies td
      JOIN tasks dependency ON dependency.task_id = td.depends_on_task_id
      WHERE td.task_id IN (
      """;

  private static final String FIND_DEPENDENCY_IDS_BY_TASK_IDS_SQL_PREFIX = """
      SELECT task_id, depends_on_task_id
      FROM task_dependencies
      WHERE task_id IN (
      """;

  private static final String FIND_ACTIVE_ASSIGNMENTS_BY_TASK_IDS_SQL_PREFIX = """
      SELECT
        ta.task_id,
        ta.volunteer_id,
        CONCAT(u.first_name, ' ', u.last_name) AS volunteer_name,
        ta.assignment_score,
        ta.assignment_reason,
        ta.assigned_at
      FROM task_assignments ta
      JOIN users u ON u.user_id = ta.volunteer_id
      WHERE ta.is_active = TRUE
        AND ta.task_id IN (
      """;

  private static final String FIND_ACTIVE_VOLUNTEER_IDS_BY_EVENT_ID_SQL = """
      SELECT DISTINCT ta.volunteer_id
      FROM task_assignments ta
      JOIN tasks t ON t.task_id = ta.task_id
      WHERE ta.is_active = TRUE
        AND t.event_id = ?
      ORDER BY ta.volunteer_id ASC
      """;

  private static final String FIND_EVENT_OPTIONS_SQL = """
      SELECT event_id, name
      FROM events
      WHERE event_status NOT IN ('COMPLETED', 'CANCELLED')
      ORDER BY start_at ASC, event_id ASC
      """;

  private static final String FIND_VOLUNTEER_CANDIDATES_SQL = """
      SELECT
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS volunteer_name,
        u.availability_status,
        u.performance_score,
        COALESCE(active_load.active_task_count, 0) AS active_task_count
      FROM users u
      LEFT JOIN (
        SELECT ta.volunteer_id, COUNT(*) AS active_task_count
        FROM task_assignments ta
        JOIN tasks t ON t.task_id = ta.task_id
        WHERE ta.is_active = TRUE
          AND t.task_status IN ('TODO', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
        GROUP BY ta.volunteer_id
      ) active_load ON active_load.volunteer_id = u.user_id
      WHERE u.role = 'VOLUNTEER'
        AND u.user_status = 'ACTIVE'
      ORDER BY u.performance_score DESC, volunteer_name ASC
      """;

  private static final String INSERT_TASK_SQL = """
      INSERT INTO tasks (
        event_id,
        title,
        description,
        task_priority,
        task_status,
        required_start_at,
        deadline_at,
        required_volunteers,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """;

  private static final String UPDATE_TASK_SQL = """
      UPDATE tasks
      SET event_id = ?,
          title = ?,
          description = ?,
          task_priority = ?,
          task_status = ?,
          required_start_at = ?,
          deadline_at = ?,
          updated_by = ?,
          updated_at = ?
      WHERE task_id = ?
      """;

  private static final String DELETE_TASK_REQUIRED_SKILLS_SQL = """
      DELETE FROM task_required_skills
      WHERE task_id = ?
      """;

  private static final String INSERT_TASK_REQUIRED_SKILL_SQL = """
      INSERT INTO task_required_skills (task_id, skill_id)
      VALUES (?, ?)
      """;

  private static final String DELETE_TASK_DEPENDENCIES_SQL = """
      DELETE FROM task_dependencies
      WHERE task_id = ?
      """;

  private static final String INSERT_TASK_DEPENDENCY_SQL = """
      INSERT INTO task_dependencies (task_id, depends_on_task_id)
      VALUES (?, ?)
      """;

  private static final String INSERT_TASK_ASSIGNMENT_SQL = """
      INSERT INTO task_assignments (
        task_id,
        volunteer_id,
        assigned_by,
        assignment_score,
        assignment_reason,
        is_active,
        assigned_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """;

  private static final String DEACTIVATE_TASK_ASSIGNMENTS_SQL = """
      UPDATE task_assignments
      SET is_active = FALSE
      WHERE task_id = ?
        AND is_active = TRUE
      """;

  private static final String DELETE_TASK_ASSIGNMENTS_SQL = """
      DELETE FROM task_assignments
      WHERE task_id = ?
      """;

  private static final String DELETE_TASK_SQL = """
      DELETE FROM tasks
      WHERE task_id = ?
      """;

  private static final String COUNT_DEPENDENT_TASKS_SQL = """
      SELECT COUNT(*)
      FROM task_dependencies
      WHERE depends_on_task_id = ?
      """;

  public List<TaskSummaryRow> findTaskSummaryRows(Connection connection) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_TASK_SUMMARY_ROWS_SQL);
         ResultSet resultSet = statement.executeQuery()) {
      List<TaskSummaryRow> rows = new ArrayList<>();
      while (resultSet.next()) {
        rows.add(new TaskSummaryRow(
            mapTask(resultSet),
            resultSet.getString("event_name"),
            getNullableLong(resultSet, "assigned_volunteer_id"),
            resultSet.getString("assigned_volunteer_name")));
      }
      return rows;
    }
  }

  public Optional<Task> findTaskById(Connection connection, long taskId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_TASK_BY_ID_SQL)) {
      statement.setLong(1, taskId);
      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }
        return Optional.of(mapTask(resultSet));
      }
    }
  }

  public Map<Long, Task> findTasksByIds(Connection connection, Collection<Long> taskIds) throws SQLException {
    if (taskIds == null || taskIds.isEmpty()) {
      return Map.of();
    }

    String sql = FIND_TASKS_BY_IDS_SQL_PREFIX + placeholders(taskIds.size()) + ")";
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      bindIds(statement, taskIds);
      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, Task> tasks = new LinkedHashMap<>();
        while (resultSet.next()) {
          Task task = mapTask(resultSet);
          tasks.put(task.taskId(), task);
        }
        return tasks;
      }
    }
  }

  public Map<Long, List<String>> findRequiredSkillsByTaskIds(Connection connection, Collection<Long> taskIds)
      throws SQLException {
    if (taskIds == null || taskIds.isEmpty()) {
      return Map.of();
    }

    String sql = FIND_REQUIRED_SKILLS_BY_TASK_IDS_SQL_PREFIX + placeholders(taskIds.size()) + ") ORDER BY s.name ASC";
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      bindIds(statement, taskIds);
      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, List<String>> requiredSkills = new LinkedHashMap<>();
        while (resultSet.next()) {
          long taskId = resultSet.getLong("task_id");
          requiredSkills.computeIfAbsent(taskId, ignored -> new ArrayList<>())
              .add(resultSet.getString("name"));
        }
        return requiredSkills;
      }
    }
  }

  public Map<Long, List<DependencyLabelRow>> findDependencyLabelsByTaskIds(Connection connection, Collection<Long> taskIds)
      throws SQLException {
    if (taskIds == null || taskIds.isEmpty()) {
      return Map.of();
    }

    String sql = FIND_DEPENDENCY_LABELS_BY_TASK_IDS_SQL_PREFIX + placeholders(taskIds.size()) + ") ORDER BY dependency.title ASC";
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      bindIds(statement, taskIds);
      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, List<DependencyLabelRow>> dependencyLabels = new LinkedHashMap<>();
        while (resultSet.next()) {
          long taskId = resultSet.getLong("task_id");
          dependencyLabels.computeIfAbsent(taskId, ignored -> new ArrayList<>())
              .add(new DependencyLabelRow(
                  resultSet.getLong("depends_on_task_id"),
                  resultSet.getString("title")));
        }
        return dependencyLabels;
      }
    }
  }

  public Map<Long, List<Long>> findDependencyIdsByTaskIds(Connection connection, Collection<Long> taskIds)
      throws SQLException {
    if (taskIds == null || taskIds.isEmpty()) {
      return Map.of();
    }

    String sql = FIND_DEPENDENCY_IDS_BY_TASK_IDS_SQL_PREFIX + placeholders(taskIds.size()) + ")";
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      bindIds(statement, taskIds);
      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, List<Long>> dependencyIds = new LinkedHashMap<>();
        while (resultSet.next()) {
          long taskId = resultSet.getLong("task_id");
          dependencyIds.computeIfAbsent(taskId, ignored -> new ArrayList<>())
              .add(resultSet.getLong("depends_on_task_id"));
        }
        return dependencyIds;
      }
    }
  }

  public Map<Long, TaskAssignmentRow> findActiveAssignmentsByTaskIds(Connection connection, Collection<Long> taskIds)
      throws SQLException {
    if (taskIds == null || taskIds.isEmpty()) {
      return Map.of();
    }

    String sql = FIND_ACTIVE_ASSIGNMENTS_BY_TASK_IDS_SQL_PREFIX + placeholders(taskIds.size()) + ") ORDER BY ta.assigned_at DESC";
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      bindIds(statement, taskIds);
      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, TaskAssignmentRow> assignments = new LinkedHashMap<>();
        while (resultSet.next()) {
          long taskId = resultSet.getLong("task_id");
          assignments.putIfAbsent(
              taskId,
              new TaskAssignmentRow(
                  resultSet.getLong("volunteer_id"),
                  resultSet.getString("volunteer_name"),
                  resultSet.getBigDecimal("assignment_score"),
                  resultSet.getString("assignment_reason"),
                  toInstant(resultSet.getTimestamp("assigned_at"))));
        }
        return assignments;
      }
    }
  }

  public List<Long> findActiveVolunteerIdsByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_ACTIVE_VOLUNTEER_IDS_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);
      try (ResultSet resultSet = statement.executeQuery()) {
        List<Long> volunteerIds = new ArrayList<>();
        while (resultSet.next()) {
          volunteerIds.add(resultSet.getLong("volunteer_id"));
        }
        return volunteerIds;
      }
    }
  }

  public List<EventOptionRow> findEventOptions(Connection connection) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_EVENT_OPTIONS_SQL);
         ResultSet resultSet = statement.executeQuery()) {
      List<EventOptionRow> options = new ArrayList<>();
      while (resultSet.next()) {
        options.add(new EventOptionRow(resultSet.getLong("event_id"), resultSet.getString("name")));
      }
      return options;
    }
  }

  public List<VolunteerCandidateRow> findVolunteerCandidates(Connection connection) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_VOLUNTEER_CANDIDATES_SQL);
         ResultSet resultSet = statement.executeQuery()) {
      List<VolunteerCandidateRow> candidates = new ArrayList<>();
      while (resultSet.next()) {
        candidates.add(new VolunteerCandidateRow(
            resultSet.getLong("user_id"),
            resultSet.getString("volunteer_name"),
            mapAvailabilityStatus(resultSet.getString("availability_status")),
            resultSet.getBigDecimal("performance_score"),
            resultSet.getInt("active_task_count")));
      }
      return candidates;
    }
  }

  public long insertTask(Connection connection, Task task) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_TASK_SQL, Statement.RETURN_GENERATED_KEYS)) {
      statement.setLong(1, task.eventId());
      statement.setString(2, task.title());
      statement.setString(3, task.description());
      statement.setString(4, task.taskPriority().name());
      statement.setString(5, task.taskStatus().name());
      statement.setTimestamp(6, toTimestamp(task.requiredStartAt()));
      statement.setTimestamp(7, toTimestamp(task.deadlineAt()));
      statement.setInt(8, task.requiredVolunteers());
      statement.setLong(9, task.createdBy());
      statement.setLong(10, task.updatedBy());
      statement.setTimestamp(11, toTimestamp(task.createdAt()));
      statement.setTimestamp(12, toTimestamp(task.updatedAt()));
      statement.executeUpdate();

      try (ResultSet keys = statement.getGeneratedKeys()) {
        if (keys.next()) {
          return keys.getLong(1);
        }
      }
    }

    throw new SQLException("Task insert did not return a generated key.");
  }

  public void updateTask(Connection connection, Task task) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(UPDATE_TASK_SQL)) {
      statement.setLong(1, task.eventId());
      statement.setString(2, task.title());
      statement.setString(3, task.description());
      statement.setString(4, task.taskPriority().name());
      statement.setString(5, task.taskStatus().name());
      statement.setTimestamp(6, toTimestamp(task.requiredStartAt()));
      statement.setTimestamp(7, toTimestamp(task.deadlineAt()));
      statement.setLong(8, task.updatedBy());
      statement.setTimestamp(9, toTimestamp(task.updatedAt()));
      statement.setLong(10, task.taskId());
      statement.executeUpdate();
    }
  }

  public void replaceRequiredSkills(Connection connection, long taskId, Collection<Long> skillIds) throws SQLException {
    try (PreparedStatement deleteStatement = connection.prepareStatement(DELETE_TASK_REQUIRED_SKILLS_SQL)) {
      deleteStatement.setLong(1, taskId);
      deleteStatement.executeUpdate();
    }

    if (skillIds == null || skillIds.isEmpty()) {
      return;
    }

    try (PreparedStatement insertStatement = connection.prepareStatement(INSERT_TASK_REQUIRED_SKILL_SQL)) {
      for (Long skillId : skillIds) {
        insertStatement.setLong(1, taskId);
        insertStatement.setLong(2, skillId);
        insertStatement.addBatch();
      }
      insertStatement.executeBatch();
    }
  }

  public void replaceDependencies(Connection connection, long taskId, Collection<Long> dependencyTaskIds) throws SQLException {
    try (PreparedStatement deleteStatement = connection.prepareStatement(DELETE_TASK_DEPENDENCIES_SQL)) {
      deleteStatement.setLong(1, taskId);
      deleteStatement.executeUpdate();
    }

    if (dependencyTaskIds == null || dependencyTaskIds.isEmpty()) {
      return;
    }

    try (PreparedStatement insertStatement = connection.prepareStatement(INSERT_TASK_DEPENDENCY_SQL)) {
      for (Long dependencyTaskId : dependencyTaskIds) {
        insertStatement.setLong(1, taskId);
        insertStatement.setLong(2, dependencyTaskId);
        insertStatement.addBatch();
      }
      insertStatement.executeBatch();
    }
  }

  public void deactivateAssignments(Connection connection, long taskId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DEACTIVATE_TASK_ASSIGNMENTS_SQL)) {
      statement.setLong(1, taskId);
      statement.executeUpdate();
    }
  }

  public void insertAssignment(Connection connection, TaskAssignment assignment) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_TASK_ASSIGNMENT_SQL)) {
      statement.setLong(1, assignment.taskId());
      statement.setLong(2, assignment.volunteerId());
      statement.setLong(3, assignment.assignedBy());
      statement.setBigDecimal(4, assignment.assignmentScore());
      statement.setString(5, assignment.assignmentReason());
      statement.setBoolean(6, assignment.active());
      statement.setTimestamp(7, toTimestamp(assignment.assignedAt()));
      statement.executeUpdate();
    }
  }

  public boolean hasDependentTasks(Connection connection, long taskId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(COUNT_DEPENDENT_TASKS_SQL)) {
      statement.setLong(1, taskId);
      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return resultSet.getInt(1) > 0;
      }
    }
  }

  public void deleteAssignments(Connection connection, long taskId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_TASK_ASSIGNMENTS_SQL)) {
      statement.setLong(1, taskId);
      statement.executeUpdate();
    }
  }

  public void deleteTask(Connection connection, long taskId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_TASK_SQL)) {
      statement.setLong(1, taskId);
      statement.executeUpdate();
    }
  }

  private Task mapTask(ResultSet resultSet) throws SQLException {
    return new Task(
        resultSet.getLong("task_id"),
        resultSet.getLong("event_id"),
        resultSet.getString("title"),
        resultSet.getString("description"),
        TaskPriority.valueOf(resultSet.getString("task_priority")),
        TaskStatus.valueOf(resultSet.getString("task_status")),
        toInstant(resultSet.getTimestamp("required_start_at")),
        toInstant(resultSet.getTimestamp("deadline_at")),
        resultSet.getInt("required_volunteers"),
        resultSet.getLong("created_by"),
        resultSet.getLong("updated_by"),
        toInstant(resultSet.getTimestamp("created_at")),
        toInstant(resultSet.getTimestamp("updated_at")));
  }

  private String placeholders(int count) {
    return java.util.stream.IntStream.range(0, count)
        .mapToObj(index -> "?")
        .collect(Collectors.joining(", "));
  }

  private void bindIds(PreparedStatement statement, Collection<Long> ids) throws SQLException {
    int index = 1;
    for (Long id : ids) {
      statement.setLong(index++, id);
    }
  }

  private Long getNullableLong(ResultSet resultSet, String columnName) throws SQLException {
    long value = resultSet.getLong(columnName);
    return resultSet.wasNull() ? null : value;
  }

  private AvailabilityStatus mapAvailabilityStatus(String value) {
    return value == null || value.isBlank() ? null : AvailabilityStatus.valueOf(value);
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  private Timestamp toTimestamp(Instant instant) {
    return instant == null ? null : Timestamp.from(instant);
  }

  public record TaskSummaryRow(
      Task task,
      String eventName,
      Long assignedVolunteerId,
      String assignedVolunteerName) {
  }

  public record DependencyLabelRow(Long dependsOnTaskId, String title) {
  }

  public record TaskAssignmentRow(
      Long volunteerId,
      String volunteerName,
      BigDecimal assignmentScore,
      String assignmentReason,
      Instant assignedAt) {
  }

  public record VolunteerCandidateRow(
      Long userId,
      String volunteerName,
      AvailabilityStatus availabilityStatus,
      BigDecimal performanceScore,
      int activeTaskCount) {
  }

  public record EventOptionRow(Long eventId, String eventName) {
  }
}