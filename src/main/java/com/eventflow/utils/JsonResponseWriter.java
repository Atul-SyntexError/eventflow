package com.eventflow.utils;


import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.SessionStatusDto;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public final class JsonResponseWriter {

  private final JsonPayloadMapper jsonPayloadMapper = new JsonPayloadMapper();

  public void writeApiResponse(HttpServletResponse response, int statusCode, ApiResponse<?> payload)
      throws IOException {
    writeJson(response, statusCode, toJson(payload));
  }

  public void writeSessionStatus(HttpServletResponse response, int statusCode, SessionStatusDto payload)
      throws IOException {
    writeJson(response, statusCode, toJson(payload));
  }

  private void writeJson(HttpServletResponse response, int statusCode, String payload)
      throws IOException {
    response.setStatus(statusCode);
    response.setCharacterEncoding("UTF-8");
    response.setContentType("application/json");
    response.getWriter().write(payload);
  }

  private String toJson(ApiResponse<?> payload) {
    return writeValue(payload);
  }

  private String toJson(SessionStatusDto payload) {
    return writeValue(payload);
  }

  private String writeValue(Object payload) {
    return jsonPayloadMapper.write(payload);
  }
}