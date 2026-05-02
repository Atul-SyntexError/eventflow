package com.eventflow.validation;

import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.TaskFormRequestDto;
import com.eventflow.model.TaskStatus;
import com.eventflow.utils.ErrorCode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class TaskFormValidator {

  public TaskFormRequestDto validateForCreate(TaskFormRequestDto request) {
    TaskFormRequestDto validated = validate(request, null);
    if (validated.status().isTerminal()) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "status",
              ErrorCode.RESOURCE_CONFLICT.name(),
              "New tasks cannot be created directly in a terminal state.")));
    }

    if (validated.status() == TaskStatus.ASSIGNED || validated.status() == TaskStatus.IN_PROGRESS) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "status",
              ErrorCode.RESOURCE_CONFLICT.name(),
              "Create the task before moving it into an assigned or in-progress state.")));
    }
    return validated;
  }

  public TaskFormRequestDto validateForUpdate(TaskFormRequestDto request, TaskStatus currentStatus) {
    TaskFormRequestDto validated = validate(request, currentStatus);
    if (currentStatus != null
        && currentStatus != validated.status()
        && !currentStatus.canTransitionTo(validated.status())) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "status",
              ErrorCode.RESOURCE_CONFLICT.name(),
              "The requested task status transition is not allowed.")));
    }
    return validated;
  }

  private TaskFormRequestDto validate(TaskFormRequestDto request, TaskStatus currentStatus) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    Long eventId = request.eventId();
    String title = trimToNull(request.title());
    String description = trimToNull(request.description());
    Instant requiredStartAt = request.requiredStartAt();
    Instant deadlineAt = request.deadlineAt();
    List<String> requiredSkills = normalizeSkills(request.requiredSkills(), errors);
    List<Long> dependencyTaskIds = normalizeDependencyIds(request.dependencyTaskIds(), errors);

    if (eventId == null) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.FIELD_REQUIRED.name(), "Event reference is required."));
    }

    if (title == null) {
      errors.add(FieldErrorDto.of("title", ErrorCode.FIELD_REQUIRED.name(), "Task title is required."));
    } else if (title.length() > 150) {
      errors.add(FieldErrorDto.of("title", ErrorCode.INVALID_FORMAT.name(), "Task title must be 150 characters or fewer."));
    }

    if (description != null && description.length() > 1000) {
      errors.add(FieldErrorDto.of("description", ErrorCode.INVALID_FORMAT.name(), "Task description must be 1000 characters or fewer."));
    }

    if (request.priority() == null) {
      errors.add(FieldErrorDto.of("priority", ErrorCode.FIELD_REQUIRED.name(), "Priority is required."));
    }

    if (request.status() == null) {
      errors.add(FieldErrorDto.of("status", ErrorCode.FIELD_REQUIRED.name(), "Status is required."));
    }

    if (deadlineAt == null) {
      errors.add(FieldErrorDto.of("deadlineAt", ErrorCode.FIELD_REQUIRED.name(), "Deadline is required."));
    }

    if (requiredStartAt != null && deadlineAt != null && requiredStartAt.isAfter(deadlineAt)) {
      errors.add(FieldErrorDto.of(
          "deadlineAt",
          ErrorCode.DATE_RANGE_INVALID.name(),
          "Deadline must be on or after the required start."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new TaskFormRequestDto(
        eventId,
        title,
        description,
        request.priority(),
        requiredSkills,
        dependencyTaskIds,
        requiredStartAt,
        deadlineAt,
        request.status());
  }

  private List<String> normalizeSkills(List<String> skills, List<FieldErrorDto> errors) {
    if (skills == null || skills.isEmpty()) {
      return List.of();
    }

    Set<String> normalized = new LinkedHashSet<>();
    for (int index = 0; index < skills.size(); index++) {
      String skill = trimToNull(skills.get(index));
      if (skill == null) {
        errors.add(FieldErrorDto.of(
            "requiredSkills[" + index + "]",
            ErrorCode.INVALID_FORMAT.name(),
            "Skill names cannot be blank."));
        continue;
      }

      if (skill.length() > 80) {
        errors.add(FieldErrorDto.of(
            "requiredSkills[" + index + "]",
            ErrorCode.INVALID_FORMAT.name(),
            "Skill names must be 80 characters or fewer."));
        continue;
      }

      normalized.add(skill);
    }
    return List.copyOf(normalized);
  }

  private List<Long> normalizeDependencyIds(List<Long> dependencyIds, List<FieldErrorDto> errors) {
    if (dependencyIds == null || dependencyIds.isEmpty()) {
      return List.of();
    }

    Set<Long> normalized = new LinkedHashSet<>();
    for (int index = 0; index < dependencyIds.size(); index++) {
      Long dependencyId = dependencyIds.get(index);
      if (dependencyId == null || dependencyId <= 0) {
        errors.add(FieldErrorDto.of(
            "dependencyTaskIds[" + index + "]",
            ErrorCode.INVALID_FORMAT.name(),
            "Dependency task ids must be valid positive identifiers."));
        continue;
      }
      normalized.add(dependencyId);
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