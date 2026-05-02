package com.eventflow.dao;

import com.eventflow.model.EventScheduleAdjustment;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;

public final class EventScheduleAdjustmentDao {

  private static final String DELETE_SUGGESTED_BY_EVENT_ID_SQL = """
      DELETE FROM event_schedule_adjustments
      WHERE event_id = ?
        AND adjustment_status = 'SUGGESTED'
      """;

  private static final String INSERT_SQL = """
      INSERT INTO event_schedule_adjustments (
        event_id,
        proposed_by,
        reason_code,
        description,
        current_start_at,
        current_end_at,
        suggested_start_at,
        suggested_end_at,
        adjustment_status,
        applied_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """;

  public void replaceSuggestedForEvent(
      Connection connection,
      long eventId,
      EventScheduleAdjustment adjustment) throws SQLException {
    deleteSuggestedByEventId(connection, eventId);
    if (adjustment == null) {
      return;
    }

    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
      statement.setLong(1, adjustment.eventId());
      statement.setLong(2, adjustment.proposedBy());
      statement.setString(3, adjustment.reasonCode());
      statement.setString(4, adjustment.description());
      statement.setTimestamp(5, toTimestamp(adjustment.currentStartAt()));
      statement.setTimestamp(6, toTimestamp(adjustment.currentEndAt()));
      statement.setTimestamp(7, toTimestamp(adjustment.suggestedStartAt()));
      statement.setTimestamp(8, toTimestamp(adjustment.suggestedEndAt()));
      statement.setString(9, adjustment.adjustmentStatus().name());
      statement.setTimestamp(10, toTimestamp(adjustment.appliedAt()));
      statement.executeUpdate();
    }
  }

  private void deleteSuggestedByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_SUGGESTED_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);
      statement.executeUpdate();
    }
  }

  private Timestamp toTimestamp(Instant instant) {
    return instant == null ? null : Timestamp.from(instant);
  }
}