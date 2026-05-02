package com.eventflow.dao;

import com.eventflow.model.NotificationLog;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

public final class NotificationLogDao {

  private static final String INSERT_SQL = """
      INSERT INTO notification_logs (
        notification_id,
        channel,
        delivery_status,
        recipient_address,
        error_message,
        attempted_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      """;

  public void insert(Connection connection, NotificationLog notificationLog) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
      statement.setLong(1, notificationLog.notificationId());
      statement.setString(2, notificationLog.channel().name());
      statement.setString(3, notificationLog.deliveryStatus().name());
      statement.setString(4, notificationLog.recipientAddress());
      statement.setString(5, notificationLog.errorMessage());
      statement.setTimestamp(6, Timestamp.from(notificationLog.attemptedAt()));
      statement.executeUpdate();
    }
  }
}