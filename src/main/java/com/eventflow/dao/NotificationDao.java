package com.eventflow.dao;

import com.eventflow.model.Notification;
import com.eventflow.model.NotificationSeverity;
import com.eventflow.model.NotificationType;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class NotificationDao {

  private static final String FIND_BY_RECIPIENT_USER_ID_SQL = """
      SELECT
        notification_id,
        recipient_user_id,
        event_id,
        task_id,
        notification_type,
        severity,
        title,
        body,
        link_path,
        is_read,
        created_at,
        read_at
      FROM notifications
      WHERE recipient_user_id = ?
      ORDER BY created_at DESC, notification_id DESC
      """;

  private static final String FIND_BY_ID_AND_RECIPIENT_USER_ID_SQL = """
      SELECT
        notification_id,
        recipient_user_id,
        event_id,
        task_id,
        notification_type,
        severity,
        title,
        body,
        link_path,
        is_read,
        created_at,
        read_at
      FROM notifications
      WHERE notification_id = ?
        AND recipient_user_id = ?
      """;

  private static final String MARK_AS_READ_SQL = """
      UPDATE notifications
      SET is_read = TRUE,
          read_at = ?
      WHERE notification_id = ?
        AND recipient_user_id = ?
        AND is_read = FALSE
      """;

  private static final String INSERT_SQL = """
      INSERT INTO notifications (
        recipient_user_id,
        event_id,
        task_id,
        notification_type,
        severity,
        title,
        body,
        link_path,
        is_read,
        created_at,
        read_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """;

  public List<Notification> findByRecipientUserId(Connection connection, long recipientUserId)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_RECIPIENT_USER_ID_SQL)) {
      statement.setLong(1, recipientUserId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<Notification> notifications = new ArrayList<>();
        while (resultSet.next()) {
          notifications.add(new Notification(
              resultSet.getLong("notification_id"),
              resultSet.getLong("recipient_user_id"),
              getNullableLong(resultSet, "event_id"),
              getNullableLong(resultSet, "task_id"),
              NotificationType.valueOf(resultSet.getString("notification_type")),
              NotificationSeverity.valueOf(resultSet.getString("severity")),
              resultSet.getString("title"),
              resultSet.getString("body"),
              resultSet.getString("link_path"),
              resultSet.getBoolean("is_read"),
              toInstant(resultSet.getTimestamp("created_at")),
              toInstant(resultSet.getTimestamp("read_at"))));
        }
        return notifications;
      }
    }
  }

  public java.util.Optional<Notification> findByIdAndRecipientUserId(
      Connection connection,
      long notificationId,
      long recipientUserId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_ID_AND_RECIPIENT_USER_ID_SQL)) {
      statement.setLong(1, notificationId);
      statement.setLong(2, recipientUserId);

      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return java.util.Optional.empty();
        }

        return java.util.Optional.of(new Notification(
            resultSet.getLong("notification_id"),
            resultSet.getLong("recipient_user_id"),
            getNullableLong(resultSet, "event_id"),
            getNullableLong(resultSet, "task_id"),
            NotificationType.valueOf(resultSet.getString("notification_type")),
            NotificationSeverity.valueOf(resultSet.getString("severity")),
            resultSet.getString("title"),
            resultSet.getString("body"),
            resultSet.getString("link_path"),
            resultSet.getBoolean("is_read"),
            toInstant(resultSet.getTimestamp("created_at")),
            toInstant(resultSet.getTimestamp("read_at"))));
      }
    }
  }

  public int markAsRead(Connection connection, long notificationId, long recipientUserId, Instant readAt)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(MARK_AS_READ_SQL)) {
      statement.setTimestamp(1, Timestamp.from(readAt));
      statement.setLong(2, notificationId);
      statement.setLong(3, recipientUserId);
      return statement.executeUpdate();
    }
  }

  public long insert(Connection connection, Notification notification) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS)) {
      statement.setLong(1, notification.recipientUserId());
      if (notification.eventId() == null) {
        statement.setObject(2, null);
      } else {
        statement.setLong(2, notification.eventId());
      }
      if (notification.taskId() == null) {
        statement.setObject(3, null);
      } else {
        statement.setLong(3, notification.taskId());
      }
      statement.setString(4, notification.notificationType().name());
      statement.setString(5, notification.severity().name());
      statement.setString(6, notification.title());
      statement.setString(7, notification.body());
      statement.setString(8, notification.linkPath());
      statement.setBoolean(9, notification.read());
      statement.setTimestamp(10, Timestamp.from(notification.createdAt()));
      statement.setTimestamp(11, notification.readAt() == null ? null : Timestamp.from(notification.readAt()));
      statement.executeUpdate();

      try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
        if (generatedKeys.next()) {
          return generatedKeys.getLong(1);
        }
      }
    }

    throw new SQLException("Notification insert did not return a generated key.");
  }

  private Long getNullableLong(ResultSet resultSet, String columnName) throws SQLException {
    long value = resultSet.getLong(columnName);
    return resultSet.wasNull() ? null : value;
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }
}