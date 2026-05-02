package com.eventflow.dao;

import com.eventflow.model.Event;
import com.eventflow.model.EventStatus;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class EventDao {

  private static final String FIND_BY_ID_SQL = """
      SELECT
        event_id,
        code,
        name,
        description,
        category,
        venue,
        start_at,
        end_at,
        registration_open_at,
        registration_close_at,
        expected_attendance,
        event_status,
        created_by,
        updated_by,
        created_at,
        updated_at
      FROM events
      WHERE event_id = ?
      """;

  private static final String FIND_STUDENT_DISCOVERY_EVENTS_SQL = """
      SELECT
        e.event_id,
        e.code,
        e.name,
        e.description,
        e.category,
        e.venue,
        e.start_at,
        e.end_at,
        e.registration_open_at,
        e.registration_close_at,
        e.expected_attendance,
        e.event_status,
        e.created_by,
        e.updated_by,
        e.created_at,
        e.updated_at,
        sr.registration_status AS student_registration_status,
        COALESCE(rc.confirmed_count, 0) AS confirmed_count
      FROM events e
      LEFT JOIN registrations sr
        ON sr.event_id = e.event_id
       AND sr.student_id = ?
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS confirmed_count
        FROM registrations
        WHERE registration_status IN ('REGISTERED', 'CHECKED_IN')
        GROUP BY event_id
      ) rc ON rc.event_id = e.event_id
      WHERE e.event_status = 'REGISTRATION_OPEN'
      ORDER BY e.start_at ASC, e.event_id ASC
      """;

  public Optional<Event> findById(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_ID_SQL)) {
      statement.setLong(1, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }

        return Optional.of(new Event(
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
            toInstant(resultSet.getTimestamp("updated_at"))));
      }
    }
  }

  public List<StudentDiscoveryEventRow> findStudentDiscoveryEvents(Connection connection, long studentId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_STUDENT_DISCOVERY_EVENTS_SQL)) {
      statement.setLong(1, studentId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<StudentDiscoveryEventRow> events = new ArrayList<>();
        while (resultSet.next()) {
          events.add(new StudentDiscoveryEventRow(
              mapEvent(resultSet),
              resultSet.getString("student_registration_status"),
              resultSet.getInt("confirmed_count")));
        }
        return events;
      }
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

  public record StudentDiscoveryEventRow(
      Event event,
      String studentRegistrationStatus,
      int confirmedCount) {
  }
}