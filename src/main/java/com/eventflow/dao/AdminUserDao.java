package com.eventflow.dao;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import com.eventflow.model.User;
import com.eventflow.model.UserStatus;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class AdminUserDao {

  private static final String FIND_ALL_USERS_SQL = """
      SELECT
        user_id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        user_status,
        availability_status,
        performance_score,
        created_at,
        updated_at
      FROM users
      ORDER BY last_name ASC, first_name ASC, user_id ASC
      """;

  private static final String FIND_USER_BY_ID_SQL = """
      SELECT
        user_id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        user_status,
        availability_status,
        performance_score,
        created_at,
        updated_at
      FROM users
      WHERE user_id = ?
      """;

  private static final String FIND_USERS_BY_IDS_SQL_PREFIX = """
      SELECT
        user_id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        user_status,
        availability_status,
        performance_score,
        created_at,
        updated_at
      FROM users
      WHERE user_id IN (
      """;

  private static final String FIND_SKILLS_BY_USER_IDS_SQL_PREFIX = """
      SELECT us.user_id, s.name
      FROM user_skills us
      JOIN skills s ON s.skill_id = us.skill_id
      WHERE us.user_id IN (
      """;

  private static final String FIND_SKILLS_FOR_USER_SQL = """
      SELECT s.name
      FROM user_skills us
      JOIN skills s ON s.skill_id = us.skill_id
      WHERE us.user_id = ?
      ORDER BY s.name ASC
      """;

  private static final String FIND_SKILL_CATALOG_SQL = """
      SELECT name
      FROM skills
      ORDER BY name ASC
      """;

  private static final String FIND_RECENT_ASSIGNMENTS_SQL = """
      SELECT CONCAT(e.name, ' - ', t.title) AS assignment_label
      FROM task_assignments ta
      JOIN tasks t ON t.task_id = ta.task_id
      JOIN events e ON e.event_id = t.event_id
      WHERE ta.volunteer_id = ?
      ORDER BY ta.assigned_at DESC
      LIMIT 5
      """;

  private static final String FIND_REGISTERED_EVENTS_SQL = """
      SELECT e.name
      FROM registrations r
      JOIN events e ON e.event_id = r.event_id
      WHERE r.student_id = ?
      ORDER BY r.registered_at DESC
      LIMIT 5
      """;

  private static final String FIND_SKILL_IDS_SQL_PREFIX = """
      SELECT skill_id, name
      FROM skills
      WHERE name IN (
      """;

  private static final String EMAIL_EXISTS_SQL = """
      SELECT COUNT(*)
      FROM users
      WHERE email = ?
      AND (? IS NULL OR user_id <> ?)
      """;

  private static final String INSERT_USER_SQL = """
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        role,
        user_status,
        availability_status,
        performance_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
      """;

  private static final String UPDATE_USER_SQL = """
      UPDATE users
      SET email = ?,
          first_name = ?,
          last_name = ?,
          role = ?,
          user_status = ?,
          availability_status = ?
      WHERE user_id = ?
      """;

  private static final String UPDATE_USER_WITH_PASSWORD_SQL = """
      UPDATE users
      SET email = ?,
          password_hash = ?,
          first_name = ?,
          last_name = ?,
          role = ?,
          user_status = ?,
          availability_status = ?
      WHERE user_id = ?
      """;

  private static final String DELETE_USER_SKILLS_SQL = """
      DELETE FROM user_skills
      WHERE user_id = ?
      """;

  private static final String INSERT_USER_SKILL_SQL = """
      INSERT INTO user_skills (user_id, skill_id, proficiency_level)
      VALUES (?, ?, NULL)
      """;

  private static final String HAS_ACTIVE_ASSIGNMENTS_SQL = """
      SELECT COUNT(*)
      FROM task_assignments ta
      JOIN tasks t ON t.task_id = ta.task_id
      WHERE ta.volunteer_id = ?
        AND ta.is_active = TRUE
        AND t.task_status IN ('TODO', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
      """;

  private static final String DELETE_USER_SQL = """
      DELETE FROM users
      WHERE user_id = ?
      """;

  private final ConnectionManager connectionManager;

  public AdminUserDao(ConnectionManager connectionManager) {
    this.connectionManager = connectionManager;
  }

  public List<User> findAllUsers(Connection connection) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_ALL_USERS_SQL);
         ResultSet resultSet = statement.executeQuery()) {
      List<User> users = new ArrayList<>();
      while (resultSet.next()) {
        users.add(mapUser(resultSet));
      }
      return users;
    }
  }

  public Optional<User> findUserById(Connection connection, long userId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_USER_BY_ID_SQL)) {
      statement.setLong(1, userId);
      try (ResultSet resultSet = statement.executeQuery()) {
        if (!resultSet.next()) {
          return Optional.empty();
        }
        return Optional.of(mapUser(resultSet));
      }
    }
  }

  public Map<Long, User> findUsersByIds(Connection connection, Collection<Long> userIds) throws SQLException {
    if (userIds == null || userIds.isEmpty()) {
      return Map.of();
    }

    String placeholders = userIds.stream().map(userId -> "?").collect(Collectors.joining(", "));
    String sql = FIND_USERS_BY_IDS_SQL_PREFIX + placeholders + ")";

    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      int index = 1;
      for (Long userId : userIds) {
        statement.setLong(index++, userId);
      }

      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, User> users = new LinkedHashMap<>();
        while (resultSet.next()) {
          User user = mapUser(resultSet);
          users.put(user.userId(), user);
        }
        return users;
      }
    }
  }

  public List<String> findSkillCatalog(Connection connection) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_SKILL_CATALOG_SQL);
         ResultSet resultSet = statement.executeQuery()) {
      List<String> skills = new ArrayList<>();
      while (resultSet.next()) {
        skills.add(resultSet.getString("name"));
      }
      return skills;
    }
  }

  public Map<Long, List<String>> findSkillsByUserIds(Connection connection, Collection<Long> userIds)
      throws SQLException {
    if (userIds == null || userIds.isEmpty()) {
      return Map.of();
    }

    String placeholders = userIds.stream().map(userId -> "?").collect(Collectors.joining(", "));
    String sql = FIND_SKILLS_BY_USER_IDS_SQL_PREFIX + placeholders + ") ORDER BY s.name ASC";

    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      int index = 1;
      for (Long userId : userIds) {
        statement.setLong(index++, userId);
      }

      try (ResultSet resultSet = statement.executeQuery()) {
        Map<Long, List<String>> skillsByUserId = new LinkedHashMap<>();
        while (resultSet.next()) {
          Long userId = resultSet.getLong("user_id");
          skillsByUserId.computeIfAbsent(userId, ignored -> new ArrayList<>())
              .add(resultSet.getString("name"));
        }
        return skillsByUserId;
      }
    }
  }

  public List<String> findSkillsForUser(Connection connection, long userId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_SKILLS_FOR_USER_SQL)) {
      statement.setLong(1, userId);
      try (ResultSet resultSet = statement.executeQuery()) {
        List<String> skills = new ArrayList<>();
        while (resultSet.next()) {
          skills.add(resultSet.getString("name"));
        }
        return skills;
      }
    }
  }

  public List<String> findRecentAssignments(Connection connection, long userId) throws SQLException {
    return findLabels(connection, FIND_RECENT_ASSIGNMENTS_SQL, userId, "assignment_label");
  }

  public List<String> findRegisteredEvents(Connection connection, long userId) throws SQLException {
    return findLabels(connection, FIND_REGISTERED_EVENTS_SQL, userId, "name");
  }

  public Map<String, Long> findSkillIdsByNames(Connection connection, List<String> skillNames)
      throws SQLException {
    if (skillNames == null || skillNames.isEmpty()) {
      return Map.of();
    }

    String placeholders = skillNames.stream().map(skill -> "?").collect(Collectors.joining(", "));
    String sql = FIND_SKILL_IDS_SQL_PREFIX + placeholders + ")";

    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      int index = 1;
      for (String skillName : skillNames) {
        statement.setString(index++, skillName);
      }

      try (ResultSet resultSet = statement.executeQuery()) {
        Map<String, Long> skillIds = new LinkedHashMap<>();
        while (resultSet.next()) {
          skillIds.put(resultSet.getString("name"), resultSet.getLong("skill_id"));
        }
        return skillIds;
      }
    }
  }

  public boolean emailExists(Connection connection, String email, Long excludedUserId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(EMAIL_EXISTS_SQL)) {
      statement.setString(1, email);
      if (excludedUserId == null) {
        statement.setObject(2, null);
        statement.setObject(3, null);
      } else {
        statement.setLong(2, excludedUserId);
        statement.setLong(3, excludedUserId);
      }

      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return resultSet.getInt(1) > 0;
      }
    }
  }

  public long insertUser(Connection connection, User user, String passwordHash) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_USER_SQL, Statement.RETURN_GENERATED_KEYS)) {
      statement.setString(1, user.email());
      statement.setString(2, passwordHash);
      statement.setString(3, user.firstName());
      statement.setString(4, user.lastName());
      statement.setString(5, user.role().name());
      statement.setString(6, user.userStatus().name());
      if (user.availabilityStatus() == null) {
        statement.setObject(7, null);
      } else {
        statement.setString(7, user.availabilityStatus().name());
      }

      statement.executeUpdate();
      try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
        if (!generatedKeys.next()) {
          throw new SQLException("Failed to generate user id.");
        }
        return generatedKeys.getLong(1);
      }
    }
  }

  public void updateUser(Connection connection, User user, String passwordHash) throws SQLException {
    boolean updatePassword = passwordHash != null;
    String sql = updatePassword ? UPDATE_USER_WITH_PASSWORD_SQL : UPDATE_USER_SQL;

    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      int index = 1;
      statement.setString(index++, user.email());
      if (updatePassword) {
        statement.setString(index++, passwordHash);
      }
      statement.setString(index++, user.firstName());
      statement.setString(index++, user.lastName());
      statement.setString(index++, user.role().name());
      statement.setString(index++, user.userStatus().name());
      if (user.availabilityStatus() == null) {
        statement.setObject(index++, null);
      } else {
        statement.setString(index++, user.availabilityStatus().name());
      }
      statement.setLong(index, user.userId());

      if (statement.executeUpdate() == 0) {
        throw new SQLException("No user was updated for id=" + user.userId());
      }
    }
  }

  public void replaceUserSkills(Connection connection, long userId, Collection<Long> skillIds)
      throws SQLException {
    try (PreparedStatement deleteStatement = connection.prepareStatement(DELETE_USER_SKILLS_SQL)) {
      deleteStatement.setLong(1, userId);
      deleteStatement.executeUpdate();
    }

    if (skillIds == null || skillIds.isEmpty()) {
      return;
    }

    try (PreparedStatement insertStatement = connection.prepareStatement(INSERT_USER_SKILL_SQL)) {
      for (Long skillId : skillIds) {
        insertStatement.setLong(1, userId);
        insertStatement.setLong(2, skillId);
        insertStatement.addBatch();
      }
      insertStatement.executeBatch();
    }
  }

  public boolean hasActiveAssignments(Connection connection, long userId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(HAS_ACTIVE_ASSIGNMENTS_SQL)) {
      statement.setLong(1, userId);
      try (ResultSet resultSet = statement.executeQuery()) {
        resultSet.next();
        return resultSet.getInt(1) > 0;
      }
    }
  }

  public void deleteUser(Connection connection, long userId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_USER_SQL)) {
      statement.setLong(1, userId);
      int deletedRows = statement.executeUpdate();
      if (deletedRows == 0) {
        throw new SQLException("No user was deleted for id=" + userId);
      }
    } catch (SQLIntegrityConstraintViolationException exception) {
      throw exception;
    }
  }

  public Optional<User> findUserById(long userId) {
    try (Connection connection = connectionManager.getConnection()) {
      Optional<User> user = findUserById(connection, userId);
      connection.commit();
      return user;
    } catch (SQLException exception) {
      throw new DaoException("Failed to load user detail for id=" + userId, exception);
    }
  }

  private List<String> findLabels(Connection connection, String sql, long userId, String column)
      throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      statement.setLong(1, userId);
      try (ResultSet resultSet = statement.executeQuery()) {
        List<String> labels = new ArrayList<>();
        while (resultSet.next()) {
          labels.add(resultSet.getString(column));
        }
        return labels;
      }
    }
  }

  private User mapUser(ResultSet resultSet) throws SQLException {
    return new User(
        resultSet.getLong("user_id"),
        resultSet.getString("email"),
        resultSet.getString("password_hash"),
        resultSet.getString("first_name"),
        resultSet.getString("last_name"),
        RoleType.valueOf(resultSet.getString("role")),
        UserStatus.valueOf(resultSet.getString("user_status")),
        mapAvailabilityStatus(resultSet.getString("availability_status")),
        resultSet.getBigDecimal("performance_score"),
        toInstant(resultSet.getTimestamp("created_at")),
        toInstant(resultSet.getTimestamp("updated_at")));
  }

  private AvailabilityStatus mapAvailabilityStatus(String value) {
    return value == null ? null : AvailabilityStatus.valueOf(value);
  }

  private Instant toInstant(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }
}