package com.eventflow.validation;

import com.eventflow.dto.CheckInRequestDto;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.utils.ErrorCode;
import java.util.ArrayList;
import java.util.List;

public final class CheckInValidator {

  public CheckInRequestDto validate(CheckInRequestDto request, long pathEventId) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    Long eventId = request.eventId();
    String confirmationCode = trimToNull(request.confirmationCode());

    if (eventId == null) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.FIELD_REQUIRED.name(), "Event id is required."));
    } else if (eventId != pathEventId) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.INVALID_FORMAT.name(), "Event id must match the request route."));
    }

    if (confirmationCode == null) {
      errors.add(FieldErrorDto.of(
          "confirmationCode",
          ErrorCode.FIELD_REQUIRED.name(),
          "Confirmation code is required."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new CheckInRequestDto(eventId, confirmationCode);
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}