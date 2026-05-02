package com.eventflow.dao;

import com.eventflow.model.Registration;
import com.eventflow.model.RegistrationStatus;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class RegistrationDao {

  private static final String FIND_BY_STUDENT_ID_SQL = """
      SELECT
        registration_id,
        event_id,
        student_id,
        registration_status,
        registered_at,
        checked_in_at
      FROM registrations
      WHERE student_id = ?
      ORDER BY registered_at DESC, registration_id DESC
      """;

  private static final String FIND_BY_EVENT_AND_STUDENT_SQL = """
      SELECT
        registration_id,
        event_id,
        student_id,
        registration_status,
        registered_at,
        checked_in_at
      FROM registrations
      WHERE event_id = ?
        AND student_id = ?
      """;

  private static final String FIND_ITEMS_BY_STUDENT_ID_SQL = """
      SELECT
        r.registration_id,
        r.event_id,
        r.student_id,
        r.registration_status,
        r.registered_at,
        r.checked_in_at,
        e.name AS event_name,
        e.venue,
        e.start_at,
        e.end_at
      FROM registrations r
      INNER JOIN events e ON e.event_id = r.event_id
      WHERE r.student_id = ?
      ORDER BY e.start_at DESC, r.registered_at DESC, r.registration_id DESC
      """;

  private static final String FIND_ELIGIBLE_CHECK_IN_EVENTS_SQL = """
      SELECT
        r.registration_id,
        r.event_id,
        r.student_id,
        r.registration_status,
        r.registered_at,
        r.checked_in_at,
        e.name AS event_name,
        e.venue,
        e.start_at,
        e.end_at,
        e.code AS event_code
      FROM registrations r
      INNER JOIN events e ON e.event_id = r.event_id
      WHERE r.student_id = ?
        AND r.registration_status = 'REGISTERED'
        AND r.checked_in_at IS NULL
        AND e.event_status <> 'CANCELLED'
        AND e.start_at <= ?
        AND e.end_at >= ?
      ORDER BY e.start_at ASC, r.registration_id ASC
      """;

  private static final String FIND_RECENT_CHECKED_IN_ITEMS_SQL = """
      SELECT
        r.event_id,
        r.registration_status,
        r.checked_in_at,
        e.name AS event_name
      FROM registrations r
      INNER JOIN events e ON e.event_id = r.event_id
      WHERE r.student_id = ?
        AND r.registration_status = 'CHECKED_IN'
        AND r.checked_in_at IS NOT NULL
      ORDER BY r.checked_in_at DESC, r.registration_id DESC
      LIMIT ?
      """;

  private static final String COUNT_CONFIRMED_REGISTRATIONS_SQL = """
      SELECT COUNT(*)
      FROM registrations
      WHERE event_id = ?
        AND registration_status IN ('REGISTERED', 'CHECKED_IN')
      """;

  private static final String FIND_CONFIRMED_STUDENT_IDS_BY_EVENT_ID_SQL = """
      SELECT DISTINCT student_id
      FROM registrations
      WHERE event_id = ?
        AND registration_status IN ('REGISTERED', 'CHECKED_IN')
      ORDER BY student_id ASC
      """;

  private static final String INSERT_SQL = """
      INSERT INTO registrations (
        event_id,
        student_id,
        registration_status,
        registered_at,
        checked_in_at
      )
      VALUES (?, ?, ?, ?, ?)
      """;

  private static final String MARK_CHECKED_IN_SQL = """
      UPDATE registrations
      SET registration_status = 'CHECKED_IN',
          checked_in_at = ?
      WHERE registration_id = ?
        AND registration_status = 'REGISTERED'
        AND checked_in_at IS NULL
      """;

  public List<Registration> findByStudentId(Connection connection, long studentId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_STUDENT_ID_SQL)) {
      statement.setLong(1, studentId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<Registration> registrations = new ArrayList<>();
        while (resultSet.next()) {
          registrations.add(mapRegistration(resultSet));
        }
        return registrations;
      }
    }
  }

  public Optional<Registration> findByEventAndStudent(Connection connection, long eventId, long studentId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_EVENT_AND_STUDENT_SQL)) {
      statement.setLong(1, eventId);
      statement.setLong(2, studentId);

      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }
        return Optional.of(mapRegistration(resultSet));
      }
    }
  }

  public List<StudentRegistrationItemRow> findItemsByStudentId(Connection connection, long studentId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_ITEMS_BY_STUDENT_ID_SQL)) {
      statement.setLong(1, studentId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<StudentRegistrationItemRow> items = new ArrayList<>();
        while (resultSet.next()) {
          items.add(new StudentRegistrationItemRow(
              mapRegistration(resultSet),
              resultSet.getString("event_name"),
              resultSet.getString("venue"),
              toInstant(resultSet.getTimestamp("start_at")),
              toInstant(resultSet.getTimestamp("end_at"))));
        }
        return items;
      }
    }
  }

  public List<StudentCheckInEligibleEventRow> findEligibleCheckInEvents(
      Connection connection,
      long studentId,
      Instant currentTime) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_ELIGIBLE_CHECK_IN_EVENTS_SQL)) {
      statement.setLong(1, studentId);
      statement.setTimestamp(2, Timestamp.from(currentTime));
      statement.setTimestamp(3, Timestamp.from(currentTime));

      try (ResultSet resultSet = statement.executeQuery()) {
        List<StudentCheckInEligibleEventRow> items = new ArrayList<>();
        while (resultSet.next()) {
          items.add(new StudentCheckInEligibleEventRow(
              mapRegistration(resultSet),
              resultSet.getString("event_name"),
              resultSet.getString("venue"),
              toInstant(resultSet.getTimestamp("start_at")),
              toInstant(resultSet.getTimestamp("end_at")),
              resultSet.getString("event_code")));
        }
        return items;
      }
    }
  }

  public List<StudentCheckInResultRow> findRecentCheckedInItems(Connection connection, long studentId, int limit)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_RECENT_CHECKED_IN_ITEMS_SQL)) {
      statement.setLong(1, studentId);
      statement.setInt(2, limit);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<StudentCheckInResultRow> items = new ArrayList<>();
        while (resultSet.next()) {
          items.add(new StudentCheckInResultRow(
              resultSet.getLong("event_id"),
              resultSet.getString("event_name"),
              RegistrationStatus.valueOf(resultSet.getString("registration_status")),
              toInstant(resultSet.getTimestamp("checked_in_at"))));
        }
        return items;
      }
    }
  }

  public int countConfirmedRegistrationsForEvent(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(COUNT_CONFIRMED_REGISTRATIONS_SQL)) {
      statement.setLong(1, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return resultSet.getInt(1);
      }
    }
  }

  public List<Long> findConfirmedStudentIdsByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_CONFIRMED_STUDENT_IDS_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<Long> studentIds = new ArrayList<>();
        while (resultSet.next()) {
          studentIds.add(resultSet.getLong("student_id"));
        }
        return studentIds;
      }
    }
  }

  public long insert(Connection connection, Registration registration) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS)) {
      statement.setLong(1, registration.eventId());
      statement.setLong(2, registration.studentId());
      statement.setString(3, registration.registrationStatus().name());
      statement.setTimestamp(4, Timestamp.from(registration.registeredAt()));
      statement.setTimestamp(5, registration.checkedInAt() == null ? null : Timestamp.from(registration.checkedInAt()));
      statement.executeUpdate();

      try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
        if (!generatedKeys.next()) {
          throw new SQLException("Failed to generate registration id.");
        }
        return generatedKeys.getLong(1);
      }
    }
  }

  public int markCheckedIn(Connection connection, long registrationId, Instant checkedInAt) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(MARK_CHECKED_IN_SQL)) {
      statement.setTimestamp(1, Timestamp.from(checkedInAt));
      statement.setLong(2, registrationId);
      return statement.executeUpdate();
    }
  }

  private Registration mapRegistration(ResultSet resultSet) throws SQLException {
    return new Registration(
        resultSet.getLong("registration_id"),
        resultSet.getLong("event_id"),
        resultSet.getLong("student_id"),
        RegistrationStatus.valueOf(resultSet.getString("registration_status")),
        toInstant(resultSet.getTimestamp("registered_at")),
        toInstant(resultSet.getTimestamp("checked_in_at")));
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  public record StudentRegistrationItemRow(
      Registration registration,
      String eventName,
      String venue,
      Instant startAt,
      Instant endAt) {
  }

    public record StudentCheckInEligibleEventRow(
      Registration registration,
      String eventName,
      String venue,
      Instant startAt,
      Instant endAt,
      String eventCode) {
    }

    public record StudentCheckInResultRow(
      Long eventId,
      String eventName,
      RegistrationStatus status,
      Instant checkedInAt) {
    }
}