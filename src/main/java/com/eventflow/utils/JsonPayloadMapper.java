package com.eventflow.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public final class JsonPayloadMapper {

  private final ObjectMapper objectMapper = JsonMapperFactory.create();

  public <T> T read(HttpServletRequest request, Class<T> type) {
    try {
      byte[] bytes = request.getInputStream().readAllBytes();
      if (bytes.length == 0) {
        return null;
      }

      String payload = new String(bytes, StandardCharsets.UTF_8).trim();
      if (payload.isEmpty()) {
        return null;
      }

      return objectMapper.readValue(payload, type);
    } catch (JsonProcessingException exception) {
      throw new ApplicationException(
          "Request body is invalid.",
          400,
          ErrorCode.INVALID_FORMAT,
          false,
          exception);
    } catch (IOException exception) {
      throw new IllegalStateException("Failed to read request body.", exception);
    }
  }

  public String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Failed to serialize payload.", exception);
    }
  }
}