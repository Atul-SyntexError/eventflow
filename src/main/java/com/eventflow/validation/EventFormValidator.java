package com.eventflow.validation;

import com.eventflow.dto.EventFormRequestDto;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.ResourceRequirementDto;
import com.eventflow.model.EventStatus;
import com.eventflow.utils.ErrorCode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class EventFormValidator {

  public EventFormRequestDto validateForCreate(EventFormRequestDto request) {
    EventFormRequestDto validated = validate(request, null);
    if (validated.status().isTerminal()) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "status",
              ErrorCode.RESOURCE_CONFLICT.name(),
              "New events cannot be created directly in a terminal state.")));
    }
    return validated;
  }

  public EventFormRequestDto validateForUpdate(EventFormRequestDto request, EventStatus currentStatus) {
    EventFormRequestDto validated = validate(request, currentStatus);
    if (currentStatus != null
        && currentStatus != validated.status()
        && !currentStatus.canTransitionTo(validated.status())) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.of(
              "status",
              ErrorCode.RESOURCE_CONFLICT.name(),
              "The requested event status transition is not allowed.")));
    }
    return validated;
  }

  private EventFormRequestDto validate(EventFormRequestDto request, EventStatus currentStatus) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    String name = trimToNull(request.name());
    String description = trimToNull(request.description());
    String category = trimToNull(request.category());
    String venue = trimToNull(request.venue());
    Instant startAt = request.startAt();
    Instant endAt = request.endAt();
    Instant registrationOpenAt = request.registrationOpenAt();
    Instant registrationCloseAt = request.registrationCloseAt();
    Integer expectedAttendance = request.expectedAttendance();
    EventStatus status = request.status();
    List<ResourceRequirementDto> resourcePlan = normalizeResources(request.resourcePlan(), errors);

    if (name == null) {
      errors.add(FieldErrorDto.of("name", ErrorCode.FIELD_REQUIRED.name(), "Event name is required."));
    } else if (name.length() > 150) {
      errors.add(FieldErrorDto.of("name", ErrorCode.INVALID_FORMAT.name(), "Event name must be 150 characters or fewer."));
    }

    if (category == null) {
      errors.add(FieldErrorDto.of("category", ErrorCode.FIELD_REQUIRED.name(), "Category is required."));
    } else if (category.length() > 100) {
      errors.add(FieldErrorDto.of("category", ErrorCode.INVALID_FORMAT.name(), "Category must be 100 characters or fewer."));
    }

    if (venue == null) {
      errors.add(FieldErrorDto.of("venue", ErrorCode.FIELD_REQUIRED.name(), "Venue is required."));
    } else if (venue.length() > 150) {
      errors.add(FieldErrorDto.of("venue", ErrorCode.INVALID_FORMAT.name(), "Venue must be 150 characters or fewer."));
    }

    if (description != null && description.length() > 1000) {
      errors.add(FieldErrorDto.of("description", ErrorCode.INVALID_FORMAT.name(), "Description must be 1000 characters or fewer."));
    }

    if (status == null) {
      errors.add(FieldErrorDto.of("status", ErrorCode.FIELD_REQUIRED.name(), "Status is required."));
    }

    if (startAt == null) {
      errors.add(FieldErrorDto.of("startAt", ErrorCode.FIELD_REQUIRED.name(), "Start window is required."));
    }

    if (endAt == null) {
      errors.add(FieldErrorDto.of("endAt", ErrorCode.FIELD_REQUIRED.name(), "End window is required."));
    }

    if (startAt != null && endAt != null && !startAt.isBefore(endAt)) {
      errors.add(FieldErrorDto.of("endAt", ErrorCode.DATE_RANGE_INVALID.name(), "End window must be after the start window."));
    }

    boolean hasRegistrationOpen = registrationOpenAt != null;
    boolean hasRegistrationClose = registrationCloseAt != null;
    if (hasRegistrationOpen != hasRegistrationClose) {
      errors.add(FieldErrorDto.of(
          "registrationOpenAt",
          ErrorCode.DATE_RANGE_INVALID.name(),
          "Registration open and close dates must both be provided when registration scheduling is used."));
    }

    if (registrationOpenAt != null && registrationCloseAt != null) {
      if (!registrationOpenAt.isBefore(registrationCloseAt)) {
        errors.add(FieldErrorDto.of(
            "registrationCloseAt",
            ErrorCode.DATE_RANGE_INVALID.name(),
            "Registration close must be after registration open."));
      }
      if (startAt != null && !registrationCloseAt.isBefore(startAt)) {
        errors.add(FieldErrorDto.of(
            "registrationCloseAt",
            ErrorCode.DATE_RANGE_INVALID.name(),
            "Registration close must be before the event start window."));
      }
    }

    if (expectedAttendance == null) {
      errors.add(FieldErrorDto.of(
          "expectedAttendance",
          ErrorCode.FIELD_REQUIRED.name(),
          "Expected attendance is required."));
    } else if (expectedAttendance <= 0) {
      errors.add(FieldErrorDto.of(
          "expectedAttendance",
          ErrorCode.INVALID_FORMAT.name(),
          "Expected attendance must be greater than zero."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new EventFormRequestDto(
        name,
        description,
        category,
        venue,
        startAt,
        endAt,
        registrationOpenAt,
        registrationCloseAt,
        expectedAttendance,
        resourcePlan,
        status);
  }

  private List<ResourceRequirementDto> normalizeResources(
      List<ResourceRequirementDto> resources,
      List<FieldErrorDto> errors) {
    if (resources == null || resources.isEmpty()) {
      return List.of();
    }

    List<ResourceRequirementDto> normalizedResources = new ArrayList<>();
    for (int index = 0; index < resources.size(); index++) {
      ResourceRequirementDto resource = resources.get(index);
      if (resource == null) {
        errors.add(FieldErrorDto.of(
            "resourcePlan[" + index + "]",
            ErrorCode.INVALID_FORMAT.name(),
            "Resource entries must be valid objects."));
        continue;
      }

      String resourceName = trimToNull(resource.resourceName());
      Integer quantityRequired = resource.quantityRequired();
      Integer quantityAllocated = resource.quantityAllocated();
      String notes = trimToNull(resource.notes());
      String fieldPrefix = "resourcePlan[" + index + "]";

      if (resourceName == null) {
        errors.add(FieldErrorDto.of(
            fieldPrefix + ".resourceName",
            ErrorCode.FIELD_REQUIRED.name(),
            "Resource name is required."));
      } else if (resourceName.length() > 100) {
        errors.add(FieldErrorDto.of(
            fieldPrefix + ".resourceName",
            ErrorCode.INVALID_FORMAT.name(),
            "Resource name must be 100 characters or fewer."));
      }

      if (quantityRequired == null) {
        errors.add(FieldErrorDto.of(
            fieldPrefix + ".quantityRequired",
            ErrorCode.FIELD_REQUIRED.name(),
            "Required quantity is required."));
      } else if (quantityRequired < 0) {
        errors.add(FieldErrorDto.of(
            fieldPrefix + ".quantityRequired",
            ErrorCode.INVALID_FORMAT.name(),
            "Required quantity cannot be negative."));
      }

      if (quantityAllocated == null) {
        quantityAllocated = 0;
      } else if (quantityAllocated < 0) {
        errors.add(FieldErrorDto.of(
            fieldPrefix + ".quantityAllocated",
            ErrorCode.INVALID_FORMAT.name(),
            "Allocated quantity cannot be negative."));
      }

      if (notes != null && notes.length() > 255) {
        errors.add(FieldErrorDto.of(
            fieldPrefix + ".notes",
            ErrorCode.INVALID_FORMAT.name(),
            "Resource notes must be 255 characters or fewer."));
      }

      normalizedResources.add(new ResourceRequirementDto(resourceName, quantityRequired, quantityAllocated, notes));
    }

    return normalizedResources;
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}