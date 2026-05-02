package com.eventflow.dao;

import com.eventflow.model.Feedback;
import com.eventflow.model.FeedbackMood;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class StudentFeedbackDao {

  private static final String FIND_ELIGIBLE_EVENTS_SQL = """
      SELECT
        e.event_id,
        e.name,
        r.checked_in_at
      FROM registrations r
      JOIN events e ON e.event_id = r.event_id
      LEFT JOIN feedback f ON f.event_id = r.event_id AND f.student_id = r.student_id
      WHERE r.student_id = ?
        AND r.registration_status = 'CHECKED_IN'
        AND r.checked_in_at IS NOT NULL
        AND e.event_status <> 'CANCELLED'
        AND f.feedback_id IS NULL
      ORDER BY r.checked_in_at DESC, e.name ASC
      """;

  private static final String FIND_SUBMISSIONS_SQL = """
      SELECT
        f.event_id,
        e.name,
        f.mood,
        f.comment,
        f.submitted_at
      FROM feedback f
      JOIN events e ON e.event_id = f.event_id
      WHERE f.student_id = ?
      ORDER BY f.submitted_at DESC, f.feedback_id DESC
      """;

  private static final String EVENT_EXISTS_SQL = """
      SELECT COUNT(*)
      FROM events
      WHERE event_id = ?
      """;

  private static final String FEEDBACK_EXISTS_SQL = """
      SELECT COUNT(*)
      FROM feedback
      WHERE event_id = ?
        AND student_id = ?
      """;

  private static final String ELIGIBLE_EVENT_SQL = """
      SELECT COUNT(*)
      FROM registrations r
      JOIN events e ON e.event_id = r.event_id
      LEFT JOIN feedback f ON f.event_id = r.event_id AND f.student_id = r.student_id
      WHERE r.event_id = ?
        AND r.student_id = ?
        AND r.registration_status = 'CHECKED_IN'
        AND r.checked_in_at IS NOT NULL
        AND e.event_status <> 'CANCELLED'
        AND f.feedback_id IS NULL
      """;

  private static final String INSERT_FEEDBACK_SQL = """
      INSERT INTO feedback (
        event_id,
        student_id,
        mood,
        comment,
        submitted_at
      )
      VALUES (?, ?, ?, ?, ?)
      """;

  public List<EligibleFeedbackEvent> findEligibleEvents(Connection connection, long studentId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_ELIGIBLE_EVENTS_SQL)) {
      statement.setLong(1, studentId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<EligibleFeedbackEvent> events = new ArrayList<>();
        while (resultSet.next()) {
          events.add(new EligibleFeedbackEvent(
              resultSet.getLong("event_id"),
              resultSet.getString("name"),
              toInstant(resultSet.getTimestamp("checked_in_at"))));
        }
        return events;
      }
    }
  }

  public List<FeedbackSubmissionRow> findSubmissions(Connection connection, long studentId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_SUBMISSIONS_SQL)) {
      statement.setLong(1, studentId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<FeedbackSubmissionRow> submissions = new ArrayList<>();
        while (resultSet.next()) {
          submissions.add(new FeedbackSubmissionRow(
              resultSet.getLong("event_id"),
              resultSet.getString("name"),
              FeedbackMood.valueOf(resultSet.getString("mood")),
              resultSet.getString("comment"),
              toInstant(resultSet.getTimestamp("submitted_at"))));
        }
        return submissions;
      }
    }
  }

  public boolean eventExists(Connection connection, long eventId) throws SQLException {
    return exists(connection, EVENT_EXISTS_SQL, eventId);
  }

  public boolean feedbackExists(Connection connection, long studentId, long eventId) throws SQLException {
    return exists(connection, FEEDBACK_EXISTS_SQL, eventId, studentId);
  }

  public boolean isEligibleEvent(Connection connection, long studentId, long eventId) throws SQLException {
    return exists(connection, ELIGIBLE_EVENT_SQL, eventId, studentId);
  }

  public void insertFeedback(Connection connection, Feedback feedback) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_FEEDBACK_SQL)) {
      statement.setLong(1, feedback.eventId());
      statement.setLong(2, feedback.studentId());
      statement.setString(3, feedback.mood().name());
      statement.setString(4, feedback.comment());
      statement.setTimestamp(5, Timestamp.from(feedback.submittedAt()));
      statement.executeUpdate();
    }
  }

  private boolean exists(Connection connection, String sql, long firstValue) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      statement.setLong(1, firstValue);
      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return resultSet.getInt(1) > 0;
      }
    }
  }

  private boolean exists(Connection connection, String sql, long firstValue, long secondValue)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      statement.setLong(1, firstValue);
      statement.setLong(2, secondValue);
      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return resultSet.getInt(1) > 0;
      }
    }
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  public record EligibleFeedbackEvent(Long eventId, String eventName, Instant checkedInAt) {
  }

  public record FeedbackSubmissionRow(
      Long eventId,
      String eventName,
      FeedbackMood mood,
      String comment,
      Instant submittedAt) {
  }
}