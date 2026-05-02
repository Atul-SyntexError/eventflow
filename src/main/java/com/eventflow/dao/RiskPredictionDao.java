package com.eventflow.dao;

import com.eventflow.model.RiskLevel;
import com.eventflow.model.RiskPrediction;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class RiskPredictionDao {

  private static final String FIND_BY_EVENT_ID_SQL = """
      SELECT
        risk_prediction_id,
        event_id,
        risk_type,
        risk_level,
        score,
        headline,
        description,
        recommended_action,
        generated_at
      FROM risk_predictions
      WHERE event_id = ?
      ORDER BY generated_at DESC, risk_prediction_id ASC
      """;

  private static final String DELETE_BY_EVENT_ID_SQL = """
      DELETE FROM risk_predictions
      WHERE event_id = ?
      """;

  private static final String INSERT_SQL = """
      INSERT INTO risk_predictions (
        event_id,
        risk_type,
        risk_level,
        score,
        headline,
        description,
        recommended_action,
        generated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      """;

  public List<RiskPrediction> findByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<RiskPrediction> predictions = new ArrayList<>();
        while (resultSet.next()) {
          predictions.add(new RiskPrediction(
              resultSet.getLong("risk_prediction_id"),
              resultSet.getLong("event_id"),
              resultSet.getString("risk_type"),
              RiskLevel.valueOf(resultSet.getString("risk_level")),
              resultSet.getBigDecimal("score"),
              resultSet.getString("headline"),
              resultSet.getString("description"),
              resultSet.getString("recommended_action"),
              toInstant(resultSet.getTimestamp("generated_at"))));
        }
        return predictions;
      }
    }
  }

  public void deleteByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);
      statement.executeUpdate();
    }
  }

  public void replaceForEvent(Connection connection, long eventId, List<RiskPrediction> predictions) throws SQLException {
    deleteByEventId(connection, eventId);
    if (predictions == null || predictions.isEmpty()) {
      return;
    }

    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
      for (RiskPrediction prediction : predictions) {
        statement.setLong(1, eventId);
        statement.setString(2, prediction.riskType());
        statement.setString(3, prediction.riskLevel().name());
        statement.setBigDecimal(4, prediction.score());
        statement.setString(5, prediction.headline());
        statement.setString(6, prediction.description());
        statement.setString(7, prediction.recommendedAction());
        statement.setTimestamp(8, Timestamp.from(prediction.generatedAt()));
        statement.addBatch();
      }
      statement.executeBatch();
    }
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }
}