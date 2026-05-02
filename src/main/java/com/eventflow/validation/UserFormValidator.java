package com.eventflow.validation;

import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.UserFormRequestDto;
import com.eventflow.model.RoleType;
import com.eventflow.utils.ErrorCode;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

public final class UserFormValidator {

  private static final Pattern EMAIL_PATTERN =
      Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);

  public UserFormRequestDto validateForCreate(UserFormRequestDto request) {
    return validate(request, true);
  }

  public UserFormRequestDto validateForUpdate(UserFormRequestDto request) {
    return validate(request, false);
  }

  private UserFormRequestDto validate(UserFormRequestDto request, boolean passwordRequired) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    String firstName = trimToNull(request.firstName());
    String lastName = trimToNull(request.lastName());
    String email = normalizeEmail(request.email());
    String password = trimToNull(request.password());
    List<String> skills = normalizeSkills(request.skills());
    List<FieldErrorDto> errors = new ArrayList<>();

    validateRequiredLength(firstName, "firstName", "First name", 80, errors);
    validateRequiredLength(lastName, "lastName", "Last name", 80, errors);

    if (email == null) {
      errors.add(FieldErrorDto.of("email", ErrorCode.FIELD_REQUIRED.name(), "Email is required."));
    } else {
      if (email.length() > 150) {
        errors.add(FieldErrorDto.of("email", ErrorCode.INVALID_FORMAT.name(), "Email must be 150 characters or fewer."));
      }
      if (!EMAIL_PATTERN.matcher(email).matches()) {
        errors.add(FieldErrorDto.of("email", ErrorCode.INVALID_FORMAT.name(), "Email must be valid."));
      }
    }

    validatePassword(password, passwordRequired, errors);

    if (request.role() == null) {
      errors.add(FieldErrorDto.of("role", ErrorCode.FIELD_REQUIRED.name(), "Role is required."));
    }

    if (request.role() == RoleType.VOLUNTEER) {
      if (request.availabilityStatus() == null) {
        errors.add(FieldErrorDto.of(
            "availabilityStatus",
            ErrorCode.FIELD_REQUIRED.name(),
            "Availability is required for volunteer users."));
      }
      if (skills.isEmpty()) {
        errors.add(FieldErrorDto.of("skills", ErrorCode.FIELD_REQUIRED.name(), "At least one skill is required for volunteer users."));
      }
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new UserFormRequestDto(
        firstName,
        lastName,
        email,
        password,
        request.role(),
        request.active(),
        request.availabilityStatus(),
        skills);
  }

  private void validateRequiredLength(
      String value,
      String field,
      String label,
      int maxLength,
      List<FieldErrorDto> errors) {
    if (value == null) {
      errors.add(FieldErrorDto.of(field, ErrorCode.FIELD_REQUIRED.name(), label + " is required."));
      return;
    }

    if (value.length() > maxLength) {
      errors.add(FieldErrorDto.of(field, ErrorCode.INVALID_FORMAT.name(), label + " must be " + maxLength + " characters or fewer."));
    }
  }

  private void validatePassword(String password, boolean passwordRequired, List<FieldErrorDto> errors) {
    if (password == null) {
      if (passwordRequired) {
        errors.add(FieldErrorDto.of("password", ErrorCode.FIELD_REQUIRED.name(), "Password is required."));
      }
      return;
    }

    boolean hasLetter = password.chars().anyMatch(Character::isLetter);
    boolean hasDigit = password.chars().anyMatch(Character::isDigit);
    if (password.length() < 8 || !hasLetter || !hasDigit) {
      errors.add(FieldErrorDto.of(
          "password",
          ErrorCode.INVALID_FORMAT.name(),
          "Password must be at least 8 characters and include both letters and numbers."));
    }
  }

  private String normalizeEmail(String value) {
    String trimmed = trimToNull(value);
    return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
  }

  private List<String> normalizeSkills(List<String> values) {
    if (values == null || values.isEmpty()) {
      return List.of();
    }

    Set<String> normalized = new LinkedHashSet<>();
    for (String value : values) {
      String trimmed = trimToNull(value);
      if (trimmed != null) {
        normalized.add(trimmed);
      }
    }
    return List.copyOf(normalized);
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}