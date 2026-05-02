package com.eventflow.validation;

import com.eventflow.dto.FeedbackSubmissionRequestDto;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.utils.ErrorCode;
import java.util.ArrayList;
import java.util.List;

public final class FeedbackSubmissionValidator {

  public FeedbackSubmissionRequestDto validate(FeedbackSubmissionRequestDto request, long pathEventId) {
    if (request == null) {
      throw new ValidationException(
          "Validation failed",
          List.of(FieldErrorDto.global(ErrorCode.INVALID_FORMAT.name(), "Request body is required.")));
    }

    List<FieldErrorDto> errors = new ArrayList<>();
    Long eventId = request.eventId();
    String comment = trimToNull(request.comment());

    if (eventId == null) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.FIELD_REQUIRED.name(), "Event id is required."));
    } else if (eventId != pathEventId) {
      errors.add(FieldErrorDto.of("eventId", ErrorCode.INVALID_FORMAT.name(), "Event id must match the request route."));
    }

    if (request.mood() == null) {
      errors.add(FieldErrorDto.of("mood", ErrorCode.FIELD_REQUIRED.name(), "Mood is required."));
    }

    if (comment != null && comment.length() > 500) {
      errors.add(FieldErrorDto.of("comment", ErrorCode.INVALID_FORMAT.name(), "Comment must be 500 characters or fewer."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException("Validation failed", errors);
    }

    return new FeedbackSubmissionRequestDto(eventId, request.mood(), comment);
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}