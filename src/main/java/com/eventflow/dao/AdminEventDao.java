package com.eventflow.dao;

import com.eventflow.model.Event;
import com.eventflow.model.EventStatus;
import com.eventflow.model.RiskLevel;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class AdminEventDao {

  private static final String FIND_EVENT_SUMMARIES_SQL = """
      SELECT
        e.event_id,
        e.code,
        e.name,
        e.description,
        e.category,
        e.event_status,
        e.venue,
        e.start_at,
        e.end_at,
        e.registration_open_at,
        e.registration_close_at,
        e.expected_attendance,
        e.created_by,
        e.updated_by,
        e.created_at,
        e.updated_at,
        COALESCE(reg.registered_count, 0) AS registered_count,
        COALESCE(reg.checked_in_count, 0) AS checked_in_count,
        metric.health_score,
        metric.risk_level
      FROM events e
      LEFT JOIN (
        SELECT
          event_id,
          SUM(CASE WHEN registration_status IN ('REGISTERED', 'CHECKED_IN') THEN 1 ELSE 0 END) AS registered_count,
          SUM(CASE WHEN registration_status = 'CHECKED_IN' THEN 1 ELSE 0 END) AS checked_in_count
        FROM registrations
        GROUP BY event_id
      ) reg ON reg.event_id = e.event_id
      LEFT JOIN (
        SELECT current_metric.event_id, current_metric.health_score, current_metric.risk_level
        FROM event_metrics current_metric
        INNER JOIN (
          SELECT event_id, MAX(snapshot_at) AS latest_snapshot_at
          FROM event_metrics
          GROUP BY event_id
        ) latest_metric
          ON latest_metric.event_id = current_metric.event_id
         AND latest_metric.latest_snapshot_at = current_metric.snapshot_at
      ) metric ON metric.event_id = e.event_id
      ORDER BY e.start_at ASC, e.event_id ASC
      """;

  private static final String INSERT_EVENT_SQL = """
      INSERT INTO events (
        code,
        name,
        description,
        category,
        event_status,
        venue,
        start_at,
        end_at,
        registration_open_at,
        registration_close_at,
        expected_attendance,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """;

  private static final String UPDATE_EVENT_SQL = """
      UPDATE events
      SET name = ?,
          description = ?,
          category = ?,
          event_status = ?,
          venue = ?,
          start_at = ?,
          end_at = ?,
          registration_open_at = ?,
          registration_close_at = ?,
          expected_attendance = ?,
          updated_by = ?,
          updated_at = ?
      WHERE event_id = ?
      """;

  private static final String COUNT_BLOCKING_DEPENDENCIES_SQL = """
      SELECT
        ((SELECT COUNT(*) FROM registrations WHERE event_id = ?)
        + (SELECT COUNT(*) FROM tasks WHERE event_id = ?)
        + (SELECT COUNT(*) FROM feedback WHERE event_id = ?)) AS dependency_count
      """;

  private static final String DELETE_EVENT_METRICS_SQL = """
      DELETE FROM event_metrics
      WHERE event_id = ?
      """;

  private static final String DELETE_SCHEDULE_ADJUSTMENTS_SQL = """
      DELETE FROM event_schedule_adjustments
      WHERE event_id = ?
      """;

  private static final String DELETE_EVENT_SQL = """
      DELETE FROM events
      WHERE event_id = ?
      """;

  public List<EventSummaryRow> findEventSummaries(Connection connection) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_EVENT_SUMMARIES_SQL);
         ResultSet resultSet = statement.executeQuery()) {
      List<EventSummaryRow> rows = new ArrayList<>();
      while (resultSet.next()) {
        rows.add(new EventSummaryRow(
            mapEvent(resultSet),
            resultSet.getInt("registered_count"),
            resultSet.getInt("checked_in_count"),
            resultSet.getBigDecimal("health_score"),
            mapRiskLevel(resultSet.getString("risk_level"))));
      }
      return rows;
    }
  }

  public long insertEvent(Connection connection, Event event) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_EVENT_SQL, Statement.RETURN_GENERATED_KEYS)) {
      statement.setString(1, event.code());
      statement.setString(2, event.name());
      statement.setString(3, event.description());
      statement.setString(4, event.category());
      statement.setString(5, event.eventStatus().name());
      statement.setString(6, event.venue());
      statement.setTimestamp(7, toTimestamp(event.startAt()));
      statement.setTimestamp(8, toTimestamp(event.endAt()));
      statement.setTimestamp(9, toTimestamp(event.registrationOpenAt()));
      statement.setTimestamp(10, toTimestamp(event.registrationCloseAt()));
      statement.setInt(11, event.expectedAttendance());
      statement.setLong(12, event.createdBy());
      statement.setLong(13, event.updatedBy());
      statement.setTimestamp(14, toTimestamp(event.createdAt()));
      statement.setTimestamp(15, toTimestamp(event.updatedAt()));
      statement.executeUpdate();

      try (ResultSet keys = statement.getGeneratedKeys()) {
        if (keys.next()) {
          return keys.getLong(1);
        }
      }
    }

    throw new SQLException("Event insert did not return a generated key.");
  }

  public void updateEvent(Connection connection, Event event) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(UPDATE_EVENT_SQL)) {
      statement.setString(1, event.name());
      statement.setString(2, event.description());
      statement.setString(3, event.category());
      statement.setString(4, event.eventStatus().name());
      statement.setString(5, event.venue());
      statement.setTimestamp(6, toTimestamp(event.startAt()));
      statement.setTimestamp(7, toTimestamp(event.endAt()));
      statement.setTimestamp(8, toTimestamp(event.registrationOpenAt()));
      statement.setTimestamp(9, toTimestamp(event.registrationCloseAt()));
      statement.setInt(10, event.expectedAttendance());
      statement.setLong(11, event.updatedBy());
      statement.setTimestamp(12, toTimestamp(event.updatedAt()));
      statement.setLong(13, event.eventId());
      statement.executeUpdate();
    }
  }

  public boolean hasBlockingDependencies(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(COUNT_BLOCKING_DEPENDENCIES_SQL)) {
      statement.setLong(1, eventId);
      statement.setLong(2, eventId);
      statement.setLong(3, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        if (resultSet.next()) {
          return resultSet.getInt("dependency_count") > 0;
        }
        return false;
      }
    }
  }

  public void deleteEventMetrics(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_EVENT_METRICS_SQL)) {
      statement.setLong(1, eventId);
      statement.executeUpdate();
    }
  }

  public void deleteScheduleAdjustments(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_SCHEDULE_ADJUSTMENTS_SQL)) {
      statement.setLong(1, eventId);
      statement.executeUpdate();
    }
  }

  public void deleteEvent(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_EVENT_SQL)) {
      statement.setLong(1, eventId);
      statement.executeUpdate();
    }
  }

  private Event mapEvent(ResultSet resultSet) throws SQLException {
    return new Event(
        resultSet.getLong("event_id"),
        resultSet.getString("code"),
        resultSet.getString("name"),
        resultSet.getString("description"),
        resultSet.getString("category"),
        resultSet.getString("venue"),
        toInstant(resultSet.getTimestamp("start_at")),
        toInstant(resultSet.getTimestamp("end_at")),
        toInstant(resultSet.getTimestamp("registration_open_at")),
        toInstant(resultSet.getTimestamp("registration_close_at")),
        resultSet.getInt("expected_attendance"),
      EventStatus.valueOf(resultSet.getString("event_status")),
        resultSet.getLong("created_by"),
        resultSet.getLong("updated_by"),
        toInstant(resultSet.getTimestamp("created_at")),
        toInstant(resultSet.getTimestamp("updated_at")));
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  private Timestamp toTimestamp(Instant instant) {
    return instant == null ? null : Timestamp.from(instant);
  }

  private RiskLevel mapRiskLevel(String value) {
    return value == null || value.isBlank() ? null : RiskLevel.valueOf(value);
  }

  public record EventSummaryRow(
      Event event,
      int registeredCount,
      int checkedInCount,
      BigDecimal healthScore,
      RiskLevel riskLevel) {
  }
}