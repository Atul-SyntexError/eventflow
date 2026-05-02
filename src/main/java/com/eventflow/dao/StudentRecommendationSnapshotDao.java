package com.eventflow.dao;

import com.eventflow.dto.EventRecommendationDto;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

public final class StudentRecommendationSnapshotDao {

  private static final String DELETE_BY_STUDENT_ID_SQL = """
      DELETE FROM student_recommendation_snapshots
      WHERE student_id = ?
      """;

  private static final String INSERT_SQL = """
      INSERT INTO student_recommendation_snapshots (
        student_id,
        event_id,
        score,
        reason_tags,
        headline,
        generated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      """;

  public void replaceForStudent(
      Connection connection,
      long studentId,
      List<EventRecommendationDto> recommendations) throws SQLException {
    deleteByStudentId(connection, studentId);
    if (recommendations == null || recommendations.isEmpty()) {
      return;
    }

    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
      Timestamp generatedAt = Timestamp.from(Instant.now());
      for (EventRecommendationDto recommendation : recommendations) {
        statement.setLong(1, studentId);
        statement.setLong(2, recommendation.eventId());
        statement.setBigDecimal(3, recommendation.score());
        statement.setString(4, String.join("|", recommendation.reasonTags()));
        statement.setString(5, recommendation.headline());
        statement.setTimestamp(6, generatedAt);
        statement.addBatch();
      }
      statement.executeBatch();
    }
  }

  private void deleteByStudentId(Connection connection, long studentId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_BY_STUDENT_ID_SQL)) {
      statement.setLong(1, studentId);
      statement.executeUpdate();
    }
  }
}