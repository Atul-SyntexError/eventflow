package com.eventflow.dao;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import com.eventflow.model.UserStatus;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public final class AuthUserDao {

  private static final String FIND_BY_EMAIL_SQL = """
      SELECT
        u.user_id,
        u.email,
        u.password_hash,
        u.first_name,
        u.last_name,
        u.role,
        u.user_status,
        u.availability_status,
        COALESCE(SUM(CASE WHEN n.is_read = FALSE THEN 1 ELSE 0 END), 0) AS unread_notification_count
      FROM users u
      LEFT JOIN notifications n ON n.recipient_user_id = u.user_id
      WHERE u.email = ?
      GROUP BY
        u.user_id,
        u.email,
        u.password_hash,
        u.first_name,
        u.last_name,
        u.role,
        u.user_status,
        u.availability_status
      """;

  private final ConnectionManager connectionManager;

  public AuthUserDao(ConnectionManager connectionManager) {
    this.connectionManager = connectionManager;
  }

  public Optional<AuthUserRecord> findByEmail(String normalizedEmail) {
    try (Connection connection = connectionManager.getConnection();
         PreparedStatement statement = connection.prepareStatement(FIND_BY_EMAIL_SQL)) {
      statement.setString(1, normalizedEmail);

      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }

        return Optional.of(new AuthUserRecord(
            resultSet.getLong("user_id"),
            resultSet.getString("email"),
            resultSet.getString("password_hash"),
            resultSet.getString("first_name"),
            resultSet.getString("last_name"),
            RoleType.valueOf(resultSet.getString("role")),
            UserStatus.valueOf(resultSet.getString("user_status")),
            mapAvailabilityStatus(resultSet.getString("availability_status")),
            resultSet.getInt("unread_notification_count")));
      }
    } catch (SQLException exception) {
      throw new DaoException("Failed to load auth user for email: " + normalizedEmail, exception);
    }
  }

  private AvailabilityStatus mapAvailabilityStatus(String value) {
    return value == null ? null : AvailabilityStatus.valueOf(value);
  }
}