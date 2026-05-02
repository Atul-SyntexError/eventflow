package com.eventflow.service;

import com.eventflow.dao.AdminUserDao;
import com.eventflow.dao.AuditLogDao;
import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.UserDetailDto;
import com.eventflow.dto.UserFormRequestDto;
import com.eventflow.dto.UserSummaryDto;
import com.eventflow.mapper.AdminDtoMapper;
import com.eventflow.model.AuditLog;
import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import com.eventflow.model.User;
import com.eventflow.model.UserStatus;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.utils.PasswordHasher;
import com.eventflow.validation.UserFormValidator;
import com.eventflow.validation.ValidationException;
import java.sql.Connection;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.SQLException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class AdminUserService {

  private final ConnectionManager connectionManager;
  private final AdminUserDao adminUserDao;
  private final AuditLogDao auditLogDao;
  private final AdminDtoMapper adminDtoMapper;
  private final PasswordHasher passwordHasher;
  private final UserFormValidator userFormValidator;
  private final JsonPayloadMapper jsonPayloadMapper;

  public AdminUserService(
      ConnectionManager connectionManager,
      AdminUserDao adminUserDao,
      AuditLogDao auditLogDao,
      AdminDtoMapper adminDtoMapper,
      PasswordHasher passwordHasher,
      UserFormValidator userFormValidator,
      JsonPayloadMapper jsonPayloadMapper) {
    this.connectionManager = connectionManager;
    this.adminUserDao = adminUserDao;
    this.auditLogDao = auditLogDao;
    this.adminDtoMapper = adminDtoMapper;
    this.passwordHasher = passwordHasher;
    this.userFormValidator = userFormValidator;
    this.jsonPayloadMapper = jsonPayloadMapper;
  }

  public List<UserSummaryDto> listUsers() {
    return withConnection("list users", connection -> {
      List<User> users = adminUserDao.findAllUsers(connection);
      Map<Long, List<String>> skillsByUserId = adminUserDao.findSkillsByUserIds(
          connection,
          users.stream().map(User::userId).toList());

      return users.stream()
          .map(user -> adminDtoMapper.toUserSummaryDto(user, skillsByUserId.getOrDefault(user.userId(), List.of())))
          .toList();
    });
  }

  public List<String> listSkillCatalog() {
    return withConnection("list user skill catalog", adminUserDao::findSkillCatalog);
  }

  public UserDetailDto getUserDetail(long userId) {
    return withConnection("load user detail", connection -> loadUserDetail(connection, userId));
  }

  public UserDetailDto createUser(UserFormRequestDto request, long actorUserId) {
    UserFormRequestDto validated = userFormValidator.validateForCreate(request);
    return withConnection("create user", connection -> {
      validateEmailUniqueness(connection, validated.email(), null);
      Map<String, Long> skillIdsByName = resolveSkillIds(connection, validated.skills());

      User user = toUser(null, validated);
      long userId = adminUserDao.insertUser(connection, user, passwordHasher.hash(validated.password()));
      adminUserDao.replaceUserSkills(connection, userId, skillIdsByName.values());

      UserDetailDto created = loadUserDetail(connection, userId);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "USER",
              userId,
              "CREATE",
              null,
              jsonPayloadMapper.write(created),
              Instant.now()));
      return created;
    });
  }

  public UserDetailDto updateUser(long userId, UserFormRequestDto request, long actorUserId) {
    UserFormRequestDto validated = userFormValidator.validateForUpdate(request);
    return withConnection("update user", connection -> {
      UserDetailDto before = loadUserDetail(connection, userId);
      validateProtectedStateChanges(connection, userId, actorUserId, before, validated);
      validateEmailUniqueness(connection, validated.email(), userId);
      Map<String, Long> skillIdsByName = resolveSkillIds(connection, validated.skills());

      String updatedPasswordHash = validated.password() == null ? null : passwordHasher.hash(validated.password());
      adminUserDao.updateUser(connection, toUser(userId, validated), updatedPasswordHash);
      adminUserDao.replaceUserSkills(connection, userId, skillIdsByName.values());

      UserDetailDto updated = loadUserDetail(connection, userId);
      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "USER",
              userId,
              "UPDATE",
              jsonPayloadMapper.write(before),
              jsonPayloadMapper.write(updated),
              Instant.now()));
      return updated;
    });
  }

  public void deleteUser(long userId, long actorUserId) {
    withConnection("delete user", connection -> {
      UserDetailDto before = loadUserDetail(connection, userId);
      if (userId == actorUserId) {
        throw new ApplicationException(
            "You cannot delete the account for the current session.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }
      if (adminUserDao.hasActiveAssignments(connection, userId)) {
        throw new ApplicationException(
            "This user cannot be deleted while active task assignments still depend on the account.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      try {
        adminUserDao.deleteUser(connection, userId);
      } catch (SQLIntegrityConstraintViolationException exception) {
        throw new ApplicationException(
            "This user cannot be deleted while related records still exist.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            exception);
      }

      auditLogDao.insert(
          connection,
          new AuditLog(
              null,
              actorUserId,
              "USER",
              userId,
              "DELETE",
              jsonPayloadMapper.write(before),
              null,
              Instant.now()));
      return null;
    });
  }

  private void validateProtectedStateChanges(
      Connection connection,
      long userId,
      long actorUserId,
      UserDetailDto before,
      UserFormRequestDto validated) throws SQLException {
    boolean deactivating = before.active() && !validated.active();
    boolean changingAwayFromVolunteer = before.role() == RoleType.VOLUNTEER && validated.role() != RoleType.VOLUNTEER;

    if ((deactivating || changingAwayFromVolunteer) && adminUserDao.hasActiveAssignments(connection, userId)) {
      throw new ApplicationException(
          "Active task assignments must be resolved before this user can be deactivated or removed from the volunteer pool.",
          409,
          ErrorCode.RESOURCE_CONFLICT,
          false,
          null);
    }

    if (userId == actorUserId && !validated.active()) {
      throw new ApplicationException(
          "You cannot deactivate the account for the current session.",
          409,
          ErrorCode.RESOURCE_CONFLICT,
          false,
          null);
    }
  }

  private void validateEmailUniqueness(Connection connection, String email, Long excludedUserId)
      throws SQLException {
    if (adminUserDao.emailExists(connection, email, excludedUserId)) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of("email", ErrorCode.EMAIL_ALREADY_EXISTS.name(), "Email is already in use.")));
    }
  }

  private Map<String, Long> resolveSkillIds(Connection connection, List<String> skills) throws SQLException {
    Map<String, Long> skillIdsByName = adminUserDao.findSkillIdsByNames(connection, skills);
    if (skillIdsByName.size() != skills.size()) {
      Map<String, Long> lookup = new LinkedHashMap<>(skillIdsByName);
      List<String> invalidSkills = skills.stream().filter(skill -> !lookup.containsKey(skill)).toList();
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "skills",
              ErrorCode.INVALID_FORMAT.name(),
              "Unknown skills: " + String.join(", ", invalidSkills) + ".")));
    }
    return skillIdsByName;
  }

  private UserDetailDto loadUserDetail(Connection connection, long userId) throws SQLException {
    Optional<User> user = adminUserDao.findUserById(connection, userId);
    if (user.isEmpty()) {
      throw new ApplicationException(
          "User was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    }

    return adminDtoMapper.toUserDetailDto(
        user.get(),
        adminUserDao.findSkillsForUser(connection, userId),
        adminUserDao.findRecentAssignments(connection, userId),
        adminUserDao.findRegisteredEvents(connection, userId));
  }

  private User toUser(Long userId, UserFormRequestDto request) {
    UserStatus userStatus = request.active() ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    AvailabilityStatus availabilityStatus = request.role() == RoleType.VOLUNTEER ? request.availabilityStatus() : request.availabilityStatus();

    return new User(
        userId,
        request.email(),
        null,
        request.firstName(),
        request.lastName(),
        request.role(),
        userStatus,
        availabilityStatus,
        null,
        null,
        null);
  }

  private <T> T withConnection(String operation, SqlWork<T> work) {
    try (Connection connection = connectionManager.getConnection()) {
      try {
        T result = work.execute(connection);
        connection.commit();
        return result;
      } catch (SQLException exception) {
        rollbackQuietly(connection);
        throw new DaoException("Failed to " + operation + ".", exception);
      } catch (RuntimeException exception) {
        rollbackQuietly(connection);
        throw exception;
      }
    } catch (SQLException exception) {
      throw new DaoException("Failed to open connection for " + operation + ".", exception);
    }
  }

  private void rollbackQuietly(Connection connection) {
    try {
      connection.rollback();
    } catch (SQLException ignored) {
      // Ignore rollback failures to preserve the original exception.
    }
  }

  @FunctionalInterface
  private interface SqlWork<T> {
    T execute(Connection connection) throws SQLException;
  }
}