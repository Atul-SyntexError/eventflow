package com.eventflow.validation;

import com.eventflow.dto.FieldErrorDto;
import java.util.List;

public final class ValidationException extends RuntimeException {

  private final List<FieldErrorDto> errors;

  public ValidationException(String message, List<FieldErrorDto> errors) {
    super(message);
    this.errors = errors == null ? List.of() : List.copyOf(errors);
  }

  public List<FieldErrorDto> getErrors() {
    return errors;
  }
}