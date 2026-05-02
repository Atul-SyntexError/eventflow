package com.eventflow.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class VolunteerPerformanceDao {

  private static final String FIND_VOLUNTEER_PERFORMANCE_AGGREGATE_SQL = """
      SELECT
        COUNT(DISTINCT CASE WHEN t.task_status <> 'CANCELLED' THEN t.task_id END) AS total_task_count,
        COUNT(DISTINCT CASE WHEN t.task_status = 'COMPLETED' THEN t.task_id END) AS completed_task_count,
        COUNT(DISTINCT CASE
          WHEN ta.is_active = TRUE
           AND t.task_status IN ('TODO', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
          THEN t.task_id
        END) AS active_task_count,
        COUNT(DISTINCT CASE
          WHEN t.task_status = 'COMPLETED'
           AND (t.deadline_at IS NULL OR t.updated_at <= t.deadline_at)
          THEN t.task_id
        END) AS on_time_completed_count
      FROM task_assignments ta
      JOIN tasks t ON t.task_id = ta.task_id
      WHERE ta.volunteer_id = ?
      """;

  private static final String FIND_VOLUNTEER_RECENT_EVENT_PERFORMANCE_SQL = """
      SELECT
        e.event_id,
        e.name AS event_name,
        COUNT(DISTINCT t.task_id) AS total_task_count,
        COUNT(DISTINCT CASE WHEN t.task_status = 'COMPLETED' THEN t.task_id END) AS completed_task_count,
        COUNT(DISTINCT CASE
          WHEN t.task_status = 'COMPLETED'
           AND (t.deadline_at IS NULL OR t.updated_at <= t.deadline_at)
          THEN t.task_id
        END) AS on_time_completed_count,
        COUNT(DISTINCT CASE
          WHEN ta.is_active = TRUE
           AND t.task_status IN ('TODO', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
          THEN t.task_id
        END) AS active_task_count,
        MAX(COALESCE(t.updated_at, ta.assigned_at)) AS latest_activity_at,
        SUBSTRING_INDEX(
          GROUP_CONCAT(
            DISTINCT t.title
            ORDER BY COALESCE(t.updated_at, ta.assigned_at) DESC SEPARATOR '||'
          ),
          '||',
          1
        ) AS latest_task_title
      FROM task_assignments ta
      JOIN tasks t ON t.task_id = ta.task_id
      JOIN events e ON e.event_id = t.event_id
      WHERE ta.volunteer_id = ?
        AND t.task_status <> 'CANCELLED'
      GROUP BY e.event_id, e.name
      ORDER BY latest_activity_at DESC, e.event_id DESC
      LIMIT ?
      """;

  public VolunteerPerformanceAggregateRow findPerformanceAggregate(Connection connection, long volunteerId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_VOLUNTEER_PERFORMANCE_AGGREGATE_SQL)) {
      statement.setLong(1, volunteerId);
      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return new VolunteerPerformanceAggregateRow(0, 0, 0, 0);
        }
        return new VolunteerPerformanceAggregateRow(
            resultSet.getInt("total_task_count"),
            resultSet.getInt("completed_task_count"),
            resultSet.getInt("active_task_count"),
            resultSet.getInt("on_time_completed_count"));
      }
    }
  }

  public List<VolunteerEventPerformanceRow> findRecentEventPerformance(
      Connection connection,
      long volunteerId,
      int limit) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_VOLUNTEER_RECENT_EVENT_PERFORMANCE_SQL)) {
      statement.setLong(1, volunteerId);
      statement.setInt(2, limit);
      try (ResultSet resultSet = statement.executeQuery()) {
        List<VolunteerEventPerformanceRow> rows = new ArrayList<>();
        while (resultSet.next()) {
          rows.add(new VolunteerEventPerformanceRow(
              resultSet.getLong("event_id"),
              resultSet.getString("event_name"),
              resultSet.getInt("total_task_count"),
              resultSet.getInt("completed_task_count"),
              resultSet.getInt("on_time_completed_count"),
              resultSet.getInt("active_task_count"),
              toInstant(resultSet.getTimestamp("latest_activity_at")),
              resultSet.getString("latest_task_title")));
        }
        return rows;
      }
    }
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  public record VolunteerPerformanceAggregateRow(
      int totalTaskCount,
      int completedTaskCount,
      int activeTaskCount,
      int onTimeCompletedCount) {
  }

  public record VolunteerEventPerformanceRow(
      long eventId,
      String eventName,
      int totalTaskCount,
      int completedTaskCount,
      int onTimeCompletedCount,
      int activeTaskCount,
      Instant latestActivityAt,
      String latestTaskTitle) {
  }
}