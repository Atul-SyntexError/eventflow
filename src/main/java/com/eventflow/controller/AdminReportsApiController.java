package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.ReportSummaryDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.service.AdminReportService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorResponseMapper;
import com.eventflow.utils.JsonResponseWriter;
import com.eventflow.utils.SessionContextHelper;
import com.eventflow.validation.ValidationException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(urlPatterns = "/api/admin/reports/*")
public final class AdminReportsApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminReportService adminReportService = AppComponentFactory.adminReportService(getServletContext());
    try {
      long eventId = requireDetailPath(request.getPathInfo());
      requireActor(request);
      ReportSummaryDto reportSummary = adminReportService.getReportSummary(eventId);
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Admin report loaded successfully.", reportSummary));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  private RoleSessionDto requireActor(HttpServletRequest request) {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    return currentUser.orElseThrow(() ->
        new ApplicationException("Authentication required.", 401, null, false, null));
  }

  private long requireDetailPath(String pathInfo) {
    List<String> segments = normalizeSegments(pathInfo);
    if (segments.size() != 1) {
      throw new ApplicationException("Admin report route was not found.", 404, null, false, null);
    }
    return parseEventId(segments.get(0));
  }

  private List<String> normalizeSegments(String pathInfo) {
    if (pathInfo == null || "/".equals(pathInfo)) {
      return List.of();
    }

    String normalized = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
    if (normalized.endsWith("/")) {
      normalized = normalized.substring(0, normalized.length() - 1);
    }
    if (normalized.isBlank()) {
      return List.of();
    }
    return List.of(normalized.split("/"));
  }

  private long parseEventId(String segment) {
    try {
      return Long.parseLong(segment);
    } catch (NumberFormatException exception) {
      throw new ApplicationException("Event id is invalid.", 400, null, false, exception);
    }
  }

  private void writeFailure(HttpServletResponse response, RuntimeException exception) throws IOException {
    int status = resolveStatus(exception);
    jsonResponseWriter.writeApiResponse(response, status, errorResponseMapper.toResponse(exception));
  }

  private int resolveStatus(RuntimeException exception) {
    if (exception instanceof ValidationException) {
      return 422;
    }
    if (exception instanceof ApplicationException applicationException) {
      return applicationException.getStatusCode();
    }
    return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
  }
}