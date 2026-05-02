package com.eventflow.utils;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.validation.ValidationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ErrorResponseMapper {

  private static final Logger LOGGER = LoggerFactory.getLogger(ErrorResponseMapper.class);

  public ApiResponse<Void> toResponse(RuntimeException exception) {
    if (exception instanceof ValidationException validationException) {
      return ApiResponse.failure(validationException.getMessage(), validationException.getErrors());
    }

    if (exception instanceof ApplicationException applicationException) {
      logApplicationException(applicationException);
      return ApiResponse.failure(
          applicationException.getMessage(),
          buildGlobalErrors(applicationException));
    }

    LOGGER.error("Unhandled application exception", exception);
    return ApiResponse.failure("An unexpected error occurred.", List.of());
  }

  private void logApplicationException(ApplicationException exception) {
    if (exception.shouldLogStackTrace()) {
      LOGGER.error("Application exception: {}", exception.getMessage(), exception);
      return;
    }
    LOGGER.warn("Application exception: {}", exception.getMessage());
  }

  private List<FieldErrorDto> buildGlobalErrors(ApplicationException exception) {
    if (exception.getErrorCode() == null) {
      return List.of();
    }
    return List.of(FieldErrorDto.global(exception.getErrorCode().name(), exception.getMessage()));
  }
}