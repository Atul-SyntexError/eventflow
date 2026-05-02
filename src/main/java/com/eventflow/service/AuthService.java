package com.eventflow.service;

import com.eventflow.dao.AuthUserDao;
import com.eventflow.dao.AuthUserRecord;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.LoginRequestDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.PasswordHasher;
import com.eventflow.utils.RolePermissionRegistry;
import com.eventflow.validation.ValidationException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class AuthService {

  private final AuthUserDao authUserDao;
  private final PasswordHasher passwordHasher;
  private final RolePermissionRegistry rolePermissionRegistry;

  public AuthService(
      AuthUserDao authUserDao,
      PasswordHasher passwordHasher,
      RolePermissionRegistry rolePermissionRegistry) {
    this.authUserDao = authUserDao;
    this.passwordHasher = passwordHasher;
    this.rolePermissionRegistry = rolePermissionRegistry;
  }

  public RoleSessionDto authenticate(LoginRequestDto request) {
    String normalizedEmail = normalizeEmail(request.email());
    String password = request.password() == null ? "" : request.password();
    validate(normalizedEmail, password);

    AuthUserRecord user = authUserDao.findByEmail(normalizedEmail)
        .orElseThrow(() -> invalidCredentials());

    if (!user.isActive()) {
      throw invalidCredentials();
    }

    if (!passwordHasher.matches(password, user.passwordHash())) {
      throw invalidCredentials();
    }

    return new RoleSessionDto(
        user.userId(),
        user.fullName(),
        user.email(),
        user.role(),
        rolePermissionRegistry.permissionsFor(user.role()),
        user.unreadNotificationCount(),
        Instant.now());
  }

  private void validate(String normalizedEmail, String password) {
    List<FieldErrorDto> errors = new ArrayList<>();

    if (normalizedEmail == null) {
      errors.add(FieldErrorDto.of("email", ErrorCode.FIELD_REQUIRED.name(), "Email is required."));
    }

    if (password.isBlank()) {
      errors.add(FieldErrorDto.of("password", ErrorCode.FIELD_REQUIRED.name(), "Password is required."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }
  }

  private String normalizeEmail(String email) {
    if (email == null) {
      return null;
    }
    String normalized = email.trim().toLowerCase();
    return normalized.isEmpty() ? null : normalized;
  }

  private ApplicationException invalidCredentials() {
    return new ApplicationException(
        "Invalid email or password.",
        401,
        ErrorCode.INVALID_CREDENTIALS,
        false,
        null);
  }
}