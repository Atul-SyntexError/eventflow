package com.eventflow.validation;

import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.RegistrationRequestDto;
import com.eventflow.utils.ErrorCode;
import java.util.ArrayList;
import java.util.List;

public final class RegistrationValidator {

  public RegistrationRequestDto validate(RegistrationRequestDto request, long pathEventId) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    Long eventId = request.eventId();

    if (eventId == null) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.FIELD_REQUIRED.name(), "Event id is required."));
    } else if (eventId != pathEventId) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.INVALID_FORMAT.name(), "Event id must match the request route."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new RegistrationRequestDto(eventId);
  }
}