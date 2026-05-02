package com.eventflow.dao;

import com.eventflow.model.EventMetric;
import com.eventflow.model.RiskLevel;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class EventIntelligenceDao {

  private static final String FEEDBACK_ANALYSIS_SQL = """
      SELECT
        COALESCE(SUM(CASE WHEN mood = 'POSITIVE' THEN 1 ELSE 0 END), 0) AS positive_count,
        COALESCE(SUM(CASE WHEN mood = 'NEUTRAL' THEN 1 ELSE 0 END), 0) AS neutral_count,
        COALESCE(SUM(CASE WHEN mood = 'NEGATIVE' THEN 1 ELSE 0 END), 0) AS negative_count,
        COALESCE(AVG(CASE
          WHEN mood = 'POSITIVE' THEN 1.0
          WHEN mood = 'NEUTRAL' THEN 0.5
          ELSE 0.0
        END), 0.5) AS average_mood_score
      FROM feedback
      WHERE event_id = ?
      """;

  private static final String TOP_COMMENTS_SQL = """
      SELECT comment
      FROM feedback
      WHERE event_id = ?
        AND comment IS NOT NULL
        AND TRIM(comment) <> ''
      ORDER BY submitted_at DESC, feedback_id DESC
      LIMIT ?
      """;

  private static final String HEALTH_INPUTS_SQL = """
      SELECT
        e.event_id,
        e.expected_attendance,
        COALESCE(registration_counts.registered_count, 0) AS registered_count,
        COALESCE(registration_counts.checked_in_count, 0) AS checked_in_count,
        COALESCE(task_counts.required_volunteers, 0) AS required_volunteers,
        COALESCE(task_counts.active_task_count, 0) AS active_task_count,
        COALESCE(task_counts.assigned_task_count, 0) AS assigned_task_count,
        COALESCE(task_counts.in_progress_task_count, 0) AS in_progress_task_count,
        COALESCE(task_counts.completed_task_count, 0) AS completed_task_count,
        COALESCE(task_counts.blocked_task_count, 0) AS blocked_task_count,
        COALESCE(task_counts.overdue_task_count, 0) AS overdue_task_count,
        COALESCE(assignment_counts.active_assignments, 0) AS active_assignments
      FROM events e
      LEFT JOIN (
        SELECT
          event_id,
          COUNT(*) AS registered_count,
          SUM(CASE WHEN registration_status = 'CHECKED_IN' AND checked_in_at IS NOT NULL THEN 1 ELSE 0 END) AS checked_in_count
        FROM registrations
        WHERE event_id = ?
        GROUP BY event_id
      ) registration_counts ON registration_counts.event_id = e.event_id
      LEFT JOIN (
        SELECT
          event_id,
          SUM(required_volunteers) AS required_volunteers,
          COUNT(*) AS active_task_count,
          SUM(CASE WHEN task_status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned_task_count,
          SUM(CASE WHEN task_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_task_count,
          SUM(CASE WHEN task_status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_task_count,
          SUM(CASE WHEN task_status = 'BLOCKED' THEN 1 ELSE 0 END) AS blocked_task_count,
          SUM(CASE
            WHEN task_status IN ('TODO', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
              AND deadline_at IS NOT NULL
              AND deadline_at < CURRENT_TIMESTAMP
            THEN 1
            ELSE 0
          END) AS overdue_task_count
        FROM tasks
        WHERE event_id = ?
          AND task_status <> 'CANCELLED'
        GROUP BY event_id
      ) task_counts ON task_counts.event_id = e.event_id
      LEFT JOIN (
        SELECT
          t.event_id,
          COUNT(*) AS active_assignments
        FROM task_assignments ta
        JOIN tasks t ON t.task_id = ta.task_id
        WHERE t.event_id = ?
          AND ta.is_active = TRUE
          AND t.task_status <> 'CANCELLED'
        GROUP BY t.event_id
      ) assignment_counts ON assignment_counts.event_id = e.event_id
      WHERE e.event_id = ?
      """;

  private static final String FIND_LATEST_METRIC_SQL = """
      SELECT
        event_metric_id,
        event_id,
        snapshot_at,
        registered_count,
        checked_in_count,
        attendance_ratio,
        engagement_score,
        volunteer_efficiency_score,
        health_score,
        risk_level
      FROM event_metrics
      WHERE event_id = ?
      ORDER BY snapshot_at DESC, event_metric_id DESC
      LIMIT 1
      """;

  private static final String FIND_RECENT_METRICS_SQL = """
      SELECT
        event_metric_id,
        event_id,
        snapshot_at,
        registered_count,
        checked_in_count,
        attendance_ratio,
        engagement_score,
        volunteer_efficiency_score,
        health_score,
        risk_level
      FROM event_metrics
      WHERE event_id = ?
      ORDER BY snapshot_at DESC, event_metric_id DESC
      LIMIT ?
      """;

  private static final String INSERT_EVENT_METRIC_SQL = """
      INSERT INTO event_metrics (
        event_id,
        snapshot_at,
        registered_count,
        checked_in_count,
        attendance_ratio,
        engagement_score,
        volunteer_efficiency_score,
        health_score,
        risk_level
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      """;

  public FeedbackAggregate loadFeedbackAggregate(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FEEDBACK_ANALYSIS_SQL)) {
      statement.setLong(1, eventId);
      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return new FeedbackAggregate(
            resultSet.getInt("positive_count"),
            resultSet.getInt("neutral_count"),
            resultSet.getInt("negative_count"),
            resultSet.getBigDecimal("average_mood_score"));
      }
    }
  }

  public List<String> findTopComments(Connection connection, long eventId, int limit) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(TOP_COMMENTS_SQL)) {
      statement.setLong(1, eventId);
      statement.setInt(2, limit);
      try (ResultSet resultSet = statement.executeQuery()) {
        List<String> comments = new ArrayList<>();
        while (resultSet.next()) {
          comments.add(resultSet.getString("comment"));
        }
        return comments;
      }
    }
  }

  public Optional<HealthInputs> findHealthInputs(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(HEALTH_INPUTS_SQL)) {
      statement.setLong(1, eventId);
      statement.setLong(2, eventId);
      statement.setLong(3, eventId);
      statement.setLong(4, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }

        return Optional.of(new HealthInputs(
            resultSet.getLong("event_id"),
            resultSet.getInt("expected_attendance"),
            resultSet.getInt("registered_count"),
            resultSet.getInt("checked_in_count"),
            resultSet.getInt("required_volunteers"),
            resultSet.getInt("active_task_count"),
            resultSet.getInt("assigned_task_count"),
            resultSet.getInt("in_progress_task_count"),
            resultSet.getInt("completed_task_count"),
            resultSet.getInt("blocked_task_count"),
            resultSet.getInt("overdue_task_count"),
            resultSet.getInt("active_assignments")));
      }
    }
  }

  public Optional<EventMetric> findLatestMetric(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_LATEST_METRIC_SQL)) {
      statement.setLong(1, eventId);
      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }

        return Optional.of(mapMetric(resultSet));
      }
    }
  }

  public List<EventMetric> findRecentMetrics(Connection connection, long eventId, int limit) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_RECENT_METRICS_SQL)) {
      statement.setLong(1, eventId);
      statement.setInt(2, limit);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<EventMetric> metrics = new ArrayList<>();
        while (resultSet.next()) {
          metrics.add(mapMetric(resultSet));
        }
        return metrics;
      }
    }
  }

  public void insertEventMetric(Connection connection, EventMetric metric) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_EVENT_METRIC_SQL)) {
      statement.setLong(1, metric.eventId());
      statement.setTimestamp(2, Timestamp.from(metric.snapshotAt()));
      statement.setInt(3, metric.registeredCount());
      statement.setInt(4, metric.checkedInCount());
      statement.setBigDecimal(5, metric.attendanceRatio());
      statement.setBigDecimal(6, metric.engagementScore());
      statement.setBigDecimal(7, metric.volunteerEfficiencyScore());
      statement.setBigDecimal(8, metric.healthScore());
      statement.setString(9, metric.riskLevel().name());
      statement.executeUpdate();
    }
  }

  private EventMetric mapMetric(ResultSet resultSet) throws SQLException {
    return new EventMetric(
        resultSet.getLong("event_metric_id"),
        resultSet.getLong("event_id"),
        toInstant(resultSet.getTimestamp("snapshot_at")),
        resultSet.getInt("registered_count"),
        resultSet.getInt("checked_in_count"),
        resultSet.getBigDecimal("attendance_ratio"),
        resultSet.getBigDecimal("engagement_score"),
        resultSet.getBigDecimal("volunteer_efficiency_score"),
        resultSet.getBigDecimal("health_score"),
        RiskLevel.valueOf(resultSet.getString("risk_level")));
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  public record FeedbackAggregate(
      Integer positiveCount,
      Integer neutralCount,
      Integer negativeCount,
      BigDecimal averageMoodScore) {
  }

  public record HealthInputs(
      Long eventId,
      Integer expectedAttendance,
      Integer registeredCount,
      Integer checkedInCount,
      Integer requiredVolunteers,
      Integer activeTaskCount,
      Integer assignedTaskCount,
      Integer inProgressTaskCount,
      Integer completedTaskCount,
      Integer blockedTaskCount,
      Integer overdueTaskCount,
      Integer activeAssignments) {
  }
}