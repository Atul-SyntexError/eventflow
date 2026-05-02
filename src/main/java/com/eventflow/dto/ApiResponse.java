package com.eventflow.dto;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    List<FieldErrorDto> errors,
    Map<String, Object> meta,
    Instant timestamp) {

  public ApiResponse {
    errors = errors == null ? List.of() : List.copyOf(errors);

    Map<String, Object> normalizedMeta = new LinkedHashMap<>();
    if (meta != null) {
      normalizedMeta.putAll(meta);
    }
    meta = Collections.unmodifiableMap(normalizedMeta);
    timestamp = timestamp == null ? Instant.now() : timestamp;
  }

  public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>(true, message, data, List.of(), Map.of(), Instant.now());
  }

  public static <T> ApiResponse<T> success(String message, T data, PageMetaDto meta) {
    return new ApiResponse<>(
        true,
        message,
        data,
        List.of(),
        meta == null ? Map.of() : meta.toMap(),
        Instant.now());
  }

  public static <T> ApiResponse<T> failure(String message, List<FieldErrorDto> errors) {
    return new ApiResponse<>(false, message, null, errors, Map.of(), Instant.now());
  }

  public static <T> ApiResponse<T> failure(
      String message,
      List<FieldErrorDto> errors,
      Map<String, Object> meta) {
    return new ApiResponse<>(false, message, null, errors, meta, Instant.now());
  }
}