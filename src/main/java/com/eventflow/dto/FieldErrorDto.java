package com.eventflow.dto;

public record FieldErrorDto(String field, String code, String message) {

  public static FieldErrorDto of(String field, String code, String message) {
    return new FieldErrorDto(field, code, message);
  }

  public static FieldErrorDto global(String code, String message) {
    return new FieldErrorDto(null, code, message);
  }
}