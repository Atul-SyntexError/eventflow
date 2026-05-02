package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.ScheduleAdjustmentSuggestionDto;
import com.eventflow.dto.TimelineItemDto;
import com.eventflow.service.ScheduleAdjustmentService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorResponseMapper;
import com.eventflow.utils.JsonResponseWriter;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(urlPatterns = {"/api/organizer/events/*"})
public final class OrganizerEventOperationsApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    ScheduleAdjustmentService scheduleAdjustmentService =
        AppComponentFactory.scheduleAdjustmentService(getServletContext());
    try {
      List<String> segments = normalizeSegments(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      if (segments.size() == 3
          && "schedule-adjustments".equals(segments.get(1))
          && "suggestion".equals(segments.get(2))) {
        long eventId = parseEventId(segments.get(0));
        ScheduleAdjustmentSuggestionDto suggestion =
            scheduleAdjustmentService.suggestForEvent(eventId, actor.userId());
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Schedule adjustment suggestion loaded successfully.", suggestion));
        return;
      }

      if (segments.size() == 2 && "timeline".equals(segments.get(1))) {
        long eventId = parseEventId(segments.get(0));
        List<TimelineItemDto> timeline = scheduleAdjustmentService.loadTimeline(eventId);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Organizer timeline loaded successfully.", timeline));
        return;
      }

      throw new ApplicationException("Organizer event operations route was not found.", 404, null, false, null);
    } catch (RuntimeException exception) {
      jsonResponseWriter.writeApiResponse(
          response,
          resolveStatus(exception),
          errorResponseMapper.toResponse(exception));
    }
  }

  private RoleSessionDto requireActor(HttpServletRequest request) {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    return currentUser.orElseThrow(() ->
        new ApplicationException("Authentication required.", 401, null, false, null));
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

  private int resolveStatus(RuntimeException exception) {
    if (exception instanceof ApplicationException applicationException) {
      return applicationException.getStatusCode();
    }
    return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
  }
}